import { PDFDocument } from "pdf-lib";
import { ProcessingResult } from "@/lib/processing/types";

export async function splitPDF(
  file: File,
  ranges: { start: number; end: number }[]
): Promise<ProcessingResult> {
  if (!file || file.type !== "application/pdf") {
    return { status: "unsupported", error: "Please select a valid PDF file." };
  }

  if (!ranges || ranges.length === 0) {
    return { status: "error", error: "Please specify at least one page range to extract." };
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const sourcePdf = await PDFDocument.load(arrayBuffer);
    const totalPages = sourcePdf.getPageCount();

    for (const range of ranges) {
      if (range.start < 1 || range.end > totalPages || range.start > range.end) {
        return {
          status: "error",
          error: `Invalid page range: ${range.start}-${range.end}. The PDF has ${totalPages} pages.`,
        };
      }
    }

    const newPdf = await PDFDocument.create();
    for (const range of ranges) {
      const pageIndexes = Array.from(
        { length: range.end - range.start + 1 },
        (_, i) => range.start - 1 + i
      );
      const copiedPages = await newPdf.copyPages(sourcePdf, pageIndexes);
      copiedPages.forEach((page) => newPdf.addPage(page));
    }

    const pdfBytes = await newPdf.save();
    const blob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    return {
      status: "success",
      outputBlob: blob,
      outputUrl: url,
      message: `Successfully extracted ${newPdf.getPageCount()} pages from PDF.`,
    };
  } catch (err: unknown) {
    return { status: "error", error: err instanceof Error ? err.message : "Failed to split PDF." };
  }
}

export async function extractAllPages(file: File): Promise<ProcessingResult> {
  if (!file || file.type !== "application/pdf") {
    return { status: "unsupported", error: "Please select a valid PDF file." };
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const sourcePdf = await PDFDocument.load(arrayBuffer);
    const totalPages = sourcePdf.getPageCount();

    const urls: string[] = [];
    for (let i = 0; i < totalPages; i++) {
      const newPdf = await PDFDocument.create();
      const [copiedPage] = await newPdf.copyPages(sourcePdf, [i]);
      newPdf.addPage(copiedPage);
      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" });
      urls.push(URL.createObjectURL(blob));
    }

    return {
      status: "success",
      message: `Extracted ${totalPages} individual pages.`,
      data: { urls, totalPages },
    };
  } catch (err: unknown) {
    return { status: "error", error: err instanceof Error ? err.message : "Failed to extract pages." };
  }
}