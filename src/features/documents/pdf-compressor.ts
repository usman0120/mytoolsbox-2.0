import { PDFDocument } from "pdf-lib";
import { ProcessingResult } from "@/lib/processing/types";

export async function compressPDF(file: File, options: { quality?: number } = {}): Promise<ProcessingResult> {
  if (!file || file.type !== "application/pdf") {
    return { status: "unsupported", error: "Please select a valid PDF file." };
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer);

    const pdfBytes = await pdf.save({
      useObjectStreams: true,
      addDefaultPage: false,
    });

    const originalSize = file.size;
    const compressedSize = pdfBytes.length;
    const reduction = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);

    const blob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    return {
      status: "success",
      outputBlob: blob,
      outputUrl: url,
      message: `Compressed from ${(originalSize / 1024).toFixed(0)} KB to ${(compressedSize / 1024).toFixed(0)} KB (${reduction}% reduction)`,
    };
  } catch (err: any) {
    return { status: "error", error: err.message || "Failed to compress PDF." };
  }
}