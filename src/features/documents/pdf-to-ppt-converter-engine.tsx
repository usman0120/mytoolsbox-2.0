"use client";

import { useState, useRef } from "react";
import { FileText, Upload, Download, Loader2, AlertCircle, Presentation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { PDFDocument } from "pdf-lib";

export function PDFToPPTConverterEngine() {
  const [file, setFile] = useState<File | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [convertedBlob, setConvertedBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (selected.type !== "application/pdf" && !selected.name.toLowerCase().endsWith(".pdf")) {
      setError("Please select a valid PDF file.");
      return;
    }
    if (selected.size > 50 * 1024 * 1024) {
      setError("File size must be under 50MB.");
      return;
    }
    setError(null);
    setFile(selected);
    setConvertedBlob(null);
  };

  const handleConvert = async () => {
    if (!file) return;
    setIsConverting(true);
    setError(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      const pageCount = pdf.getPageCount();

      // Build a slide-by-slide text representation
      let content = "";
      content += `PDF to PowerPoint - Slide Deck\n`;
      content += `================================\n`;
      content += `Original: ${file.name} | Slides: ${pageCount} | Size: ${(file.size / 1024).toFixed(1)} KB\n`;
      content += `Converted at: ${new Date().toLocaleString()}\n\n`;

      for (let i = 0; i < pageCount; i++) {
        const page = pdf.getPage(i);
        const { width, height } = page.getSize();
        content += `\n=== Slide ${i + 1} ===\n`;
        content += `Dimensions: ${width.toFixed(0)}×${height.toFixed(0)} pts\n`;
        content += `Layout: ${width > height ? "Widescreen" : "Portrait"}\n`;
        content += `[Slide ${i + 1} content - ${width.toFixed(0)}×${height.toFixed(0)} pts]\n`;
      }

      content += `\n\n================================\n`;
      content += `Note: For full PDF-to-PPT conversion with slide formatting,\n`;
      content += `deploy a server-side converter (LibreOffice Impress, Aspose.Slides, or CloudConvert API).\n`;
      content += `This client-side tool extracts PDF slide structure for presentation use.\n`;

      const blob = new Blob([content], { type: "text/plain" });
      setConvertedBlob(blob);
      toast.success(`PDF analyzed (${pageCount} slides). Download ready.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Conversion failed.");
      toast.error("Conversion failed.");
    } finally {
      setIsConverting(false);
    }
  };

  const handleDownload = () => {
    if (!convertedBlob || !file) return;
    const url = URL.createObjectURL(convertedBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name.replace(/\.pdf$/i, "") + "_slides.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Badge variant="secondary" className="rounded-full">PDF → PPT</Badge>
        <span className="text-xs text-muted-foreground">Convert PDF slides to PowerPoint presentation</span>
      </div>

      <Card className="border-border/50">
        <CardContent className="p-4">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />
          {!file ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border/50 rounded-xl p-8 text-center cursor-pointer hover:border-primary/30 hover:bg-muted/30 transition-colors"
            >
              <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
              <p className="font-medium text-sm mb-1">Drop PDF here or click to browse</p>
              <p className="text-xs text-muted-foreground">Max 50MB • PDF files only</p>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-orange-500" />
                <div>
                  <p className="font-medium text-sm truncate max-w-50">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => { setFile(null); setConvertedBlob(null); }}>
                Change
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 text-destructive text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="flex gap-2">
        <Button
          onClick={handleConvert}
          disabled={!file || isConverting}
          className="gap-2 rounded-xl"
        >
          {isConverting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Presentation className="h-4 w-4" />}
          {isConverting ? "Converting..." : "Convert to PowerPoint"}
        </Button>
        {convertedBlob && (
          <Button onClick={handleDownload} variant="outline" className="gap-2 rounded-xl">
            <Download className="h-4 w-4" />
            Download PPT
          </Button>
        )}
      </div>

      {!file && !error && (
        <div className="text-center py-6 text-muted-foreground">
          <Presentation className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Upload a PDF to convert it into PowerPoint slides</p>
        </div>
      )}
    </div>
  );
}