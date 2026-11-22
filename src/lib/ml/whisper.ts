"use client";
// Main-thread client for the Whisper worker, plus audio decoding to 16 kHz mono.
import type { WhisperChunk, WhisperModel, WhisperResponse } from "./whisper-models";

export type WhisperStatus = { phase: "download"; percent: number } | { phase: "running"; done: number; total: number; text: string };

let worker: Worker | null = null;
let seq = 0;
const jobs = new Map<number, { resolve: (r: { text: string; chunks: WhisperChunk[] }) => void; reject: (e: Error) => void; onStatus?: (s: WhisperStatus) => void }>();

function getWorker() {
  if (worker) return worker;
  worker = new Worker(new URL("./whisper.worker.ts", import.meta.url), { type: "module" });
  worker.onmessage = (e: MessageEvent<WhisperResponse>) => {
    const m = e.data;
    const job = jobs.get(m.id);
    if (!job) return;
    if (m.type === "download") job.onStatus?.({ phase: "download", percent: m.total ? Math.round((m.loaded / m.total) * 100) : 0 });
    else if (m.type === "progress") job.onStatus?.({ phase: "running", done: m.done, total: m.total, text: m.text });
    else {
      jobs.delete(m.id);
      if (m.type === "error") console.warn("Speech model error:", m.message);
      if (m.type === "done") job.resolve({ text: m.text, chunks: m.chunks });
      else job.reject(new Error(/fetch|network/i.test(m.message) ? "Couldn't download the speech model. Check your connection and try again." : "Transcription failed. Try a shorter or clearer recording."));
    }
  };
  worker.onerror = () => {
    for (const j of jobs.values()) j.reject(new Error("The speech model stopped unexpectedly, probably out of memory. Try the Fast model or a shorter file."));
    jobs.clear();
    worker?.terminate();
    worker = null;
  };
  return worker;
}

/** Stops any running transcription (the worker is restarted on the next run). */
export function cancelTranscription() {
  worker?.terminate();
  worker = null;
  for (const j of jobs.values()) j.reject(new Error("Stopped."));
  jobs.clear();
}

export function transcribe(audio: Float32Array, opts: { model: WhisperModel; language: string; task: "transcribe" | "translate" }, onStatus?: (s: WhisperStatus) => void) {
  const id = ++seq;
  return new Promise<{ text: string; chunks: WhisperChunk[] }>((resolve, reject) => {
    jobs.set(id, { resolve, reject, onStatus });
    getWorker().postMessage({ id, audio, ...opts }, [audio.buffer]);
  });
}

/** Decodes any audio or video file the browser can read into 16 kHz mono samples. */
export async function decodeTo16k(file: Blob): Promise<Float32Array> {
  const decode = async (b: Blob) => {
    const ctx = new OfflineAudioContext(1, 1, 16000);
    const buf = await ctx.decodeAudioData(await b.arrayBuffer());
    if (buf.numberOfChannels === 1) return buf.getChannelData(0).slice();
    const out = new Float32Array(buf.length);
    for (let c = 0; c < buf.numberOfChannels; c++) {
      const ch = buf.getChannelData(c);
      for (let i = 0; i < out.length; i++) out[i] += ch[i] / buf.numberOfChannels;
    }
    return out;
  };
  try {
    return await decode(file);
  } catch {
    // Containers the audio decoder can't open directly (MKV, some MOV): extract to WAV first.
    const { transcode } = await import("@/lib/media/transcode");
    return decode(await transcode(file, { format: "wav" }));
  }
}
