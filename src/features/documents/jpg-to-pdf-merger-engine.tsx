"use client";

import { useState, useRef, useEffect } from "react";
import {
  Image as ImageIcon,
  Upload,
  Download,
  Loader2,
  Trash2,
  ArrowUp,
  ArrowDown,
  X,
  Plus,
  CheckCircle2,
  ExternalLink,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { PDFDocument } from "pdf-lib";

interface ImageFile {
  id: string;
  file: File;
  preview: string;
}

export function JPGToPDFMergerEngine() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [layoutMode, setLayoutMode] = useState<"1-per-page" | "2-per-page" | "fit">("1-per-page");
  const [pageSize, setPageSize] = useState<"a4" | "letter">("a4");
  const [isMerging, setIsMerging] = useState(false);
  const [convertedBlob, setConvertedBlob] = useState<Blob | null>(null);
  const [convertedUrl, setConvertedUrl] = useState<string | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validFiles: ImageFile[] = [];
    for (const file of files) {
      if (!file.type.startsWith("image/") && !/\.(jpe?g|png|webp)$/i.test(file.name)) {
        continue;
      }
      validFiles.push({
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        file,
        preview: URL.createObjectURL(file),
      });
    }

    if (validFiles.length > 0) {
      setImages((prev) => [...prev, ...validFiles]);
      setConvertedBlob(null);
      setConvertedUrl(null);
      toast.success(`Added ${validFiles.length} image(s).`);
    }
  };

  const removeImage = (id: string) => {
    setImages((prev) => {
      const img = prev.find((i) => i.id === id);
      if (img) URL.revokeObjectURL(img.preview);
      return prev.filter((i) => i.id !== id);
    });
    setConvertedBlob(null);
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

  const handleMerge = async () => {
    if (images.length === 0) return;
    setIsMerging(true);

    try {
      const pdf = await PDFDocument.create();
      const pageWidth = pageSize === "letter" ? 612 : 595.28;
      const pageHeight = pageSize === "letter" ? 792 : 841.89;
      const margin = 36; // 0.5 inch

      if (layoutMode === "1-per-page") {
        for (const item of images) {
          const ab = await item.file.arrayBuffer();
          let embeddedImage;
          try {
            embeddedImage = await pdf.embedJpg(new Uint8Array(ab));
          } catch {
            embeddedImage = await pdf.embedPng(new Uint8Array(ab));
          }

          const page = pdf.addPage([pageWidth, pageHeight]);
          const availW = pageWidth - margin * 2;
          const availH = pageHeight - margin * 2;
          const scale = Math.min(availW / embeddedImage.width, availH / embeddedImage.height, 1);

          const w = embeddedImage.width * scale;
          const h = embeddedImage.height * scale;
          const x = margin + (availW - w) / 2;
          const y = margin + (availH - h) / 2;

          page.drawImage(embeddedImage, { x, y, width: w, height: h });
        }
      } else if (layoutMode === "fit") {
        // Fit each page to exact image size
        for (const item of images) {
          const ab = await item.file.arrayBuffer();
          let embeddedImage;
          try {
            embeddedImage = await pdf.embedJpg(new Uint8Array(ab));
          } catch {
            embeddedImage = await pdf.embedPng(new Uint8Array(ab));
          }

          const page = pdf.addPage([embeddedImage.width, embeddedImage.height]);
          page.drawImage(embeddedImage, {
            x: 0,
            y: 0,
            width: embeddedImage.width,
            height: embeddedImage.height,
          });
        }
      } else {
        // 2-per-page stacked vertically
        for (let i = 0; i < images.length; i += 2) {
          const page = pdf.addPage([pageWidth, pageHeight]);
          const slotHeight = (pageHeight - margin * 3) / 2;
          const availW = pageWidth - margin * 2;

          // Slot 1 (top)
          const ab1 = await images[i].file.arrayBuffer();
          let img1;
          try {
            img1 = await pdf.embedJpg(new Uint8Array(ab1));
          } catch {
            img1 = await pdf.embedPng(new Uint8Array(ab1));
          }
          const scale1 = Math.min(availW / img1.width, slotHeight / img1.height, 1);
          const w1 = img1.width * scale1;
          const h1 = img1.height * scale1;
          page.drawImage(img1, {
            x: margin + (availW - w1) / 2,
            y: pageHeight - margin - slotHeight + (slotHeight - h1) / 2,
            width: w1,
            height: h1,
          });

          // Slot 2 (bottom if exists)
          if (i + 1 < images.length) {
            const ab2 = await images[i + 1].file.arrayBuffer();
            let img2;
            try {
              img2 = await pdf.embedJpg(new Uint8Array(ab2));
            } catch {
              img2 = await pdf.embedPng(new Uint8Array(ab2));
            }
            const scale2 = Math.min(availW / img2.width, slotHeight / img2.height, 1);
            const w2 = img2.width * scale2;
            const h2 = img2.height * scale2;
            page.drawImage(img2, {
              x: margin + (availW - w2) / 2,
              y: margin + (slotHeight - h2) / 2,
              width: w2,
              height: h2,
            });
          }
        }
      }

      const total = pdf.getPageCount();
      setPageCount(total);

      const bytes = await pdf.save({ useObjectStreams: true });
      const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      setConvertedBlob(blob);
      setConvertedUrl(url);
      toast.success(`Merged ${images.length} JPG images into ${total} page(s)!`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error merging JPGs.");
    } finally {
      setIsMerging(false);
    }
  };

  const handleDownload = () => {
    if (!convertedUrl) return;
    const a = document.createElement("a");
    a.href = convertedUrl;
    a.download = `merged-images-${Date.now()}.pdf`;
    a.click();
  };

  const handleReset = () => {
    images.forEach((img) => URL.revokeObjectURL(img.preview));
    setImages([]);
    setConvertedBlob(null);
    setConvertedUrl(null);
  };

  useEffect(() => {
    return () => {
      if (convertedUrl) URL.revokeObjectURL(convertedUrl);
      images.forEach((img) => URL.revokeObjectURL(img.preview));
    };
  }, [convertedUrl, images]);

  return (
    <div className="w-full min-w-0 space-y-4">
      {/* Upload Zone */}
      <div
        className="border-2 border-dashed rounded-lg p-4 sm:p-6 text-center transition-colors cursor-pointer border-border hover:border-primary/50 hover:bg-muted/30"
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 mx-auto mb-4">
          <ImageIcon className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-semibold mb-1">Upload JPG Images to Merge into PDF</h3>
        <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
          Combine multiple JPG/JPEG photos, scans, and documents into a clean PDF. Reorder and customize layout.
        </p>
        <Button variant="outline" onClick={(event) => { event.stopPropagation(); fileInputRef.current?.click(); }} className="rounded-lg">
          <Plus className="h-4 w-4 mr-1.5" /> Select JPG Files
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png"
          multiple
          className="hidden"
          onChange={handleFilesSelected}
        />
      </div>

      {/* Queue & Settings */}
      {images.length > 0 && (
        <section aria-label="JPG sequence and PDF layout" className="min-w-0">
          <div className="py-3 border-b border-border/60 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">Image Order</span>
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
                <Trash2 className="h-3.5 w-3.5 mr-1" /> Clear
              </Button>
            </div>
          </div>

          <div className="py-4 space-y-4">
            {/* Gallery Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {images.map((item, idx) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-border/60 overflow-hidden bg-card flex flex-col"
                >
                  <div className="aspect-square w-full bg-muted/20 relative flex items-center justify-center overflow-hidden p-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.preview}
                      alt={item.file.name}
                      className="max-h-full max-w-full object-contain rounded"
                    />
                    <div className="absolute top-1.5 left-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white font-bold text-[10px]">
                      {idx + 1}
                    </div>
                  </div>

                  <div className="p-2 border-t border-border/40 flex items-center justify-between text-xs">
                    <span className="truncate flex-1 text-muted-foreground font-mono text-[11px]">
                      {(item.file.size / 1024).toFixed(0)} KB
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => moveImage(idx, -1)}
                        className="p-1 rounded hover:bg-muted text-muted-foreground disabled:opacity-30 cursor-pointer"
                        title="Move up"
                      >
                        <ArrowUp className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === images.length - 1}
                        onClick={() => moveImage(idx, 1)}
                        className="p-1 rounded hover:bg-muted text-muted-foreground disabled:opacity-30 cursor-pointer"
                        title="Move down"
                      >
                        <ArrowDown className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeImage(item.id)}
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

            {/* Layout Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <Label className="text-xs font-semibold mb-1.5 block">Layout Mode</Label>
                <div className="flex rounded-lg bg-background p-0.5 border border-border/60">
                  <button
                    type="button"
                    onClick={() => setLayoutMode("1-per-page")}
                    className={`flex-1 py-1 text-center rounded-md font-medium transition-colors ${
                      layoutMode === "1-per-page" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                    }`}
                  >
                    1 per page
                  </button>
                  <button
                    type="button"
                    onClick={() => setLayoutMode("2-per-page")}
                    className={`flex-1 py-1 text-center rounded-md font-medium transition-colors ${
                      layoutMode === "2-per-page" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                    }`}
                  >
                    2 per page
                  </button>
                  <button
                    type="button"
                    onClick={() => setLayoutMode("fit")}
                    className={`flex-1 py-1 text-center rounded-md font-medium transition-colors ${
                      layoutMode === "fit" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                    }`}
                  >
                    Fit Image
                  </button>
                </div>
              </div>

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
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                onClick={handleMerge}
                disabled={isMerging}
                className="rounded-xl px-6 font-semibold"
              >
                {isMerging ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Merging JPGs...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" /> Merge into PDF Document
                  </>
                )}
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Result Card */}
      {convertedBlob && convertedUrl && (
        <Card className="rounded-2xl border-emerald-500/30 bg-emerald-500/5 p-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-center sm:text-left">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 shrink-0">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">JPG Images Merged Successfully!</h4>
                <p className="text-xs text-muted-foreground">
                  {pageCount} page(s) • {(convertedBlob.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl h-10 gap-1.5"
                onClick={() => window.open(convertedUrl, "_blank")}
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