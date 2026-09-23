"use client";

import { useState, useRef, useEffect } from "react";
import {
  FileText,
  Upload,
  Download,
  Sparkles,
  Loader2,
  Trash2,
  RotateCw,
  Stamp,
  CheckCircle2,
  Eye,
  Languages,
  BookOpen,
  FileCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { PDFDocument, rgb, degrees, StandardFonts } from "pdf-lib";
import { extractPdfPages, PDFPageContent } from "@/lib/documents/pdf-text-extractor";
import { complete } from "@/lib/ai";

export function SodaPDFEngine() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [extractedPages, setExtractedPages] = useState<PDFPageContent[]>([]);
  const [activeTab, setActiveTab] = useState<"ai" | "edit">("ai");

  // AI State
  const [aiAction, setAiAction] = useState<"summary" | "keypoints" | "translate">("summary");
  const [targetLang, setTargetLang] = useState("Spanish");
  const [aiOutput, setAiOutput] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Edit State
  const [watermarkText, setWatermarkText] = useState("CONFIDENTIAL");
  const [rotation, setRotation] = useState<number>(0);
  const [deletePageNum, setDeletePageNum] = useState<string>("");
  const [isProcessingPdf, setIsProcessingPdf] = useState(false);
  const [modifiedBlob, setModifiedBlob] = useState<Blob | null>(null);
  const [modifiedUrl, setModifiedUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (selected.type !== "application/pdf" && !selected.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Please upload a valid PDF document.");
      return;
    }

    setFile(selected);
    setAiOutput("");
    setModifiedBlob(null);
    setModifiedUrl(null);

    try {
      const pages = await extractPdfPages(selected);
      setExtractedPages(pages);
      setPageCount(pages.length);
      toast.success(`Loaded ${selected.name} (${pages.length} pages).`);
    } catch {
      toast.error("Failed to parse PDF pages.");
    }
  };

  // Run AI Feature
  const handleRunAI = async () => {
    if (!file || extractedPages.length === 0) return;
    setIsAiLoading(true);
    setAiOutput("");

    try {
      const sampleText = extractedPages
        .map((p) => `[Page ${p.pageNumber}]\n${p.text}`)
        .join("\n\n")
        .slice(0, 5000);

      let prompt = "";
      if (aiAction === "summary") {
        prompt = `Please analyze the following PDF document text and provide an executive summary with core highlights and conclusions:\n\n${sampleText}`;
      } else if (aiAction === "keypoints") {
        prompt = `Extract the top 5-10 key points, facts, and actionable takeaways from this PDF document:\n\n${sampleText}`;
      } else {
        prompt = `Translate the following PDF text into ${targetLang}. Maintain structured headings and clarity:\n\n${sampleText}`;
      }

      const res = await complete({
        prompt,
        tier: "reasoning",
        maxTokens: 1500,
      });

      setAiOutput(res.text);
      toast.success("AI analysis complete!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "AI processing failed.");
    } finally {
      setIsAiLoading(false);
    }
  };

  // Apply Modifications with pdf-lib
  const handleApplyModifications = async () => {
    if (!file) return;
    setIsProcessingPdf(true);

    try {
      const ab = await file.arrayBuffer();
      const pdf = await PDFDocument.load(ab, { ignoreEncryption: true });

      // Apply watermark if entered
      if (watermarkText.trim()) {
        const font = await pdf.embedFont(StandardFonts.HelveticaBold);
        const pages = pdf.getPages();

        pages.forEach((page) => {
          const { width, height } = page.getSize();
          const textSize = Math.min(width, height) / 8;
          page.drawText(watermarkText.trim(), {
            x: width / 4,
            y: height / 3,
            size: textSize,
            font,
            color: rgb(0.85, 0.2, 0.2),
            opacity: 0.25,
            rotate: degrees(45),
          });
        });
      }

      // Apply rotation if needed
      if (rotation !== 0) {
        const pages = pdf.getPages();
        pages.forEach((page) => {
          page.setRotation(degrees((page.getRotation().angle + rotation) % 360));
        });
      }

      // Delete specific page if requested
      if (deletePageNum.trim()) {
        const pageIdx = parseInt(deletePageNum.trim(), 10) - 1;
        if (!isNaN(pageIdx) && pageIdx >= 0 && pageIdx < pdf.getPageCount()) {
          pdf.removePage(pageIdx);
        }
      }

      const bytes = await pdf.save({ useObjectStreams: true });
      const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      setModifiedBlob(blob);
      setModifiedUrl(url);
      setPageCount(pdf.getPageCount());
      toast.success("PDF modified successfully!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to modify PDF.");
    } finally {
      setIsProcessingPdf(false);
    }
  };

  const handleDownloadModified = () => {
    if (!modifiedUrl || !file) return;
    const a = document.createElement("a");
    a.href = modifiedUrl;
    const base = file.name.replace(/\.pdf$/i, "");
    a.download = `${base}-edited.pdf`;
    a.click();
  };

  const handleReset = () => {
    if (modifiedUrl) URL.revokeObjectURL(modifiedUrl);
    setFile(null);
    setExtractedPages([]);
    setAiOutput("");
    setModifiedBlob(null);
    setModifiedUrl(null);
  };

  useEffect(() => {
    return () => {
      if (modifiedUrl) URL.revokeObjectURL(modifiedUrl);
    };
  }, [modifiedUrl]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Upload Drop Zone */}
      {!file && (
        <div
          className="border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center transition-all cursor-pointer border-border hover:border-teal-500/50 hover:bg-teal-500/5"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-500 mx-auto mb-4">
            <Sparkles className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-semibold mb-1">Upload PDF to Soda AI Studio</h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
            AI-powered PDF suite. Summarize dense reports, translate languages, apply custom watermarks, and edit pages in real time.
          </p>
          <Button variant="outline" size="sm" className="rounded-xl pointer-events-none">
            <Upload className="h-4 w-4 mr-1.5" /> Select PDF Document
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

      {/* Main Suite Workspace */}
      {file && (
        <Card className="rounded-2xl border-border/60 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="p-4 bg-muted/40 border-b border-border/60 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 shrink-0">
                <FileText className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{file.name}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{(file.size / 1024).toFixed(1)} KB</span>
                  <span>•</span>
                  <Badge variant="secondary" className="rounded-full text-[10px]">
                    {pageCount} {pageCount === 1 ? "page" : "pages"}
                  </Badge>
                </div>
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

          {/* Mode Switcher Tabs */}
          <div className="px-5 pt-4">
            <div className="flex rounded-xl bg-muted/50 p-1 w-fit border border-border/60">
              <button
                type="button"
                onClick={() => setActiveTab("ai")}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === "ai"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Sparkles className="h-3.5 w-3.5 text-teal-500" /> AI Document Assistant
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("edit")}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === "edit"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Stamp className="h-3.5 w-3.5 text-teal-500" /> Watermark & Page Tools
              </button>
            </div>
          </div>

          <CardContent className="p-5 space-y-6">
            {activeTab === "ai" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div
                    onClick={() => setAiAction("summary")}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      aiAction === "summary"
                        ? "border-teal-500 bg-teal-500/5 ring-1 ring-teal-500"
                        : "border-border bg-card hover:border-border/80"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <BookOpen className="h-4 w-4 text-teal-500" />
                      <span className="text-xs font-semibold">Executive Summary</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Distill key arguments and executive takeaways.
                    </p>
                  </div>

                  <div
                    onClick={() => setAiAction("keypoints")}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      aiAction === "keypoints"
                        ? "border-teal-500 bg-teal-500/5 ring-1 ring-teal-500"
                        : "border-border bg-card hover:border-border/80"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <FileCheck className="h-4 w-4 text-teal-500" />
                      <span className="text-xs font-semibold">Key Takeaways</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Extract actionable facts, figures, and data points.
                    </p>
                  </div>

                  <div
                    onClick={() => setAiAction("translate")}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      aiAction === "translate"
                        ? "border-teal-500 bg-teal-500/5 ring-1 ring-teal-500"
                        : "border-border bg-card hover:border-border/80"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Languages className="h-4 w-4 text-teal-500" />
                      <span className="text-xs font-semibold">Translate Document</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Translate content into international languages.
                    </p>
                  </div>
                </div>

                {aiAction === "translate" && (
                  <div className="flex items-center gap-2 max-w-xs">
                    <Label className="text-xs font-medium">Target Language:</Label>
                    <select
                      value={targetLang}
                      onChange={(e) => setTargetLang(e.target.value)}
                      className="rounded-lg border border-border bg-background px-2.5 py-1 text-xs"
                    >
                      <option value="Spanish">Spanish</option>
                      <option value="French">French</option>
                      <option value="German">German</option>
                      <option value="Arabic">Arabic</option>
                      <option value="Japanese">Japanese</option>
                      <option value="Chinese">Chinese</option>
                      <option value="Portuguese">Portuguese</option>
                    </select>
                  </div>
                )}

                <div className="flex justify-end">
                  <Button
                    onClick={handleRunAI}
                    disabled={isAiLoading}
                    className="rounded-xl px-5 font-semibold bg-teal-600 hover:bg-teal-700 text-white"
                  >
                    {isAiLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Processing AI...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" /> Run Soda AI Intelligence
                      </>
                    )}
                  </Button>
                </div>

                {/* AI Output Window */}
                {aiOutput && (
                  <div className="p-4 rounded-xl bg-muted/20 border border-border/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-teal-600 dark:text-teal-400">AI Response</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(aiOutput);
                          toast.success("Copied to clipboard!");
                        }}
                        className="text-xs h-7"
                      >
                        Copy Text
                      </Button>
                    </div>
                    <p className="text-xs text-foreground whitespace-pre-wrap leading-relaxed">{aiOutput}</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "edit" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-muted/20 border border-border/50 text-xs">
                  <div>
                    <Label className="text-xs font-medium mb-1 block">Stamp Watermark</Label>
                    <Input
                      value={watermarkText}
                      onChange={(e) => setWatermarkText(e.target.value)}
                      placeholder="e.g. CONFIDENTIAL"
                      className="h-9 rounded-xl text-xs"
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-medium mb-1 block">Rotate All Pages</Label>
                    <div className="flex rounded-lg bg-background p-0.5 border border-border/60">
                      {[0, 90, 180, 270].map((deg) => (
                        <button
                          key={deg}
                          type="button"
                          onClick={() => setRotation(deg)}
                          className={`flex-1 py-1 text-center rounded-md font-medium text-xs transition-colors ${
                            rotation === deg ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                          }`}
                        >
                          {deg}°
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs font-medium mb-1 block">Delete Page Number (Optional)</Label>
                    <Input
                      type="number"
                      min={1}
                      max={pageCount}
                      value={deletePageNum}
                      onChange={(e) => setDeletePageNum(e.target.value)}
                      placeholder={`1 to ${pageCount}`}
                      className="h-9 rounded-xl text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={handleApplyModifications}
                    disabled={isProcessingPdf}
                    className="rounded-xl px-5 font-semibold bg-teal-600 hover:bg-teal-700 text-white"
                  >
                    {isProcessingPdf ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving Changes...
                      </>
                    ) : (
                      <>
                        <Stamp className="h-4 w-4 mr-2" /> Apply & Save PDF
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Modified Result Download */}
      {modifiedBlob && modifiedUrl && (
        <Card className="rounded-2xl border-emerald-500/30 bg-emerald-500/5 p-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-center sm:text-left">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 shrink-0">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Updated PDF Ready!</h4>
                <p className="text-xs text-muted-foreground">
                  {pageCount} pages • {(modifiedBlob.size / 1024).toFixed(1)} KB • Modifications applied
                </p>
              </div>
            </div>

            <Button
              size="sm"
              className="rounded-xl h-10 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
              onClick={handleDownloadModified}
            >
              <Download className="h-4 w-4" /> Download Updated PDF
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}