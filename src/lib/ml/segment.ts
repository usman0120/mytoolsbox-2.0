"use client";
// Main-thread client for the segmentation worker. One shared worker keeps loaded models warm.
import type { SegmentModel, SegmentResponse } from "./segment-models";

export type SegmentStatus = { phase: "download"; percent: number } | { phase: "running" };

export interface SegmentResult {
  mask: Uint8Array;
  width: number;
  height: number;
}

let worker: Worker | null = null;
let seq = 0;
const pending = new Map<number, { resolve: (r: SegmentResult) => void; reject: (e: Error) => void; onStatus?: (s: SegmentStatus) => void }>();

function getWorker(): Worker {
  if (worker) return worker;
  worker = new Worker(new URL("./segment.worker.ts", import.meta.url), { type: "module" });
  worker.onmessage = (e: MessageEvent<SegmentResponse>) => {
    const msg = e.data;
    const job = pending.get(msg.id);
    if (!job) return;
    if (msg.type === "progress") job.onStatus?.({ phase: "download", percent: msg.total ? Math.round((msg.loaded / msg.total) * 100) : 0 });
    else if (msg.type === "running") job.onStatus?.({ phase: "running" });
    else {
      pending.delete(msg.id);
      if (msg.type === "error") console.warn("Segmentation model error:", msg.message);
      if (msg.type === "done") job.resolve({ mask: msg.mask, width: msg.width, height: msg.height });
      else job.reject(new Error(friendly(msg.message)));
    }
  };
  worker.onerror = () => {
    for (const job of pending.values()) job.reject(new Error("The background model stopped unexpectedly. Reload the page and try again."));
    pending.clear();
    worker?.terminate();
    worker = null;
  };
  return worker;
}

function friendly(message: string) {
  if (/fetch|network|Failed to load/i.test(message)) return "Couldn't download the model. Check your connection and try again.";
  if (/memory|allocation/i.test(message)) return "This image is too large for this device. Try a smaller photo.";
  return "Background removal failed on this image. Try another photo.";
}

/** Returns an alpha mask (0-255, same size as the image) for the subject. */
export async function segment(image: Blob, model: SegmentModel, onStatus?: (s: SegmentStatus) => void): Promise<SegmentResult> {
  const bitmap = await createImageBitmap(image, { imageOrientation: "from-image" });
  const id = ++seq;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject, onStatus });
    getWorker().postMessage({ id, model, bitmap }, [bitmap]);
  });
}
