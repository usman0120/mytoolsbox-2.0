import { ProcessingResult } from "@/lib/processing/types";

export type RotationAngle = number; // arbitrary degrees, e.g. -180 to 180
export type FlipDirection = "none" | "horizontal" | "vertical" | "both";

export interface RotateOptions {
  angle?: number;
  flip?: FlipDirection;
  backgroundColor?: string;
  format?: "image/png" | "image/jpeg" | "image/webp";
}

export async function rotateImage(
  file: File,
  options: RotateOptions = {}
): Promise<ProcessingResult> {
  const { angle = 0, flip = "none", backgroundColor = "transparent", format } = options;

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
      const rad = (angle * Math.PI) / 180;
      const absCos = Math.abs(Math.cos(rad));
      const absSin = Math.abs(Math.sin(rad));

      // Calculate new bounding canvas dimensions for any arbitrary rotation
      const newWidth = Math.round(img.width * absCos + img.height * absSin);
      const newHeight = Math.round(img.width * absSin + img.height * absCos);

      const canvas = document.createElement("canvas");
      canvas.width = newWidth;
      canvas.height = newHeight;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });

      if (!ctx) {
        resolve({ status: "error", error: "Unable to initialize canvas context." });
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // Fill background if specified and not transparent
      if (backgroundColor && backgroundColor !== "transparent") {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, newWidth, newHeight);
      }

      // Move origin to canvas center
      ctx.translate(newWidth / 2, newHeight / 2);

      // Apply rotation
      ctx.rotate(rad);

      // Apply flip
      const scaleX = flip === "horizontal" || flip === "both" ? -1 : 1;
      const scaleY = flip === "vertical" || flip === "both" ? -1 : 1;
      ctx.scale(scaleX, scaleY);

      // Draw image centered
      ctx.drawImage(img, -img.width / 2, -img.height / 2);

      let targetMime = format;
      if (!targetMime) {
        targetMime = file.type === "image/png" ? "image/png" : "image/jpeg";
      }

      // If background is transparent, ensure PNG or WebP
      if (backgroundColor === "transparent" && targetMime === "image/jpeg") {
        targetMime = "image/png";
      }

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve({ status: "error", error: "Rotation failed." });
            return;
          }

          const url = URL.createObjectURL(blob);
          const originalName = file.name.replace(/\.[^.]+$/, "");
          const ext = targetMime === "image/png" ? "png" : targetMime === "image/webp" ? "webp" : "jpg";
          const downloadName = `${originalName}_rotated.${ext}`;

          resolve({
            status: "success",
            outputBlob: blob,
            outputUrl: url,
            message: `Rotated ${angle}°${flip !== "none" ? ` (flipped ${flip})` : ""} (${newWidth}×${newHeight}px)`,
            data: {
              downloadName,
              width: newWidth,
              height: newHeight,
              size: blob.size,
            },
          });
        },
        targetMime,
        0.95
      );
    };

    img.onerror = () => {
      resolve({ status: "error", error: "Failed to load image for rotation." });
    };

    reader.readAsDataURL(file);
  });
}