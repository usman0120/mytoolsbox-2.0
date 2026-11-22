/// <reference lib="webworker" />
// Background segmentation in a Web Worker (blueprint section 22: ML in browser, no uploads).
import { env, pipeline, RawImage, type ProgressInfo } from "@huggingface/transformers";
import { SEGMENT_MODELS, type SegmentModel, type SegmentRequest, type SegmentResponse } from "./segment-models";

env.allowLocalModels = false;
env.useBrowserCache = true;

type Remover = (image: RawImage) => Promise<RawImage>;
const loaded = new Map<SegmentModel, Promise<Remover>>();

function load(model: SegmentModel, id: number): Promise<Remover> {
  let p = loaded.get(model);
  if (!p) {
    const spec = SEGMENT_MODELS[model];
    p = pipeline("background-removal", spec.repo, {
      dtype: "q8",
      device: "wasm",
      progress_callback: (info: ProgressInfo) => {
        if (info.status === "progress_total") post({ id, type: "progress", loaded: info.loaded, total: info.total });
      },
    }).then((run) => (image: RawImage) => run(image) as Promise<RawImage>);
    p.catch(() => loaded.delete(model));
    loaded.set(model, p);
  }
  return p;
}

function post(msg: SegmentResponse, transfer: Transferable[] = []) {
  (self as unknown as DedicatedWorkerGlobalScope).postMessage(msg, transfer);
}

self.onmessage = async (e: MessageEvent<SegmentRequest>) => {
  const { id, model, bitmap } = e.data;
  try {
    const remove = await load(model, id);
    post({ id, type: "running" });
    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(bitmap, 0, 0);
    bitmap.close();
    const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const out = await remove(new RawImage(data, width, height, 4));
    // The pipeline returns RGBA with the mask in alpha; keep only the alpha channel.
    const mask = new Uint8Array(width * height);
    const src = out.data;
    for (let i = 0; i < mask.length; i++) mask[i] = src[i * 4 + 3];
    post({ id, type: "done", mask, width, height }, [mask.buffer]);
  } catch (err) {
    post({ id, type: "error", message: err instanceof Error ? err.message : String(err) });
  }
};
