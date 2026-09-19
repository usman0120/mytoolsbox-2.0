import { ProcessingResult } from "@/lib/processing/types";

interface ResizeOptions {
  width?: number;
  height?: number;
  percentage?: number;
  maintainAspectRatio?: boolean;
  format?: "image/jpeg" | "image/png" | "image/webp";
}

export async function resizeImage(file: File, options: ResizeOptions = {}): Promise<ProcessingResult> {
  if (!file.type.startsWith("image/")) {
    return { status: "unsupported", error: "Selected file is not an image." };
  }

  const { width, height, percentage, maintainAspectRatio = true, format } = options;

  return new Promise((resolve) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = () => { img.src = reader.result as string; };
    reader.readAsDataURL(file);

    img.onload = () => {
      let newWidth = img.width;
      let newHeight = img.height;

      if (percentage) {
        newWidth = Math.round(img.width * (percentage / 100));
        newHeight = Math.round(img.height * (percentage / 100));
      } else if (width && height) {
        newWidth = width;
        newHeight = height;
      } else if (width && maintainAspectRatio) {
        newWidth = width;
        newHeight = Math.round((img.height * width) / img.width);
      } else if (height && maintainAspectRatio) {
        newHeight = height;
        newWidth = Math.round((img.width * height) / img.height);
      } else if (width) {
        newWidth = width;
      } else if (height) {
        newHeight = height;
      }

      const canvas = document.createElement("canvas");
      canvas.width = newWidth;
      canvas.height = newHeight;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, newWidth, newHeight);

      const outputFormat = format || file.type === "image/png" ? "image/png" : "image/jpeg";
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve({ status: "error", error: "Failed to resize image." });
            return;
          }
          const url = URL.createObjectURL(blob);
          resolve({
            status: "success",
            outputBlob: blob,
            outputUrl: url,
            message: `Resized from ${img.width}×${img.height} to ${newWidth}×${newHeight}`,
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