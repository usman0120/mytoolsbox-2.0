"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  Upload,
  FileText,
  Download,
  Trash2,
  FileImage,
  ChevronLeft,
  ChevronRight,
  Plus,
  Loader2,
  CheckCircle2,
  Archive,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  pdfToImages,
  renderPageToImage,
  exportImagesZip,
} from "@/features/documents/pdf-to-images";

export function PDFToImagesEngine() {
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [format, setFormat] = useState<"image/png" | "image/jpeg">("image/png");
  const [scale, setScale] = useState<number>(2); // 2 = High DPI (150-200 DPI)
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pageImages, setPageImages] = useState<Map<number, string>>(new Map());
  const [isRendering, setIsRendering] = useState(false);
  const [isExportingAll, setIsExportingAll] = useState(false);
  const [exportProgress, setExportProgress] = useState<number>(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadFile = useCallback(async (selected: File) => {
    if (selected.type !== "application/pdf" && !selected.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Please upload a valid PDF document.");
      return;
    }

    setFile(selected);
    setPageImages(new Map());
    setCurrentPage(1);

    const res = await pdfToImages(selected, format);
    if (res.status === "success" && res.data) {
      const data = res.data as { pdfUrl: string; totalPages: number };
      setPdfUrl(data.pdfUrl);
      setTotalPages(data.totalPages);
      toast.success(`PDF loaded: ${data.totalPages} pages.`);
      if (data.totalPages > 0) {
        setIsRendering(true);
        try {
          const img = await renderPageToImage(data.pdfUrl, 1, format, scale);
          if (img) {
            setPageImages((prev) => new Map(prev).set(1, img));
          }
        } finally {
          setIsRendering(false);
        }
      }
    } else {
      toast.error(res.error || "Failed to load PDF.");
    }
  }, [format, scale]);

  // Render on page change if not yet rendered
  const handlePageChange = async (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);

    if (pdfUrl && !pageImages.has(newPage)) {
      setIsRendering(true);
      const img = await renderPageToImage(pdfUrl, newPage, format, scale);
      if (img) {
        setPageImages((prev) => new Map(prev).set(newPage, img));
      }
      setIsRendering(false);
    }
  };

  const handleDownloadSingle = () => {
    const img = pageImages.get(currentPage);
    if (!img || !file) return;
    const a = document.createElement("a");
    a.href = img;
    const ext = format === "image/jpeg" ? "jpg" : "png";
    const base = file.name.replace(/\.pdf$/i, "");
    a.download = `${base}-page-${currentPage}.${ext}`;
    a.click();
  };

  const handleDownloadAllZip = async () => {
    if (!pdfUrl || totalPages === 0 || !file) return;
    setIsExportingAll(true);
    setExportProgress(0);

    try {
      const allImages = new Map(pageImages);

      for (let i = 1; i <= totalPages; i++) {
        if (!allImages.has(i)) {
          const img = await renderPageToImage(pdfUrl, i, format, scale);
          if (img) {
            allImages.set(i, img);
            setPageImages((prev) => new Map(prev).set(i, img));
          }
        }
        setExportProgress(Math.round((i / totalPages) * 100));
      }

      const zipBlob = await exportImagesZip(allImages, format);
      const zipUrl = URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.href = zipUrl;
      const base = file.name.replace(/\.pdf$/i, "");
      a.download = `${base}-all-images.zip`;
      a.click();
      URL.revokeObjectURL(zipUrl);
      toast.success(`Exported ${totalPages} images into ZIP!`);
    } catch {
      toast.error("Failed to package images into ZIP.");
    } finally {
      setIsExportingAll(false);
    }
  };

  const handleReset = () => {
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    setFile(null);
    setPdfUrl(null);
    setPageImages(new Map());
    setCurrentPage(1);
    setTotalPages(0);
  };

  useEffect(() => {
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, [pdfUrl]);

  return (
    <div className="w-full min-w-0 space-y-4">
      {/* Upload Zone */}
      {!file && (
        <div
          className={`border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center transition-all cursor-pointer ${
            dragOver
              ? "border-primary bg-primary/5 scale-[0.99]"
              : "border-border hover:border-primary/50 hover:bg-muted/30"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            if (e.dataTransfer.files[0]) loadFile(e.dataTransfer.files[0]);
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mx-auto mb-4">
            <FileImage className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-semibold mb-1">Upload PDF to Extract Images</h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
            Render PDF pages to high-resolution PNG or JPG images. Download single pages or the entire document as a ZIP archive.
          </p>
          <Button variant="outline" onClick={(event) => { event.stopPropagation(); fileInputRef.current?.click(); }} className="rounded-lg">
            <Plus className="h-4 w-4 mr-1.5" /> Select PDF Document
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) loadFile(e.target.files[0]);
              e.target.value = "";
            }}
          />
        </div>
      )}

      {/* Viewer & Export Controls */}
      {file && (
        <section aria-label="PDF page rendering and export" className="min-w-0">
          {/* Header Bar */}
          <div className="p-4 bg-muted/40 border-b border-border/60 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-500 shrink-0">
                <FileText className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{file.name}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{(file.size / 1024).toFixed(1)} KB</span>
                  <span>•</span>
                  <Badge variant="secondary" className="rounded-full text-[10px]">
                    {totalPages} {totalPages === 1 ? "page" : "pages"}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="text-xs h-8 text-destructive hover:text-destructive rounded-lg"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1" /> Change PDF
              </Button>
            </div>
          </div>

          <div className="py-4 space-y-4">
            {/* Options Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">Format:</span>
                  <div className="flex rounded-lg bg-background p-0.5 border border-border/60">
                    <button
                      type="button"
                      onClick={() => setFormat("image/png")}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                        format === "image/png" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                      }`}
                    >
                      PNG
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormat("image/jpeg")}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                        format === "image/jpeg" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                      }`}
                    >
                      JPG
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">Resolution:</span>
                  <div className="flex rounded-lg bg-background p-0.5 border border-border/60">
                    <button
                      type="button"
                      onClick={() => setScale(1.5)}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                        scale === 1.5 ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                      }`}
                    >
                      Standard (150 DPI)
                    </button>
                    <button
                      type="button"
                      onClick={() => setScale(2.5)}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                        scale === 2.5 ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                      }`}
                    >
                      High (300 DPI)
                    </button>
                  </div>
                </div>
              </div>

              {/* Download All ZIP Button */}
              <Button
                size="sm"
                onClick={handleDownloadAllZip}
                disabled={isExportingAll || totalPages === 0}
                className="rounded-xl h-8 text-xs font-semibold gap-1.5"
              >
                {isExportingAll ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> {exportProgress}% Zipping...
                  </>
                ) : (
                  <>
                    <Archive className="h-3.5 w-3.5" /> Download All Pages (ZIP)
                  </>
                )}
              </Button>
            </div>

            {/* Page Preview Container */}
            <div className="flex flex-col items-center space-y-4">
              <div className="w-full min-h-64 sm:min-h-96 bg-muted/10 border border-border/60 rounded-lg overflow-hidden flex items-center justify-center p-3 relative">
                {isRendering ? (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="text-xs">Rendering Page {currentPage}...</span>
                  </div>
                ) : pageImages.has(currentPage) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={pageImages.get(currentPage)}
                    alt={`PDF Page ${currentPage}`}
                    className="max-h-[70dvh] max-w-full object-contain rounded-sm"
                  />
                ) : (
                  <div className="text-center text-muted-foreground text-xs">
                    <ImageIcon className="h-8 w-8 mx-auto mb-2 opacity-40" />
                    Click below to render Page {currentPage}
                  </div>
                )}
              </div>

              {/* Navigation & Single Download Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 w-full">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1 || isRendering}
                  className="rounded-xl h-9"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                </Button>

                <div className="text-xs font-medium text-foreground">
                  Page <span className="font-bold">{currentPage}</span> of {totalPages}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages || isRendering}
                    className="rounded-xl h-9"
                  >
                    Next <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>

                  <Button
                    size="sm"
                    onClick={handleDownloadSingle}
                    disabled={!pageImages.has(currentPage)}
                    className="rounded-xl h-9 text-xs gap-1.5"
                  >
                    <Download className="h-3.5 w-3.5" /> Download Page {currentPage}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}