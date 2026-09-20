import { ProcessingResult } from "@/lib/processing/types";

export type GrayscaleMethod = "average" | "luminosity" | "desaturate";

interface GrayscaleOptions {
  method?: GrayscaleMethod;
}

export async function convertToGrayscale(
  file: File,
  options: GrayscaleOptions = {}
): Promise<ProcessingResult> {
  const { method = "luminosity" } = options;

  if (!file.type.startsWith("image/")) {
    return { status: "unsupported", error: "Selected file is not an image." };
  }

  return new Promise((resolve) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = () => {
      img.src = reader.result as string;
    };

    reader.onerror = () => {
      resolve({ status: "error", error: "Failed to read image file." });
    };

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        resolve({ status: "error", error: "Unable to process image." });
        return;
      }

      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        let gray: number;

        switch (method) {
          case "average":
            gray = Math.round((r + g + b) / 3);
            break;
          case "desaturate":
            gray = Math.round((Math.max(r, g, b) + Math.min(r, g, b)) / 2);
            break;
          case "luminosity":
          default:
            // Perceived luminosity weights (human eye is more sensitive to green)
            gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
            break;
        }

        data[i] = gray;
        data[i + 1] = gray;
        data[i + 2] = gray;
        // Alpha channel unchanged
      }

      ctx.putImageData(imageData, 0, 0);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve({ status: "error", error: "Grayscale conversion failed." });
            return;
          }

          const url = URL.createObjectURL(blob);
          const originalName = file.name.replace(/\.[^.]+$/, "");
          const ext = file.type === "image/png" ? "png" : "jpg";

          resolve({
            status: "success",
            outputBlob: blob,
            outputUrl: url,
            message: `Converted to grayscale using ${method} method`,
            data: { downloadName: `${originalName}_grayscale.${ext}` },
          });
        },
        file.type || "image/png",
        0.95
      );
    };

    img.onerror = () => {
      resolve({ status: "error", error: "Failed to load image for grayscale conversion." });
    };

    reader.readAsDataURL(file);
  });
}