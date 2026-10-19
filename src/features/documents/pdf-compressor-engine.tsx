"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  Upload,
  FileText,
  Download,
  Trash2,
  FileDown,
  CheckCircle2,
  ExternalLink,
  Plus,
  Loader2,
  Zap,
  Gauge,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { PDFDocument } from "pdf-lib";
import { compressPDF, CompressionLevel } from "@/features/documents/pdf-compressor";

export function PDFCompressorEngine() {
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [pageCount, setPageCount] = useState<number>(0);
  const [level, setLevel] = useState<CompressionLevel>("recommended");
  const [stripMetadata, setStripMetadata] = useState(true);
  const [isCompressing, setIsCompressing] = useState(false);
  const [result, setResult] = useState<{
    url: string;
    originalSize: number;
    compressedSize: number;
    reductionPercent: number;
    message: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadFile = useCallback(async (selected: File) => {
    if (selected.type !== "application/pdf" && !selected.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Please upload a valid PDF document.");
      return;
    }

    try {
      const buf = await selected.arrayBuffer();
      const doc = await PDFDocument.load(buf, { ignoreEncryption: true });
      setFile(selected);
      setPageCount(doc.getPageCount());
      setResult(null);
      toast.success(`Loaded PDF: ${selected.name} (${doc.getPageCount()} pages)`);
    } catch {
      toast.error("Could not read PDF. It might be password-protected or corrupted.");
    }
  }, []);

  const handleCompress = async () => {
    if (!file) return;
    setIsCompressing(true);
    setResult(null);

    try {
      const res = await compressPDF(file, { level, stripMetadata });
      if (res.status === "success" && res.outputUrl && res.outputBlob) {
        setResult({
          url: res.outputUrl,
          originalSize: (res.metadata?.originalSize as number) || file.size,
          compressedSize: res.outputBlob.size,
          reductionPercent: (res.metadata?.reductionPercent as number) || 0,
          message: res.message || "PDF compressed successfully.",
        });
        toast.success("Compression completed!");
      } else {
        toast.error(res.error || "Failed to compress PDF.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error compressing PDF.");
    } finally {
      setIsCompressing(false);
    }
  };

  const handleDownload = () => {
    if (!result || !file) return;
    const a = document.createElement("a");
    a.href = result.url;
    const baseName = file.name.replace(/\.pdf$/i, "");
    a.download = `${baseName}-compressed.pdf`;
    a.click();
  };

  const handleReset = () => {
    setFile(null);
    setPageCount(0);
    setResult(null);
  };

  useEffect(() => {
    return () => {
      if (result?.url) URL.revokeObjectURL(result.url);
    };
  }, [result]);

  return (
    <div className="w-full min-w-0 space-y-4">
      {/* Upload Zone */}
      {!file && (
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
            if (e.dataTransfer.files[0]) loadFile(e.dataTransfer.files[0]);
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mx-auto mb-4">
            <FileDown className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-semibold mb-1">Upload PDF File to Compress</h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
            Reduce PDF file size while retaining quality. Choose between Balanced, Lossless, or Maximum compression presets.
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

      {/* File Loaded & Compression Settings */}
      {file && (
        <section aria-label="PDF compression settings" className="min-w-0">
          {/* Header */}
          <div className="p-4 bg-muted/40 border-b border-border/60 flex items-center justify-between gap-3">
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
                    {pageCount} {pageCount === 1 ? "page" : "pages"}
                  </Badge>
                </div>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="text-xs h-8 text-destructive hover:text-destructive rounded-lg shrink-0"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" /> Change PDF
            </Button>
          </div>

          <div className="py-4 space-y-4">
            {/* Compression Presets */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Compression Level
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button type="button" aria-pressed={level === "basic"}
                  onClick={() => setLevel("basic")}
                  className={`p-3 rounded-lg border text-left transition-colors ${
                    level === "basic"
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border hover:border-border/80 bg-card"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-semibold">Low Compression</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Lossless optimization. Highest visual quality. Best for printing.
                  </p>
                </button>

                <button type="button" aria-pressed={level === "recommended"}
                  onClick={() => setLevel("recommended")}
                  className={`p-3 rounded-lg border text-left transition-colors ${
                    level === "recommended"
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border hover:border-border/80 bg-card"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-amber-500" />
                      <span className="text-sm font-semibold">Recommended</span>
                    </div>
                    <Badge variant="secondary" className="text-[9px] px-1.5 py-0 bg-primary/10 text-primary">
                      Optimal
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Balanced file size reduction with sharp text & clean images.
                  </p>
                </button>

                <button type="button" aria-pressed={level === "extreme"}
                  onClick={() => setLevel("extreme")}
                  className={`p-3 rounded-lg border text-left transition-colors ${
                    level === "extreme"
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border hover:border-border/80 bg-card"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Gauge className="h-4 w-4 text-emerald-500" />
                    <span className="text-sm font-semibold">Extreme</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Maximum size reduction. Ideal for email limits and web uploads.
                  </p>
                </button>
              </div>
            </div>

            {/* Checkbox Options */}
            <div className="flex items-center space-x-2 pt-1">
              <input
                type="checkbox"
                id="stripMetadata"
                checked={stripMetadata}
                onChange={(e) => setStripMetadata(e.target.checked)}
                className="rounded border-border h-4 w-4 text-primary focus:ring-primary cursor-pointer"
              />
              <Label htmlFor="stripMetadata" className="text-xs font-medium cursor-pointer">
                Strip document metadata (Author, Producer, Keywords) for privacy & smaller file size
              </Label>
            </div>

            {/* Action Bar */}
            <div className="pt-2 flex justify-end">
              <Button
                onClick={handleCompress}
                disabled={isCompressing}
                className="rounded-xl px-6 font-semibold"
              >
                {isCompressing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Compressing...
                  </>
                ) : (
                  <>
                    <FileDown className="h-4 w-4 mr-2" /> Compress PDF
                  </>
                )}
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Compression Result Banner */}
      {result && (
        <Card className="rounded-2xl border-emerald-500/30 bg-emerald-500/5 p-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-center sm:text-left">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 shrink-0">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">PDF Optimized Successfully!</h4>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="text-xs line-through text-muted-foreground">
                    {(result.originalSize / 1024).toFixed(1)} KB
                  </span>
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    {(result.compressedSize / 1024).toFixed(1)} KB
                  </span>
                  {result.reductionPercent > 0 && (
                    <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
                      -{result.reductionPercent}% smaller
                    </Badge>
                  )}
                </div>
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
                <Download className="h-4 w-4" /> Download Compressed PDF
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}