import { ProcessingResult } from "@/lib/processing/types";

interface WatermarkOptions {
  text: string;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  opacity?: number;
  position?: "center" | "topLeft" | "topRight" | "bottomLeft" | "bottomRight";
  rotation?: number;
  repeat?: boolean;
}

export async function watermarkImage(
  file: File,
  options: WatermarkOptions
): Promise<ProcessingResult> {
  const {
    text,
    fontSize = 48,
    fontFamily = "Arial, sans-serif",
    color = "rgba(255, 255, 255, 0.5)",
    opacity = 0.5,
    position = "center",
    rotation = -30,
    repeat = false,
  } = options;

  if (!file.type.startsWith("image/")) {
    return { status: "unsupported", error: "Selected file is not an image." };
  }

  if (!text || text.trim().length === 0) {
    return { status: "error", error: "Watermark text is required." };
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

      // Configure watermark style
      ctx.font = `${fontSize}px ${fontFamily}`;
      ctx.fillStyle = color;
      ctx.globalAlpha = opacity;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const textWidth = ctx.measureText(text).width;
      const textHeight = fontSize;

      if (repeat) {
        // Tile watermark across the image
        ctx.save();
        const spacing = Math.max(textWidth, textHeight) * 2;
        const midX = canvas.width / 2;
        const midY = canvas.height / 2;
        ctx.translate(midX, midY);
        ctx.rotate((rotation * Math.PI) / 180);

        for (let y = -canvas.height; y < canvas.height * 2; y += spacing) {
          for (let x = -canvas.width; x < canvas.width * 2; x += spacing) {
            ctx.fillText(text, x, y);
          }
        }
        ctx.restore();
      } else {
        // Single watermark at specified position
        let x: number, y: number;
        const padding = fontSize;

        switch (position) {
          case "topLeft":
            x = padding + textWidth / 2;
            y = padding + textHeight / 2;
            break;
          case "topRight":
            x = canvas.width - padding - textWidth / 2;
            y = padding + textHeight / 2;
            break;
          case "bottomLeft":
            x = padding + textWidth / 2;
            y = canvas.height - padding - textHeight / 2;
            break;
          case "bottomRight":
            x = canvas.width - padding - textWidth / 2;
            y = canvas.height - padding - textHeight / 2;
            break;
          case "center":
          default:
            x = canvas.width / 2;
            y = canvas.height / 2;
            break;
        }

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.fillText(text, 0, 0);
        ctx.restore();
      }

      ctx.globalAlpha = 1.0;

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve({ status: "error", error: "Watermarking failed." });
            return;
          }

          const url = URL.createObjectURL(blob);
          const originalName = file.name.replace(/\.[^.]+$/, "");
          const ext = file.type === "image/png" ? "png" : "jpg";

          resolve({
            status: "success",
            outputBlob: blob,
            outputUrl: url,
            message: `Watermark "${text}" applied successfully`,
            data: { downloadName: `${originalName}_watermarked.${ext}` },
          });
        },
        file.type || "image/png",
        0.95
      );
    };

    img.onerror = () => {
      resolve({ status: "error", error: "Failed to load image for watermarking." });
    };

    reader.readAsDataURL(file);
  });
}