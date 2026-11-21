"use client";

import { useState, useRef, useEffect } from "react";
import {
  FileText,
  Upload,
  Download,
  Loader2,
  CheckCircle2,
  ExternalLink,
  Plus,
  Trash2,
  FileDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { parseDocxText } from "@/lib/documents/openxml-builder";

export function WordToPDFConverterEngine() {
  const [file, setFile] = useState<File | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [fontSize, setFontSize] = useState<number>(11);
  const [convertedBlob, setConvertedBlob] = useState<Blob | null>(null);
  const [convertedUrl, setConvertedUrl] = useState<string | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    const isWord =
      selected.name.toLowerCase().endsWith(".docx") ||
      selected.name.toLowerCase().endsWith(".doc") ||
      selected.name.toLowerCase().endsWith(".txt") ||
      selected.name.toLowerCase().endsWith(".rtf");

    if (!isWord) {
      toast.error("Please upload a Word document (.docx) or text file.");
      return;
    }

    setFile(selected);
    setConvertedBlob(null);
    setConvertedUrl(null);
  };

  const handleConvert = async () => {
    if (!file) return;
    setIsConverting(true);

    try {
      let rawText = "";

      if (file.name.toLowerCase().endsWith(".docx")) {
        // Parse genuine OpenXML DOCX archive
        rawText = await parseDocxText(file);
      } else {
        // Fallback for .txt or plain documents
        rawText = await file.text();
      }

      if (!rawText.trim()) {
        throw new Error("The document does not contain readable text.");
      }

      // Generate PDF
      const pdf = await PDFDocument.create();
      const fontRegular = await pdf.embedFont(StandardFonts.Helvetica);
      const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);

      const margin = 54; // 0.75 inch
      const pageWidth = 595.28; // A4
      const pageHeight = 841.89;
      const maxWidth = pageWidth - margin * 2;
      const lineHeight = fontSize * 1.5;

      let currentPage = pdf.addPage([pageWidth, pageHeight]);
      let currentY = pageHeight - margin;

      const paragraphs = rawText.split("\n");

      // Text wrapping helper
      const wrapText = (text: string, font: typeof fontRegular, size: number): string[] => {
        const words = text.split(/\s+/);
        const lines: string[] = [];
        let cur = "";

        for (const w of words) {
          const candidate = cur ? `${cur} ${w}` : w;
          const width = font.widthOfTextAtSize(candidate, size);
          if (width > maxWidth && cur) {
            lines.push(cur);
            cur = w;
          } else {
            cur = candidate;
          }
        }
        if (cur) lines.push(cur);
        return lines.length > 0 ? lines : [""];
      };

      for (const para of paragraphs) {
        const trimmed = para.trim();
        if (!trimmed) {
          currentY -= lineHeight * 0.75;
          continue;
        }

        const isHeading =
          trimmed.length < 80 &&
          (trimmed === trimmed.toUpperCase() || /^#{1,3}\s/.test(trimmed) || /^[A-Z0-9\s.,]{3,40}:$/.test(trimmed));

        const font = isHeading ? fontBold : fontRegular;
        const currentSize = isHeading ? fontSize + 3 : fontSize;
        const cleanText = trimmed.replace(/^#{1,3}\s/, "");
        const lines = wrapText(cleanText, font, currentSize);

        for (const line of lines) {
          if (currentY < margin + lineHeight) {
            currentPage = pdf.addPage([pageWidth, pageHeight]);
            currentY = pageHeight - margin;
          }

          currentPage.drawText(line, {
            x: margin,
            y: currentY,
            size: currentSize,
            font,
            color: isHeading ? rgb(0.1, 0.2, 0.35) : rgb(0.15, 0.15, 0.15),
          });

          currentY -= lineHeight;
        }

        currentY -= 4; // Paragraph spacing
      }

      const total = pdf.getPageCount();
      setPageCount(total);

      // Add page numbers
      const pages = pdf.getPages();
      pages.forEach((p, idx) => {
        const numText = `Page ${idx + 1} of ${total}`;
        const numWidth = fontRegular.widthOfTextAtSize(numText, 9);
        p.drawText(numText, {
          x: (pageWidth - numWidth) / 2,
          y: 25,
          size: 9,
          font: fontRegular,
          color: rgb(0.4, 0.4, 0.4),
        });
      });

      const bytes = await pdf.save({ useObjectStreams: true });
      const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      setConvertedBlob(blob);
      setConvertedUrl(url);
      toast.success(`Converted to PDF (${total} pages)!`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Conversion failed.");
    } finally {
      setIsConverting(false);
    }
  };

  const handleDownload = () => {
    if (!convertedUrl || !file) return;
    const a = document.createElement("a");
    a.href = convertedUrl;
    const base = file.name.replace(/\.(docx?|odt|txt|rtf)$/i, "");
    a.download = `${base}.pdf`;
    a.click();
  };

  const handleReset = () => {
    if (convertedUrl) URL.revokeObjectURL(convertedUrl);
    setFile(null);
    setConvertedBlob(null);
    setConvertedUrl(null);
  };

  useEffect(() => {
    return () => {
      if (convertedUrl) URL.revokeObjectURL(convertedUrl);
    };
  }, [convertedUrl]);

  return (
    <div className="w-full min-w-0 space-y-4">
      {/* Upload Zone */}
      {!file && (
        <div
          className="border-2 border-dashed rounded-lg p-4 sm:p-6 text-center transition-colors cursor-pointer border-border hover:border-primary/50 hover:bg-muted/30"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500 mx-auto mb-4">
            <Upload className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-semibold mb-1">Upload Word Document to Convert</h3>
          <Button variant="outline" onClick={(event) => { event.stopPropagation(); fileInputRef.current?.click(); }} className="rounded-lg">
            <Plus className="h-4 w-4 mr-1.5" /> Select .DOCX Document
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".docx,.doc,.txt,.rtf"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      )}

      {/* File Loaded & Settings */}
      {file && (
        <section aria-label="Word to PDF settings" className="min-w-0 overflow-hidden">
          <div className="p-4 bg-muted/40 border-b border-border/60 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 shrink-0">
                <FileText className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="text-xs h-8 text-destructive hover:text-destructive rounded-lg"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" /> Change Document
            </Button>
          </div>

          <div className="py-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-semibold mb-1.5 block">Font Size</Label>
                <div className="flex rounded-lg bg-background p-0.5 border border-border/60">
                  {[10, 11, 12, 14].map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setFontSize(size)}
                      className={`flex-1 py-1 text-center rounded-md font-medium text-xs transition-colors ${
                        fontSize === size ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {size} pt
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-xs font-semibold mb-1.5 block">Page Standard</Label>
                <Badge variant="outline" className="h-8 w-full justify-center text-xs font-medium">
                  Standard A4 (595 × 842 pt)
                </Badge>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                onClick={handleConvert}
                disabled={isConverting}
                className="rounded-xl px-6 font-semibold"
              >
                {isConverting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Rendering PDF...
                  </>
                ) : (
                  <>
                    <FileDown className="h-4 w-4 mr-2" /> Convert Word to PDF
                  </>
                )}
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Result Banner */}
      {convertedBlob && convertedUrl && (
        <Card className="rounded-2xl border-emerald-500/30 bg-emerald-500/5 p-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-center sm:text-left">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 shrink-0">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">PDF Generated Successfully!</h4>
                <p className="text-xs text-muted-foreground">
                  {pageCount} pages rendered • {(convertedBlob.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl h-10 gap-1.5"
                onClick={() => window.open(convertedUrl, "_blank")}
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