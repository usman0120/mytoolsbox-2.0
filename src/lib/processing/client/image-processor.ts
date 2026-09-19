// ---------------------------------------------------------------------------
// Client-side Image Processor (Canvas API)
// ---------------------------------------------------------------------------

import type { ProcessingResult, ProcessingOptions } from "../types";

export interface ImageProcessOptions extends ProcessingOptions {
  width?: number;
  height?: number;
  maintainAspectRatio?: boolean;
  outputFormat?: "image/jpeg" | "image/png" | "image/webp" | "image/avif";
  quality?: number; // 0-1
  filters?: ImageFilters;
}

export interface ImageFilters {
  brightness?: number; // 0-200 (100 = normal)
  contrast?: number;   // 0-200 (100 = normal)
  saturation?: number; // 0-200 (100 = normal)
  blur?: number;       // px
  grayscale?: boolean;
  sepia?: boolean;
  invert?: boolean;
  rotate?: number;     // degrees
  flipH?: boolean;
  flipV?: boolean;
}

export async function processImageClient(
  file: File,
  options: ImageProcessOptions = {}
): Promise<ProcessingResult> {
  try {
    const bitmap = await createImageBitmap(file);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;

    // Calculate dimensions
    let width = options.width ?? bitmap.width;
    let height = options.height ?? bitmap.height;

    if (options.maintainAspectRatio !== false) {
      const ratio = Math.min(width / bitmap.width, height / bitmap.height);
      width = Math.round(bitmap.width * ratio);
      height = Math.round(bitmap.height * ratio);
    }

    canvas.width = width;
    canvas.height = height;

    // Apply filters
    if (options.filters) {
      applyImageFilters(ctx, bitmap, width, height, options.filters);
    } else {
      ctx.drawImage(bitmap, 0, 0, width, height);
    }

    // Convert to blob
    const outputFormat = options.outputFormat ?? "image/jpeg";
    const quality = options.quality ?? 0.85;
    const blob = await canvasToBlob(canvas, outputFormat, quality);

    return {
      status: "success",
      outputBlob: blob,
      outputUrl: URL.createObjectURL(blob),
      message: `Image processed: ${width}x${height}, ${(blob.size / 1024).toFixed(1)}KB`,
    };
  } catch (error) {
    return {
      status: "error",
      error: error instanceof Error ? error.message : "Image processing failed",
    };
  }
}

function applyImageFilters(
  ctx: CanvasRenderingContext2D,
  bitmap: ImageBitmap,
  width: number,
  height: number,
  filters: ImageFilters
): void {
  ctx.drawImage(bitmap, 0, 0, width, height);

  if (!hasActiveFilters(filters)) return;

  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    // Brightness
    if (filters.brightness !== undefined && filters.brightness !== 100) {
      const factor = filters.brightness / 100;
      r = Math.min(255, r * factor);
      g = Math.min(255, g * factor);
      b = Math.min(255, b * factor);
    }

    // Contrast
    if (filters.contrast !== undefined && filters.contrast !== 100) {
      const factor = (filters.contrast + 100) / 100;
      r = Math.min(255, ((r / 255 - 0.5) * factor + 0.5) * 255);
      g = Math.min(255, ((g / 255 - 0.5) * factor + 0.5) * 255);
      b = Math.min(255, ((b / 255 - 0.5) * factor + 0.5) * 255);
    }

    // Saturation
    if (filters.saturation !== undefined && filters.saturation !== 100) {
      const factor = filters.saturation / 100;
      const gray = 0.2989 * r + 0.587 * g + 0.114 * b;
      r = Math.min(255, gray + factor * (r - gray));
      g = Math.min(255, gray + factor * (g - gray));
      b = Math.min(255, gray + factor * (b - gray));
    }

    // Grayscale
    if (filters.grayscale) {
      const gray = 0.2989 * r + 0.587 * g + 0.114 * b;
      r = g = b = gray;
    }

    // Sepia
    if (filters.sepia) {
      const tr = 0.393 * r + 0.769 * g + 0.189 * b;
      const tg = 0.349 * r + 0.686 * g + 0.168 * b;
      const tb = 0.272 * r + 0.534 * g + 0.131 * b;
      r = Math.min(255, tr);
      g = Math.min(255, tg);
      b = Math.min(255, tb);
    }

    // Invert
    if (filters.invert) {
      r = 255 - r;
      g = 255 - g;
      b = 255 - b;
    }

    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
  }

  ctx.putImageData(imageData, 0, 0);
}

function hasActiveFilters(filters: ImageFilters): boolean {
  return (
    (filters.brightness !== undefined && filters.brightness !== 100) ||
    (filters.contrast !== undefined && filters.contrast !== 100) ||
    (filters.saturation !== undefined && filters.saturation !== 100) ||
    filters.grayscale === true ||
    filters.sepia === true ||
    filters.invert === true
  );
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  format: string,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Canvas toBlob returned null"));
      },
      format,
      quality
    );
  });
}

// ---------------------------------------------------------------------------
// Crop
// ---------------------------------------------------------------------------

export interface CropOptions {
  x: number;
  y: number;
  width: number;
  height: number;
  outputFormat?: "image/jpeg" | "image/png" | "image/webp";
  quality?: number;
}

export async function cropImageClient(
  file: File,
  options: CropOptions
): Promise<ProcessingResult> {
  try {
    const bitmap = await createImageBitmap(file);
    const canvas = document.createElement("canvas");
    canvas.width = options.width;
    canvas.height = options.height;
    const ctx = canvas.getContext("2d")!;

    ctx.drawImage(
      bitmap,
      options.x, options.y, options.width, options.height,
      0, 0, options.width, options.height
    );

    const format = options.outputFormat ?? "image/jpeg";
    const quality = options.quality ?? 0.92;
    const blob = await canvasToBlob(canvas, format, quality);

    return {
      status: "success",
      outputBlob: blob,
      outputUrl: URL.createObjectURL(blob),
      message: `Image cropped to ${options.width}x${options.height}`,
    };
  } catch (error) {
    return {
      status: "error",
      error: error instanceof Error ? error.message : "Image crop failed",
    };
  }
}

// ---------------------------------------------------------------------------
// Rotate
// ---------------------------------------------------------------------------

export async function rotateImageClient(
  file: File,
  degrees: number,
  outputFormat?: "image/jpeg" | "image/png" | "image/webp"
): Promise<ProcessingResult> {
  try {
    const bitmap = await createImageBitmap(file);
    const radians = (degrees * Math.PI) / 180;
    const cos = Math.abs(Math.cos(radians));
    const sin = Math.abs(Math.sin(radians));

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * cos + bitmap.height * sin);
    canvas.height = Math.round(bitmap.width * sin + bitmap.height * cos);
    const ctx = canvas.getContext("2d")!;

    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(radians);
    ctx.drawImage(bitmap, -bitmap.width / 2, -bitmap.height / 2);

    const format = outputFormat ?? "image/png";
    const blob = await canvasToBlob(canvas, format, 0.92);

    return {
      status: "success",
      outputBlob: blob,
      outputUrl: URL.createObjectURL(blob),
      message: `Image rotated ${degrees}°`,
    };
  } catch (error) {
    return {
      status: "error",
      error: error instanceof Error ? error.message : "Image rotation failed",
    };
  }
}

// ---------------------------------------------------------------------------
// Watermark
// ---------------------------------------------------------------------------

export interface WatermarkOptions {
  text: string;
  position?: "center" | "top-left" | "top-right" | "bottom-left" | "bottom-right";
  font?: string;
  fontSize?: number;
  color?: string;
  opacity?: number;
  outputFormat?: "image/jpeg" | "image/png" | "image/webp";
  quality?: number;
}

export async function watermarkImageClient(
  file: File,
  options: WatermarkOptions
): Promise<ProcessingResult> {
  try {
    const bitmap = await createImageBitmap(file);
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext("2d")!;

    // Draw original
    ctx.drawImage(bitmap, 0, 0);

    // Configure watermark text
    const fontSize = options.fontSize ?? Math.max(16, Math.floor(bitmap.width / 20));
    const font = options.font ?? `${fontSize}px system-ui, sans-serif`;
    const color = options.color ?? "rgba(255, 255, 255, 0.7)";
    const opacity = options.opacity ?? 0.7;

    ctx.font = font;
    ctx.fillStyle = color;
    ctx.globalAlpha = opacity;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Position
    const pos = options.position ?? "center";
    let x = canvas.width / 2;
    let y = canvas.height / 2;
    const padding = fontSize;

    switch (pos) {
      case "top-left":
        x = padding + ctx.measureText(options.text).width / 2;
        y = padding + fontSize / 2;
        break;
      case "top-right":
        x = canvas.width - padding - ctx.measureText(options.text).width / 2;
        y = padding + fontSize / 2;
        break;
      case "bottom-left":
        x = padding + ctx.measureText(options.text).width / 2;
        y = canvas.height - padding - fontSize / 2;
        break;
      case "bottom-right":
        x = canvas.width - padding - ctx.measureText(options.text).width / 2;
        y = canvas.height - padding - fontSize / 2;
        break;
    }

    ctx.fillText(options.text, x, y);
    ctx.globalAlpha = 1;

    const format = options.outputFormat ?? "image/jpeg";
    const quality = options.quality ?? 0.9;
    const blob = await canvasToBlob(canvas, format, quality);

    return {
      status: "success",
      outputBlob: blob,
      outputUrl: URL.createObjectURL(blob),
      message: "Watermark applied",
    };
  } catch (error) {
    return {
      status: "error",
      error: error instanceof Error ? error.message : "Watermark failed",
    };
  }
}

// ---------------------------------------------------------------------------
// Metadata removal (strip EXIF)
// ---------------------------------------------------------------------------

export async function removeImageMetadataClient(
  file: File,
  outputFormat?: "image/jpeg" | "image/png" | "image/webp"
): Promise<ProcessingResult> {
  try {
    const bitmap = await createImageBitmap(file);
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext("2d")!;

    // Drawing via Canvas strips all EXIF/metadata
    ctx.drawImage(bitmap, 0, 0);

    const format = outputFormat ?? "image/png";
    const blob = await canvasToBlob(canvas, format, 0.95);

    return {
      status: "success",
      outputBlob: blob,
      outputUrl: URL.createObjectURL(blob),
      message: `Metadata removed. Original: ${(file.size / 1024).toFixed(1)}KB → Clean: ${(blob.size / 1024).toFixed(1)}KB`,
    };
  } catch (error) {
    return {
      status: "error",
      error: error instanceof Error ? error.message : "Metadata removal failed",
    };
  }
}