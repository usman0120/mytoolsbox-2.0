import { ProcessingResult } from "@/lib/processing/types";

export interface CompressOptions {
  quality?: number; // 0.05 to 1.0
  maxWidth?: number;
  maxHeight?: number;
  format?: "auto" | "image/jpeg" | "image/webp" | "image/png";
}

export interface CompressionStats {
  originalSize: number;
  compressedSize: number;
  savingsPercent: number;
  originalWidth: number;
  originalHeight: number;
  outputWidth: number;
  outputHeight: number;
  outputFormat: string;
}

export async function compressImage(
  file: File,
  options: CompressOptions = {}
): Promise<ProcessingResult> {
  const { quality = 0.75, maxWidth = 4096, maxHeight = 4096, format = "auto" } = options;

  if (!file.type.startsWith("image/")) {
    return { status: "unsupported", error: "Selected file is not a supported image." };
  }

  return new Promise((resolve) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = () => {
      img.src = reader.result as string;
    };

    img.onload = () => {
      let { width, height } = img;
      const originalWidth = width;
      const originalHeight = height;

      // Downscale if maximum bounds specified
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      if (height > maxHeight) {
        width = Math.round((width * maxHeight) / height);
        height = maxHeight;
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });

      if (!ctx) {
        resolve({ status: "error", error: "Failed to initialize canvas context." });
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // If output is JPEG and source has alpha channel, fill background with white
      let targetMime = "image/jpeg";
      if (format === "auto") {
        targetMime = file.type === "image/png" ? "image/png" : "image/jpeg";
      } else {
        targetMime = format;
      }

      if (targetMime === "image/jpeg") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, width, height);
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve({ status: "error", error: "Failed to compress image." });
            return;
          }

          const url = URL.createObjectURL(blob);
          const savings = file.size > 0 ? Math.round((1 - blob.size / file.size) * 100) : 0;

          const stats: CompressionStats = {
            originalSize: file.size,
            compressedSize: blob.size,
            savingsPercent: Math.max(0, savings),
            originalWidth,
            originalHeight,
            outputWidth: width,
            outputHeight: height,
            outputFormat: targetMime,
          };

          const ext = targetMime === "image/png" ? "png" : targetMime === "image/webp" ? "webp" : "jpg";
          const downloadName = `${file.name.replace(/\.[^.]+$/, "")}_compressed.${ext}`;

          resolve({
            status: "success",
            outputBlob: blob,
            outputUrl: url,
            message: `Compressed! Reduced by ${stats.savingsPercent}% (${formatSize(file.size)} → ${formatSize(blob.size)})`,
            data: {
              downloadName,
              stats,
            },
          });
        },
        targetMime,
        quality
      );
    };

    img.onerror = () => {
      resolve({ status: "error", error: "Failed to load image file." });
    };

    reader.readAsDataURL(file);
  });
}

export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}