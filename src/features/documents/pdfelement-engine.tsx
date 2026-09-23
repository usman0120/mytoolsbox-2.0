"use client";

import { useState, useRef, useCallback } from "react";
import {
  Upload,
  Download,
  Trash2,
  FileText,
  Stamp,
  RotateCw,
  FileEdit,
  Shield,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PDFDocument, rgb, degrees, StandardFonts } from "pdf-lib";

interface PdfMeta {
  title: string;
  author: string;
  subject: string;
  keywords: string;
  creator: string;
  producer: string;
  pageCount: number;
}

export function PDFElementEngine() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [outputName, setOutputName] = useState<string>("");

  // Metadata
  const [meta, setMeta] = useState<PdfMeta>({
    title: "",
    author: "",
    subject: "",
    keywords: "",
    creator: "",
    producer: "",
    pageCount: 0,
  });

  // Stamp / Watermark options
  const [stampText, setStampText] = useState("CONFIDENTIAL");
  const [stampPreset, setStampPreset] = useState<string>("CONFIDENTIAL");
  const [stampColor, setStampColor] = useState<"red" | "blue" | "green" | "gray" | "purple">("red");
  const [stampOpacity, setStampOpacity] = useState(0.25);
  const [stampPosition, setStampPosition] = useState<"center-diagonal" | "top-right" | "bottom-center">("center-diagonal");
  const [applyStamp, setApplyStamp] = useState(false);

  // Header & Footer
  const [headerText, setHeaderText] = useState("");
  const [footerText, setFooterText] = useState("");
  const [addPageNumbers, setAddPageNumbers] = useState(false);

  // Rotation
  const [rotationDegrees, setRotationDegrees] = useState<0 | 90 | 180 | 270>(0);

  // Page deletion
  const [deletePagesInput, setDeletePagesInput] = useState("");

  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadFile = useCallback(async (f: File) => {
    if (!f.name.toLowerCase().endsWith(".pdf")) {
      setError("Please select a valid PDF file.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);
    setOutputUrl(null);

    try {
      const buffer = await f.arrayBuffer();
      const pdf = await PDFDocument.load(buffer, { ignoreEncryption: true });

      setFile(f);
      setMeta({
        title: pdf.getTitle() || f.name.replace(/\.[^.]+$/, ""),
        author: pdf.getAuthor() || "",
        subject: pdf.getSubject() || "",
        keywords: pdf.getKeywords() || "",
        creator: pdf.getCreator() || "PDFelement Suite",
        producer: pdf.getProducer() || "MyToolsBox",
        pageCount: pdf.getPageCount(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse PDF document.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleApplyStampPreset = (preset: string) => {
    setStampPreset(preset);
    setStampText(preset);
    setApplyStamp(true);
    if (preset === "APPROVED") setStampColor("green");
    else if (preset === "CONFIDENTIAL" || preset === "REJECTED") setStampColor("red");
    else if (preset === "FINAL") setStampColor("blue");
    else setStampColor("purple");
  };

  const getColorRgb = (color: string) => {
    switch (color) {
      case "red": return rgb(0.85, 0.15, 0.15);
      case "green": return rgb(0.1, 0.65, 0.25);
      case "blue": return rgb(0.15, 0.45, 0.85);
      case "purple": return rgb(0.55, 0.2, 0.8);
      default: return rgb(0.4, 0.4, 0.4);
    }
  };

  const handleProcess = async () => {
    if (!file) return;

    setProcessing(true);
    setError(null);

    try {
      const buffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(buffer, { ignoreEncryption: true });

      // 1. Update metadata
      pdf.setTitle(meta.title);
      pdf.setAuthor(meta.author);
      pdf.setSubject(meta.subject);
      pdf.setKeywords(meta.keywords ? meta.keywords.split(",").map((k) => k.trim()) : []);
      pdf.setCreator(meta.creator || "PDFelement");
      pdf.setProducer(meta.producer || "MyToolsBox Studio");
      pdf.setModificationDate(new Date());

      // 2. Handle page deletion if specified
      if (deletePagesInput.trim()) {
        const pagesToDelete = new Set<number>();
        const parts = deletePagesInput.split(",");
        for (const p of parts) {
          const trimmed = p.trim();
          if (trimmed.includes("-")) {
            const [start, end] = trimmed.split("-").map(Number);
            if (!isNaN(start) && !isNaN(end)) {
              for (let i = start; i <= end; i++) pagesToDelete.add(i - 1);
            }
          } else {
            const pageNum = Number(trimmed);
            if (!isNaN(pageNum)) pagesToDelete.add(pageNum - 1);
          }
        }

        // Delete from highest index to lowest so indices don't shift
        const sortedIndices = Array.from(pagesToDelete).sort((a, b) => b - a);
        for (const idx of sortedIndices) {
          if (idx >= 0 && idx < pdf.getPageCount() && pdf.getPageCount() > 1) {
            pdf.removePage(idx);
          }
        }
      }

      const pages = pdf.getPages();
      const font = await pdf.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdf.embedFont(StandardFonts.HelveticaBold);
      const totalPages = pages.length;

      // 3. Process each page (rotation, watermark, headers/footers, numbering)
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const { width, height } = page.getSize();

        // Rotation
        if (rotationDegrees > 0) {
          const currentRotation = page.getRotation().angle;
          page.setRotation(degrees((currentRotation + rotationDegrees) % 360));
        }

        // Stamp / Watermark
        if (applyStamp && stampText.trim()) {
          const stampRgb = getColorRgb(stampColor);
          if (stampPosition === "center-diagonal") {
            const fontSize = Math.min(width, height) * 0.12;
            const textWidth = boldFont.widthOfTextAtSize(stampText, fontSize);
            page.drawText(stampText, {
              x: (width - textWidth) / 2,
              y: height / 2 - fontSize / 4,
              size: fontSize,
              font: boldFont,
              color: stampRgb,
              opacity: stampOpacity,
              rotate: degrees(45),
            });
          } else if (stampPosition === "top-right") {
            const fontSize = 16;
            const textWidth = boldFont.widthOfTextAtSize(stampText, fontSize);
            page.drawRectangle({
              x: width - textWidth - 36,
              y: height - 42,
              width: textWidth + 24,
              height: 26,
              color: stampRgb,
              opacity: 0.15,
            });
            page.drawText(stampText, {
              x: width - textWidth - 24,
              y: height - 34,
              size: fontSize,
              font: boldFont,
              color: stampRgb,
              opacity: Math.min(stampOpacity * 2.5, 0.9),
            });
          } else {
            // Bottom center
            const fontSize = 16;
            const textWidth = boldFont.widthOfTextAtSize(stampText, fontSize);
            page.drawText(stampText, {
              x: (width - textWidth) / 2,
              y: 28,
              size: fontSize,
              font: boldFont,
              color: stampRgb,
              opacity: stampOpacity,
            });
          }
        }

        // Header
        if (headerText.trim()) {
          page.drawText(headerText, {
            x: 40,
            y: height - 28,
            size: 9,
            font,
            color: rgb(0.35, 0.35, 0.35),
          });
        }

        // Footer & Page numbering
        if (footerText.trim() || addPageNumbers) {
          if (footerText.trim()) {
            page.drawText(footerText, {
              x: 40,
              y: 20,
              size: 9,
              font,
              color: rgb(0.35, 0.35, 0.35),
            });
          }

          if (addPageNumbers) {
            const numText = `Page ${i + 1} of ${totalPages}`;
            const numWidth = font.widthOfTextAtSize(numText, 9);
            page.drawText(numText, {
              x: width - numWidth - 40,
              y: 20,
              size: 9,
              font,
              color: rgb(0.35, 0.35, 0.35),
            });
          }
        }
      }

      const pdfBytes = await pdf.save();
      const blob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      setOutputUrl(url);
      setOutputName(`${file.name.replace(/\.[^.]+$/, "")}_edited.pdf`);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to edit PDF document.");
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!outputUrl) return;
    const a = document.createElement("a");
    a.href = outputUrl;
    a.download = outputName;
    a.click();
  };

  const handleReset = () => {
    setFile(null);
    setOutputUrl(null);
    setSuccess(false);
    setError(null);
    setMeta({
      title: "",
      author: "",
      subject: "",
      keywords: "",
      creator: "",
      producer: "",
      pageCount: 0,
    });
    setRotationDegrees(0);
    setDeletePagesInput("");
    setApplyStamp(false);
    setHeaderText("");
    setFooterText("");
    setAddPageNumbers(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-border/50">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
            PDFelement Studio
          </Badge>
          <span className="text-xs text-muted-foreground">
            Complete PDF editing, stamp annotations, metadata management & page layout
          </span>
        </div>
        {file && (
          <Button variant="ghost" size="sm" onClick={handleReset} className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground">
            <Trash2 className="h-3.5 w-3.5" /> Start Over
          </Button>
        )}
      </div>

      {!file && (
        <div
          className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer ${
            dragOver ? "border-primary bg-primary/5 scale-[0.99]" : "border-border/60 hover:border-primary/40 bg-card/50"
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); e.dataTransfer.files[0] && loadFile(e.dataTransfer.files[0]); }}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20 text-primary">
            <FileText className="h-7 w-7" />
          </div>
          <h3 className="font-semibold text-base mb-1">Drop your PDF here or click to browse</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
            Edit document metadata, add professional stamps, watermarks, headers, footers, and page numbers directly in your browser.
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf,.pdf"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && loadFile(e.target.files[0])}
          />
          <Button size="sm" className="rounded-xl gap-2 pointer-events-none">
            <Upload className="h-4 w-4" /> Select PDF
          </Button>
        </div>
      )}

      {loading && (
        <div className="py-12 text-center space-y-3">
          <div className="animate-spin h-8 w-8 border-3 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-sm text-muted-foreground">Inspecting PDF structure...</p>
        </div>
      )}

      {error && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
            <p className="text-sm text-destructive font-medium">{error}</p>
          </CardContent>
        </Card>
      )}

      {file && !loading && (
        <div className="space-y-6">
          {/* File summary bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-card border border-border/50 shadow-xs">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                <FileText className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm truncate">{file.name}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                  <span>•</span>
                  <span>{meta.pageCount} page(s)</span>
                  <span>•</span>
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Client-Side</Badge>
                </div>
              </div>
            </div>
            {outputUrl ? (
              <Button onClick={handleDownload} className="gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white">
                <Download className="h-4 w-4" /> Download Edited PDF
              </Button>
            ) : (
              <Button onClick={handleProcess} disabled={processing} className="gap-2 rounded-xl">
                {processing ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                    Applying Changes...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" /> Apply & Save PDF
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Success banner if created */}
          {success && outputUrl && (
            <Card className="border-emerald-500/30 bg-emerald-500/5">
              <CardContent className="p-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  <div>
                    <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">PDF successfully processed!</p>
                    <p className="text-xs text-muted-foreground">All edits, annotations, and metadata have been written into the document.</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleDownload} className="rounded-xl gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white">
                    <Download className="h-3.5 w-3.5" /> Download ({outputName})
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => window.open(outputUrl, "_blank")} className="rounded-xl gap-1.5">
                    <Eye className="h-3.5 w-3.5" /> Preview
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tabs for Editing Operations */}
          <Tabs defaultValue="stamp" className="space-y-4">
            <TabsList className="grid grid-cols-4 rounded-xl p-1 bg-muted/50 border border-border/50">
              <TabsTrigger value="stamp" className="rounded-lg gap-2 text-xs sm:text-sm">
                <Stamp className="h-4 w-4" /> Stamp & Watermark
              </TabsTrigger>
              <TabsTrigger value="metadata" className="rounded-lg gap-2 text-xs sm:text-sm">
                <FileEdit className="h-4 w-4" /> Document Info
              </TabsTrigger>
              <TabsTrigger value="headers" className="rounded-lg gap-2 text-xs sm:text-sm">
                <Layers className="h-4 w-4" /> Header & Numbers
              </TabsTrigger>
              <TabsTrigger value="pages" className="rounded-lg gap-2 text-xs sm:text-sm">
                <RotateCw className="h-4 w-4" /> Page Layout
              </TabsTrigger>
            </TabsList>

            {/* Stamp & Watermark Tab */}
            <TabsContent value="stamp" className="space-y-4">
              <Card className="border-border/50">
                <CardContent className="p-5 space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-1">Quick Stamp Presets</h4>
                    <p className="text-xs text-muted-foreground mb-3">Choose a professional business stamp or customize your own watermark overlay.</p>
                    <div className="flex flex-wrap gap-2">
                      {["CONFIDENTIAL", "APPROVED", "DRAFT", "FINAL", "URGENT", "REJECTED"].map((preset) => (
                        <Button
                          key={preset}
                          type="button"
                          size="sm"
                          variant={stampPreset === preset && applyStamp ? "default" : "outline"}
                          className="rounded-xl text-xs"
                          onClick={() => handleApplyStampPreset(preset)}
                        >
                          {preset}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-border/40">
                    <div className="space-y-2">
                      <Label className="text-xs">Custom Stamp / Watermark Text</Label>
                      <Input
                        value={stampText}
                        onChange={(e) => {
                          setStampText(e.target.value);
                          setApplyStamp(true);
                        }}
                        placeholder="e.g. OFFICIAL COPY"
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Stamp Position</Label>
                      <select
                        value={stampPosition}
                        onChange={(e) => setStampPosition(e.target.value as typeof stampPosition)}
                        className="w-full rounded-xl border border-border/50 bg-background p-2 text-xs h-9"
                      >
                        <option value="center-diagonal">Center Diagonal (Watermark)</option>
                        <option value="top-right">Top Right (Official Badge)</option>
                        <option value="bottom-center">Bottom Center (Footer Stamp)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="space-y-2">
                      <Label className="text-xs">Stamp Color</Label>
                      <div className="flex gap-2">
                        {[
                          { id: "red", label: "Red", bg: "bg-red-500" },
                          { id: "blue", label: "Blue", bg: "bg-blue-500" },
                          { id: "green", label: "Green", bg: "bg-emerald-500" },
                          { id: "purple", label: "Purple", bg: "bg-purple-500" },
                          { id: "gray", label: "Slate", bg: "bg-slate-500" },
                        ].map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => setStampColor(c.id as typeof stampColor)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition-all ${
                              stampColor === c.id ? "border-primary bg-primary/10 font-medium" : "border-border/50 bg-muted/20"
                            }`}
                          >
                            <span className={`h-2.5 w-2.5 rounded-full ${c.bg}`} />
                            {c.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label className="text-xs">Opacity / Transparency</Label>
                        <span className="text-xs text-muted-foreground">{Math.round(stampOpacity * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0.05"
                        max="0.85"
                        step="0.05"
                        value={stampOpacity}
                        onChange={(e) => setStampOpacity(parseFloat(e.target.value))}
                        className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="apply-stamp-check"
                      checked={applyStamp}
                      onChange={(e) => setApplyStamp(e.target.checked)}
                      className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                    />
                    <label htmlFor="apply-stamp-check" className="text-xs font-medium cursor-pointer">
                      Enable watermark / stamp on all pages
                    </label>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Document Info / Metadata Tab */}
            <TabsContent value="metadata" className="space-y-4">
              <Card className="border-border/50">
                <CardContent className="p-5 space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-1">PDF Properties & Metadata</h4>
                    <p className="text-xs text-muted-foreground">View and modify internal document information read by PDF viewers and search engines.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs">Document Title</Label>
                      <Input
                        value={meta.title}
                        onChange={(e) => setMeta({ ...meta, title: e.target.value })}
                        placeholder="Document Title"
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Author</Label>
                      <Input
                        value={meta.author}
                        onChange={(e) => setMeta({ ...meta, author: e.target.value })}
                        placeholder="Author / Organization"
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Subject / Description</Label>
                      <Input
                        value={meta.subject}
                        onChange={(e) => setMeta({ ...meta, subject: e.target.value })}
                        placeholder="Subject summary"
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Keywords (comma-separated)</Label>
                      <Input
                        value={meta.keywords}
                        onChange={(e) => setMeta({ ...meta, keywords: e.target.value })}
                        placeholder="report, quarterly, financial"
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Creator Tool</Label>
                      <Input
                        value={meta.creator}
                        onChange={(e) => setMeta({ ...meta, creator: e.target.value })}
                        placeholder="Application name"
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Producer</Label>
                      <Input
                        value={meta.producer}
                        onChange={(e) => setMeta({ ...meta, producer: e.target.value })}
                        placeholder="PDF producer"
                        className="rounded-xl"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Header & Numbering Tab */}
            <TabsContent value="headers" className="space-y-4">
              <Card className="border-border/50">
                <CardContent className="p-5 space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-1">Header, Footer & Numbering</h4>
                    <p className="text-xs text-muted-foreground">Add running headers, legal disclaimers, and continuous page numbering.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs">Running Header (Top Left)</Label>
                      <Input
                        value={headerText}
                        onChange={(e) => setHeaderText(e.target.value)}
                        placeholder="e.g. Acme Corp • Confidential Internal Document"
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Footer Disclaimer (Bottom Left)</Label>
                      <Input
                        value={footerText}
                        onChange={(e) => setFooterText(e.target.value)}
                        placeholder="e.g. All Rights Reserved • Do not distribute"
                        className="rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-muted/30 border border-border/40 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold">Automatic Page Numbering</p>
                      <p className="text-xs text-muted-foreground">Stamps "Page X of Y" in the bottom right corner of every page.</p>
                    </div>
                    <input
                      type="checkbox"
                      id="add-page-num-check"
                      checked={addPageNumbers}
                      onChange={(e) => setAddPageNumbers(e.target.checked)}
                      className="rounded border-border text-primary focus:ring-primary h-5 w-5"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Page Layout & Rotation Tab */}
            <TabsContent value="pages" className="space-y-4">
              <Card className="border-border/50">
                <CardContent className="p-5 space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-1">Page Orientation & Deletion</h4>
                    <p className="text-xs text-muted-foreground">Rotate sideways pages or strip unwanted sheets before finalizing.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs">Rotate All Pages</Label>
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { deg: 0, label: "0°" },
                          { deg: 90, label: "90° CW" },
                          { deg: 180, label: "180°" },
                          { deg: 270, label: "270° CCW" },
                        ].map((r) => (
                          <Button
                            key={r.deg}
                            type="button"
                            size="sm"
                            variant={rotationDegrees === r.deg ? "default" : "outline"}
                            className="rounded-xl text-xs"
                            onClick={() => setRotationDegrees(r.deg as typeof rotationDegrees)}
                          >
                            {r.label}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs">Delete Specific Pages (Optional)</Label>
                      <Input
                        value={deletePagesInput}
                        onChange={(e) => setDeletePagesInput(e.target.value)}
                        placeholder="e.g. 1, 4-6"
                        className="rounded-xl"
                      />
                      <p className="text-[11px] text-muted-foreground">Comma-separated page numbers or ranges to remove.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Button
            onClick={handleProcess}
            disabled={processing}
            className="w-full py-6 rounded-2xl text-sm font-semibold shadow-md gap-2"
          >
            {processing ? (
              <>
                <div className="animate-spin h-5 w-5 border-2 border-current border-t-transparent rounded-full" />
                Processing PDF...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" /> Apply All Modifications & Export PDF
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}