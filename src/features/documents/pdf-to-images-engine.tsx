"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Upload, FileText, Download, Trash2, FileImage, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useProcessing } from "@/hooks/use-processing";
import { pdfToImages, renderPageToImage } from "@/features/documents/pdf-to-images";

export function PDFToImagesEngine() {
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [format, setFormat] = useState<"image/png" | "image/jpeg">("image/png");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pageImages, setPageImages] = useState<Map<number, string>>(new Map());
  const [rendering, setRendering] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { status, result, error, process, reset } = useProcessing();

  const loadFile = useCallback((f: File) => {
    if (f.type !== "application/pdf") return;
    setFile(f);
    setPageImages(new Map());
    setCurrentPage(1);
    reset();
  }, [reset]);

  const handleProcess = async () => {
    if (!file) return;
    await process(() => pdfToImages(file, format));
  };

  useEffect(() => {
    if (result?.data) {
      const data = result.data as any;
      setTotalPages(data.totalPages || 0);
      setPdfUrl(data.pdfUrl || null);
    }
  }, [result]);

  const renderCurrentPage = async () => {
    if (!pdfUrl) return;
    setRendering(true);
    const image = await renderPageToImage(pdfUrl, currentPage, format, 2);
    if (image) {
      setPageImages((prev) => new Map(prev).set(currentPage, image));
    }
    setRendering(false);
  };

  const downloadPage = () => {
    const image = pageImages.get(currentPage);
    if (!image) return;
    const ext = format === "image/jpeg" ? "jpg" : "png";
    const a = document.createElement("a");
    a.href = image;
    a.download = `page-${currentPage}.${ext}`;
    a.click();
  };

  const downloadAll = async () => {
    if (!pdfUrl) return;
    for (let i = 1; i <= totalPages; i++) {
      if (!pageImages.has(i)) {
        const image = await renderPageToImage(pdfUrl, i, format, 2);
        if (image) {
          setPageImages((prev) => new Map(prev).set(i, image));
          const ext = format === "image/jpeg" ? "jpg" : "png";
          const a = document.createElement("a");
          a.href = image;
          a.download = `page-${i}.${ext}`;
          a.click();
          await new Promise((r) => setTimeout(r, 500));
        }
      }
    }
  };

  const handleReset = () => {
    reset();
    setFile(null);
    setPdfUrl(null);
    setPageImages(new Map());
    setCurrentPage(1);
    setTotalPages(0);
  };

  return (
    <div className="space-y-4">
      {status === "idle" && !file && (
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
            dragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25"
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files[0]) loadFile(e.dataTransfer.files[0]); }}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
          <p className="font-medium mb-1">Drop a PDF file here</p>
          <p className="text-sm text-muted-foreground">or click to browse. Convert PDF pages to images.</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && loadFile(e.target.files[0])}
          />
        </div>
      )}

      {file && status === "idle" && (
        <>
          <Card className="p-3">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-red-500 shrink-0" />
              <span className="text-sm flex-1 truncate">{file.name}</span>
              <span className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(0)} KB</span>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleReset}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </Card>

          <div className="flex gap-2">
            <Button variant={format === "image/png" ? "default" : "outline"} size="sm" onClick={() => setFormat("image/png")}>
              PNG
            </Button>
            <Button variant={format === "image/jpeg" ? "default" : "outline"} size="sm" onClick={() => setFormat("image/jpeg")}>
              JPEG
            </Button>
          </div>

          <Button onClick={handleProcess} className="w-full">
            <FileImage className="h-4 w-4 mr-2" /> Convert PDF to Images
          </Button>
        </>
      )}

      {status === "processing" && (
        <div className="text-center py-8">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Processing PDF...</p>
        </div>
      )}

      {status === "success" && totalPages > 0 && (
        <div className="space-y-4">
          <div className="bg-green-500/10 text-green-600 dark:text-green-400 rounded-xl p-4 text-sm font-medium text-center">
            {result?.message}
          </div>

          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage <= 1}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">Page {currentPage} of {totalPages}</span>
            <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <Card className="overflow-hidden">
            <CardContent className="p-4 flex items-center justify-center min-h-[300px] bg-muted/30">
              {pageImages.has(currentPage) ? (
                <img
                  src={pageImages.get(currentPage)}
                  alt={`Page ${currentPage}`}
                  className="max-w-full max-h-[500px] rounded-lg shadow-lg"
                />
              ) : (
                <div className="text-center">
                  <FileImage className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                  <Button onClick={renderCurrentPage} disabled={rendering}>
                    {rendering ? "Rendering..." : "Render Page"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button onClick={downloadPage} disabled={!pageImages.has(currentPage)} className="flex-1">
              <Download className="h-4 w-4 mr-2" /> Download This Page
            </Button>
            <Button onClick={downloadAll} variant="outline" className="flex-1">
              <Download className="h-4 w-4 mr-2" /> Download All Pages
            </Button>
          </div>

          <Button variant="outline" onClick={handleReset} className="w-full">Convert Another</Button>
        </div>
      )}

      {status === "error" && error && (
        <div className="space-y-3">
          <div className="bg-destructive/10 text-destructive rounded-xl p-4 text-sm text-center">{error}</div>
          <Button variant="outline" onClick={handleReset} className="w-full">Try Again</Button>
        </div>
      )}
    </div>
  );
}