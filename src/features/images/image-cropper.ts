import { ProcessingResult } from "@/lib/processing/types";

interface CropOptions {
  x: number;
  y: number;
  width: number;
  height: number;
  format?: "image/jpeg" | "image/png" | "image/webp";
}

export async function cropImage(file: File, options: CropOptions): Promise<ProcessingResult> {
  if (!file.type.startsWith("image/")) {
    return { status: "unsupported", error: "Selected file is not an image." };
  }

  const { x, y, width, height, format } = options;

  if (width <= 0 || height <= 0) {
    return { status: "error", error: "Crop dimensions must be positive." };
  }

  return new Promise((resolve) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = () => { img.src = reader.result as string; };
    reader.readAsDataURL(file);

    img.onload = () => {
      if (x + width > img.width || y + height > img.height || x < 0 || y < 0) {
        resolve({ status: "error", error: "Crop area exceeds image boundaries." });
        return;
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, x, y, width, height, 0, 0, width, height);

      const outputFormat = format || file.type === "image/png" ? "image/png" : "image/jpeg";
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve({ status: "error", error: "Failed to crop image." });
            return;
          }
          const url = URL.createObjectURL(blob);
          resolve({
            status: "success",
            outputBlob: blob,
            outputUrl: url,
            message: `Cropped to ${width}×${height}px`,
          });
        },
        outputFormat,
        0.9
      );
    };

    img.onerror = () => {
      resolve({ status: "error", error: "Failed to load image." });
    };
  });
}