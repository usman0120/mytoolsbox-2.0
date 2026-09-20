import { ProcessingResult } from "@/lib/processing/types";

export type RotationAngle = 90 | 180 | 270;
export type FlipDirection = "horizontal" | "vertical" | "both";

interface RotateOptions {
  angle?: RotationAngle;
  flip?: FlipDirection;
}

export async function rotateImage(
  file: File,
  options: RotateOptions = {}
): Promise<ProcessingResult> {
  const { angle = 90, flip } = options;

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
      let canvasWidth = img.width;
      let canvasHeight = img.height;

      // Swap dimensions for 90/270 rotations
      if (angle === 90 || angle === 270) {
        [canvasWidth, canvasHeight] = [canvasHeight, canvasWidth];
      }

      const canvas = document.createElement("canvas");
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        resolve({ status: "error", error: "Unable to process image." });
        return;
      }

      // Move origin to center, rotate, then draw
      ctx.translate(canvasWidth / 2, canvasHeight / 2);

      // Apply rotation
      const radians = (angle * Math.PI) / 180;
      ctx.rotate(radians);

      // Apply flip
      if (flip === "horizontal") ctx.scale(-1, 1);
      else if (flip === "vertical") ctx.scale(1, -1);
      else if (flip === "both") ctx.scale(-1, -1);

      ctx.drawImage(img, -img.width / 2, -img.height / 2);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve({ status: "error", error: "Rotation failed." });
            return;
          }

          const url = URL.createObjectURL(blob);
          const originalName = file.name.replace(/\.[^.]+$/, "");
          const ext = file.type === "image/png" ? "png" : "jpg";

          resolve({
            status: "success",
            outputBlob: blob,
            outputUrl: url,
            message: `Image rotated ${angle}°${flip ? ` and flipped ${flip}` : ""} (${canvasWidth}×${canvasHeight})`,
            data: { downloadName: `${originalName}_rotated.${ext}`, width: canvasWidth, height: canvasHeight },
          });
        },
        file.type || "image/png",
        0.95
      );
    };

    img.onerror = () => {
      resolve({ status: "error", error: "Failed to load image for rotation." });
    };

    reader.readAsDataURL(file);
  });
}