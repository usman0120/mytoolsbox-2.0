"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  Upload,
  Image as ImageIcon,
  Download,
  Trash2,
  FileText,
  Plus,
  ArrowUp,
  ArrowDown,
  X,
  Loader2,
  CheckCircle2,
  ExternalLink,
  Sliders,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  imagesToPDF,
  PDFPageSize,
  PDFOrientation,
  PDFMargin,
} from "@/features/documents/images-to-pdf";

interface ImageItem {
  file: File;
  id: string;
  previewUrl: string;
}

export function ImagesToPDFEngine() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [pageSize, setPageSize] = useState<PDFPageSize>("a4");
  const [orientation, setOrientation] = useState<PDFOrientation>("auto");
  const [margin, setMargin] = useState<PDFMargin>("small");
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{
    url: string;
    pageCount: number;
    size: number;
    message: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const addImages = useCallback((newFiles: FileList | File[]) => {
    const rawFiles = Array.from(newFiles).filter((f) =>
      f.type.startsWith("image/") || /\.(jpe?g|png|webp|gif|bmp)$/i.test(f.name)
    );

    if (rawFiles.length === 0) {
      toast.error("Please select valid image files (JPG, PNG, WebP).");
      return;
    }

    const items: ImageItem[] = rawFiles.map((file) => ({
      file,
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      previewUrl: URL.createObjectURL(file),
    }));

    setImages((prev) => [...prev, ...items]);
    setResult(null);
    toast.success(`Added ${items.length} image(s).`);
  }, []);

  const removeImage = (id: string) => {
    setImages((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((item) => item.id !== id);
    });
  };

  const moveImage = (index: number, direction: -1 | 1) => {
    setImages((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const handleConvert = async () => {
    if (images.length === 0) return;
    setIsProcessing(true);
    setResult(null);

    try {
      const rawFiles = images.map((i) => i.file);
      const res = await imagesToPDF(rawFiles, { pageSize, orientation, margin });

      if (res.status === "success" && res.outputUrl && res.outputBlob) {
        setResult({
          url: res.outputUrl,
          pageCount: (res.metadata?.pageCount as number) || images.length,
          size: res.outputBlob.size,
          message: res.message || "PDF created successfully.",
        });
        toast.success("PDF created successfully!");
      } else {
        toast.error(res.error || "Failed to create PDF.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error creating PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const a = document.createElement("a");
    a.href = result.url;
    a.download = `images-converted-${Date.now()}.pdf`;
    a.click();
  };

  const handleReset = () => {
    images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    setImages([]);
    setResult(null);
  };

  useEffect(() => {
    return () => {
      if (result?.url) URL.revokeObjectURL(result.url);
      images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    };
  }, [result, images]);

  return (
    <div className="w-full min-w-0 space-y-4">
      {/* Upload Zone */}
      <div
        className={`border-2 border-dashed rounded-lg p-4 sm:p-6 text-center transition-colors cursor-pointer ${
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
          if (e.dataTransfer.files) addImages(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mx-auto mb-4">
          <ImageIcon className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-semibold mb-1">Upload Images to Convert to PDF</h3>
        <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
          Convert JPG, PNG, WebP, GIF, or BMP images into a single professional PDF document. Reorder and customize margins.
        </p>
        <Button variant="outline" onClick={(event) => { event.stopPropagation(); fileInputRef.current?.click(); }} className="rounded-lg">
          <Plus className="h-4 w-4 mr-1.5" /> Select Images
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) addImages(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {/* Selected Images Gallery */}
      {images.length > 0 && (
        <section aria-label="Image sequence and PDF layout" className="min-w-0">
          <div className="p-4 bg-muted/40 border-b border-border/60 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">Image Sequence</span>
              <Badge variant="secondary" className="rounded-full text-xs">
                {images.length} {images.length === 1 ? "image" : "images"}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs h-8 rounded-lg"
              >
                <Plus className="h-3.5 w-3.5 mr-1" /> Add More
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="text-xs h-8 text-destructive hover:text-destructive rounded-lg"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1" /> Clear All
              </Button>
            </div>
          </div>

          <div className="py-4">
            {/* Grid of Image Thumbnails */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {images.map((img, idx) => (
                <div
                  key={img.id}
                  className="group relative rounded-xl border border-border/60 overflow-hidden bg-card flex flex-col"
                >
                  <div className="aspect-square w-full bg-muted/20 relative flex items-center justify-center overflow-hidden p-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.previewUrl}
                      alt={img.file.name}
                      className="max-h-full max-w-full object-contain rounded"
                    />
                    <div className="absolute top-1.5 left-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white font-bold text-[10px]">
                      {idx + 1}
                    </div>
                  </div>

                  <div className="p-2 border-t border-border/40 flex items-center justify-between text-xs">
                    <span className="truncate flex-1 text-muted-foreground font-mono text-[11px]">
                      {(img.file.size / 1024).toFixed(0)} KB
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => moveImage(idx, -1)}
                        className="p-1 rounded hover:bg-muted text-muted-foreground disabled:opacity-30 cursor-pointer"
                        title="Move backward"
                      >
                        <ArrowUp className="h-3 w-3 -rotate-90" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === images.length - 1}
                        onClick={() => moveImage(idx, 1)}
                        className="p-1 rounded hover:bg-muted text-muted-foreground disabled:opacity-30 cursor-pointer"
                        title="Move forward"
                      >
                        <ArrowDown className="h-3 w-3 -rotate-90" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeImage(img.id)}
                        className="p-1 rounded hover:bg-destructive/10 text-destructive cursor-pointer"
                        title="Remove"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Layout & Margin Settings */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <Label className="text-xs font-semibold mb-1.5 block">Page Size</Label>
                <div className="flex rounded-lg bg-background p-0.5 border border-border/60">
                  <button
                    type="button"
                    onClick={() => setPageSize("a4")}
                    className={`flex-1 py-1 text-center rounded-md font-medium transition-colors ${
                      pageSize === "a4" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                    }`}
                  >
                    A4
                  </button>
                  <button
                    type="button"
                    onClick={() => setPageSize("letter")}
                    className={`flex-1 py-1 text-center rounded-md font-medium transition-colors ${
                      pageSize === "letter" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                    }`}
                  >
                    US Letter
                  </button>
                  <button
                    type="button"
                    onClick={() => setPageSize("fit")}
                    className={`flex-1 py-1 text-center rounded-md font-medium transition-colors ${
                      pageSize === "fit" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                    }`}
                  >
                    Fit Image
                  </button>
                </div>
              </div>

              <div>
                <Label className="text-xs font-semibold mb-1.5 block">Orientation</Label>
                <div className="flex rounded-lg bg-background p-0.5 border border-border/60">
                  <button
                    type="button"
                    onClick={() => setOrientation("auto")}
                    className={`flex-1 py-1 text-center rounded-md font-medium transition-colors ${
                      orientation === "auto" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                    }`}
                  >
                    Auto
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrientation("portrait")}
                    className={`flex-1 py-1 text-center rounded-md font-medium transition-colors ${
                      orientation === "portrait" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                    }`}
                  >
                    Portrait
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrientation("landscape")}
                    className={`flex-1 py-1 text-center rounded-md font-medium transition-colors ${
                      orientation === "landscape" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                    }`}
                  >
                    Landscape
                  </button>
                </div>
              </div>

              <div>
                <Label className="text-xs font-semibold mb-1.5 block">Margin</Label>
                <div className="flex rounded-lg bg-background p-0.5 border border-border/60">
                  <button
                    type="button"
                    onClick={() => setMargin("none")}
                    className={`flex-1 py-1 text-center rounded-md font-medium transition-colors ${
                      margin === "none" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                    }`}
                  >
                    No Margin
                  </button>
                  <button
                    type="button"
                    onClick={() => setMargin("small")}
                    className={`flex-1 py-1 text-center rounded-md font-medium transition-colors ${
                      margin === "small" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                    }`}
                  >
                    Small
                  </button>
                  <button
                    type="button"
                    onClick={() => setMargin("normal")}
                    className={`flex-1 py-1 text-center rounded-md font-medium transition-colors ${
                      margin === "normal" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                    }`}
                  >
                    Normal
                  </button>
                </div>
              </div>
            </div>

            {/* Convert Action */}
            <div className="pt-4 flex justify-end">
              <Button
                onClick={handleConvert}
                disabled={isProcessing}
                className="rounded-xl px-6 font-semibold"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating PDF...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" /> Convert {images.length} Images to PDF
                  </>
                )}
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Result Card */}
      {result && (
        <Card className="rounded-2xl border-emerald-500/30 bg-emerald-500/5 p-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-center sm:text-left">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 shrink-0">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">PDF Document Ready!</h4>
                <p className="text-xs text-muted-foreground">
                  {result.pageCount} pages • {(result.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl h-10 gap-1.5"
                onClick={() => window.open(result.url, "_blank")}
              >
                <ExternalLink className="h-4 w-4" /> Preview
              </Button>
              <Button
                size="sm"
                className="rounded-xl h-10 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                onClick={handleDownload}
              >
                <Download className="h-4 w-4" /> Download PDF
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}