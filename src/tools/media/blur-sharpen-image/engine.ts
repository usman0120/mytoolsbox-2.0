import { ProcessingResult } from "@/lib/processing/types";

export type FilterType = "blur" | "sharpen" | "edgeDetect" | "emboss" | "vignette";

export interface FilterOptions {
  type: FilterType;
  intensity?: number; // 1-20
  format?: "png" | "jpeg" | "webp";
  quality?: number;
}

export async function applyFilter(
  file: File,
  options: FilterOptions
): Promise<ProcessingResult> {
  const { type, intensity = 5, format = "png", quality = 0.95 } = options;

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

      if (type === "blur") {
        // Fast, high quality canvas blur filter
        ctx.filter = `blur(${Math.max(1, intensity)}px)`;
        ctx.drawImage(img, 0, 0);
        ctx.filter = "none";
      } else if (type === "vignette") {
        ctx.drawImage(img, 0, 0);
        const radius = Math.max(canvas.width, canvas.height) * 0.75;
        const vignette = ctx.createRadialGradient(
          canvas.width / 2,
          canvas.height / 2,
          radius * (1 - Math.min(0.9, intensity * 0.05)),
          canvas.width / 2,
          canvas.height / 2,
          radius
        );
        vignette.addColorStop(0, "rgba(0, 0, 0, 0)");
        vignette.addColorStop(1, `rgba(0, 0, 0, ${Math.min(0.95, intensity * 0.08)})`);
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else {
        // Convolution kernel for sharpen, edgeDetect, emboss
        ctx.drawImage(img, 0, 0);
        const srcData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const dstData = ctx.createImageData(canvas.width, canvas.height);

        const s = Math.min(10, Math.max(1, intensity)) * 0.15;
        let kernel: number[];
        let offset = 0;

        if (type === "sharpen") {
          kernel = [
            0, -s, 0,
            -s, 1 + 4 * s, -s,
            0, -s, 0,
          ];
        } else if (type === "edgeDetect") {
          kernel = [
            -1, -1, -1,
            -1, 8, -1,
            -1, -1, -1,
          ];
          offset = 128;
        } else {
          // emboss
          kernel = [
            -2, -1, 0,
            -1, 1, 1,
            0, 1, 2,
          ];
          offset = 128;
        }

        const size = 3;
        const half = 1;
        const src = srcData.data;
        const dst = dstData.data;
        const w = srcData.width;
        const h = srcData.height;

        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            let r = 0, g = 0, b = 0;

            for (let ky = 0; ky < size; ky++) {
              for (let kx = 0; kx < size; kx++) {
                const px = Math.min(Math.max(x + kx - half, 0), w - 1);
                const py = Math.min(Math.max(y + ky - half, 0), h - 1);
                const idx = (py * w + px) * 4;
                const kVal = kernel[ky * size + kx];

                r += src[idx] * kVal;
                g += src[idx + 1] * kVal;
                b += src[idx + 2] * kVal;
              }
            }

            const dstIdx = (y * w + x) * 4;
            dst[dstIdx] = Math.min(255, Math.max(0, r + offset));
            dst[dstIdx + 1] = Math.min(255, Math.max(0, g + offset));
            dst[dstIdx + 2] = Math.min(255, Math.max(0, b + offset));
            dst[dstIdx + 3] = src[(y * w + x) * 4 + 3];
          }
        }

        ctx.putImageData(dstData, 0, 0);
      }

      const mimeType = format === "png" ? "image/png" : format === "webp" ? "image/webp" : "image/jpeg";
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve({ status: "error", error: "Filter application failed." });
            return;
          }

          const url = URL.createObjectURL(blob);
          const originalName = file.name.replace(/\.[^.]+$/, "");
          const ext = format === "png" ? "png" : format === "webp" ? "webp" : "jpg";

          resolve({
            status: "success",
            outputBlob: blob,
            outputUrl: url,
            message: `${type} filter applied (intensity: ${intensity})`,
            data: { downloadName: `${originalName}_${type}.${ext}` },
          });
        },
        mimeType,
        quality
      );
    };

    img.onerror = () => {
      resolve({ status: "error", error: "Failed to load image for filtering." });
    };

    reader.readAsDataURL(file);
  });
}