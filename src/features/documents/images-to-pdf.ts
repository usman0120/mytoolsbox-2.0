import { PDFDocument } from "pdf-lib";
import { ProcessingResult } from "@/lib/processing/types";

export type PDFPageSize = "fit" | "a4" | "letter";
export type PDFOrientation = "auto" | "portrait" | "landscape";
export type PDFMargin = "none" | "small" | "normal";

export interface ImagesToPDFOptions {
  pageSize?: PDFPageSize;
  orientation?: PDFOrientation;
  margin?: PDFMargin;
}

// Convert any image format (WebP, GIF, BMP, etc.) into clean PNG/JPEG ArrayBuffer
async function convertImageToStandard(file: File): Promise<{ buffer: Uint8Array; format: "png" | "jpg" }> {
  if (file.type === "image/png") {
    const ab = await file.arrayBuffer();
    return { buffer: new Uint8Array(ab), format: "png" };
  }
  if (file.type === "image/jpeg" || file.name.toLowerCase().endsWith(".jpg") || file.name.toLowerCase().endsWith(".jpeg")) {
    const ab = await file.arrayBuffer();
    return { buffer: new Uint8Array(ab), format: "jpg" };
  }

  // Draw through canvas for WebP, BMP, GIF, etc.
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas context failed"));
        return;
      }
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(async (blob) => {
        if (!blob) {
          reject(new Error("Canvas toBlob failed"));
          return;
        }
        const ab = await blob.arrayBuffer();
        resolve({ buffer: new Uint8Array(ab), format: "png" });
      }, "image/png");
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`Failed to load image "${file.name}"`));
    };
    img.src = url;
  });
}

export async function imagesToPDF(
  files: File[],
  options: ImagesToPDFOptions = {}
): Promise<ProcessingResult> {
  if (!files || files.length === 0) {
    return { status: "error", error: "Please select at least one image." };
  }

  const pageSizeOpt = options.pageSize ?? "a4";
  const marginOpt = options.margin ?? "small";
  const marginVal = marginOpt === "none" ? 0 : marginOpt === "small" ? 20 : 40;

  try {
    const pdf = await PDFDocument.create();

    for (const file of files) {
      let converted;
      try {
        converted = await convertImageToStandard(file);
      } catch {
        continue;
      }

      const image =
        converted.format === "jpg"
          ? await pdf.embedJpg(converted.buffer)
          : await pdf.embedPng(converted.buffer);

      let targetWidth: number;
      let targetHeight: number;

      if (pageSizeOpt === "fit") {
        targetWidth = image.width + marginVal * 2;
        targetHeight = image.height + marginVal * 2;
      } else if (pageSizeOpt === "letter") {
        targetWidth = 612;
        targetHeight = 792;
      } else {
        // A4
        targetWidth = 595.28;
        targetHeight = 841.89;
      }

      // Check orientation
      const isLandscape =
        options.orientation === "landscape" ||
        (options.orientation === "auto" && image.width > image.height && pageSizeOpt !== "fit");

      if (isLandscape && targetWidth < targetHeight) {
        const tmp = targetWidth;
        targetWidth = targetHeight;
        targetHeight = tmp;
      }

      const page = pdf.addPage([targetWidth, targetHeight]);
      const availWidth = targetWidth - marginVal * 2;
      const availHeight = targetHeight - marginVal * 2;

      // Scale proportionally to fit inside available area
      const scaleX = availWidth / image.width;
      const scaleY = availHeight / image.height;
      const scale = Math.min(scaleX, scaleY, 1);

      const renderWidth = image.width * scale;
      const renderHeight = image.height * scale;
      const x = marginVal + (availWidth - renderWidth) / 2;
      const y = marginVal + (availHeight - renderHeight) / 2;

      page.drawImage(image, {
        x,
        y,
        width: renderWidth,
        height: renderHeight,
      });
    }

    if (pdf.getPageCount() === 0) {
      return { status: "error", error: "Could not process any of the selected images." };
    }

    const pdfBytes = await pdf.save({ useObjectStreams: true });
    const blob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    return {
      status: "success",
      outputBlob: blob,
      outputUrl: url,
      metadata: {
        pageCount: pdf.getPageCount(),
        sizeBytes: pdfBytes.length,
      },
      message: `Created PDF with ${pdf.getPageCount()} page(s) from ${files.length} image(s).`,
    };
  } catch (err: unknown) {
    return {
      status: "error",
      error: err instanceof Error ? err.message : "Failed to create PDF from images.",
    };
  }
}