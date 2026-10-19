"use client";

import { useState, useRef, useCallback } from "react";
import {
  Upload,
  Download,
  Trash2,
  FileText,
  FileDown,
  RotateCw,
  Stamp,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Paperclip,
  FileOutput,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PDFDocument, rgb, degrees, StandardFonts } from "pdf-lib";
import { extractPdfPages } from "@/lib/documents/pdf-text-extractor";
import { createDocxBlob } from "@/lib/documents/openxml-builder";

type QuickTool = "compress" | "watermark" | "rotate" | "word" | "text";

export function SmallPDFEngine() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [activeTool, setActiveTool] = useState<QuickTool>("compress");

  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [outputName, setOutputName] = useState("");

  // Compress options
  const [compressLevel, setCompressLevel] = useState<"recommended" | "extreme">("recommended");

  // Watermark options
  const [watermarkText, setWatermarkText] = useState("DRAFT");
  const [watermarkOpacity, setWatermarkOpacity] = useState(0.2);

  // Rotate options
  const [rotationAngle, setRotationAngle] = useState<90 | 180 | 270>(90);

  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadFile = useCallback(async (f: File) => {
    if (!f.name.toLowerCase().endsWith(".pdf")) {
      setError("Please select a valid PDF file.");
      return;
    }

    setLoading(true);
    setError(null);
    setOutputUrl(null);
    setSuccessMessage(null);

    try {
      const buffer = await f.arrayBuffer();
      const pdf = await PDFDocument.load(buffer, { ignoreEncryption: true });
      setFile(f);
      setPageCount(pdf.getPageCount());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load PDF file.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleExecuteTool = async () => {
    if (!file) return;

    setProcessing(true);
    setError(null);

    try {
      if (activeTool === "compress") {
        const buffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(buffer, { ignoreEncryption: true });

        // Strip metadata for extreme compression
        if (compressLevel === "extreme") {
          pdf.setTitle("");
          pdf.setAuthor("");
          pdf.setSubject("");
          pdf.setKeywords([]);
          pdf.setProducer("");
          pdf.setCreator("");
        }

        const pdfBytes = await pdf.save({
          useObjectStreams: true,
          addDefaultPage: false,
        });

        const blob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        setOutputUrl(url);
        setOutputName(`${file.name.replace(/\.[^.]+$/, "")}_compressed.pdf`);
        const originalKB = (file.size / 1024).toFixed(1);
        const newKB = (blob.size / 1024).toFixed(1);
        setSuccessMessage(`Compressed from ${originalKB} KB to ${newKB} KB!`);
      } else if (activeTool === "watermark") {
        const buffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(buffer, { ignoreEncryption: true });
        const boldFont = await pdf.embedFont(StandardFonts.HelveticaBold);
        const pages = pdf.getPages();

        for (const page of pages) {
          const { width, height } = page.getSize();
          const fontSize = Math.min(width, height) * 0.12;
          const textWidth = boldFont.widthOfTextAtSize(watermarkText, fontSize);

          page.drawText(watermarkText, {
            x: (width - textWidth) / 2,
            y: height / 2 - fontSize / 4,
            size: fontSize,
            font: boldFont,
            color: rgb(0.8, 0.2, 0.2),
            opacity: watermarkOpacity,
            rotate: degrees(45),
          });
        }

        const pdfBytes = await pdf.save();
        const blob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        setOutputUrl(url);
        setOutputName(`${file.name.replace(/\.[^.]+$/, "")}_watermarked.pdf`);
        setSuccessMessage(`Watermark "${watermarkText}" stamped on all ${pages.length} pages!`);
      } else if (activeTool === "rotate") {
        const buffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(buffer, { ignoreEncryption: true });
        const pages = pdf.getPages();

        for (const page of pages) {
          const curr = page.getRotation().angle;
          page.setRotation(degrees((curr + rotationAngle) % 360));
        }

        const pdfBytes = await pdf.save();
        const blob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        setOutputUrl(url);
        setOutputName(`${file.name.replace(/\.[^.]+$/, "")}_rotated.pdf`);
        setSuccessMessage(`Rotated all ${pages.length} pages by ${rotationAngle}°!`);
      } else if (activeTool === "word") {
        const pages = await extractPdfPages(file);
        const paragraphs: string[] = [];

        pages.forEach((p) => {
          paragraphs.push(`## Page ${p.pageNumber}`);
          p.lines.forEach((line) => {
            if (line.trim()) paragraphs.push(line);
          });
          paragraphs.push("");
        });

        const docxBlob = await createDocxBlob(paragraphs, file.name.replace(/\.[^.]+$/, ""));
        const url = URL.createObjectURL(docxBlob);
        setOutputUrl(url);
        setOutputName(`${file.name.replace(/\.[^.]+$/, "")}.docx`);
        setSuccessMessage(`Converted ${pages.length} pages into a Microsoft Word (.docx) document!`);
      } else if (activeTool === "text") {
        const pages = await extractPdfPages(file);
        const textContent = pages.map((p) => `--- PAGE ${p.pageNumber} ---\n\n${p.text}`).join("\n\n");
        const blob = new Blob([textContent], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        setOutputUrl(url);
        setOutputName(`${file.name.replace(/\.[^.]+$/, "")}.txt`);
        setSuccessMessage(`Extracted text from ${pages.length} pages!`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Processing failed.");
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
    setSuccessMessage(null);
    setError(null);
    setPageCount(0);
  };

  return (
    <div className="w-full min-w-0 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-border/50">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
            Smallpdf Studio
          </Badge>
          <span className="text-xs text-muted-foreground">
            Lightweight, instant, all-in-one PDF converter and toolkit right in your browser
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
          className={`border-2 border-dashed rounded-lg p-4 sm:p-6 text-center transition-colors cursor-pointer ${
            dragOver ? "border-emerald-500 bg-emerald-500/5 scale-[0.99]" : "border-border/60 hover:border-emerald-500/40 bg-card/50"
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files[0]) loadFile(e.dataTransfer.files[0]); }}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 ring-1 ring-emerald-500/20 text-emerald-600">
            <Paperclip className="h-7 w-7" />
          </div>
          <h3 className="font-semibold text-base mb-1">Drop your PDF here for quick actions</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
            Compress, watermark, rotate, or convert your PDF to Word & Text instantly with zero uploads.
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf,.pdf"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && loadFile(e.target.files[0])}
          />
          <Button onClick={(event) => { event.stopPropagation(); fileInputRef.current?.click(); }} className="rounded-lg gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
            <Upload className="h-4 w-4" /> Select PDF
          </Button>
        </div>
      )}

      {loading && (
        <div className="py-12 text-center space-y-3">
          <div className="animate-spin h-8 w-8 border-3 border-emerald-500 border-t-transparent rounded-full mx-auto" />
          <p className="text-sm text-muted-foreground">Opening PDF document...</p>
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
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 shrink-0">
                <FileText className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm truncate">{file.name}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                  <span>•</span>
                  <span>{pageCount} page(s)</span>
                </div>
              </div>
            </div>

            {outputUrl ? (
              <Button onClick={handleDownload} className="gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white">
                <Download className="h-4 w-4" /> Download Result
              </Button>
            ) : (
              <Button onClick={handleExecuteTool} disabled={processing} className="gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white">
                {processing ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" /> Run Action
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Success Banner */}
          {successMessage && outputUrl && (
            <Card className="border-emerald-500/30 bg-emerald-500/5">
              <CardContent className="p-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  <div>
                    <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Operation Completed!</p>
                    <p className="text-xs text-muted-foreground">{successMessage}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleDownload} className="rounded-xl gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white">
                    <Download className="h-3.5 w-3.5" /> Download ({outputName})
                  </Button>
                  {outputName.endsWith(".pdf") && (
                    <Button size="sm" variant="outline" onClick={() => window.open(outputUrl, "_blank")} className="rounded-xl gap-1.5">
                      <Eye className="h-3.5 w-3.5" /> Preview
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Tool Selector Grid */}
          <div className="space-y-3">
            <Label className="text-xs font-semibold">Select Desired Operation:</Label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                { id: "compress", label: "Compress PDF", icon: FileDown, desc: "Shrink file size" },
                { id: "watermark", label: "Add Watermark", icon: Stamp, desc: "Stamp overlay text" },
                { id: "rotate", label: "Rotate Pages", icon: RotateCw, desc: "Change orientation" },
                { id: "word", label: "To Word (.docx)", icon: FileOutput, desc: "Extract to Word" },
                { id: "text", label: "Extract Text", icon: FileText, desc: "Extract to .txt" },
              ].map((tool) => (
                <button type="button" aria-pressed={activeTool === tool.id}
                  key={tool.id}
                  onClick={() => {
                    setActiveTool(tool.id as QuickTool);
                    setOutputUrl(null);
                    setSuccessMessage(null);
                  }}
                  className={`rounded-lg text-left transition-colors border ${
                    activeTool === tool.id
                      ? "border-emerald-600 bg-emerald-500/10 shadow-xs"
                      : "border-border/50 hover:border-emerald-500/30"
                  }`}
                >
                  <div className="p-3 text-center">
                    <tool.icon className={`h-5 w-5 mx-auto mb-1.5 ${activeTool === tool.id ? "text-emerald-600" : "text-muted-foreground"}`} />
                    <p className="text-xs font-semibold">{tool.label}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Active Tool Options Card */}
          <section aria-label="Operation settings">
            <div className="py-3">
              {activeTool === "compress" && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-1">PDF Compression Settings</h4>
                    <p className="text-xs text-muted-foreground">Select how aggressively to optimize PDF data streams.</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Button
                      type="button"
                      variant={compressLevel === "recommended" ? "default" : "outline"}
                      onClick={() => setCompressLevel("recommended")}
                      className="rounded-xl text-xs flex-col h-16 gap-1"
                    >
                      <span className="font-semibold">Recommended Compression</span>
                      <span className="text-[10px] opacity-80">Good balance of quality and size</span>
                    </Button>
                    <Button
                      type="button"
                      variant={compressLevel === "extreme" ? "default" : "outline"}
                      onClick={() => setCompressLevel("extreme")}
                      className="rounded-xl text-xs flex-col h-16 gap-1"
                    >
                      <span className="font-semibold">Extreme Compression</span>
                      <span className="text-[10px] opacity-80">Strip metadata & maximize compression</span>
                    </Button>
                  </div>
                </div>
              )}

              {activeTool === "watermark" && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-1">Watermark Overlay</h4>
                    <p className="text-xs text-muted-foreground">Add diagonal text watermark across every page.</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Watermark Text</Label>
                      <Input
                        value={watermarkText}
                        onChange={(e) => setWatermarkText(e.target.value)}
                        placeholder="DRAFT"
                        className="rounded-xl text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <Label className="text-xs">Opacity</Label>
                        <span className="text-xs text-muted-foreground">{Math.round(watermarkOpacity * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0.05"
                        max="0.6"
                        step="0.05"
                        value={watermarkOpacity}
                        onChange={(e) => setWatermarkOpacity(parseFloat(e.target.value))}
                        className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-emerald-600"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTool === "rotate" && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-1">Page Rotation</h4>
                    <p className="text-xs text-muted-foreground">Rotate every page by the specified degrees.</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { deg: 90, label: "90° Clockwise" },
                      { deg: 180, label: "180° Invert" },
                      { deg: 270, label: "270° Counter-CW" },
                    ].map((r) => (
                      <Button
                        key={r.deg}
                        type="button"
                        variant={rotationAngle === r.deg ? "default" : "outline"}
                        onClick={() => setRotationAngle(r.deg as typeof rotationAngle)}
                        className="rounded-xl text-xs"
                      >
                        {r.label}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {activeTool === "word" && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm mb-1">Convert to Microsoft Word (.docx)</h4>
                  <p className="text-xs text-muted-foreground">
                    Extracts all text, page numbers, and paragraphs into a real, formatted Microsoft Word OpenXML (.docx) file.
                  </p>
                </div>
              )}

              {activeTool === "text" && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm mb-1">Extract Plain Text (.txt)</h4>
                  <p className="text-xs text-muted-foreground">
                    Extracts readable raw text with clean page separators into a universal text document.
                  </p>
                </div>
              )}
            </div>
          </section>

          <Button
            onClick={handleExecuteTool}
            disabled={processing}
            className="w-full py-6 rounded-2xl text-sm font-semibold shadow-md gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {processing ? (
              <>
                <div className="animate-spin h-5 w-5 border-2 border-current border-t-transparent rounded-full" />
                Processing...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" /> Execute {activeTool.toUpperCase()} Now
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}