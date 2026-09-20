"use client";

import { useState, useRef } from "react";
import { FileText, Upload, Download, Loader2, AlertCircle, FileOutput } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export function WordToPDFConverterEngine() {
  const [file, setFile] = useState<File | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [convertedBlob, setConvertedBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptedTypes = [
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword",
    "application/vnd.oasis.opendocument.text",
    "application/rtf",
    "text/plain",
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    const isDoc = acceptedTypes.includes(selected.type) ||
      /\.(docx?|odt|rtf|txt)$/i.test(selected.name);
    if (!isDoc) {
      setError("Please select a valid document file (.docx, .doc, .odt, .rtf, .txt).");
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
      const text = await file.text();
      const pdf = await PDFDocument.create();
      const font = await pdf.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdf.embedFont(StandardFonts.HelveticaBold);
      const fontSize = 11;
      const margin = 60;
      const pageWidth = 612; // US Letter
      const pageHeight = 792;
      const maxWidth = pageWidth - margin * 2;
      const lineHeight = fontSize * 1.5;

      const lines = text.split("\n");
      let currentPage = pdf.addPage([pageWidth, pageHeight]);
      let y = pageHeight - margin;

      const addNewPage = () => {
        currentPage = pdf.addPage([pageWidth, pageHeight]);
        y = pageHeight - margin;
      };

      const wrapText = (text: string, maxWidth: number, font: any, size: number): string[] => {
        const words = text.split(" ");
        const lines: string[] = [];
        let currentLine = "";

        for (const word of words) {
          const testLine = currentLine ? `${currentLine} ${word}` : word;
          const width = font.widthOfTextAtSize(testLine, size);
          if (width > maxWidth && currentLine) {
            lines.push(currentLine);
            currentLine = word;
          } else {
            currentLine = testLine;
          }
        }
        if (currentLine) lines.push(currentLine);
        return lines.length > 0 ? lines : [""];
      };

      for (const line of lines) {
        const trimmed = line.trim();
        const isHeading = trimmed.length > 0 && trimmed.length < 80 &&
          (trimmed === trimmed.toUpperCase() || /^#{1,3}\s/.test(trimmed) || /^[A-Z][a-z]+:/.test(trimmed));

        const displayText = trimmed.replace(/^#{1,3}\s/, "");
        const useFont = isHeading ? boldFont : font;
        const useSize = isHeading ? 14 : fontSize;

        if (displayText === "") {
          y -= lineHeight;
        } else {
          const wrappedLines = wrapText(displayText, maxWidth, useFont, useSize);
          for (const wl of wrappedLines) {
            if (y < margin + lineHeight) addNewPage();
            currentPage.drawText(wl, {
              x: margin,
              y,
              size: useSize,
              font: useFont,
              color: rgb(0, 0, 0),
            });
            y -= lineHeight * (useSize / fontSize);
          }
        }

        if (y < margin) addNewPage();
      }

      const pdfBytes = await pdf.save();
      const blob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" });
      setConvertedBlob(blob);
      toast.success(`Converted to PDF (${pdf.getPageCount()} page(s)).`);
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
    a.download = file.name.replace(/\.(docx?|odt|rtf|txt)$/i, "") + ".pdf";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Badge variant="secondary" className="rounded-full">Word → PDF</Badge>
        <span className="text-xs text-muted-foreground">Convert documents to PDF format</span>
      </div>

      <Card className="border-border/50">
        <CardContent className="p-4">
          <input
            ref={fileInputRef}
            type="file"
            accept=".docx,.doc,.odt,.rtf,.txt"
            onChange={handleFileChange}
            className="hidden"
          />
          {!file ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border/50 rounded-xl p-8 text-center cursor-pointer hover:border-primary/30 hover:bg-muted/30 transition-colors"
            >
              <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
              <p className="font-medium text-sm mb-1">Drop document here or click to browse</p>
              <p className="text-xs text-muted-foreground">Supports .docx, .doc, .odt, .rtf, .txt • Max 50MB</p>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="font-medium text-sm truncate max-w-[200px]">{file.name}</p>
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
          {isConverting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileOutput className="h-4 w-4" />}
          {isConverting ? "Converting..." : "Convert to PDF"}
        </Button>
        {convertedBlob && (
          <Button onClick={handleDownload} variant="outline" className="gap-2 rounded-xl">
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        )}
      </div>

      {!file && !error && (
        <div className="text-center py-6 text-muted-foreground">
          <FileOutput className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Upload a Word document to convert it to PDF</p>
        </div>
      )}
    </div>
  );
}