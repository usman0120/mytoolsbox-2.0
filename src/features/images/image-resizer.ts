import { ProcessingResult } from "@/lib/processing/types";

export interface ResizeOptions {
  width?: number;
  height?: number;
  percentage?: number;
  maintainAspectRatio?: boolean;
  fitMode?: "stretch" | "contain" | "cover";
  backgroundColor?: string;
  format?: "image/jpeg" | "image/png" | "image/webp";
}

export async function resizeImage(file: File, options: ResizeOptions = {}): Promise<ProcessingResult> {
  if (!file.type.startsWith("image/")) {
    return { status: "unsupported", error: "Selected file is not an image." };
  }

  const {
    width,
    height,
    percentage,
    maintainAspectRatio = true,
    fitMode = "stretch",
    backgroundColor = "#ffffff",
    format,
  } = options;

  return new Promise((resolve) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = () => { img.src = reader.result as string; };
    reader.readAsDataURL(file);

    img.onload = () => {
      let targetWidth = img.width;
      let targetHeight = img.height;

      if (percentage) {
        targetWidth = Math.round(img.width * (percentage / 100));
        targetHeight = Math.round(img.height * (percentage / 100));
      } else if (width && height) {
        if (maintainAspectRatio && fitMode === "stretch") {
          const ratio = img.width / img.height;
          if (width / height > ratio) {
            targetWidth = Math.round(height * ratio);
            targetHeight = height;
          } else {
            targetWidth = width;
            targetHeight = Math.round(width / ratio);
          }
        } else {
          targetWidth = width;
          targetHeight = height;
        }
      } else if (width && maintainAspectRatio) {
        targetWidth = width;
        targetHeight = Math.round((img.height * width) / img.width);
      } else if (height && maintainAspectRatio) {
        targetHeight = height;
        targetWidth = Math.round((img.width * height) / img.height);
      } else if (width) {
        targetWidth = width;
      } else if (height) {
        targetHeight = height;
      }

      const canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });

      if (!ctx) {
        resolve({ status: "error", error: "Could not create canvas context." });
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      if (fitMode === "contain" && width && height) {
        canvas.width = width;
        canvas.height = height;
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, width, height);

        const hRatio = width / img.width;
        const vRatio = height / img.height;
        const ratio = Math.min(hRatio, vRatio);
        const centerShiftX = (width - img.width * ratio) / 2;
        const centerShiftY = (height - img.height * ratio) / 2;
        ctx.drawImage(img, 0, 0, img.width, img.height, centerShiftX, centerShiftY, img.width * ratio, img.height * ratio);
      } else if (fitMode === "cover" && width && height) {
        canvas.width = width;
        canvas.height = height;
        const hRatio = width / img.width;
        const vRatio = height / img.height;
        const ratio = Math.max(hRatio, vRatio);
        const centerShiftX = (width - img.width * ratio) / 2;
        const centerShiftY = (height - img.height * ratio) / 2;
        ctx.drawImage(img, 0, 0, img.width, img.height, centerShiftX, centerShiftY, img.width * ratio, img.height * ratio);
      } else {
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
      }

      let outputFormat = format;
      if (!outputFormat) {
        outputFormat = file.type === "image/png" ? "image/png" : "image/jpeg";
      }

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve({ status: "error", error: "Failed to resize image." });
            return;
          }
          const url = URL.createObjectURL(blob);
          const ext = outputFormat === "image/png" ? "png" : outputFormat === "image/webp" ? "webp" : "jpg";
          const downloadName = `${file.name.replace(/\.[^.]+$/, "")}_${canvas.width}x${canvas.height}.${ext}`;

          resolve({
            status: "success",
            outputBlob: blob,
            outputUrl: url,
            message: `Resized from ${img.width}×${img.height} to ${canvas.width}×${canvas.height}`,
            data: {
              downloadName,
              width: canvas.width,
              height: canvas.height,
              size: blob.size,
            },
          });
        },
        outputFormat,
        0.92
      );
    };

    img.onerror = () => {
      resolve({ status: "error", error: "Failed to load image." });
    };
  });
}