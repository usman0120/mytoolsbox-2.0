import { ProcessingResult } from "@/lib/processing/types";

const FORMAT_MIME: Record<string, string> = {
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  bmp: "image/bmp",
};

const FORMAT_EXT: Record<string, string> = {
  jpeg: "jpg",
  jpg: "jpg",
  png: "png",
  webp: "webp",
  bmp: "bmp",
};

export async function convertImage(file: File, format: string): Promise<ProcessingResult> {
  if (!file.type.startsWith("image/")) {
    return { status: "unsupported", error: "Selected file is not an image." };
  }

  const targetMime = FORMAT_MIME[format];
  if (!targetMime) {
    return { status: "error", error: `Unsupported target format: ${format}` };
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

      // For JPEG/WebP, use quality setting; PNG is lossless
      const quality = format === "png" ? undefined : 0.92;

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve({ status: "error", error: "Conversion failed." });
            return;
          }

          const url = URL.createObjectURL(blob);
          const originalName = file.name.replace(/\.[^.]+$/, "");
          const ext = FORMAT_EXT[format] || format;

          resolve({
            status: "success",
            outputBlob: blob,
            outputUrl: url,
            message: `Converted to ${format.toUpperCase()} (${(blob.size / 1024).toFixed(1)} KB)`,
            data: { downloadName: `${originalName}.${ext}` },
          });
        },
        targetMime,
        quality
      );
    };

    img.onerror = () => {
      resolve({ status: "error", error: "Failed to load image for conversion." });
    };

    reader.readAsDataURL(file);
  });
}