import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { ProcessingResult } from "@/lib/processing/types";

export interface PDFMergeOptions {
  outputFileName?: string;
  addPageNumbers?: boolean;
}

export async function mergePDFs(
  files: File[],
  options: PDFMergeOptions = {}
): Promise<ProcessingResult> {
  if (files.length < 2) {
    return { status: "error", error: "Please select at least 2 PDF files to merge." };
  }

  const startTime = Date.now();
  const mergedPdf = await PDFDocument.create();
  let totalPageCount = 0;

  for (const file of files) {
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      return { status: "unsupported", error: `"${file.name}" is not a valid PDF file.` };
    }
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer);
    const pageIndices = pdf.getPageIndices();
    const copiedPages = await mergedPdf.copyPages(pdf, pageIndices);
    copiedPages.forEach((page) => {
      mergedPdf.addPage(page);
      totalPageCount++;
    });
  }

  // Optionally stamp page numbers at bottom center of each page
  if (options.addPageNumbers) {
    const font = await mergedPdf.embedFont(StandardFonts.Helvetica);
    const pages = mergedPdf.getPages();
    pages.forEach((page, idx) => {
      const { width } = page.getSize();
      const text = `Page ${idx + 1} of ${totalPageCount}`;
      const textWidth = font.widthOfTextAtSize(text, 9);
      page.drawText(text, {
        x: (width - textWidth) / 2,
        y: 20,
        size: 9,
        font,
        color: rgb(0.3, 0.3, 0.3),
      });
    });
  }

  const mergedBytes = await mergedPdf.save({ useObjectStreams: true });
  const blob = new Blob([mergedBytes as BlobPart], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  return {
    status: "success",
    outputBlob: blob,
    outputUrl: url,
    metadata: {
      pageCount: totalPageCount,
      fileCount: files.length,
      sizeBytes: mergedBytes.length,
      elapsedSeconds: elapsed,
    },
    message: `Merged ${files.length} PDFs (${totalPageCount} pages) in ${elapsed}s.`,
  };
}