"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, FileText, X, ArrowUpDown, Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useProcessing } from "@/hooks/use-processing";
import { mergePDFs } from "@/features/documents/pdf-merger";
import { ProcessingStatusBadge } from "@/components/common/processing-status";

export function PDFMergerEngine() {
  const [files, setFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { status, result, error, process, reset } = useProcessing();

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const pdfs = Array.from(newFiles).filter((f) => f.type === "application/pdf");
    setFiles((prev) => [...prev, ...pdfs]);
  }, []);

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const moveFile = (index: number, direction: -1 | 1) => {
    setFiles((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const handleMerge = async () => {
    await process(() => mergePDFs(files));
  };

  const handleDownload = () => {
    if (result?.outputUrl) {
      const a = document.createElement("a");
      a.href = result.outputUrl;
      a.download = "merged.pdf";
      a.click();
    }
  };

  const handleReset = () => {
    reset();
    setFiles([]);
  };

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      {status === "idle" && (
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
            dragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25"
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
          <p className="font-medium mb-1">Drop PDF files here</p>
          <p className="text-sm text-muted-foreground">or click to browse. Select 2+ PDFs to merge.</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            multiple
            className="hidden"
            onChange={(e) => e.target.files && addFiles(e.target.files)}
          />
        </div>
      )}

      {/* File list */}
      {files.length > 0 && status === "idle" && (
        <div className="space-y-2">
          {files.map((file, i) => (
            <Card key={`${file.name}-${i}`} className="p-3">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-red-500 shrink-0" />
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
          <div className="flex gap-2">
            <Button onClick={handleMerge} disabled={files.length < 2} className="flex-1">
              Merge {files.length} PDFs
            </Button>
            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
              Add More
            </Button>
          </div>
        </div>
      )}

      {/* Processing */}
      {status === "processing" && (
        <div className="text-center py-8">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="font-medium">Merging PDFs...</p>
          <p className="text-sm text-muted-foreground">Combining {files.length} files</p>
        </div>
      )}

      {/* Result */}
      {status === "success" && result && (
        <div className="text-center py-6 space-y-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100 dark:bg-green-900/30 mx-auto">
            <FileText className="h-8 w-8 text-green-600" />
          </div>
          <div>
            <p className="font-semibold text-lg">PDF Merged!</p>
            <p className="text-sm text-muted-foreground">{result.message}</p>
          </div>
          <div className="flex gap-2 justify-center">
            <Button onClick={handleDownload} className="gap-2">
              <Download className="h-4 w-4" /> Download
            </Button>
            <Button variant="outline" onClick={handleReset} className="gap-2">
              <Trash2 className="h-4 w-4" /> Start Over
            </Button>
          </div>
        </div>
      )}

      {/* Error */}
      {status === "error" && error && (
        <div className="text-center py-6">
          <p className="text-destructive font-medium mb-2">Error</p>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <Button variant="outline" onClick={handleReset}>Try Again</Button>
        </div>
      )}
    </div>
  );
}