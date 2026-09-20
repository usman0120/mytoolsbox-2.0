import { ProcessingResult } from "@/lib/processing/types";

export type FilterType = "blur" | "sharpen" | "edgeDetect" | "emboss";

interface FilterOptions {
  type: FilterType;
  intensity?: number; // 1-10 for blur/sharpen
}

// Convolution kernels
const KERNELS: Record<FilterType, (intensity: number) => { kernel: number[]; size: number; factor: number; offset: number }> = {
  blur: (i) => {
    const s = Math.min(i, 10);
    const size = s * 2 + 1;
    const val = 1 / (size * size);
    const kernel = new Array(size * size).fill(val);
    return { kernel, size, factor: 1, offset: 0 };
  },
  sharpen: (i) => {
    const s = Math.min(i, 5) * 0.1;
    return {
      kernel: [0, -s, 0, -s, 1 + 4 * s, -s, 0, -s, 0],
      size: 3,
      factor: 1,
      offset: 0,
    };
  },
  edgeDetect: () => ({
    kernel: [-1, -1, -1, -1, 8, -1, -1, -1, -1],
    size: 3,
    factor: 1,
    offset: 128,
  }),
  emboss: () => ({
    kernel: [-2, -1, 0, -1, 1, 1, 0, 1, 2],
    size: 3,
    factor: 1,
    offset: 128,
  }),
};

function applyConvolution(
  src: ImageData,
  dst: ImageData,
  kernel: number[],
  size: number,
  factor: number,
  offset: number
) {
  const half = Math.floor(size / 2);
  const srcData = src.data;
  const dstData = dst.data;
  const w = src.width;
  const h = src.height;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let r = 0, g = 0, b = 0;

      for (let ky = 0; ky < size; ky++) {
        for (let kx = 0; kx < size; kx++) {
          const px = Math.min(Math.max(x + kx - half, 0), w - 1);
          const py = Math.min(Math.max(y + ky - half, 0), h - 1);
          const idx = (py * w + px) * 4;
          const kVal = kernel[ky * size + kx];

          r += srcData[idx] * kVal;
          g += srcData[idx + 1] * kVal;
          b += srcData[idx + 2] * kVal;
        }
      }

      const dstIdx = (y * w + x) * 4;
      dstData[dstIdx] = Math.min(255, Math.max(0, r * factor + offset));
      dstData[dstIdx + 1] = Math.min(255, Math.max(0, g * factor + offset));
      dstData[dstIdx + 2] = Math.min(255, Math.max(0, b * factor + offset));
      dstData[dstIdx + 3] = srcData[(y * w + x) * 4 + 3];
    }
  }
}

export async function applyFilter(
  file: File,
  options: FilterOptions
): Promise<ProcessingResult> {
  const { type, intensity = 5 } = options;

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
      const srcData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const dstData = ctx.createImageData(canvas.width, canvas.height);

      const { kernel, size, factor, offset } = KERNELS[type](intensity);
      applyConvolution(srcData, dstData, kernel, size, factor, offset);

      ctx.putImageData(dstData, 0, 0);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve({ status: "error", error: "Filter application failed." });
            return;
          }

          const url = URL.createObjectURL(blob);
          const originalName = file.name.replace(/\.[^.]+$/, "");
          const ext = file.type === "image/png" ? "png" : "jpg";

          const filterNames: Record<FilterType, string> = {
            blur: "Blur",
            sharpen: "Sharpen",
            edgeDetect: "Edge Detect",
            emboss: "Emboss",
          };

          resolve({
            status: "success",
            outputBlob: blob,
            outputUrl: url,
            message: `${filterNames[type]} filter applied (intensity: ${intensity})`,
            data: { downloadName: `${originalName}_${type}.${ext}` },
          });
        },
        file.type || "image/png",
        0.95
      );
    };

    img.onerror = () => {
      resolve({ status: "error", error: "Failed to load image for filtering." });
    };

    reader.readAsDataURL(file);
  });
}