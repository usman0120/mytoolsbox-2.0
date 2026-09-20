import { PDFDocument } from "pdf-lib";
import { ProcessingResult } from "@/lib/processing/types";

export async function imagesToPDF(files: File[]): Promise<ProcessingResult> {
  if (!files || files.length === 0) {
    return { status: "error", error: "Please select at least one image." };
  }

  const imageFiles = files.filter((f) => f.type.startsWith("image/"));
  if (imageFiles.length === 0) {
    return { status: "unsupported", error: "No valid image files selected." };
  }

  try {
    const pdf = await PDFDocument.create();

    for (const file of imageFiles) {
      const arrayBuffer = await file.arrayBuffer();
      let image;

      if (file.type === "image/png") {
        image = await pdf.embedPng(new Uint8Array(arrayBuffer));
      } else if (file.type === "image/jpeg") {
        image = await pdf.embedJpg(new Uint8Array(arrayBuffer));
      } else {
        try {
          image = await pdf.embedPng(new Uint8Array(arrayBuffer));
        } catch {
          continue;
        }
      }

      const page = pdf.addPage([image.width, image.height]);
      page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
    }

    if (pdf.getPageCount() === 0) {
      return { status: "error", error: "Could not process any of the selected images." };
    }

    const pdfBytes = await pdf.save();
    const blob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    return {
      status: "success",
      outputBlob: blob,
      outputUrl: url,
      message: `Created PDF with ${pdf.getPageCount()} page(s) from ${imageFiles.length} image(s).`,
    };
  } catch (err: unknown) {
    return { status: "error", error: err instanceof Error ? err.message : "Failed to create PDF from images." };
  }
}