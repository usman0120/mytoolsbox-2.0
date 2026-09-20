"use client";

import { useState, useRef } from "react";
import { FileText, Upload, Download, Loader2, AlertCircle, FileOutput } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export function PDFToMarkdownEngine() {
  const [file, setFile] = useState<File | null>(null);
  const [markdown, setMarkdown] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.type !== "application/pdf") {
      setError("Please select a valid PDF file.");
      return;
    }
    if (f.size > 50 * 1024 * 1024) {
      setError("File size exceeds 50MB limit.");
      return;
    }
    setFile(f);
    setError(null);
    setMarkdown("");
  };

  const textToMarkdown = (text: string): string => {
    const lines = text.split("\n");
    const mdLines: string[] = [];
    let prevEmpty = false;

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) {
        if (!prevEmpty) mdLines.push("");
        prevEmpty = true;
        continue;
      }
      prevEmpty = false;

      // Detect headings (all caps, short lines)
      if (trimmed === trimmed.toUpperCase() && trimmed.length < 80 && /^[A-Z0-9\s\-:]+$/.test(trimmed)) {
        mdLines.push(`## ${trimmed.charAt(0) + trimmed.slice(1).toLowerCase()}`);
        continue;
      }
      // Detect numbered lists
      if (/^\d+[.)]\s/.test(trimmed)) {
        mdLines.push(trimmed);
        continue;
      }
      // Detect bullet points
      if (/^[•\-*]\s/.test(trimmed)) {
        mdLines.push(`- ${trimmed.replace(/^[•\-*]\s*/, "")}`);
        continue;
      }
      mdLines.push(trimmed);
    }
    return mdLines.join("\n");
  };

  const handleConvert = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const { getDocument } = await import("pdfjs-dist");
      
      const pdf = await getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
      const pages: string[] = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: { str?: string }) => item.str || "")
          .join(" ");
        pages.push(pageText);
      }

      const rawText = pages.join("\n\n");
      const md = textToMarkdown(rawText);
      setMarkdown(md);
      toast.success(`Converted ${pdf.numPages} page(s) to Markdown.`);
    } catch {
      try {
        const text = await file.text();
        const readable = text.replace(/[^\x20-\x7E\x0A\x0D\x09]/g, " ").replace(/\s+/g, " ").trim();
        if (readable.length > 50) {
          setMarkdown(textToMarkdown(readable));
          toast.success("Converted to Markdown (basic mode).");
        } else {
          setError("Could not extract text. The PDF may be scanned or image-based.");
        }
      } catch {
        setError("Failed to convert. The PDF may be encrypted or corrupted.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${file?.name?.replace(".pdf", "") || "converted"}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Badge variant="secondary" className="rounded-full">PDF → Markdown</Badge>
        <span className="text-xs text-muted-foreground">Convert PDF documents to Markdown format</span>
      </div>

      <Card className="border-border/50">
        <CardContent className="p-4">
          <input ref={fileInputRef} type="file" accept="application/pdf" onChange={handleFileSelect} className="hidden" />
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-border/50 rounded-xl p-6 text-center cursor-pointer hover:border-primary/30 hover:bg-muted/30 transition-colors"
          >
            <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
            <p className="font-medium text-sm mb-1">{file ? file.name : "Drop PDF here or click to browse"}</p>
            <p className="text-xs text-muted-foreground">{file ? `${(file.size / 1024).toFixed(1)} KB` : "Max 50MB"}</p>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 text-destructive text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />{error}
        </div>
      )}

      <Button onClick={handleConvert} disabled={!file || isProcessing} className="gap-2 rounded-xl w-full">
        {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileOutput className="h-4 w-4" />}
        {isProcessing ? "Converting..." : "Convert to Markdown"}
      </Button>

      {markdown && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Markdown Output</p>
            <Button variant="ghost" size="sm" onClick={handleDownload} className="gap-1 rounded-xl text-xs">
              <Download className="h-3 w-3" />Download .md
            </Button>
          </div>
          <div className="p-4 bg-muted/30 rounded-xl max-h-[400px] overflow-y-auto">
            <pre className="text-sm whitespace-pre-wrap font-mono">{markdown}</pre>
          </div>
        </div>
      )}
    </div>
  );
}