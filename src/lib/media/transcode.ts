"use client";
// Video/audio conversion on WebCodecs via Mediabunny (blueprint section 22). Hardware-accelerated where the
// browser supports it, much faster than real time, and the file never leaves the device.
import {
  ALL_FORMATS, BlobSource, BufferTarget, Conversion, Input, Mp3OutputFormat, Mp4OutputFormat, OggOutputFormat, Output, QUALITY_HIGH, QUALITY_LOW, QUALITY_MEDIUM,
  WavOutputFormat, WebMOutputFormat, canEncodeAudio, getFirstEncodableVideoCodec, type OutputFormat, type VideoCodec,
} from "mediabunny";
import { fitToBitrate, planBitrates, scaleTo, type Fit, type OutFormat } from "./plan";

export type { OutFormat, Fit } from "./plan";

export interface MediaInfo {
  duration: number;
  hasVideo: boolean;
  hasAudio: boolean;
  width: number;
  height: number;
}

export async function probe(file: Blob): Promise<MediaInfo> {
  const input = new Input({ source: new BlobSource(file), formats: ALL_FORMATS });
  try {
    const [video, audio, duration] = await Promise.all([input.getPrimaryVideoTrack(), input.getPrimaryAudioTrack(), input.computeDuration()]);
    return { duration, hasVideo: !!video, hasAudio: !!audio, width: video?.displayWidth ?? 0, height: video?.displayHeight ?? 0 };
  } catch {
    throw new Error("This file couldn't be read. Use an MP4, MOV, WebM, MKV, MP3, M4A, WAV or Ogg file.");
  } finally {
    input.dispose();
  }
}

export interface TranscodeOptions {
  format: OutFormat;
  start?: number;
  end?: number;
  /** Output size; omit to keep the source size. */
  width?: number;
  height?: number;
  fit?: Fit;
  mute?: boolean;
  quality?: "low" | "medium" | "high";
  /** Aim for this file size (bytes). Overrides quality. */
  targetBytes?: number;
  audioBitrate?: number;
}

export const FORMAT_INFO: Record<OutFormat, { ext: string; mime: string; audioOnly: boolean; label: string }> = {
  mp4: { ext: "mp4", mime: "video/mp4", audioOnly: false, label: "MP4" },
  webm: { ext: "webm", mime: "video/webm", audioOnly: false, label: "WebM" },
  mp3: { ext: "mp3", mime: "audio/mpeg", audioOnly: true, label: "MP3" },
  m4a: { ext: "m4a", mime: "audio/mp4", audioOnly: true, label: "M4A (AAC)" },
  wav: { ext: "wav", mime: "audio/wav", audioOnly: true, label: "WAV" },
  ogg: { ext: "ogg", mime: "audio/ogg", audioOnly: true, label: "Ogg (Opus)" },
};

let mp3Ready: Promise<void> | null = null;
function ensureMp3() {
  mp3Ready ??= (async () => {
    if (!(await canEncodeAudio("mp3"))) {
      const { registerMp3Encoder } = await import("@mediabunny/mp3-encoder");
      registerMp3Encoder();
    }
  })();
  return mp3Ready;
}

function outputFormat(f: OutFormat): OutputFormat {
  switch (f) {
    case "mp4":
    case "m4a":
      return new Mp4OutputFormat({ fastStart: "in-memory" });
    case "webm":
      return new WebMOutputFormat();
    case "mp3":
      return new Mp3OutputFormat();
    case "wav":
      return new WavOutputFormat();
    case "ogg":
      return new OggOutputFormat();
  }
}

const QUALITY = { low: QUALITY_LOW, medium: QUALITY_MEDIUM, high: QUALITY_HIGH };

/**
 * Converts the file. With a target size, encoders (especially hardware ones on short, busy clips) can overshoot,
 * so the bitrate is corrected and the file re-encoded up to twice until it fits.
 */
export async function transcode(file: Blob, opts: TranscodeOptions, onProgress?: (p: number, pass: number) => void, signal?: AbortSignal): Promise<Blob> {
  let scale = 1;
  let best: Blob | null = null;
  for (let pass = 1; pass <= (opts.targetBytes ? 3 : 1); pass++) {
    signal?.throwIfAborted();
    const blob = await transcodeOnce(file, opts, scale, pass, (p) => onProgress?.(p, pass), signal);
    if (!best || blob.size < best.size) best = blob;
    if (!opts.targetBytes || blob.size <= opts.targetBytes * 1.03) return blob;
    scale *= (opts.targetBytes / blob.size) * 0.95;
  }
  return best!;
}

async function transcodeOnce(file: Blob, opts: TranscodeOptions, scale: number, pass: number, onProgress?: (p: number) => void, signal?: AbortSignal): Promise<Blob> {
  const info = FORMAT_INFO[opts.format];
  if (opts.format === "mp3") await ensureMp3();
  const input = new Input({ source: new BlobSource(file), formats: ALL_FORMATS });
  const format = outputFormat(opts.format);
  const output = new Output({ format, target: new BufferTarget() });
  try {
    const src = await probe(file);
    const duration = Math.max(0.1, (opts.end ?? src.duration) - (opts.start ?? 0));
    const bitrates = opts.targetBytes ? planBitrates(opts.targetBytes * scale, duration, !opts.mute && src.hasAudio, !info.audioOnly && src.hasVideo) : null;
    let size = opts.width || opts.height ? scaleTo(src.width, src.height, opts.width, opts.height, opts.fit ?? "contain") : null;
    // A tight size budget at full resolution looks blocky and encoders overshoot it; scale down to a sane bits-per-pixel.
    if (bitrates?.video && src.hasVideo) {
      const fitted = fitToBitrate(size?.width ?? src.width, size?.height ?? src.height, bitrates.video);
      if (fitted) size = { ...fitted, fit: size?.fit ?? "contain" };
    }

    let videoCodec: VideoCodec | null = null;
    if (!info.audioOnly && src.hasVideo) {
      const preferred: VideoCodec[] = opts.format === "webm" ? ["vp9", "vp8", "av1"] : ["avc", "hevc", "vp9", "av1"];
      videoCodec = await getFirstEncodableVideoCodec(preferred.filter((c) => format.getSupportedVideoCodecs().includes(c)), size ? { width: size.width, height: size.height } : undefined);
      if (!videoCodec) throw new Error(`This browser can't encode ${info.label} video. Try WebM, or use Chrome or Edge.`);
    }

    const conversion = await Conversion.init({
      input,
      output,
      trim: opts.start || opts.end ? { start: opts.start, end: opts.end } : undefined,
      video: info.audioOnly
        ? { discard: true }
        : {
            codec: videoCodec ?? undefined,
            ...(size ? { width: size.width, height: size.height, fit: size.fit } : {}),
            bitrate: bitrates?.video ?? QUALITY[opts.quality ?? "medium"],
            forceTranscode: !!(bitrates || size || opts.quality),
            // Software encoders follow the requested bitrate more strictly; use them when correcting a size overshoot.
            ...(pass > 1 ? { hardwareAcceleration: "prefer-software" as const } : {}),
          },
      audio: opts.mute ? { discard: true } : { bitrate: bitrates?.audio ?? opts.audioBitrate ?? QUALITY[opts.quality ?? "medium"] },
    });
    if (!conversion.isValid) throw new Error(explain(conversion.discardedTracks.map((d) => d.reason)));
    signal?.throwIfAborted();
    conversion.onProgress = (p) => onProgress?.(p);
    const abort = () => void conversion.cancel();
    signal?.addEventListener("abort", abort);
    try {
      await conversion.execute();
    } finally {
      signal?.removeEventListener("abort", abort);
    }
    const buffer = (output.target as BufferTarget).buffer;
    if (!buffer) throw new Error("The conversion produced no data.");
    return new Blob([buffer], { type: info.mime });
  } finally {
    input.dispose();
  }
}

function explain(reasons: string[]): string {
  if (reasons.some((r) => r.includes("undecodable"))) return "This browser can't decode this file's codec. Try Chrome or Edge, or convert the file to MP4 first.";
  if (reasons.some((r) => r.includes("no_encodable"))) return "This browser can't encode to that format. Pick another format.";
  return "This file can't be converted with these settings.";
}
