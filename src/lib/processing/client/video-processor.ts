// ---------------------------------------------------------------------------
// Client-side Video Processor (Canvas + MediaRecorder + ffmpeg.wasm)
// ---------------------------------------------------------------------------

import type { ProcessingResult } from "../types";

// ---------------------------------------------------------------------------
// Configurable limits
// ---------------------------------------------------------------------------

export const VIDEO_LIMITS = {
  /** Maximum file size for client-side processing (bytes). Default: 500MB */
  maxFileSize: 500 * 1024 * 1024,
  /** Maximum video duration for client-side processing (seconds). Default: 300s (5 min) */
  maxDuration: 300,
  /** Maximum output resolution width (pixels). Default: 1920 */
  maxResolution: 1920,
  /** Default output format */
  defaultFormat: "video/webm" as const,
} as const;

export interface VideoLimits {
  maxFileSize?: number;
  maxDuration?: number;
  maxResolution?: number;
}

/**
 * Check if a video file is within client-side processing limits.
 */
export function checkVideoLimits(
  file: File,
  duration: number,
  resolution: { width: number; height: number },
  limits?: VideoLimits
): { withinLimits: boolean; reason?: string } {
  const maxSize = limits?.maxFileSize ?? VIDEO_LIMITS.maxFileSize;
  const maxDuration = limits?.maxDuration ?? VIDEO_LIMITS.maxDuration;
  const maxResolution = limits?.maxResolution ?? VIDEO_LIMITS.maxResolution;

  if (file.size > maxSize) {
    return {
      withinLimits: false,
      reason: `File size (${(file.size / 1024 / 1024).toFixed(1)}MB) exceeds limit (${(maxSize / 1024 / 1024).toFixed(0)}MB). Use cloud processing.`,
    };
  }
  if (duration > maxDuration) {
    return {
      withinLimits: false,
      reason: `Video duration (${duration.toFixed(1)}s) exceeds limit (${maxDuration}s). Use cloud processing.`,
    };
  }
  if (resolution.width > maxResolution || resolution.height > maxResolution) {
    return {
      withinLimits: false,
      reason: `Resolution (${resolution.width}x${resolution.height}) exceeds limit (${maxResolution}px). Use cloud processing.`,
    };
  }
  return { withinLimits: true };
}

/**
 * Get video metadata (duration, resolution, codec info).
 */
export async function getVideoMetadata(
  file: File
): Promise<{ duration: number; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.src = URL.createObjectURL(file);
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src);
      resolve({
        duration: video.duration,
        width: video.videoWidth,
        height: video.videoHeight,
      });
    };
    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      reject(new Error("Failed to load video metadata"));
    };
  });
}

export interface VideoTrimOptions {
  startTime: number; // seconds
  endTime: number;   // seconds
  outputFormat?: "video/webm" | "video/mp4";
}

export interface VideoToGIFOptions {
  startTime?: number;
  duration?: number; // max duration in seconds
  width?: number;
  fps?: number;
  quality?: number; // 0-1
}

/**
 * Trim a video client-side using Canvas + MediaRecorder.
 * Note: Limited browser support. Falls back to cloud for complex operations.
 */
export async function trimVideoClient(
  file: File,
  options: VideoTrimOptions
): Promise<ProcessingResult> {
  try {
    const video = document.createElement("video");
    video.src = URL.createObjectURL(file);
    await new Promise<void>((resolve) => {
      video.onloadedmetadata = () => resolve();
    });

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d")!;

    const stream = canvas.captureStream(30);
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
        ? "video/webm;codecs=vp9"
        : "video/webm",
    });

    const chunks: Blob[] = [];
    mediaRecorder.ondataavailable = (e) => chunks.push(e.data);

    const resultPromise = new Promise<Blob>((resolve) => {
      mediaRecorder.onstop = () => {
        resolve(new Blob(chunks, { type: mediaRecorder.mimeType }));
      };
    });

    // Seek to start time
    video.currentTime = options.startTime;
    await new Promise((resolve) => (video.onseeked = resolve));

    mediaRecorder.start();
    video.play();

    // Stop after duration
    const duration = options.endTime - options.startTime;
    setTimeout(() => {
      mediaRecorder.stop();
      video.pause();
    }, duration * 1000);

    const blob = await resultPromise;
    URL.revokeObjectURL(video.src);

    return {
      status: "success",
      outputBlob: blob,
      outputUrl: URL.createObjectURL(blob),
      message: `Video trimmed: ${duration.toFixed(1)}s`,
    };
  } catch (error) {
    return {
      status: "error",
      error: error instanceof Error ? error.message : "Video trimming failed",
    };
  }
}

/**
 * Convert video segment to GIF client-side.
 * Note: This is a simplified implementation. For production, use cloud processing.
 */
export async function videoToGIFClient(
  file: File,
  options: VideoToGIFOptions = {}
): Promise<ProcessingResult> {
  try {
    const video = document.createElement("video");
    video.src = URL.createObjectURL(file);
    await new Promise<void>((resolve) => {
      video.onloadedmetadata = () => resolve();
    });

    const fps = options.fps ?? 10;
    const maxDuration = options.duration ?? 5;
    const targetWidth = options.width ?? 480;
    const aspectRatio = video.videoHeight / video.videoWidth;
    const targetHeight = Math.round(targetWidth * aspectRatio);

    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext("2d")!;

    const frames: ImageData[] = [];
    const frameInterval = 1 / fps;
    const totalFrames = Math.floor(maxDuration * fps);

    video.currentTime = options.startTime ?? 0;
    await new Promise((resolve) => (video.onseeked = resolve));

    for (let i = 0; i < totalFrames; i++) {
      video.currentTime = (options.startTime ?? 0) + i * frameInterval;
      await new Promise((resolve) => (video.onseeked = resolve));

      ctx.drawImage(video, 0, 0, targetWidth, targetHeight);
      frames.push(ctx.getImageData(0, 0, targetWidth, targetHeight));
    }

    // For now, return frames as a simple animated WebP alternative
    // Full GIF encoding requires a library like gif.js
    // This returns the first frame as a preview
    if (frames.length > 0) {
      ctx.putImageData(frames[0], 0, 0);
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Failed"))), "image/png");
      });

      URL.revokeObjectURL(video.src);

      return {
        status: "success",
        outputBlob: blob,
        outputUrl: URL.createObjectURL(blob),
        message: `GIF preview generated (${frames.length} frames). Full GIF encoding requires cloud processing.`,
        data: { frameCount: frames.length, fps, width: targetWidth, height: targetHeight },
      };
    }

    URL.revokeObjectURL(video.src);
    return { status: "error", error: "No frames extracted" };
  } catch (error) {
    return {
      status: "error",
      error: error instanceof Error ? error.message : "Video to GIF conversion failed",
    };
  }
}

// ---------------------------------------------------------------------------
// ffmpeg.wasm – Advanced video processing (convert, compress, extract audio)
// ---------------------------------------------------------------------------

export interface FFmpegConvertOptions {
  outputFormat: "video/mp4" | "video/webm" | "audio/mp3" | "audio/aac" | "audio/wav";
  videoCodec?: "libx264" | "libvpx-vp9" | "copy";
  audioCodec?: "aac" | "libmp3lame" | "copy";
  crf?: number; // 0-51, lower = better quality (default: 23)
  resolution?: { width: number; height: number };
  fps?: number;
  startTime?: number; // seconds
  duration?: number; // seconds
  onProgress?: (percent: number) => void;
}

/**
 * Convert/compress a video using ffmpeg.wasm (loaded dynamically).
 * Falls back with a clear message if ffmpeg.wasm is not available.
 */
export async function convertVideoClient(
  file: File,
  options: FFmpegConvertOptions
): Promise<ProcessingResult> {
  try {
    // Dynamically import ffmpeg.wasm – only loads when needed
    // Using any cast since @ffmpeg/ffmpeg may not have types installed
    const ffmpegModule = await import("@ffmpeg/ffmpeg").catch(() => null);
    const utilModule = await import("@ffmpeg/util").catch(() => null);

    if (!ffmpegModule || !utilModule) {
      return {
        status: "error",
        error:
          "ffmpeg.wasm is not installed. Install it with: npm install @ffmpeg/ffmpeg @ffmpeg/util",
      };
    }

    const { FFmpeg } = ffmpegModule as { FFmpeg: new () => { load: (opts: Record<string, unknown>) => Promise<void>; writeFile: (name: string, data: unknown) => Promise<void>; readFile: (name: string) => Promise<Uint8Array>; exec: (args: string[]) => Promise<void>; on: (event: string, cb: (data: { progress: number }) => void) => void } };
    const { fetchFile, toBlobURL } = utilModule as { fetchFile: (file: File) => Promise<Uint8Array>; toBlobURL: (url: string, mime: string) => Promise<string> };

    const ffmpeg = new FFmpeg();

    // Load ffmpeg core
    const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm";
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
    });

    ffmpeg.on("progress", ({ progress }: { progress: number }) => {
      options.onProgress?.(Math.round(progress * 100));
    });

    // Write input file
    const inputName = "input." + (file.name.split(".").pop() ?? "mp4");
    await ffmpeg.writeFile(inputName, await fetchFile(file));

    // Build ffmpeg arguments
    const args: string[] = [];

    if (options.startTime !== undefined) {
      args.push("-ss", options.startTime.toString());
    }
    if (options.duration !== undefined) {
      args.push("-t", options.duration.toString());
    }

    args.push("-i", inputName);

    // Video codec
    if (options.videoCodec) {
      args.push("-c:v", options.videoCodec);
    }
    // Audio codec
    if (options.audioCodec) {
      args.push("-c:a", options.audioCodec);
    }
    // Quality (CRF)
    if (options.crf !== undefined) {
      args.push("-crf", options.crf.toString());
    }
    // Resolution
    if (options.resolution) {
      args.push("-vf", `scale=${options.resolution.width}:${options.resolution.height}`);
    }
    // FPS
    if (options.fps) {
      args.push("-r", options.fps.toString());
    }

    const ext = options.outputFormat.split("/")[1];
    const outputName = `output.${ext}`;
    args.push(outputName);

    await ffmpeg.exec(args);

    // Read output
    const data = await ffmpeg.readFile(outputName);
    const blob = new Blob([data as BlobPart], { type: options.outputFormat });

    return {
      status: "success",
      outputBlob: blob,
      outputUrl: URL.createObjectURL(blob),
      message: `Video converted to ${options.outputFormat}`,
    };
  } catch (error) {
    // If ffmpeg.wasm isn't installed, provide a helpful error
    if (error instanceof Error && error.message.includes("Cannot find module")) {
      return {
        status: "error",
        error:
          "ffmpeg.wasm is not installed. Install it with: npm install @ffmpeg/ffmpeg @ffmpeg/util",
      };
    }
    return {
      status: "error",
      error: error instanceof Error ? error.message : "Video conversion failed",
    };
  }
}

/**
 * Extract audio from a video file using ffmpeg.wasm.
 */
export async function extractAudioClient(
  file: File,
  outputFormat: "audio/mp3" | "audio/aac" | "audio/wav" = "audio/mp3"
): Promise<ProcessingResult> {
  return convertVideoClient(file, {
    outputFormat,
    videoCodec: undefined, // No video
    audioCodec: outputFormat === "audio/mp3" ? "libmp3lame" : "aac",
  });
}