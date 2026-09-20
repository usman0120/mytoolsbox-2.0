import { ProcessingResult } from "@/lib/processing/types";

export type TextPosition = "top" | "center" | "bottom" | "topLeft" | "topRight" | "bottomLeft" | "bottomRight";

interface TextOverlayOptions {
  text: string;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  backgroundColor?: string;
  position?: TextPosition;
  padding?: number;
  borderRadius?: number;
}

export async function addTextOverlay(
  file: File,
  options: TextOverlayOptions
): Promise<ProcessingResult> {
  const {
    text,
    fontSize = 36,
    fontFamily = "Arial, sans-serif",
    color = "#ffffff",
    backgroundColor = "rgba(0, 0, 0, 0.6)",
    position = "bottom",
    padding = 16,
    borderRadius = 8,
  } = options;

  if (!file.type.startsWith("image/")) {
    return { status: "unsupported", error: "Selected file is not an image." };
  }

  if (!text || text.trim().length === 0) {
    return { status: "error", error: "Overlay text is required." };
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

      // Draw original image
      ctx.drawImage(img, 0, 0);

      // Measure text
      ctx.font = `bold ${fontSize}px ${fontFamily}`;
      const metrics = ctx.measureText(text);
      const textWidth = metrics.width;
      const textHeight = fontSize;
      const boxWidth = textWidth + padding * 2;
      const boxHeight = textHeight + padding * 2;

      // Calculate position
      let x: number, y: number;
      const margin = 20;

      switch (position) {
        case "top":
          x = (canvas.width - boxWidth) / 2;
          y = margin;
          break;
        case "topLeft":
          x = margin;
          y = margin;
          break;
        case "topRight":
          x = canvas.width - boxWidth - margin;
          y = margin;
          break;
        case "bottom":
          x = (canvas.width - boxWidth) / 2;
          y = canvas.height - boxHeight - margin;
          break;
        case "bottomLeft":
          x = margin;
          y = canvas.height - boxHeight - margin;
          break;
        case "bottomRight":
          x = canvas.width - boxWidth - margin;
          y = canvas.height - boxHeight - margin;
          break;
        case "center":
          x = (canvas.width - boxWidth) / 2;
          y = (canvas.height - boxHeight) / 2;
          break;
      }

      // Draw background box
      if (backgroundColor && backgroundColor !== "transparent") {
        ctx.fillStyle = backgroundColor;
        ctx.beginPath();
        ctx.roundRect(x, y, boxWidth, boxHeight, borderRadius);
        ctx.fill();
      }

      // Draw text
      ctx.fillStyle = color;
      ctx.font = `bold ${fontSize}px ${fontFamily}`;
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillText(text, x + padding, y + padding);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve({ status: "error", error: "Text overlay failed." });
            return;
          }

          const url = URL.createObjectURL(blob);
          const originalName = file.name.replace(/\.[^.]+$/, "");
          const ext = file.type === "image/png" ? "png" : "jpg";

          resolve({
            status: "success",
            outputBlob: blob,
            outputUrl: url,
            message: `Text "${text}" added to image`,
            data: { downloadName: `${originalName}_overlay.${ext}` },
          });
        },
        file.type || "image/png",
        0.95
      );
    };

    img.onerror = () => {
      resolve({ status: "error", error: "Failed to load image for text overlay." });
    };

    reader.readAsDataURL(file);
  });
}