"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  Upload,
  FileText,
  Download,
  Trash2,
  Scissors,
  CheckCircle2,
  ExternalLink,
  Plus,
  Loader2,
  Layers,
  Archive,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { PDFDocument } from "pdf-lib";
import { splitPDF, extractAllPages, SplitRange } from "@/features/documents/pdf-splitter";

export function PDFSplitterEngine() {
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [mode, setMode] = useState<"range" | "all" | "custom">("range");
  const [rangeStart, setRangeStart] = useState("1");
  const [rangeEnd, setRangeEnd] = useState("1");
  const [customRangeString, setCustomRangeString] = useState("1-3, 5");
  const [ranges, setRanges] = useState<SplitRange[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{
    url: string;
    isZip: boolean;
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
      const pages = doc.getPageCount();
      setFile(selected);
      setTotalPages(pages);
      setRangeStart("1");
      setRangeEnd(String(Math.min(pages, 5)));
      setRanges([{ start: 1, end: Math.min(pages, 5) }]);
      setCustomRangeString(pages > 1 ? `1-${Math.min(pages, 3)}` : "1");
      setResult(null);
      toast.success(`Loaded PDF with ${pages} pages.`);
    } catch {
      toast.error("Could not read PDF. It might be password-protected or corrupted.");
    }
  }, []);

  const parseCustomRanges = (input: string, maxPages: number): SplitRange[] => {
    const parts = input.split(",").map((p) => p.trim()).filter(Boolean);
    const parsed: SplitRange[] = [];

    for (const part of parts) {
      if (part.includes("-")) {
        const [startStr, endStr] = part.split("-").map((s) => parseInt(s.trim(), 10));
        if (!isNaN(startStr) && !isNaN(endStr) && startStr >= 1 && endStr <= maxPages && startStr <= endStr) {
          parsed.push({ start: startStr, end: endStr });
        }
      } else {
        const page = parseInt(part, 10);
        if (!isNaN(page) && page >= 1 && page <= maxPages) {
          parsed.push({ start: page, end: page });
        }
      }
    }
    return parsed;
  };

  const handleSplit = async () => {
    if (!file || totalPages === 0) return;
    setIsProcessing(true);
    setResult(null);

    try {
      if (mode === "all") {
        const res = await extractAllPages(file);
        if (res.status === "success" && res.outputUrl) {
          setResult({
            url: res.outputUrl,
            isZip: true,
            message: res.message || "All pages extracted into ZIP archive.",
          });
          toast.success("Extraction completed!");
        } else {
          toast.error(res.error || "Failed to extract pages.");
        }
      } else if (mode === "custom") {
        const parsed = parseCustomRanges(customRangeString, totalPages);
        if (parsed.length === 0) {
          toast.error(`Please enter valid page ranges between 1 and ${totalPages} (e.g. 1-3, 5).`);
          setIsProcessing(false);
          return;
        }
        const res = await splitPDF(file, parsed, true);
        if (res.status === "success" && res.outputUrl) {
          setResult({
            url: res.outputUrl,
            isZip: Boolean(res.metadata?.isZip),
            message: res.message || "Pages extracted successfully.",
          });
          toast.success("Split completed!");
        } else {
          toast.error(res.error || "Failed to split PDF.");
        }
      } else {
        // Range mode
        const start = parseInt(rangeStart, 10);
        const end = parseInt(rangeEnd, 10);
        if (isNaN(start) || isNaN(end) || start < 1 || end > totalPages || start > end) {
          toast.error(`Invalid range. Start must be ≥ 1 and End must be ≤ ${totalPages}.`);
          setIsProcessing(false);
          return;
        }
        const res = await splitPDF(file, [{ start, end }], true);
        if (res.status === "success" && res.outputUrl) {
          setResult({
            url: res.outputUrl,
            isZip: false,
            message: res.message || "Pages extracted successfully.",
          });
          toast.success("Split completed!");
        } else {
          toast.error(res.error || "Failed to split PDF.");
        }
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error splitting PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!result || !file) return;
    const a = document.createElement("a");
    a.href = result.url;
    const baseName = file.name.replace(/\.pdf$/i, "");
    a.download = result.isZip ? `${baseName}-extracted-pages.zip` : `${baseName}-split.pdf`;
    a.click();
  };

  const handleReset = () => {
    setFile(null);
    setTotalPages(0);
    setResult(null);
  };

  // Clean up object URLs
  useEffect(() => {
    return () => {
      if (result?.url) URL.revokeObjectURL(result.url);
    };
  }, [result]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Upload Drop Zone */}
      {!file && (
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
            if (e.dataTransfer.files[0]) loadFile(e.dataTransfer.files[0]);
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mx-auto mb-4">
            <Scissors className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-semibold mb-1">Upload PDF File to Split</h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
            Extract specific page ranges, separate individual pages into a ZIP archive, or divide your document.
          </p>
          <Button variant="outline" size="sm" className="rounded-xl pointer-events-none">
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

      {/* Document Loaded & Splitting Configuration */}
      {file && (
        <Card className="rounded-2xl border-border/60 shadow-sm overflow-hidden">
          {/* File Header */}
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
                    {totalPages} {totalPages === 1 ? "page" : "pages"} total
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

          <CardContent className="p-5 space-y-6">
            {/* Split Mode Selector */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Select Splitting Method
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div
                  onClick={() => setMode("range")}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    mode === "range"
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border hover:border-border/80 bg-card"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Scissors className="h-4 w-4 text-primary" />
                    <span className="text-sm font-semibold">Single Range</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Extract a continuous sequence of pages (e.g. pages 2 to 5).
                  </p>
                </div>

                <div
                  onClick={() => setMode("custom")}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    mode === "custom"
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border hover:border-border/80 bg-card"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Layers className="h-4 w-4 text-primary" />
                    <span className="text-sm font-semibold">Custom Ranges</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Select distinct pages or multiple chunks (e.g. 1-3, 5, 8).
                  </p>
                </div>

                <div
                  onClick={() => setMode("all")}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    mode === "all"
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border hover:border-border/80 bg-card"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Archive className="h-4 w-4 text-primary" />
                    <span className="text-sm font-semibold">Extract Every Page</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Split every single page into separate PDF files inside a ZIP.
                  </p>
                </div>
              </div>
            </div>

            {/* Mode-Specific Controls */}
            {mode === "range" && (
              <div className="grid grid-cols-2 gap-4 max-w-md p-4 rounded-xl bg-muted/20 border border-border/50">
                <div>
                  <Label htmlFor="startPage" className="text-xs font-medium">
                    Start Page
                  </Label>
                  <Input
                    id="startPage"
                    type="number"
                    min={1}
                    max={totalPages}
                    value={rangeStart}
                    onChange={(e) => setRangeStart(e.target.value)}
                    className="mt-1 h-9 rounded-xl text-xs font-mono"
                  />
                </div>
                <div>
                  <Label htmlFor="endPage" className="text-xs font-medium">
                    End Page (Max: {totalPages})
                  </Label>
                  <Input
                    id="endPage"
                    type="number"
                    min={1}
                    max={totalPages}
                    value={rangeEnd}
                    onChange={(e) => setRangeEnd(e.target.value)}
                    className="mt-1 h-9 rounded-xl text-xs font-mono"
                  />
                </div>
              </div>
            )}

            {mode === "custom" && (
              <div className="p-4 rounded-xl bg-muted/20 border border-border/50 space-y-2">
                <Label htmlFor="customRanges" className="text-xs font-medium">
                  Enter Page Numbers or Ranges (Separated by commas)
                </Label>
                <Input
                  id="customRanges"
                  value={customRangeString}
                  onChange={(e) => setCustomRangeString(e.target.value)}
                  placeholder={`e.g. 1-2, 4, 6-${totalPages}`}
                  className="h-9 rounded-xl text-xs font-mono"
                />
                <p className="text-[11px] text-muted-foreground">
                  Valid page range: 1 to {totalPages}. Example: <code className="bg-muted px-1 rounded">1-3, 5, 7</code> extracts pages 1, 2, 3, 5, and 7.
                </p>
              </div>
            )}

            {mode === "all" && (
              <div className="p-4 rounded-xl bg-muted/20 border border-border/50">
                <p className="text-xs text-foreground font-medium mb-1">
                  Ready to split {totalPages} individual pages
                </p>
                <p className="text-xs text-muted-foreground">
                  Each page from 1 to {totalPages} will be rendered into its own PDF file and packaged into a convenient ZIP archive.
                </p>
              </div>
            )}

            {/* Split Action Button */}
            <div className="pt-2 flex justify-end">
              <Button
                onClick={handleSplit}
                disabled={isProcessing}
                className="rounded-xl px-6 font-semibold"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Processing...
                  </>
                ) : (
                  <>
                    <Scissors className="h-4 w-4 mr-2" /> Split PDF Document
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
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
                <h4 className="font-semibold text-foreground">Split Completed!</h4>
                <p className="text-xs text-muted-foreground">{result.message}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!result.isZip && (
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl h-10 gap-1.5"
                  onClick={() => window.open(result.url, "_blank")}
                >
                  <ExternalLink className="h-4 w-4" /> Preview
                </Button>
              )}
              <Button
                size="sm"
                className="rounded-xl h-10 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                onClick={handleDownload}
              >
                <Download className="h-4 w-4" /> {result.isZip ? "Download ZIP Archive" : "Download Split PDF"}
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}