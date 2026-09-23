import { ProcessingResult } from "@/lib/processing/types";

export type GrayscaleMethod =
  | "luminosity"
  | "noir"
  | "sepia"
  | "cyanotype"
  | "silver"
  | "average"
  | "desaturate";

export interface GrayscaleOptions {
  method?: GrayscaleMethod;
  contrast?: number; // -50 to 50
  brightness?: number; // -50 to 50
  grain?: number; // 0 to 100
  format?: "png" | "jpeg" | "webp";
  quality?: number;
}

export async function convertToGrayscale(
  file: File,
  options: GrayscaleOptions = {}
): Promise<ProcessingResult> {
  const {
    method = "luminosity",
    contrast = 0,
    brightness = 0,
    grain = 0,
    format = "png",
    quality = 0.95,
  } = options;

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
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        resolve({ status: "error", error: "Unable to process image." });
        return;
      }

      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Contrast factor calculation
      const contrastFactor = (259 * (contrast + 255)) / (255 * (259 - contrast));

      for (let i = 0; i < data.length; i += 4) {
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];

        let gray = 0;

        switch (method) {
          case "average":
            gray = Math.round((r + g + b) / 3);
            break;
          case "desaturate":
            gray = Math.round((Math.max(r, g, b) + Math.min(r, g, b)) / 2);
            break;
          case "noir": {
            // High contrast B&W with deepened shadows
            const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
            gray = Math.min(255, Math.max(0, Math.pow(lum / 255, 1.35) * 270));
            break;
          }
          case "silver": {
            // Fine-grained silver gelatin look with gentle highlights
            const lum = 0.299 * r + 0.587 * g + 0.114 * b;
            gray = Math.min(255, Math.max(0, 128 + 1.25 * (lum - 128)));
            break;
          }
          case "sepia":
          case "cyanotype":
          case "luminosity":
          default:
            // Standard perceived luminosity (ITU-R BT.709)
            gray = Math.round(0.2126 * r + 0.7152 * g + 0.0722 * b);
            break;
        }

        // Apply Brightness
        if (brightness !== 0) {
          gray = Math.min(255, Math.max(0, gray + brightness));
        }

        // Apply Contrast
        if (contrast !== 0) {
          gray = Math.min(255, Math.max(0, contrastFactor * (gray - 128) + 128));
        }

        // Apply Film Grain noise
        if (grain > 0) {
          const noise = (Math.random() - 0.5) * (grain * 0.8);
          gray = Math.min(255, Math.max(0, gray + noise));
        }

        // Tonal color mapping for sepia and cyanotype
        if (method === "sepia") {
          data[i] = Math.min(255, Math.round(gray * 1.15)); // warm red
          data[i + 1] = Math.min(255, Math.round(gray * 0.95)); // golden green
          data[i + 2] = Math.min(255, Math.round(gray * 0.75)); // muted blue
        } else if (method === "cyanotype") {
          data[i] = Math.min(255, Math.round(gray * 0.65)); // reduced red
          data[i + 1] = Math.min(255, Math.round(gray * 0.9)); // teal green
          data[i + 2] = Math.min(255, Math.round(gray * 1.2)); // rich cyan blue
        } else {
          data[i] = gray;
          data[i + 1] = gray;
          data[i + 2] = gray;
        }
      }

      ctx.putImageData(imageData, 0, 0);

      const mimeType = format === "png" ? "image/png" : format === "webp" ? "image/webp" : "image/jpeg";
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve({ status: "error", error: "Grayscale conversion failed." });
            return;
          }

          const url = URL.createObjectURL(blob);
          const originalName = file.name.replace(/\.[^.]+$/, "");
          const ext = format === "png" ? "png" : format === "webp" ? "webp" : "jpg";

          resolve({
            status: "success",
            outputBlob: blob,
            outputUrl: url,
            message: `Converted with photographic ${method} toning`,
            data: { downloadName: `${originalName}_${method}.${ext}` },
          });
        },
        mimeType,
        quality
      );
    };

    img.onerror = () => {
      resolve({ status: "error", error: "Failed to load image for grayscale conversion." });
    };

    reader.readAsDataURL(file);
  });
}