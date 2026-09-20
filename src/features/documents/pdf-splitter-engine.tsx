"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, FileText, Download, Trash2, Scissors, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useProcessing } from "@/hooks/use-processing";
import { splitPDF, extractAllPages } from "@/features/documents/pdf-splitter";

export function PDFSplitterEngine() {
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [rangeStart, setRangeStart] = useState("1");
  const [rangeEnd, setRangeEnd] = useState("1");
  const [ranges, setRanges] = useState<{ start: number; end: number }[]>([]);
  const [mode, setMode] = useState<"range" | "all">("range");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { status, result, error, process, reset } = useProcessing();

  const loadFile = useCallback((f: File) => {
    if (f.type !== "application/pdf") return;
    setFile(f);
    setRanges([]);
    reset();
  }, [reset]);

  const addRange = () => {
    const start = parseInt(rangeStart);
    const end = parseInt(rangeEnd);
    if (isNaN(start) || isNaN(end) || start < 1 || end < start) return;
    setRanges((prev) => [...prev, { start, end }]);
    setRangeStart("");
    setRangeEnd("");
  };

  const removeRange = (index: number) => {
    setRanges((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSplit = async () => {
    if (!file) return;
    if (mode === "all") {
      await process(() => extractAllPages(file));
    } else {
      if (ranges.length === 0) return;
      await process(() => splitPDF(file, ranges));
    }
  };

  const handleDownload = (url?: string, index?: number) => {
    const downloadUrl = url || result?.outputUrl;
    if (!downloadUrl) return;
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = index !== undefined ? `split-page-${index + 1}.pdf` : "split.pdf";
    a.click();
  };

  const handleReset = () => {
    reset();
    setFile(null);
    setRanges([]);
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
          onDrop={(e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files[0]) loadFile(e.dataTransfer.files[0]); }}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
          <p className="font-medium mb-1">Drop a PDF file here</p>
          <p className="text-sm text-muted-foreground">or click to browse</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && loadFile(e.target.files[0])}
          />
        </div>
      )}

      {file && status === "idle" && (
        <>
          <Card className="p-3">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-red-500 shrink-0" />
              <span className="text-sm flex-1 truncate">{file.name}</span>
              <span className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(0)} KB</span>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleReset}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </Card>

          <div className="flex gap-2">
            <Button variant={mode === "range" ? "default" : "outline"} size="sm" onClick={() => setMode("range")}>
              <Scissors className="h-3.5 w-3.5 mr-1.5" /> Page Ranges
            </Button>
            <Button variant={mode === "all" ? "default" : "outline"} size="sm" onClick={() => setMode("all")}>
              <Copy className="h-3.5 w-3.5 mr-1.5" /> Extract All Pages
            </Button>
          </div>

          {mode === "range" && (
            <div className="space-y-3">
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <Label className="text-xs">Start Page</Label>
                  <Input
                    type="number"
                    min={1}
                    value={rangeStart}
                    onChange={(e) => setRangeStart(e.target.value)}
                    placeholder="1"
                    className="h-9"
                  />
                </div>
                <div className="flex-1">
                  <Label className="text-xs">End Page</Label>
                  <Input
                    type="number"
                    min={1}
                    value={rangeEnd}
                    onChange={(e) => setRangeEnd(e.target.value)}
                    placeholder="1"
                    className="h-9"
                  />
                </div>
                <Button size="sm" onClick={addRange} className="h-9">Add</Button>
              </div>

              {ranges.length > 0 && (
                <div className="space-y-1.5">
                  {ranges.map((range, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm bg-muted/50 rounded-lg px-3 py-1.5">
                      <span className="flex-1">Pages {range.start}–{range.end}</span>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeRange(i)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <Button onClick={handleSplit} disabled={ranges.length === 0} className="w-full">
                <Scissors className="h-4 w-4 mr-2" /> Split PDF
              </Button>
            </div>
          )}

          {mode === "all" && (
            <Button onClick={handleSplit} className="w-full">
              <Copy className="h-4 w-4 mr-2" /> Extract All Pages
            </Button>
          )}
        </>
      )}

      {status === "processing" && (
        <div className="text-center py-8">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Splitting PDF...</p>
        </div>
      )}

      {status === "success" && result && (
        <div className="space-y-3">
          <div className="bg-green-500/10 text-green-600 dark:text-green-400 rounded-xl p-4 text-sm font-medium text-center">
            {result.message}
          </div>
          {result.data && (result.data as { urls: string[] }).urls ? (
            <div className="space-y-2">
              {(result.data as { urls: string[] }).urls.map((url: string, i: number) => (
                <Card key={i} className="p-3">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-red-500 shrink-0" />
                    <span className="text-sm flex-1">Page {i + 1}.pdf</span>
                    <Button size="sm" variant="outline" onClick={() => handleDownload(url, i)}>
                      <Download className="h-3.5 w-3.5 mr-1.5" /> Download
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Button onClick={() => handleDownload()} className="w-full">
              <Download className="h-4 w-4 mr-2" /> Download Split PDF
            </Button>
          )}
          <Button variant="outline" onClick={handleReset} className="w-full">Split Another</Button>
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