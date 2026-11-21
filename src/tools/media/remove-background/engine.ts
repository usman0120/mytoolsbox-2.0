import { ProcessingResult } from "@/lib/processing/types";

export interface BackgroundRemoverOptions {
  targetColor?: { r: number; g: number; b: number };
  tolerance?: number; // 5 to 120
  feather?: number; // 0 to 30
  replacement?: "transparent" | "color";
  replacementColor?: string; // hex
  floodFillOnly?: boolean;
}

export async function removeBackground(
  file: File,
  options: BackgroundRemoverOptions = {}
): Promise<ProcessingResult> {
  const {
    targetColor,
    tolerance = 50,
    feather = 10,
    replacement = "transparent",
    replacementColor = "#ffffff",
    floodFillOnly = false,
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
      const w = canvas.width;
      const h = canvas.height;

      // Determine keying color
      let keyR = 0, keyG = 0, keyB = 0;
      if (targetColor) {
        keyR = targetColor.r;
        keyG = targetColor.g;
        keyB = targetColor.b;
      } else {
        // Sample border points
        const corners = [
          { x: 0, y: 0 },
          { x: w - 1, y: 0 },
          { x: 0, y: h - 1 },
          { x: w - 1, y: h - 1 },
          { x: Math.floor(w / 2), y: 0 },
          { x: Math.floor(w / 2), y: h - 1 },
        ];
        for (const pt of corners) {
          const idx = (pt.y * w + pt.x) * 4;
          keyR += data[idx];
          keyG += data[idx + 1];
          keyB += data[idx + 2];
        }
        keyR = Math.round(keyR / corners.length);
        keyG = Math.round(keyG / corners.length);
        keyB = Math.round(keyB / corners.length);
      }

      // Parse replacement color if not transparent
      let repR = 255, repG = 255, repB = 255;
      if (replacement === "color" && replacementColor) {
        const hex = replacementColor.replace("#", "");
        repR = parseInt(hex.substring(0, 2), 16) || 255;
        repG = parseInt(hex.substring(2, 4), 16) || 255;
        repB = parseInt(hex.substring(4, 6), 16) || 255;
      }

      const featherDist = Math.max(1, feather * 1.5);

      if (floodFillOnly) {
        // Flood fill from borders
        const visited = new Uint8Array(w * h);
        const queue: number[] = [];

        // Push border pixels
        for (let x = 0; x < w; x++) {
          queue.push(x, 0);
          queue.push(x, h - 1);
        }
        for (let y = 1; y < h - 1; y++) {
          queue.push(0, y);
          queue.push(w - 1, y);
        }

        let head = 0;
        while (head < queue.length) {
          const px = queue[head++];
          const py = queue[head++];
          const pIndex = py * w + px;

          if (visited[pIndex]) continue;
          visited[pIndex] = 1;

          const idx = pIndex * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];

          const dist = Math.sqrt((r - keyR) ** 2 + (g - keyG) ** 2 + (b - keyB) ** 2);
          if (dist <= tolerance) {
            if (replacement === "transparent") {
              data[idx + 3] = 0;
            } else {
              data[idx] = repR;
              data[idx + 1] = repG;
              data[idx + 2] = repB;
              data[idx + 3] = 255;
            }

            // Push neighbors
            if (px > 0 && !visited[pIndex - 1]) queue.push(px - 1, py);
            if (px < w - 1 && !visited[pIndex + 1]) queue.push(px + 1, py);
            if (py > 0 && !visited[pIndex - w]) queue.push(px, py - 1);
            if (py < h - 1 && !visited[pIndex + w]) queue.push(px, py + 1);
          }
        }
      } else {
        // Global color distance keying with feathering
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          const distance = Math.sqrt((r - keyR) ** 2 + (g - keyG) ** 2 + (b - keyB) ** 2);

          if (distance < tolerance) {
            if (replacement === "transparent") {
              data[i + 3] = 0;
            } else {
              data[i] = repR;
              data[i + 1] = repG;
              data[i + 2] = repB;
              data[i + 3] = 255;
            }
          } else if (distance < tolerance + featherDist && replacement === "transparent") {
            const factor = (distance - tolerance) / featherDist;
            data[i + 3] = Math.round(data[i + 3] * Math.min(1, factor));
          }
        }
      }

      ctx.putImageData(imageData, 0, 0);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve({ status: "error", error: "Background removal export failed." });
            return;
          }

          const url = URL.createObjectURL(blob);
          const originalName = file.name.replace(/\.[^.]+$/, "");

          resolve({
            status: "success",
            outputBlob: blob,
            outputUrl: url,
            message: `Background removed successfully`,
            data: { downloadName: `${originalName}_nobg.png` },
          });
        },
        "image/png"
      );
    };

    img.onerror = () => {
      resolve({ status: "error", error: "Failed to load image for background removal." });
    };

    reader.readAsDataURL(file);
  });
}