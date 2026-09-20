"use client";

import { useState, useRef } from "react";
import { Image, Upload, Download, Loader2, AlertCircle, FileOutput, X, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { PDFDocument } from "pdf-lib";

interface ImageFile {
  id: string;
  file: File;
  preview: string;
}

async function imageToPDFPage(file: File): Promise<Uint8Array | null> {
  try {
    const pdf = await PDFDocument.create();
    const arrayBuffer = await file.arrayBuffer();

    if (file.type === "image/png") {
      const image = await pdf.embedPng(new Uint8Array(arrayBuffer));
      const page = pdf.addPage([image.width, image.height]);
      page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
    } else if (file.type === "image/jpeg" || file.type === "image/jpg") {
      const image = await pdf.embedJpg(new Uint8Array(arrayBuffer));
      const page = pdf.addPage([image.width, image.height]);
      page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
    } else {
      // Try PNG embedding for other formats
      try {
        const image = await pdf.embedPng(new Uint8Array(arrayBuffer));
        const page = pdf.addPage([image.width, image.height]);
        page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
      } catch {
        return null;
      }
    }

    return await pdf.save();
  } catch {
    return null;
  }
}

export function JPGToPDFMergerEngine() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [convertedBlob, setConvertedBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validFiles: ImageFile[] = [];
    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        setError(`"${file.name}" is not a valid image file.`);
        continue;
      }
      if (file.size > 20 * 1024 * 1024) {
        setError(`"${file.name}" exceeds 20MB limit.`);
        continue;
      }
      validFiles.push({
        id: crypto.randomUUID(),
        file,
        preview: URL.createObjectURL(file),
      });
    }

    if (validFiles.length > 0) {
      setError(null);
      setImages((prev) => [...prev, ...validFiles]);
      setConvertedBlob(null);
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

  const moveImage = (id: string, direction: "up" | "down") => {
    setImages((prev) => {
      const idx = prev.findIndex((i) => i.id === id);
      if (idx === -1) return prev;
      const newIdx = direction === "up" ? idx - 1 : idx + 1;
      if (newIdx < 0 || newIdx >= prev.length) return prev;
      const arr = [...prev];
      [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
      return arr;
    });
    setConvertedBlob(null);
  };

  const handleMerge = async () => {
    if (images.length === 0) return;
    setIsConverting(true);
    setError(null);

    try {
      // Use pdf-lib to merge all images into a single PDF
      const mergedPdf = await PDFDocument.create();

      for (const img of images) {
        const arrayBuffer = await img.file.arrayBuffer();
        let embeddedImage;

        if (img.file.type === "image/png") {
          embeddedImage = await mergedPdf.embedPng(new Uint8Array(arrayBuffer));
        } else if (img.file.type === "image/jpeg" || img.file.type === "image/jpg") {
          embeddedImage = await mergedPdf.embedJpg(new Uint8Array(arrayBuffer));
        } else {
          try {
            embeddedImage = await mergedPdf.embedPng(new Uint8Array(arrayBuffer));
          } catch {
            continue;
          }
        }

        const page = mergedPdf.addPage([embeddedImage.width, embeddedImage.height]);
        page.drawImage(embeddedImage, {
          x: 0, y: 0,
          width: embeddedImage.width,
          height: embeddedImage.height,
        });
      }

      if (mergedPdf.getPageCount() === 0) {
        setError("Could not process any of the selected images.");
        return;
      }

      const pdfBytes = await mergedPdf.save();
      const blob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" });
      setConvertedBlob(blob);
      toast.success(`Merged ${images.length} image(s) into PDF (${mergedPdf.getPageCount()} pages).`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Merge failed.");
      toast.error("Merge failed.");
    } finally {
      setIsConverting(false);
    }
  };

  const handleDownload = () => {
    if (!convertedBlob) return;
    const url = URL.createObjectURL(convertedBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `merged-images-${Date.now()}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Badge variant="secondary" className="rounded-full">JPG → PDF</Badge>
        <span className="text-xs text-muted-foreground">Merge multiple images into a single PDF</span>
      </div>

      {/* Upload */}
      <Card className="border-border/50">
        <CardContent className="p-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFilesSelected}
            className="hidden"
          />
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-border/50 rounded-xl p-6 text-center cursor-pointer hover:border-primary/30 hover:bg-muted/30 transition-colors"
          >
            <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
            <p className="font-medium text-sm mb-1">Drop images here or click to browse</p>
            <p className="text-xs text-muted-foreground">JPG, PNG, WebP, BMP • Max 20MB each</p>
          </div>
        </CardContent>
      </Card>

      {/* Image list */}
      {images.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">{images.length} image(s) selected</p>
          <div className="space-y-2 max-h-75 overflow-y-auto">
            {images.map((img, idx) => (
              <div key={img.id} className="flex items-center gap-3 p-2 bg-muted/30 rounded-xl">
                <img src={img.preview} alt={img.file.name} className="h-12 w-12 object-cover rounded-lg" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{img.file.name}</p>
                  <p className="text-xs text-muted-foreground">{(img.file.size / 1024).toFixed(1)} KB</p>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveImage(img.id, "up")} disabled={idx === 0}>
                    <GripVertical className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeImage(img.id)}>
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 text-destructive text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="flex gap-2">
        <Button
          onClick={handleMerge}
          disabled={images.length === 0 || isConverting}
          className="gap-2 rounded-xl"
        >
          {isConverting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileOutput className="h-4 w-4" />}
          {isConverting ? "Merging..." : `Merge ${images.length} Image(s) to PDF`}
        </Button>
        {convertedBlob && (
          <Button onClick={handleDownload} variant="outline" className="gap-2 rounded-xl">
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        )}
      </div>

      {images.length === 0 && !error && (
        <div className="text-center py-6 text-muted-foreground">
          <Image className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Add images to merge them into a single PDF</p>
        </div>
      )}
    </div>
  );
}