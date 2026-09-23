"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  Upload,
  FileText,
  X,
  ArrowUp,
  ArrowDown,
  Download,
  Trash2,
  CheckCircle2,
  ExternalLink,
  Plus,
  Loader2,
  FileCheck2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { PDFDocument } from "pdf-lib";
import { mergePDFs } from "@/features/documents/pdf-merger";

interface PDFFileInfo {
  file: File;
  id: string;
  name: string;
  size: number;
  pageCount: number | null;
}

export function PDFMergerEngine() {
  const [files, setFiles] = useState<PDFFileInfo[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [isMerging, setIsMerging] = useState(false);
  const [addPageNumbers, setAddPageNumbers] = useState(false);
  const [customFileName, setCustomFileName] = useState("merged-document.pdf");
  const [mergedResult, setMergedResult] = useState<{
    url: string;
    blob: Blob;
    pageCount: number;
    size: number;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Read page count for each file on load
  const inspectAndAddFiles = useCallback(async (newFiles: FileList | File[]) => {
    const rawFiles = Array.from(newFiles).filter(
      (f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf")
    );

    if (rawFiles.length === 0) {
      toast.error("Please select valid PDF documents.");
      return;
    }

    const items: PDFFileInfo[] = [];
    for (const f of rawFiles) {
      let pageCount = null;
      try {
        const buf = await f.arrayBuffer();
        const doc = await PDFDocument.load(buf, { ignoreEncryption: true });
        pageCount = doc.getPageCount();
      } catch {
        pageCount = 1;
      }
      items.push({
        file: f,
        id: `${f.name}-${Date.now()}-${Math.random()}`,
        name: f.name,
        size: f.size,
        pageCount,
      });
    }

    setFiles((prev) => [...prev, ...items]);
    toast.success(`Added ${items.length} PDF file(s).`);
  }, []);

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((item) => item.id !== id));
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
    if (files.length < 2) {
      toast.error("Please add at least 2 PDF files to merge.");
      return;
    }

    setIsMerging(true);
    setMergedResult(null);

    try {
      const rawFiles = files.map((f) => f.file);
      const res = await mergePDFs(rawFiles, {
        outputFileName: customFileName,
        addPageNumbers,
      });

      if (res.status === "success" && res.outputUrl && res.outputBlob) {
        setMergedResult({
          url: res.outputUrl,
          blob: res.outputBlob,
          pageCount: (res.metadata?.pageCount as number) || 0,
          size: res.outputBlob.size,
        });
        toast.success(res.message || "PDFs merged successfully!");
      } else {
        toast.error(res.error || "Failed to merge PDF files.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error during PDF merge.");
    } finally {
      setIsMerging(false);
    }
  };

  const handleDownload = () => {
    if (!mergedResult) return;
    const a = document.createElement("a");
    a.href = mergedResult.url;
    a.download = customFileName.endsWith(".pdf") ? customFileName : `${customFileName}.pdf`;
    a.click();
  };

  const handleReset = () => {
    setFiles([]);
    setMergedResult(null);
  };

  const totalPages = files.reduce((acc, f) => acc + (f.pageCount || 0), 0);
  const totalInputSize = files.reduce((acc, f) => acc + f.size, 0);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      if (mergedResult?.url) {
        URL.revokeObjectURL(mergedResult.url);
      }
    };
  }, [mergedResult]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Upload Zone */}
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
          if (e.dataTransfer.files) inspectAndAddFiles(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mx-auto mb-4">
          <Upload className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-semibold mb-1">Upload PDF Files to Combine</h3>
        <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
          Drag & drop your PDF documents here, or click to browse. Reorder pages and files before merging.
        </p>
        <Button variant="outline" size="sm" className="rounded-xl pointer-events-none">
          <Plus className="h-4 w-4 mr-1.5" /> Select PDF Files
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) inspectAndAddFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {/* File List & Reorder Queue */}
      {files.length > 0 && (
        <Card className="rounded-2xl border-border/60 shadow-sm overflow-hidden">
          <div className="p-4 bg-muted/40 border-b border-border/60 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">Merge Queue</span>
              <Badge variant="secondary" className="rounded-full text-xs">
                {files.length} {files.length === 1 ? "file" : "files"}
              </Badge>
              {totalPages > 0 && (
                <Badge variant="outline" className="rounded-full text-xs">
                  {totalPages} total pages
                </Badge>
              )}
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

          <CardContent className="p-3 space-y-2">
            {files.map((item, idx) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50 hover:border-border transition-all shadow-2xs"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 text-red-500 shrink-0 font-bold text-xs">
                  {idx + 1}
                </div>
                <FileText className="h-5 w-5 text-red-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(item.size / 1024).toFixed(1)} KB
                    {item.pageCount && ` • ${item.pageCount} ${item.pageCount === 1 ? "page" : "pages"}`}
                  </p>
                </div>

                {/* Reorder & Remove Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg"
                    disabled={idx === 0}
                    onClick={() => moveFile(idx, -1)}
                    title="Move up"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg"
                    disabled={idx === files.length - 1}
                    onClick={() => moveFile(idx, 1)}
                    title="Move down"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive"
                    onClick={() => removeFile(item.id)}
                    title="Remove from queue"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>

          {/* Merge Settings & Actions Bar */}
          <div className="p-4 bg-muted/20 border-t border-border/60 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="outputName" className="text-xs font-medium">
                  Output File Name
                </Label>
                <Input
                  id="outputName"
                  value={customFileName}
                  onChange={(e) => setCustomFileName(e.target.value)}
                  placeholder="merged-document.pdf"
                  className="mt-1 h-9 rounded-xl text-xs"
                />
              </div>
              <div className="flex items-center space-x-2 pt-5">
                <input
                  type="checkbox"
                  id="pageNumbers"
                  checked={addPageNumbers}
                  onChange={(e) => setAddPageNumbers(e.target.checked)}
                  className="rounded border-border h-4 w-4 text-primary focus:ring-primary cursor-pointer"
                />
                <Label htmlFor="pageNumbers" className="text-xs font-medium cursor-pointer">
                  Stamp continuous page numbers at bottom center
                </Label>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-muted-foreground">
                Total size: {(totalInputSize / (1024 * 1024)).toFixed(2)} MB
              </span>
              <Button
                onClick={handleMerge}
                disabled={files.length < 2 || isMerging}
                className="rounded-xl px-6 font-semibold"
              >
                {isMerging ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Merging...
                  </>
                ) : (
                  <>
                    <FileCheck2 className="h-4 w-4 mr-2" /> Combine {files.length} PDFs
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Merged Success Result Banner */}
      {mergedResult && (
        <Card className="rounded-2xl border-emerald-500/30 bg-emerald-500/5 p-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-center sm:text-left">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 shrink-0">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Merge Completed Successfully!</h4>
                <p className="text-xs text-muted-foreground">
                  {mergedResult.pageCount} pages combined • {(mergedResult.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl h-10 gap-1.5"
                onClick={() => window.open(mergedResult.url, "_blank")}
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