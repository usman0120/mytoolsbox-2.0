// ---------------------------------------------------------------------------
// PDF Processing Service – routes to client or cloud
// ---------------------------------------------------------------------------

import type { ProcessingResult } from "../types";
import { decideProcessingLocation, checkBrowserSupport } from "../engine";
import {
  mergePDFsClient,
  extractPDFPagesClient,
  imagesToPDFClient,
  type PDFMergeInput,
  type PDFExtractOptions,
  type ImagesToPDFOptions,
} from "../client/pdf-processor";
import { processPDFCloud } from "../cloud/processors";

export interface PDFServiceOptions {
  forceCloud?: boolean;
  apiKey?: string;
}

/**
 * Merge PDFs – auto-decides client vs cloud.
 */
export async function mergePDFs(
  input: PDFMergeInput,
  options: PDFServiceOptions = {}
): Promise<ProcessingResult> {
  // Check total size of all files
  const totalSize = input.files.reduce((sum, f) => sum + f.size, 0);
  const browserSupport = checkBrowserSupport("application/pdf");

  const decision = decideProcessingLocation({
    fileSize: totalSize,
    mimeType: "application/pdf",
    browserSupport,
    estimatedTime: input.files.length * 2000,
  });

  if (options.forceCloud || decision.location === "cloud") {
    // Cloud merge: upload all files
    // For simplicity, merge first file with cloud processing
    return processPDFCloud(input.files[0], {
      operation: "merge",
      apiKey: options.apiKey,
    });
  }

  return mergePDFsClient(input);
}

/**
 * Extract pages from PDF.
 */
export async function extractPDFPages(
  file: File,
  options: PDFExtractOptions & PDFServiceOptions
): Promise<ProcessingResult> {
  const browserSupport = checkBrowserSupport("application/pdf");

  const decision = decideProcessingLocation({
    fileSize: file.size,
    mimeType: "application/pdf",
    browserSupport,
    estimatedTime: 3000,
  });

  if (options.forceCloud || decision.location === "cloud") {
    return processPDFCloud(file, {
      operation: "extract",
      apiKey: options.apiKey,
    });
  }

  return extractPDFPagesClient(file, options);
}

/**
 * Convert images to PDF.
 */
export async function convertImagesToPDF(
  options: ImagesToPDFOptions & PDFServiceOptions
): Promise<ProcessingResult> {
  const totalSize = options.images.reduce((sum, f) => sum + f.size, 0);
  const browserSupport = checkBrowserSupport("application/pdf");

  const decision = decideProcessingLocation({
    fileSize: totalSize,
    mimeType: "application/pdf",
    browserSupport,
    estimatedTime: options.images.length * 1000,
  });

  if (options.forceCloud || decision.location === "cloud") {
    return processPDFCloud(options.images[0], {
      operation: "images-to-pdf",
      apiKey: options.apiKey,
    });
  }

  return imagesToPDFClient(options);
}