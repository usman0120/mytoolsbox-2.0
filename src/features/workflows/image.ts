import type { Artifact, WorkflowStep } from "./model";

export function checkAbort(signal: AbortSignal) { if (signal.aborted) throw new DOMException("Workflow canceled", "AbortError"); }
export function canvasBlob(canvas: HTMLCanvasElement, format: string, quality = 0.9): Promise<Blob> {
  return new Promise((resolve, reject) => canvas.toBlob((blob) => {
    if (!blob) reject(new Error("The browser could not encode this image."));
    else if (blob.type !== format) reject(new Error(`${format} export is not supported by this browser. Choose JPEG or PNG.`));
    else resolve(blob);
  }, format, quality));
}
function context(canvas: HTMLCanvasElement) { const ctx = canvas.getContext("2d"); if (!ctx) throw new Error("Canvas processing is unavailable."); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = "high"; return ctx; }
const mime = (format: string) => `image/${format}`;
const extension = (format: string) => format === "jpeg" ? "jpg" : format;
export const baseName = (name: string) => name.replace(/\.[^.]+$/, "");

export async function processWorkflowImage(asset: Artifact, step: WorkflowStep, signal: AbortSignal): Promise<Artifact> {
  checkAbort(signal);
  const bitmap = await createImageBitmap(asset.blob);
  const canvas = document.createElement("canvas");
  try {
    let width = bitmap.width, height = bitmap.height;
    if (!width || !height || width * height > 40_000_000) throw new Error("Image dimensions exceed the 40-megapixel input limit.");
    const options = step.options;
    if (step.operation === "image-compress" && asset.blob.type === mime(String(options.format))) {
      const limit = Math.floor(Number(options.maxKB) * 1000);
      if (asset.blob.size < limit) {
        const header = new Uint8Array(await asset.blob.slice(0, 12).arrayBuffer());
        const jpeg = options.format === "jpeg" && header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff;
        const webp = options.format === "webp" && String.fromCharCode(...header.slice(0, 4)) === "RIFF" && String.fromCharCode(...header.slice(8, 12)) === "WEBP";
        if (jpeg || webp) {
          checkAbort(signal);
          return { ...asset, id: `${asset.id}-${step.id}`, name: `${baseName(asset.name)}.${extension(String(options.format))}`, width, height, targetBytes: limit };
        }
      }
    }
    if (step.operation === "image-resize") {
      const scale = Math.min(1, Number(options.width) / width, Number(options.height) / height);
      width = Math.max(1, Math.round(width * scale)); height = Math.max(1, Math.round(height * scale));
    } else if (step.operation === "image-crop") { width = Math.round(Number(options.width)); height = Math.round(Number(options.height)); }
    else if (step.operation === "image-rotate" && options.angle !== "180") { width = bitmap.height; height = bitmap.width; }
    canvas.width = width; canvas.height = height;
    const ctx = context(canvas);
    const format = String(options.format ?? "png");
    if (format === "jpeg") { ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, width, height); }
    if (step.operation === "image-crop") {
      const scale = Math.max(width / bitmap.width, height / bitmap.height);
      const sourceWidth = width / scale, sourceHeight = height / scale;
      ctx.drawImage(bitmap, (bitmap.width - sourceWidth) / 2, (bitmap.height - sourceHeight) / 2, sourceWidth, sourceHeight, 0, 0, width, height);
    } else if (step.operation === "image-rotate") {
      ctx.translate(width / 2, height / 2); ctx.rotate(Number(options.angle) * Math.PI / 180);
      if (options.flip) ctx.scale(-1, 1);
      ctx.drawImage(bitmap, -bitmap.width / 2, -bitmap.height / 2); ctx.resetTransform();
    } else ctx.drawImage(bitmap, 0, 0, width, height);
    if (step.operation === "image-grayscale") {
      const pixels = ctx.getImageData(0, 0, width, height);
      for (let i = 0; i < pixels.data.length; i += 4) {
        const gray = 0.2126 * pixels.data[i] + 0.7152 * pixels.data[i + 1] + 0.0722 * pixels.data[i + 2];
        pixels.data[i] = pixels.data[i + 1] = pixels.data[i + 2] = gray;
      }
      ctx.putImageData(pixels, 0, 0);
    }
    if (step.operation === "image-watermark") {
      ctx.globalAlpha = Number(options.opacity); ctx.font = `600 ${Number(options.fontSize)}px Arial, sans-serif`;
      ctx.textAlign = options.position === "center" ? "center" : "right"; ctx.textBaseline = options.position === "center" ? "middle" : "bottom";
      ctx.strokeStyle = "white"; ctx.lineWidth = 2; ctx.fillStyle = "black";
      const x = options.position === "center" ? width / 2 : width - 16, y = options.position === "center" ? height / 2 : height - 16;
      ctx.strokeText(String(options.text), x, y, Math.max(1, width - 32)); ctx.fillText(String(options.text), x, y, Math.max(1, width - 32)); ctx.globalAlpha = 1;
    }
    let blob: Blob;
    let targetBytes: number | undefined;
    if (step.operation === "image-compress") {
      targetBytes = Math.floor(Number(options.maxKB) * 1000);
      // Search for the best quality that meets the strict byte limit. Resize
      // only when allowed, and check actual encoder output after every pass.
      let found: Blob | undefined;
      for (let pass = 0; pass < 14; pass++) {
        checkAbort(signal);
        let low = Number(options.minQuality), high = 0.98;
        const minimum = await canvasBlob(canvas, mime(format), low);
        if (minimum.size < targetBytes) {
          found = minimum;
          for (let attempt = 0; attempt < 8; attempt++) {
            checkAbort(signal); const quality = (low + high) / 2;
            const candidate = await canvasBlob(canvas, mime(format), quality);
            if (candidate.size < targetBytes) { found = candidate; low = quality; } else high = quality;
          }
          break;
        }
        if (!options.allowResize || Math.min(canvas.width, canvas.height) <= 64) break;
        const next = document.createElement("canvas"); next.width = Math.max(1, Math.floor(canvas.width * 0.8)); next.height = Math.max(1, Math.floor(canvas.height * 0.8));
        context(next).drawImage(canvas, 0, 0, next.width, next.height);
        canvas.width = next.width; canvas.height = next.height; context(canvas).drawImage(next, 0, 0); next.width = next.height = 0;
      }
      if (!found || found.size >= targetBytes) throw new Error(`Could not reach ${options.maxKB} KB within the quality/resolution limits. Allow resizing, lower minimum quality, or increase the target.`);
      blob = found; width = canvas.width; height = canvas.height;
    } else blob = await canvasBlob(canvas, mime(format), Number(options.quality ?? 0.95));
    checkAbort(signal);
    return { ...asset, id: `${asset.id}-${step.id}`, name: `${baseName(asset.name)}.${extension(format)}`, kind: "image", blob, width, height, targetBytes };
  } finally { bitmap.close(); canvas.width = canvas.height = 0; }
}
