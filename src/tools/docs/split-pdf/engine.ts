import { PDFDocument } from "pdf-lib";
import JSZip from "jszip";
import { ProcessingResult } from "@/lib/processing/types";

export interface SplitRange {
  start: number;
  end: number;
}

export async function splitPDF(
  file: File,
  ranges: SplitRange[],
  mergeExtracted: boolean = true
): Promise<ProcessingResult> {
  if (!file || (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf"))) {
    return { status: "unsupported", error: "Please select a valid PDF file." };
  }

  if (!ranges || ranges.length === 0) {
    return { status: "error", error: "Please specify at least one page range to extract." };
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const sourcePdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    const totalPages = sourcePdf.getPageCount();

    // Validate ranges
    for (const range of ranges) {
      if (range.start < 1 || range.end > totalPages || range.start > range.end) {
        return {
          status: "error",
          error: `Invalid page range: ${range.start}-${range.end}. The PDF has ${totalPages} pages.`,
        };
      }
    }

    if (mergeExtracted || ranges.length === 1) {
      // Create single PDF containing all selected ranges
      const newPdf = await PDFDocument.create();
      for (const range of ranges) {
        const pageIndexes = Array.from(
          { length: range.end - range.start + 1 },
          (_, i) => range.start - 1 + i
        );
        const copiedPages = await newPdf.copyPages(sourcePdf, pageIndexes);
        copiedPages.forEach((page) => newPdf.addPage(page));
      }

      const pdfBytes = await newPdf.save({ useObjectStreams: true });
      const blob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      return {
        status: "success",
        outputBlob: blob,
        outputUrl: url,
        metadata: {
          totalPages,
          extractedPages: newPdf.getPageCount(),
          isZip: false,
        },
        message: `Successfully extracted ${newPdf.getPageCount()} pages from PDF.`,
      };
    } else {
      // Package separate range files into a ZIP
      const zip = new JSZip();
      for (let idx = 0; idx < ranges.length; idx++) {
        const range = ranges[idx];
        const rangePdf = await PDFDocument.create();
        const pageIndexes = Array.from(
          { length: range.end - range.start + 1 },
          (_, i) => range.start - 1 + i
        );
        const copiedPages = await rangePdf.copyPages(sourcePdf, pageIndexes);
        copiedPages.forEach((page) => rangePdf.addPage(page));
        const bytes = await rangePdf.save({ useObjectStreams: true });
        zip.file(`part-${idx + 1}-pages-${range.start}-to-${range.end}.pdf`, bytes);
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const zipUrl = URL.createObjectURL(zipBlob);

      return {
        status: "success",
        outputBlob: zipBlob,
        outputUrl: zipUrl,
        metadata: {
          totalPages,
          extractedFiles: ranges.length,
          isZip: true,
        },
        message: `Successfully generated ${ranges.length} PDF parts in a ZIP archive.`,
      };
    }
  } catch (err: unknown) {
    return { status: "error", error: err instanceof Error ? err.message : "Failed to split PDF." };
  }
}

export async function extractAllPages(file: File): Promise<ProcessingResult> {
  if (!file || (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf"))) {
    return { status: "unsupported", error: "Please select a valid PDF file." };
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const sourcePdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    const totalPages = sourcePdf.getPageCount();
    const zip = new JSZip();

    for (let i = 0; i < totalPages; i++) {
      const newPdf = await PDFDocument.create();
      const [copiedPage] = await newPdf.copyPages(sourcePdf, [i]);
      newPdf.addPage(copiedPage);
      const pdfBytes = await newPdf.save({ useObjectStreams: true });
      const paddedIndex = String(i + 1).padStart(String(totalPages).length, "0");
      zip.file(`page-${paddedIndex}.pdf`, pdfBytes);
    }

    const zipBlob = await zip.generateAsync({ type: "blob" });
    const zipUrl = URL.createObjectURL(zipBlob);

    return {
      status: "success",
      outputBlob: zipBlob,
      outputUrl: zipUrl,
      metadata: {
        totalPages,
        extractedFiles: totalPages,
        isZip: true,
      },
      message: `Extracted all ${totalPages} pages into individual PDFs (ZIP archive).`,
    };
  } catch (err: unknown) {
    return { status: "error", error: err instanceof Error ? err.message : "Failed to extract pages." };
  }
}