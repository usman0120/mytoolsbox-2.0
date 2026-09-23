import { PDFDocument } from "pdf-lib";
import { ProcessingResult } from "@/lib/processing/types";

export type CompressionLevel = "basic" | "recommended" | "extreme";

export interface CompressPDFOptions {
  level?: CompressionLevel;
  stripMetadata?: boolean;
}

export async function compressPDF(
  file: File,
  options: CompressPDFOptions = {}
): Promise<ProcessingResult> {
  if (!file || (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf"))) {
    return { status: "unsupported", error: "Please select a valid PDF file." };
  }

  const level = options.level ?? "recommended";
  const startTime = Date.now();

  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    const originalSize = file.size;
    const pageCount = pdf.getPageCount();

    if (options.stripMetadata || level === "extreme" || level === "recommended") {
      pdf.setTitle("");
      pdf.setAuthor("");
      pdf.setSubject("");
      pdf.setKeywords([]);
      pdf.setProducer("MyToolsBox PDF Engine");
      pdf.setCreator("MyToolsBox");
    }

    // Save with object streams and compression
    const pdfBytes = await pdf.save({
      useObjectStreams: true,
      addDefaultPage: false,
      objectsPerTick: 50,
    });

    const compressedSize = pdfBytes.length;
    // Calculate realistic savings
    const reductionPercent = Math.max(
      0,
      parseFloat((((originalSize - compressedSize) / originalSize) * 100).toFixed(1))
    );

    const blob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

    return {
      status: "success",
      outputBlob: blob,
      outputUrl: url,
      metadata: {
        originalSize,
        compressedSize,
        reductionPercent,
        pageCount,
        level,
        elapsedSeconds: elapsed,
      },
      message:
        compressedSize < originalSize
          ? `Compressed by ${reductionPercent}% (${(originalSize / 1024).toFixed(0)} KB → ${(compressedSize / 1024).toFixed(0)} KB) in ${elapsed}s.`
          : `PDF is already highly optimized. Cleaned up structure (${(compressedSize / 1024).toFixed(0)} KB).`,
    };
  } catch (err: unknown) {
    return {
      status: "error",
      error: err instanceof Error ? err.message : "Failed to compress PDF.",
    };
  }
}