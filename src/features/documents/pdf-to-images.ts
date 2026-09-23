import { PDFDocument } from "pdf-lib";
import JSZip from "jszip";
import { ProcessingResult } from "@/lib/processing/types";

// Load PDF.js with multiple fallback CDNs
export async function ensurePdfJsLoaded(): Promise<boolean> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((window as unknown as { pdfjsLib?: any }).pdfjsLib) return true;

  const cdns = [
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js",
    "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js",
    "https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.min.js",
  ];

  for (const src of cdns) {
    try {
      await new Promise<void>((resolve, reject) => {
        const script = document.createElement("script");
        script.src = src;
        script.async = true;
        script.onload = () => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const pdfjs = (window as unknown as { pdfjsLib?: any }).pdfjsLib;
          if (pdfjs) {
            pdfjs.GlobalWorkerOptions.workerSrc = src.replace("pdf.min.js", "pdf.worker.min.js");
            resolve();
          } else {
            reject(new Error("pdfjsLib not defined"));
          }
        };
        script.onerror = () => reject(new Error("Failed to load script"));
        document.head.appendChild(script);
      });
      return true;
    } catch {
      // Try next CDN
    }
  }

  return false;
}

export async function renderPageToImage(
  pdfUrl: string,
  pageNumber: number,
  format: "image/jpeg" | "image/png" = "image/png",
  scale: number = 2
): Promise<string | null> {
  const loaded = await ensurePdfJsLoaded();
  if (!loaded) return null;

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pdfjsLib = (window as unknown as { pdfjsLib?: any }).pdfjsLib;
    if (!pdfjsLib) return null;

    const loadingTask = pdfjsLib.getDocument(pdfUrl);
    const pdf = await loadingTask.promise;
    const page = await pdf.getPage(pageNumber);

    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    await page.render({ canvasContext: ctx, viewport }).promise;

    const mimeType = format === "image/jpeg" ? "image/jpeg" : "image/png";
    const quality = format === "image/jpeg" ? 0.92 : undefined;
    return canvas.toDataURL(mimeType, quality);
  } catch (err) {
    console.error("Error rendering PDF page:", err);
    return null;
  }
}

export async function exportImagesZip(
  pageDataUrls: Map<number, string>,
  format: "image/jpeg" | "image/png" = "image/png"
): Promise<Blob> {
  const zip = new JSZip();
  const ext = format === "image/jpeg" ? "jpg" : "png";

  for (const [pageNum, dataUrl] of pageDataUrls.entries()) {
    const base64Data = dataUrl.split(",")[1];
    const padded = String(pageNum).padStart(3, "0");
    zip.file(`page-${padded}.${ext}`, base64Data, { base64: true });
  }

  return zip.generateAsync({ type: "blob" });
}

export async function pdfToImages(
  file: File,
  format: "image/jpeg" | "image/png" = "image/png"
): Promise<ProcessingResult> {
  if (!file || (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf"))) {
    return { status: "unsupported", error: "Please select a valid PDF file." };
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    const totalPages = pdf.getPageCount();
    const pdfBlob = new Blob([arrayBuffer], { type: "application/pdf" });
    const pdfUrl = URL.createObjectURL(pdfBlob);

    return {
      status: "success",
      message: `PDF loaded with ${totalPages} pages. Ready to extract images.`,
      data: { pdfUrl, totalPages, format },
    };
  } catch (err: unknown) {
    return { status: "error", error: err instanceof Error ? err.message : "Failed to load PDF." };
  }
}