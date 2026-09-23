"use client";

import { useState, useRef, useEffect } from "react";
import {
  FileText,
  Upload,
  Download,
  Loader2,
  CheckCircle2,
  Plus,
  Trash2,
  Eye,
  Layers,
  FileSpreadsheet,
  Presentation,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { extractPdfPages, PDFPageContent } from "@/lib/documents/pdf-text-extractor";
import {
  createDocxBlob,
  createXlsxBlob,
  createPptxBlob,
  DocxParagraph,
  PptxSlide,
} from "@/lib/documents/openxml-builder";

type ConversionFormat = "docx" | "xlsx" | "pptx";

const FORMAT_CONFIG: Record<
  ConversionFormat,
  { label: string; ext: string; icon: typeof FileText; desc: string; color: string }
> = {
  docx: {
    label: "Word Document",
    ext: "docx",
    icon: FileText,
    desc: "Editable .docx format with formatted paragraphs & headings",
    color: "text-blue-500",
  },
  xlsx: {
    label: "Excel Spreadsheet",
    ext: "xlsx",
    icon: FileSpreadsheet,
    desc: "Structured .xlsx spreadsheet with tabular data & rows",
    color: "text-emerald-500",
  },
  pptx: {
    label: "PowerPoint Presentation",
    ext: "pptx",
    icon: Presentation,
    desc: "Slide deck .pptx format with one slide per PDF page",
    color: "text-orange-500",
  },
};

export function PDFToOfficeConverterEngine() {
  const [file, setFile] = useState<File | null>(null);
  const [targetFormat, setTargetFormat] = useState<ConversionFormat>("docx");
  const [isConverting, setIsConverting] = useState(false);
  const [convertedBlob, setConvertedBlob] = useState<Blob | null>(null);
  const [convertedUrl, setConvertedUrl] = useState<string | null>(null);
  const [extractedPages, setExtractedPages] = useState<PDFPageContent[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (selected.type !== "application/pdf" && !selected.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Please upload a valid PDF document.");
      return;
    }

    setFile(selected);
    setConvertedBlob(null);
    setConvertedUrl(null);
    setExtractedPages([]);
  };

  const handleConvert = async () => {
    if (!file) return;
    setIsConverting(true);

    try {
      const pages = await extractPdfPages(file);
      setExtractedPages(pages);

      let blob: Blob;

      if (targetFormat === "docx") {
        // Build Word Paragraphs
        const paragraphs: (string | DocxParagraph)[] = [
          {
            text: file.name.replace(/\.pdf$/i, ""),
            isHeading: true,
            fontSize: 36,
            align: "center",
          },
          { text: "" },
        ];

        for (const p of pages) {
          paragraphs.push({
            text: `Page ${p.pageNumber}`,
            isHeading: true,
            fontSize: 26,
            isBold: true,
          });

          for (const line of p.lines) {
            if (!line.trim()) continue;
            const isSubheading = line.length < 50 && (line.endsWith(":") || line === line.toUpperCase());
            paragraphs.push({
              text: line,
              isHeading: isSubheading,
              fontSize: isSubheading ? 24 : 22,
              isBold: isSubheading,
            });
          }
          paragraphs.push({ text: "" });
        }

        blob = await createDocxBlob(paragraphs, file.name);
      } else if (targetFormat === "xlsx") {
        // Build Excel Rows
        const rows: (string | number)[][] = [
          ["Page", "Line #", "Extracted Content"],
        ];

        for (const p of pages) {
          p.lines.forEach((line, lineIdx) => {
            if (line.trim()) {
              rows.push([p.pageNumber, lineIdx + 1, line.trim()]);
            }
          });
        }

        blob = await createXlsxBlob(rows, "Extracted Data");
      } else {
        // Build PowerPoint Slides
        const slides: PptxSlide[] = pages.map((p) => {
          const title = p.lines[0]?.slice(0, 70) || `Slide ${p.pageNumber}`;
          const bullets = p.lines.slice(1, 8).map((l) => l.slice(0, 120));
          return {
            title,
            bullets: bullets.length > 0 ? bullets : ["Content extracted from PDF document."],
          };
        });

        blob = await createPptxBlob(slides);
      }

      setConvertedBlob(blob);
      const url = URL.createObjectURL(blob);
      setConvertedUrl(url);
      toast.success(`Converted to ${FORMAT_CONFIG[targetFormat].label}!`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Conversion failed.");
    } finally {
      setIsConverting(false);
    }
  };

  const handleDownload = () => {
    if (!convertedUrl || !file) return;
    const cfg = FORMAT_CONFIG[targetFormat];
    const base = file.name.replace(/\.pdf$/i, "");
    const a = document.createElement("a");
    a.href = convertedUrl;
    a.download = `${base}.${cfg.ext}`;
    a.click();
  };

  const handleReset = () => {
    if (convertedUrl) URL.revokeObjectURL(convertedUrl);
    setFile(null);
    setConvertedBlob(null);
    setConvertedUrl(null);
    setExtractedPages([]);
  };

  useEffect(() => {
    return () => {
      if (convertedUrl) URL.revokeObjectURL(convertedUrl);
    };
  }, [convertedUrl]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Upload Drop Zone */}
      {!file && (
        <div
          className="border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center transition-all cursor-pointer border-border hover:border-primary/50 hover:bg-muted/30"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mx-auto mb-4">
            <Upload className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-semibold mb-1">Upload PDF to Convert to Office Formats</h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
            Convert your PDF document into an editable Microsoft Word (.docx), Excel spreadsheet (.xlsx), or PowerPoint (.pptx).
          </p>
          <Button variant="outline" size="sm" className="rounded-xl pointer-events-none">
            <Plus className="h-4 w-4 mr-1.5" /> Select PDF Document
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      )}

      {/* Conversion Workspace */}
      {file && (
        <Card className="rounded-2xl border-border/60 shadow-sm overflow-hidden">
          <div className="p-4 bg-muted/40 border-b border-border/60 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-500 shrink-0">
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
              <Trash2 className="h-3.5 w-3.5 mr-1" /> Change PDF
            </Button>
          </div>

          <CardContent className="p-5 space-y-6">
            {/* Target Format Selector */}
            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Choose Target Format
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {(Object.keys(FORMAT_CONFIG) as ConversionFormat[]).map((fmt) => {
                  const cfg = FORMAT_CONFIG[fmt];
                  const Icon = cfg.icon;
                  const isSelected = targetFormat === fmt;
                  return (
                    <div
                      key={fmt}
                      onClick={() => {
                        setTargetFormat(fmt);
                        setConvertedBlob(null);
                        setConvertedUrl(null);
                      }}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "border-border hover:border-border/80 bg-card"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <Icon className={`h-5 w-5 ${cfg.color}`} />
                        <span className="text-sm font-semibold">{cfg.label}</span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{cfg.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Convert Button */}
            <div className="flex justify-end pt-2">
              <Button
                onClick={handleConvert}
                disabled={isConverting}
                className="rounded-xl px-6 font-semibold"
              >
                {isConverting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Converting Document...
                  </>
                ) : (
                  <>
                    <Layers className="h-4 w-4 mr-2" /> Convert to {FORMAT_CONFIG[targetFormat].ext.toUpperCase()}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Result Card */}
      {convertedBlob && convertedUrl && (
        <Card className="rounded-2xl border-emerald-500/30 bg-emerald-500/5 p-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-center sm:text-left">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 shrink-0">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">
                  Ready to Download {FORMAT_CONFIG[targetFormat].label}!
                </h4>
                <p className="text-xs text-muted-foreground">
                  Size: {(convertedBlob.size / 1024).toFixed(1)} KB • Genuine OpenXML formatted document
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {extractedPages.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl h-10 gap-1.5"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  <Eye className="h-4 w-4" /> {showPreview ? "Hide Preview" : "Inspect Text"}
                </Button>
              )}
              <Button
                size="sm"
                className="rounded-xl h-10 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                onClick={handleDownload}
              >
                <Download className="h-4 w-4" /> Download .{FORMAT_CONFIG[targetFormat].ext}
              </Button>
            </div>
          </div>

          {/* Text preview if requested */}
          {showPreview && extractedPages.length > 0 && (
            <div className="mt-4 p-4 rounded-xl bg-background border border-border/60 max-h-60 overflow-y-auto font-mono text-xs text-foreground space-y-3">
              {extractedPages.map((p) => (
                <div key={p.pageNumber} className="border-b border-border/40 pb-2">
                  <span className="font-bold text-primary">--- Page {p.pageNumber} ---</span>
                  <p className="whitespace-pre-wrap mt-1">{p.text}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}