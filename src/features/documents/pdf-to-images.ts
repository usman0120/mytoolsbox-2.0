import { PDFDocument } from "pdf-lib";
import { ProcessingResult } from "@/lib/processing/types";

export async function pdfToImages(
  file: File,
  format: "image/jpeg" | "image/png" = "image/png"
): Promise<ProcessingResult> {
  if (!file || file.type !== "application/pdf") {
    return { status: "unsupported", error: "Please select a valid PDF file." };
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer);
    const totalPages = pdf.getPageCount();
    const pdfBlob = new Blob([arrayBuffer], { type: "application/pdf" });
    const pdfUrl = URL.createObjectURL(pdfBlob);

    return {
      status: "success",
      message: `PDF has ${totalPages} pages. Use the preview below to save each page as an image.`,
      data: { pdfUrl, totalPages, format },
    };
  } catch (err: any) {
    return { status: "error", error: err.message || "Failed to process PDF." };
  }
}

export async function renderPageToImage(
  pdfUrl: string,
  pageNumber: number,
  format: "image/jpeg" | "image/png" = "image/png",
  scale: number = 2
): Promise<string | null> {
  return new Promise((resolve) => {
    const scriptId = "pdfjs-script";
    const existingScript = document.getElementById(scriptId);

    const renderPage = async () => {
      try {
        const pdfjsLib = (window as any).pdfjsLib;
        if (!pdfjsLib) { resolve(null); return; }

        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(pageNumber);

        const viewport = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d")!;

        await page.render({ canvasContext: ctx, viewport }).promise;

        const mimeType = format === "image/jpeg" ? "image/jpeg" : "image/png";
        const quality = format === "image/jpeg" ? 0.9 : undefined;
        const dataUrl = canvas.toDataURL(mimeType, quality);
        resolve(dataUrl);
      } catch {
        resolve(null);
      }
    };

    if (existingScript) {
      renderPage();
    } else {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
      script.onload = renderPage;
      script.onerror = () => resolve(null);
      document.head.appendChild(script);
    }
  });
}