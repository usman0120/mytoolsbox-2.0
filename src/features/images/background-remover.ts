import { ProcessingResult } from "@/lib/processing/types";

export async function removeBackground(file: File): Promise<ProcessingResult> {
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

      // Sample corner pixels to determine background color
      const corners = [
        { x: 0, y: 0 },
        { x: canvas.width - 1, y: 0 },
        { x: 0, y: canvas.height - 1 },
        { x: canvas.width - 1, y: canvas.height - 1 },
      ];

      let avgR = 0, avgG = 0, avgB = 0;
      for (const corner of corners) {
        const idx = (corner.y * canvas.width + corner.x) * 4;
        avgR += data[idx];
        avgG += data[idx + 1];
        avgB += data[idx + 2];
      }
      avgR = Math.round(avgR / 4);
      avgG = Math.round(avgG / 4);
      avgB = Math.round(avgB / 4);

      // Color distance threshold
      const threshold = 60;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        const distance = Math.sqrt(
          (r - avgR) ** 2 + (g - avgG) ** 2 + (b - avgB) ** 2
        );

        if (distance < threshold) {
          // Make pixel transparent
          data[i + 3] = 0;
        } else if (distance < threshold * 1.8) {
          // Feather the edge
          const factor = (distance - threshold) / (threshold * 0.8);
          data[i + 3] = Math.round(data[i + 3] * Math.min(1, factor));
        }
      }

      ctx.putImageData(imageData, 0, 0);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve({ status: "error", error: "Background removal failed." });
            return;
          }

          const url = URL.createObjectURL(blob);
          const originalName = file.name.replace(/\.[^.]+$/, "");

          resolve({
            status: "success",
            outputBlob: blob,
            outputUrl: url,
            message: `Background removed (detected color: rgb(${avgR},${avgG},${avgB}))`,
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