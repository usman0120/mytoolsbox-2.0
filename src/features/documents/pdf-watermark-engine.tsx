"use client";

import { useState, useRef } from "react";
import { FileText, Upload, Download, Loader2, AlertCircle, Paintbrush, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function PDFWatermarkEngine() {
  const [file, setFile] = useState<File | null>(null);
  const [watermarkText, setWatermarkText] = useState("CONFIDENTIAL");
  const [opacity, setOpacity] = useState(30);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.type !== "application/pdf") {
      setError("Please select a valid PDF file.");
      return;
    }
    if (f.size > 30 * 1024 * 1024) {
      setError("File size exceeds 30MB limit.");
      return;
    }
    setFile(f);
    setError(null);
    setResultBlob(null);
  };

  const handleApplyWatermark = async () => {
    if (!file || !watermarkText.trim()) return;
    setIsProcessing(true);
    setError(null);

    try {
      const { PDFDocument, rgb, StandardFonts } = await import("pdf-lib");
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const pages = pdfDoc.getPages();
      const opacityValue = opacity / 100;

      for (const page of pages) {
        const { width, height } = page.getSize();
        const fontSize = Math.min(width, height) * 0.08;
        const textWidth = font.widthOfTextAtSize(watermarkText, fontSize);
        const textHeight = fontSize;

        // Draw watermark diagonally across the page
        for (let y = -height; y < height * 2; y += textHeight * 3) {
          for (let x = -width; x < width * 2; x += textWidth * 2) {
            page.drawText(watermarkText, {
              x: x + (y % (textHeight * 6) === 0 ? textWidth / 2 : 0),
              y,
              size: fontSize,
              font,
              color: rgb(0.7, 0.7, 0.7),
              opacity: opacityValue,
              rotate: { type: "degrees", angle: 45 },
            });
          }
        }
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      setResultBlob(blob);
      toast.success("Watermark applied successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to apply watermark.");
      toast.error("Failed to apply watermark.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultBlob) return;
    const url = URL.createObjectURL(resultBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `watermarked-${file?.name || "document.pdf"}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Badge variant="secondary" className="rounded-full">PDF Watermark</Badge>
        <span className="text-xs text-muted-foreground">Add text watermarks to PDF documents</span>
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
            <p className="text-xs text-muted-foreground">{file ? `${(file.size / 1024).toFixed(1)} KB` : "Max 30MB"}</p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3 p-4 bg-muted/30 rounded-xl">
        <div className="space-y-1.5">
          <Label className="text-xs">Watermark Text</Label>
          <input
            type="text"
            value={watermarkText}
            onChange={(e) => setWatermarkText(e.target.value)}
            placeholder="e.g. CONFIDENTIAL, DRAFT, SAMPLE"
            className="w-full px-3 py-2 text-sm rounded-xl border border-border/50 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Opacity: {opacity}%</Label>
          <input
            type="range"
            min={5}
            max={80}
            value={opacity}
            onChange={(e) => setOpacity(Number(e.target.value))}
            className="w-full"
          />
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 text-destructive text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />{error}
        </div>
      )}

      <div className="flex gap-2">
        <Button onClick={handleApplyWatermark} disabled={!file || !watermarkText.trim() || isProcessing} className="gap-2 rounded-xl">
          {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Paintbrush className="h-4 w-4" />}
          {isProcessing ? "Applying..." : "Apply Watermark"}
        </Button>
        {resultBlob && (
          <Button onClick={handleDownload} variant="outline" className="gap-2 rounded-xl">
            <Download className="h-4 w-4" />Download
          </Button>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}