// ---------------------------------------------------------------------------
// Client-side PDF Processor (PDF-lib + Canvas)
// ---------------------------------------------------------------------------

import type { ProcessingResult } from "../types";

export interface PDFMergeInput {
  files: File[];
}

export interface PDFExtractOptions {
  pages: number[]; // 1-based page numbers to extract
}

export interface ImagesToPDFOptions {
  images: File[];
  pageSize?: "a4" | "letter" | "fit";
}

/**
 * Merge multiple PDFs client-side.
 * Uses dynamic import of pdf-lib to avoid bundling for non-PDF users.
 */
export async function mergePDFsClient(input: PDFMergeInput): Promise<ProcessingResult> {
  try {
    const { PDFDocument } = await import("pdf-lib");
    const mergedDoc = await PDFDocument.create();

    for (const file of input.files) {
      const arrayBuffer = await file.arrayBuffer();
      const doc = await PDFDocument.load(arrayBuffer);
      const copiedPages = await mergedDoc.copyPages(doc, doc.getPageIndices());
      copiedPages.forEach((page) => mergedDoc.addPage(page));
    }

    const pdfBytes = await mergedDoc.save();
    const blob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" });

    return {
      status: "success",
      outputBlob: blob,
      outputUrl: URL.createObjectURL(blob),
      message: `Merged ${input.files.length} PDFs (${mergedDoc.getPageCount()} pages)`,
    };
  } catch (error) {
    return {
      status: "error",
      error: error instanceof Error ? error.message : "PDF merge failed",
    };
  }
}

/**
 * Extract pages from a PDF client-side.
 */
export async function extractPDFPagesClient(
  file: File,
  options: PDFExtractOptions
): Promise<ProcessingResult> {
  try {
    const { PDFDocument } = await import("pdf-lib");
    const arrayBuffer = await file.arrayBuffer();
    const sourceDoc = await PDFDocument.load(arrayBuffer);
    const newDoc = await PDFDocument.create();

    const pageIndices = options.pages.map((p) => p - 1); // Convert to 0-based
    const copiedPages = await newDoc.copyPages(sourceDoc, pageIndices);
    copiedPages.forEach((page) => newDoc.addPage(page));

    const pdfBytes = await newDoc.save();
    const blob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" });

    return {
      status: "success",
      outputBlob: blob,
      outputUrl: URL.createObjectURL(blob),
      message: `Extracted ${options.pages.length} pages`,
    };
  } catch (error) {
    return {
      status: "error",
      error: error instanceof Error ? error.message : "PDF extraction failed",
    };
  }
}

/**
 * Convert images to PDF client-side.
 */
export async function imagesToPDFClient(
  options: ImagesToPDFOptions
): Promise<ProcessingResult> {
  try {
    const { PDFDocument } = await import("pdf-lib");

    const doc = await PDFDocument.create();

    for (const imageFile of options.images) {
      const arrayBuffer = await imageFile.arrayBuffer();
      let image;

      if (imageFile.type === "image/png") {
        image = await doc.embedPng(arrayBuffer);
      } else if (imageFile.type === "image/jpeg" || imageFile.type === "image/jpg") {
        image = await doc.embedJpg(arrayBuffer);
      } else {
        // Try PNG first, fallback to JPG
        try {
          image = await doc.embedPng(arrayBuffer);
        } catch {
          image = await doc.embedJpg(arrayBuffer);
        }
      }

      const page = doc.addPage();
      const { width, height } = page.getSize();

      // Scale image to fit page
      const imgDims = image.scaleToFit(width - 40, height - 40);
      page.drawImage(image, {
        x: (width - imgDims.width) / 2,
        y: (height - imgDims.height) / 2,
        width: imgDims.width,
        height: imgDims.height,
      });
    }

    const pdfBytes = await doc.save();
    const blob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" });

    return {
      status: "success",
      outputBlob: blob,
      outputUrl: URL.createObjectURL(blob),
      message: `Created PDF with ${options.images.length} images`,
    };
  } catch (error) {
    return {
      status: "error",
      error: error instanceof Error ? error.message : "Images to PDF conversion failed",
    };
  }
}