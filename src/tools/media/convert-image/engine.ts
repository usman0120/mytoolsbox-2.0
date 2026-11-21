import { ProcessingResult } from "@/lib/processing/types";

export interface ConvertOptions {
  format: "png" | "jpeg" | "webp" | "bmp" | "ico";
  quality?: number; // 0.1 to 1.0
  backgroundColor?: string; // used when converting transparent to opaque JPEG/BMP
}

const FORMAT_MIME: Record<string, string> = {
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  bmp: "image/bmp",
  ico: "image/x-icon",
};

const FORMAT_EXT: Record<string, string> = {
  jpeg: "jpg",
  jpg: "jpg",
  png: "png",
  webp: "webp",
  bmp: "bmp",
  ico: "ico",
};

export async function convertImage(
  file: File,
  options: ConvertOptions | string
): Promise<ProcessingResult> {
  if (!file.type.startsWith("image/")) {
    return { status: "unsupported", error: "Selected file is not an image." };
  }

  const normalizedOptions: ConvertOptions =
    typeof options === "string"
      ? { format: (options.replace("image/", "") as ConvertOptions["format"]) || "png" }
      : options;

  const targetFormat = normalizedOptions.format.toLowerCase().replace("image/", "");
  const targetMime = FORMAT_MIME[targetFormat] || "image/png";
  const quality = normalizedOptions.quality ?? 0.92;
  const bgColor = normalizedOptions.backgroundColor || "#ffffff";

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
      let width = img.width;
      let height = img.height;

      // Favicon special sizing
      if (targetFormat === "ico") {
        width = Math.min(width, 256);
        height = Math.min(height, 256);
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });

      if (!ctx) {
        resolve({ status: "error", error: "Unable to process image on canvas." });
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // Fill background for opaque formats like JPEG and BMP
      if (targetFormat === "jpeg" || targetFormat === "jpg" || targetFormat === "bmp") {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, width, height);
      }

      ctx.drawImage(img, 0, 0, width, height);

      const mimeForCanvas = targetFormat === "ico" ? "image/png" : targetMime;

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve({ status: "error", error: "Image conversion failed." });
            return;
          }

          const url = URL.createObjectURL(blob);
          const originalName = file.name.replace(/\.[^.]+$/, "");
          const ext = FORMAT_EXT[targetFormat] || targetFormat;
          const downloadName = `${originalName}.${ext}`;

          resolve({
            status: "success",
            outputBlob: blob,
            outputUrl: url,
            message: `Converted to ${targetFormat.toUpperCase()} (${(blob.size / 1024).toFixed(1)} KB)`,
            data: {
              downloadName,
              extension: ext,
              width,
              height,
              size: blob.size,
            },
          });
        },
        mimeForCanvas,
        quality
      );
    };

    img.onerror = () => {
      resolve({ status: "error", error: "Failed to load image for conversion." });
    };

    reader.readAsDataURL(file);
  });
}