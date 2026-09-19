"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, ImageIcon, Download, Trash2, FileText, X, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useProcessing } from "@/hooks/use-processing";
import { imagesToPDF } from "@/features/documents/images-to-pdf";

export function ImagesToPDFEngine() {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { status, result, error, process, reset } = useProcessing();

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const images = Array.from(newFiles).filter((f) => f.type.startsWith("image/"));
    setFiles((prev) => [...prev, ...images]);
    images.forEach((f) => {
      const reader = new FileReader();
      reader.onload = () => setPreviews((prev) => [...prev, reader.result as string]);
      reader.readAsDataURL(f);
    });
  }, []);

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const moveFile = (index: number, direction: -1 | 1) => {
    setFiles((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
    setPreviews((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const handleConvert = async () => {
    if (files.length === 0) return;
    await process(() => imagesToPDF(files));
  };

  const handleDownload = () => {
    if (result?.outputUrl) {
      const a = document.createElement("a");
      a.href = result.outputUrl;
      a.download = "images-to-pdf.pdf";
      a.click();
    }
  };

  const handleReset = () => {
    reset();
    setFiles([]);
    setPreviews([]);
  };

  return (
    <div className="space-y-4">
      {status === "idle" && (
        <>
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
              dragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25"
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
            <p className="font-medium mb-1">Drop images here</p>
            <p className="text-sm text-muted-foreground">JPG, PNG, or WebP. Select multiple to combine into one PDF.</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => e.target.files && addFiles(e.target.files)}
            />
          </div>

          {files.length > 0 && (
            <div className="space-y-2">
              {files.map((file, i) => (
                <Card key={`${file.name}-${i}`} className="p-3">
                  <div className="flex items-center gap-3">
                    {previews[i] ? (
                      <img src={previews[i]} alt="" className="h-10 w-10 rounded object-cover shrink-0" />
                    ) : (
                      <ImageIcon className="h-5 w-5 text-muted-foreground shrink-0" />
                    )}
                    <span className="text-sm flex-1 truncate">{file.name}</span>
                    <span className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(0)} KB</span>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveFile(i, -1)} disabled={i === 0}>
                      <ArrowUpDown className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeFile(i)}>
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </Card>
              ))}
              <Button onClick={handleConvert} disabled={files.length === 0} className="w-full">
                <FileText className="h-4 w-4 mr-2" /> Convert to PDF
              </Button>
            </div>
          )}
        </>
      )}

      {status === "processing" && (
        <div className="text-center py-8">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Creating PDF...</p>
        </div>
      )}

      {status === "success" && result && (
        <div className="space-y-3">
          <div className="bg-green-500/10 text-green-600 dark:text-green-400 rounded-xl p-4 text-sm font-medium text-center">
            {result.message}
          </div>
          <Button onClick={handleDownload} className="w-full">
            <Download className="h-4 w-4 mr-2" /> Download PDF
          </Button>
          <Button variant="outline" onClick={handleReset} className="w-full">Convert More</Button>
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