import { PDFDocument } from "pdf-lib";
import { ProcessingResult } from "@/lib/processing/types";

export async function mergePDFs(files: File[]): Promise<ProcessingResult> {
  if (files.length < 2) {
    return { status: "error", error: "Please select at least 2 PDF files to merge." };
  }

  const mergedPdf = await PDFDocument.create();

  for (const file of files) {
    if (file.type !== "application/pdf") {
      return { status: "unsupported", error: `"${file.name}" is not a PDF file.` };
    }
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer);
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  const mergedBytes = await mergedPdf.save();
  const blob = new Blob([mergedBytes as BlobPart], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);

  return {
    status: "success",
    outputBlob: blob,
    outputUrl: url,
    message: `Successfully merged ${files.length} PDFs into one file.`,
  };
}