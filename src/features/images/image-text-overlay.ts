import { ProcessingResult } from "@/lib/processing/types";

export type TextPosition =
  | "top"
  | "center"
  | "bottom"
  | "topLeft"
  | "topRight"
  | "bottomLeft"
  | "bottomRight";

export interface TextOverlayOptions {
  mode?: "banner" | "meme" | "custom";
  // Banner / standard
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  backgroundColor?: string;
  position?: TextPosition;
  padding?: number;
  borderRadius?: number;
  strokeColor?: string;
  strokeWidth?: number;
  // Meme specific
  topText?: string;
  bottomText?: string;
  isUppercase?: boolean;
  format?: "png" | "jpeg" | "webp";
}

export async function addTextOverlay(
  file: File,
  options: TextOverlayOptions
): Promise<ProcessingResult> {
  const {
    mode = "banner",
    text = "",
    topText = "",
    bottomText = "",
    fontSize = 42,
    fontFamily = "Impact, sans-serif",
    color = "#ffffff",
    backgroundColor = "rgba(0, 0, 0, 0.6)",
    position = "bottom",
    padding = 16,
    borderRadius = 8,
    strokeColor = "#000000",
    strokeWidth = 3,
    isUppercase = true,
    format = "png",
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

      // Draw original image
      ctx.drawImage(img, 0, 0);

      if (mode === "meme") {
        // Meme Mode: Classic Top Text and Bottom Text
        const drawMemeText = (t: string, yPos: "top" | "bottom") => {
          if (!t.trim()) return;
          const displayStr = isUppercase ? t.toUpperCase() : t;
          const lines = displayStr.split("\n");
          ctx.save();
          ctx.font = `900 ${fontSize}px ${fontFamily}`;
          ctx.textAlign = "center";
          ctx.textBaseline = yPos === "top" ? "top" : "bottom";
          ctx.fillStyle = color;
          ctx.strokeStyle = strokeColor;
          ctx.lineWidth = strokeWidth * 2;
          ctx.lineJoin = "round";

          const lineHeight = fontSize * 1.15;
          const startY = yPos === "top" ? 25 : canvas.height - 25 - (lines.length - 1) * lineHeight;

          lines.forEach((line, idx) => {
            const currentY = yPos === "top" ? startY + idx * lineHeight : startY + idx * lineHeight;
            if (strokeWidth > 0) {
              ctx.strokeText(line, canvas.width / 2, currentY);
            }
            ctx.fillText(line, canvas.width / 2, currentY);
          });
          ctx.restore();
        };

        drawMemeText(topText, "top");
        drawMemeText(bottomText, "bottom");
      } else {
        // Banner / Custom Mode
        if (!text.trim()) {
          resolve({ status: "error", error: "Overlay text is required." });
          return;
        }

        ctx.save();
        ctx.font = `bold ${fontSize}px ${fontFamily}`;
        const metrics = ctx.measureText(text);
        const textWidth = metrics.width;
        const textHeight = fontSize;
        const boxWidth = textWidth + padding * 2;
        const boxHeight = textHeight + padding * 2;

        let x = 20;
        let y = 20;
        const margin = 24;

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

        // Draw background pill / container
        if (backgroundColor && backgroundColor !== "transparent") {
          ctx.fillStyle = backgroundColor;
          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(x, y, boxWidth, boxHeight, borderRadius);
          } else {
            ctx.rect(x, y, boxWidth, boxHeight);
          }
          ctx.fill();
        }

        // Draw text stroke if configured
        if (strokeWidth > 0 && strokeColor) {
          ctx.strokeStyle = strokeColor;
          ctx.lineWidth = strokeWidth;
          ctx.lineJoin = "round";
          ctx.strokeText(text, x + padding, y + padding + fontSize * 0.85);
        }

        // Draw text fill
        ctx.fillStyle = color;
        ctx.fillText(text, x + padding, y + padding + fontSize * 0.85);
        ctx.restore();
      }

      const mimeType = format === "png" ? "image/png" : format === "webp" ? "image/webp" : "image/jpeg";
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve({ status: "error", error: "Text overlay generation failed." });
            return;
          }

          const url = URL.createObjectURL(blob);
          const originalName = file.name.replace(/\.[^.]+$/, "");
          const ext = format === "png" ? "png" : format === "webp" ? "webp" : "jpg";

          resolve({
            status: "success",
            outputBlob: blob,
            outputUrl: url,
            message: `Text overlay applied successfully (${canvas.width}×${canvas.height})`,
            data: { downloadName: `${originalName}_text_overlay.${ext}` },
          });
        },
        mimeType,
        0.95
      );
    };

    img.onerror = () => {
      resolve({ status: "error", error: "Failed to load image for text overlay." });
    };

    reader.readAsDataURL(file);
  });
}