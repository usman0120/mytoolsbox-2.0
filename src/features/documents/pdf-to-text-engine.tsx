"use client";

import { useState, useRef } from "react";
import { FileText, Upload, Download, Loader2, AlertCircle, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export function PDFToTextEngine() {
  const [file, setFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
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
    setExtractedText("");
  };

  const handleExtract = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const { getDocument } = await import("pdfjs-dist");
      const pdfjsLib = await import("pdfjs-dist/build/pdf.worker.mjs");
      
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
      
      setExtractedText(pages.join("\n\n"));
      toast.success(`Extracted text from ${pdf.numPages} page(s).`);
    } catch {
      // Fallback: use basic text extraction via FileReader
      try {
        const text = await file.text();
        // Strip binary content, keep readable text
        const readable = text.replace(/[^\x20-\x7E\x0A\x0D\x09]/g, " ").replace(/\s+/g, " ").trim();
        if (readable.length > 50) {
          setExtractedText(readable);
          toast.success("Text extracted (basic mode).");
        } else {
          setError("Could not extract text from this PDF. The file may be scanned or image-based.");
        }
      } catch {
        setError("Failed to extract text. The PDF may be encrypted or corrupted.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(extractedText);
    setCopied(true);
    toast.success("Text copied to clipboard.");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([extractedText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${file?.name?.replace(".pdf", "") || "extracted"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Badge variant="secondary" className="rounded-full">PDF → Text</Badge>
        <span className="text-xs text-muted-foreground">Extract readable text from PDF files</span>
      </div>

      <Card className="border-border/50">
        <CardContent className="p-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={handleFileSelect}
            className="hidden"
          />
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-border/50 rounded-xl p-6 text-center cursor-pointer hover:border-primary/30 hover:bg-muted/30 transition-colors"
          >
            <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
            <p className="font-medium text-sm mb-1">
              {file ? file.name : "Drop PDF here or click to browse"}
            </p>
            <p className="text-xs text-muted-foreground">
              {file ? `${(file.size / 1024).toFixed(1)} KB` : "Max 50MB"}
            </p>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 text-destructive text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <Button
        onClick={handleExtract}
        disabled={!file || isProcessing}
        className="gap-2 rounded-xl w-full"
      >
        {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
        {isProcessing ? "Extracting..." : "Extract Text"}
      </Button>

      {extractedText && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">
              Extracted Text ({extractedText.length.toLocaleString()} chars)
            </p>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={handleCopy} className="gap-1 rounded-xl text-xs">
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                {copied ? "Copied" : "Copy"}
              </Button>
              <Button variant="ghost" size="sm" onClick={handleDownload} className="gap-1 rounded-xl text-xs">
                <Download className="h-3 w-3" />
                Download .txt
              </Button>
            </div>
          </div>
          <div className="p-4 bg-muted/30 rounded-xl max-h-100 overflow-y-auto">
            <pre className="text-sm whitespace-pre-wrap font-sans">{extractedText}</pre>
          </div>
        </div>
      )}
    </div>
  );
}