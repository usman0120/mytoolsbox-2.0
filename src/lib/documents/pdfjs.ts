"use client";

// One way to load pdf.js: the pinned pdfjs-dist build served from this site (/pdfjs, copied by
// scripts/copy-pdfjs-assets.mjs). Never from a third-party CDN. Documents are opened with
// eval disabled and local fonts/cmaps, so a malicious PDF can't run script (blueprint section 15).
type PdfJs = typeof import("pdfjs-dist");

let loading: Promise<PdfJs> | null = null;

export function loadPdfJs(): Promise<PdfJs> {
  loading ??= (async () => {
    const modulePath = "/pdfjs/pdf.min.mjs";
    const pdfjs = (await import(/* webpackIgnore: true */ /* turbopackIgnore: true */ modulePath)) as PdfJs;
    pdfjs.GlobalWorkerOptions.workerSrc = "/pdfjs/pdf.worker.min.mjs";
    return pdfjs;
  })().catch((e) => {
    loading = null;
    throw e;
  });
  return loading;
}

export const SAFE_PDF_OPTIONS = {
  isEvalSupported: false,
  cMapUrl: "/pdfjs/cmaps/",
  cMapPacked: true,
  standardFontDataUrl: "/pdfjs/standard_fonts/",
  wasmUrl: "/pdfjs/wasm/",
  useSystemFonts: true,
} as const;
