"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, Download, Trash2, FileText, FileOutput } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProcessing } from "@/hooks/use-processing";
import { textToPDF } from "@/features/documents/text-to-pdf";

export function TextToPDFEngine() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [fontSize, setFontSize] = useState(11);
  const [pageSize, setPageSize] = useState<"letter" | "a4" | "legal">("a4");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { status, result, error, process, reset } = useProcessing();

  const loadFile = useCallback((f: File) => {
    setFile(f);
    if (!title) setTitle(f.name.replace(/\.[^.]+$/, ""));
  }, [title]);

  const handleConvert = async () => {
    if (!file) return;
    await process(() => textToPDF(file, { title: title || undefined, fontSize, pageSize }));
  };

  const handleDownload = () => {
    if (result?.outputUrl) {
      const a = document.createElement("a");
      a.href = result.outputUrl;
      a.download = (result.data as { downloadName?: string } | undefined)?.downloadName || "document.pdf";
      a.click();
    }
  };

  const handleReset = () => {
    reset();
    setFile(null);
    setTitle("");
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
          <p className="font-medium mb-1">Drop a text file here</p>
          <p className="text-sm text-muted-foreground">.txt, .md, .csv, .log, or any text file. Max 10MB.</p>
          <input ref={fileInputRef} type="file" accept=".txt,.md,.csv,.log,.json,.xml,.html,.css,.js,.ts,.py,text/*" className="hidden"
            onChange={(e) => e.target.files?.[0] && loadFile(e.target.files[0])} />
        </div>
      )}

      {status === "idle" && file && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-blue-500" />
              <div>
                <p className="font-medium text-sm truncate max-w-50">{file.name}</p>
                <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleReset}>Remove</Button>
          </div>

          <div className="space-y-3">
            <div>
              <Label className="text-sm">Document Title (optional)</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="My Document" className="mt-1 rounded-xl" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm">Font Size</Label>
                <select value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full mt-1 rounded-xl border border-border/50 bg-background p-2 text-sm">
                  {[9, 10, 11, 12, 14, 16, 18].map((s) => (
                    <option key={s} value={s}>{s}pt</option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="text-sm">Page Size</Label>
                <select value={pageSize} onChange={(e) => setPageSize(e.target.value as typeof pageSize)}
                  className="w-full mt-1 rounded-xl border border-border/50 bg-background p-2 text-sm">
                  <option value="a4">A4</option>
                  <option value="letter">US Letter</option>
                  <option value="legal">US Legal</option>
                </select>
              </div>
            </div>
          </div>

          <Button onClick={handleConvert} className="w-full gap-2 rounded-xl">
            <FileOutput className="h-4 w-4" /> Convert to PDF
          </Button>
        </div>
      )}

      {status === "processing" && (
        <div className="text-center py-8">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="font-medium">Creating PDF...</p>
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