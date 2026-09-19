import { ProcessingResult } from "@/lib/processing/types";

interface CompressOptions {
  quality?: number; // 0.1 to 1.0
  maxWidth?: number;
  maxHeight?: number;
  format?: "image/jpeg" | "image/png" | "image/webp";
}

export async function compressImage(
  file: File,
  options: CompressOptions = {}
): Promise<ProcessingResult> {
  const { quality = 0.7, maxWidth = 1920, maxHeight = 1920, format } = options;

  if (!file.type.startsWith("image/")) {
    return { status: "unsupported", error: "Selected file is not an image." };
  }

  return new Promise((resolve) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = () => {
      img.src = reader.result as string;
    };

    img.onload = () => {
      let { width, height } = img;

      // Scale down if needed
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
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, width, height);

      const outputFormat = format || file.type === "image/png" ? "image/png" : "image/jpeg";

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve({ status: "error", error: "Failed to compress image." });
            return;
          }
          const url = URL.createObjectURL(blob);
          const reduction = file.size > 0
            ? Math.round((1 - blob.size / file.size) * 100)
            : 0;

          resolve({
            status: "success",
            outputBlob: blob,
            outputUrl: url,
            message: `Compressed! Size reduced by ${reduction}% (${formatSize(file.size)} → ${formatSize(blob.size)})`,
          });
        },
        outputFormat,
        quality
      );
    };

    img.onerror = () => {
      resolve({ status: "error", error: "Failed to load image." });
    };

    reader.readAsDataURL(file);
  });
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}