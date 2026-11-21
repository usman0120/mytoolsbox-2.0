import { ProcessingResult } from "@/lib/processing/types";

export interface CropOptions {
  x: number;
  y: number;
  width: number;
  height: number;
  circleCrop?: boolean;
  format?: "image/jpeg" | "image/png" | "image/webp";
}

export async function cropImage(file: File, options: CropOptions): Promise<ProcessingResult> {
  if (!file.type.startsWith("image/")) {
    return { status: "unsupported", error: "Selected file is not an image." };
  }

  const { x, y, width, height, circleCrop = false, format } = options;

  if (width <= 0 || height <= 0) {
    return { status: "error", error: "Crop dimensions must be positive." };
  }

  return new Promise((resolve) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = () => { img.src = reader.result as string; };
    reader.readAsDataURL(file);

    img.onload = () => {
      // Clamp bounds to prevent canvas errors
      const cropX = Math.max(0, Math.min(x, img.width - 1));
      const cropY = Math.max(0, Math.min(y, img.height - 1));
      const cropW = Math.min(width, img.width - cropX);
      const cropH = Math.min(height, img.height - cropY);

      if (cropW <= 0 || cropH <= 0) {
        resolve({ status: "error", error: "Invalid crop selection boundaries." });
        return;
      }

      const canvas = document.createElement("canvas");
      canvas.width = cropW;
      canvas.height = cropH;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });

      if (!ctx) {
        resolve({ status: "error", error: "Failed to initialize canvas context." });
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      if (circleCrop) {
        ctx.beginPath();
        ctx.arc(cropW / 2, cropH / 2, Math.min(cropW, cropH) / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
      }

      ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

      // Circle crops require PNG for transparent corners
      const outputFormat = circleCrop ? "image/png" : (format || (file.type === "image/png" ? "image/png" : "image/jpeg"));
      const ext = outputFormat === "image/png" ? "png" : outputFormat === "image/webp" ? "webp" : "jpg";

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve({ status: "error", error: "Failed to crop image." });
            return;
          }
          const url = URL.createObjectURL(blob);
          const downloadName = `${file.name.replace(/\.[^.]+$/, "")}_crop.${ext}`;

          resolve({
            status: "success",
            outputBlob: blob,
            outputUrl: url,
            message: `Cropped to ${Math.round(cropW)}×${Math.round(cropH)}px`,
            data: {
              downloadName,
              width: cropW,
              height: cropH,
              size: blob.size,
            },
          });
        },
        outputFormat,
        0.95
      );
    };

    img.onerror = () => {
      resolve({ status: "error", error: "Failed to load image." });
    };
  });
}