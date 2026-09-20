"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, Download, Trash2, Presentation, FileOutput } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProcessing } from "@/hooks/use-processing";
import { pptToPDF } from "@/features/documents/ppt-to-pdf";

export function PPTToPDFEngine() {
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { status, result, error, process, reset } = useProcessing();

  const loadFile = useCallback((f: File) => {
    setFile(f);
  }, []);

  const handleConvert = async () => {
    if (!file) return;
    await process(() => pptToPDF(file));
  };

  const handleDownload = () => {
    if (result?.outputUrl) {
      const a = document.createElement("a");
      a.href = result.outputUrl;
      a.download = (result.data as { downloadName?: string } | undefined)?.downloadName || "presentation.pdf";
      a.click();
    }
  };

  const handleReset = () => {
    reset();
    setFile(null);
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
          onDrop={(e) => { e.preventDefault(); setDragOver(false); e.dataTransfer.files[0] && loadFile(e.dataTransfer.files[0]); }}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
          <p className="font-medium mb-1">Drop a PowerPoint file here</p>
          <p className="text-sm text-muted-foreground">.pptx or .ppt files. Max 50MB.</p>
          <input ref={fileInputRef} type="file" accept=".pptx,.ppt,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.ms-powerpoint" className="hidden"
            onChange={(e) => e.target.files?.[0] && loadFile(e.target.files[0])} />
        </div>
      )}

      {status === "idle" && file && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
            <div className="flex items-center gap-3">
              <Presentation className="h-8 w-8 text-orange-500" />
              <div>
                <p className="font-medium text-sm truncate max-w-[200px]">{file.name}</p>
                <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleReset}>Remove</Button>
          </div>

          <div className="p-3 rounded-xl bg-muted/30 text-xs text-muted-foreground">
            <p>PPTX will be analyzed and converted to PDF.</p>
            <p className="mt-1">Slide text content is extracted. For full visual fidelity, use a server-side converter.</p>
          </div>

          <Button onClick={handleConvert} className="w-full gap-2 rounded-xl">
            <FileOutput className="h-4 w-4" /> Convert to PDF
          </Button>
        </div>
      )}

      {status === "processing" && (
        <div className="text-center py-8">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="font-medium">Converting PPT to PDF...</p>
        </div>
      )}

      {status === "success" && result && (
        <div className="text-center py-6 space-y-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100 dark:bg-green-900/30 mx-auto">
            <FileOutput className="h-8 w-8 text-green-600" />
          </div>
          <div>
            <p className="font-semibold text-lg">PDF Created!</p>
            <p className="text-sm text-muted-foreground">{result.message}</p>
          </div>
          <div className="flex gap-2 justify-center">
            <Button onClick={handleDownload} className="gap-2 rounded-xl"><Download className="h-4 w-4" /> Download PDF</Button>
            <Button variant="outline" onClick={handleReset} className="gap-2 rounded-xl"><Trash2 className="h-4 w-4" /> Convert Another</Button>
          </div>
        </div>
      )}

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