// ---------------------------------------------------------------------------
// PDF Text & Structure Extractor
// ---------------------------------------------------------------------------
// Extracts clean textual content, headings, and lines from PDF pages
// using PDF.js.
// ---------------------------------------------------------------------------

import { ensurePdfJsLoaded } from "@/features/documents/pdf-to-images";

export interface PDFPageContent {
  pageNumber: number;
  text: string;
  lines: string[];
}

export type ExtractedPdfPage = PDFPageContent;

export async function extractPdfPages(file: File): Promise<PDFPageContent[]> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfBlob = new Blob([arrayBuffer], { type: "application/pdf" });
  const pdfUrl = URL.createObjectURL(pdfBlob);

  try {
      const hasPdfJs = await ensurePdfJsLoaded();
      if (!hasPdfJs) {
        throw new Error("PDF.js is unavailable. Check your connection and try again.");
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pdfjsLib = (window as unknown as { pdfjsLib?: any }).pdfjsLib;
      if (!pdfjsLib) {
        throw new Error("PDF.js is unavailable. Check your connection and try again.");
      }
      const loadingTask = pdfjsLib.getDocument(pdfUrl);
      const pdf = await loadingTask.promise;
      const totalPages = pdf.numPages;
      const results: PDFPageContent[] = [];

      for (let i = 1; i <= totalPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();

        let lastY: number | null = null;
        const lineParts: string[] = [];
        let currentLine = "";

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        for (const item of textContent.items as any[]) {
          if (!item.str) continue;
          const y = item.transform ? item.transform[5] : null;

          if (lastY !== null && y !== null && Math.abs(y - lastY) > 5) {
            if (currentLine.trim()) {
              lineParts.push(currentLine.trim());
            }
            currentLine = item.str;
          } else {
            currentLine += (currentLine ? " " : "") + item.str;
          }
          lastY = y;
        }

        if (currentLine.trim()) {
          lineParts.push(currentLine.trim());
        }

        results.push({
          pageNumber: i,
          text: lineParts.join("\n"),
          lines: lineParts,
        });
      }

      return results;
  } catch (err) {
    const detail = err instanceof Error ? ` ${err.message}` : "";
    throw new Error(`Unable to extract PDF text.${detail}`, { cause: err });
  } finally {
    URL.revokeObjectURL(pdfUrl);
  }
}
