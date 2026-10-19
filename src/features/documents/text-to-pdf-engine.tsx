"use client";

import { useState, useRef, useCallback } from "react";
import {
  Upload,
  Download,
  Trash2,
  FileText,
  FileOutput,
  Type,
  AlignLeft,
  Settings,
  Sparkles,
  Eye,
  CheckCircle2,
  AlertCircle,
  FileCode,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { convertRawTextToPdf, TextToPDFOptions } from "@/features/documents/text-to-pdf";

const SAMPLE_TEXT = `# Annual Operations & Strategy Report
Prepared for Executive Leadership • Confidential

---

## 1. Executive Summary
During the past fiscal year, our organization expanded its operational footprint while maintaining exceptional unit economics and client satisfaction benchmarks.

- Revenue increased by 34% year-over-year
- Customer retention reached 98.4% across all segments
- Successfully launched three new flagship product workflows
- Decreased infrastructure latency by 45%

---

## 2. Key Objectives & Milestones
Our roadmap is structured into four core pillars:
1. Architectural stability and modern framework adoption
2. Centralized security, rate limiting, and credit governance
3. Global edge distribution and zero-latency client processing
4. Continuous automated verification and unit testing

---

## 3. Financial Summary & Forecast
All quarterly targets were fulfilled ahead of projections. Continued investment in client-side WebAssembly and modern document parsing has reduced server overhead to near zero.`;

export function TextToPDFEngine() {
  const [activeTab, setActiveTab] = useState<"file" | "editor">("file");
  const [file, setFile] = useState<File | null>(null);
  const [textContent, setTextContent] = useState(SAMPLE_TEXT);

  // Styling options
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [fontSize, setFontSize] = useState<number>(11);
  const [fontFamily, setFontFamily] = useState<"Helvetica" | "TimesRoman" | "Courier">("Helvetica");
  const [pageSize, setPageSize] = useState<"a4" | "letter" | "legal">("a4");
  const [margin, setMargin] = useState<"narrow" | "normal" | "wide">("normal");
  const [includePageNumbers, setIncludePageNumbers] = useState(true);
  const [headerText, setHeaderText] = useState("");
  const [footerText, setFooterText] = useState("");

  // Processing state
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [outputName, setOutputName] = useState("document.pdf");
  const [pageCountMsg, setPageCountMsg] = useState("");

  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadFile = useCallback(async (f: File) => {
    setError(null);
    setOutputUrl(null);
    setFile(f);
    if (!title) setTitle(f.name.replace(/\.[^.]+$/, ""));
    const text = await f.text();
    setTextContent(text);
  }, [title]);

  const handleConvert = async () => {
    const textToProcess = activeTab === "file" && file ? textContent : textContent;
    if (!textToProcess.trim()) {
      setError("Please provide text content or upload a text file.");
      return;
    }

    setProcessing(true);
    setError(null);

    const baseName = title.trim() || (file ? file.name.replace(/\.[^.]+$/, "") : "document");

    const options: TextToPDFOptions = {
      title: title.trim() || undefined,
      author: author.trim() || undefined,
      fontSize,
      fontFamily,
      pageSize,
      margin,
      includePageNumbers,
      headerText: headerText.trim() || undefined,
      footerText: footerText.trim() || undefined,
    };

    try {
      const res = await convertRawTextToPdf(textToProcess, baseName, options);
      if (res.status === "success" && res.outputUrl) {
        setOutputUrl(res.outputUrl);
        setOutputName(`${baseName}.pdf`);
        setPageCountMsg(res.message || "PDF Created!");
      } else {
        setError(res.error || "Failed to create PDF.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to convert text to PDF.");
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
    setError(null);
    setTitle("");
    setAuthor("");
  };

  return (
    <div className="w-full min-w-0 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-border/50">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20">
            Text & Markdown to PDF
          </Badge>
          <span className="text-xs text-muted-foreground">
            Convert plain text or formatted Markdown into clean, publication-ready PDF documents
          </span>
        </div>
        {(file || outputUrl) && (
          <Button variant="ghost" size="sm" onClick={handleReset} className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground">
            <Trash2 className="h-3.5 w-3.5" /> Start Over
          </Button>
        )}
      </div>

      {error && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
            <p className="text-sm text-destructive font-medium">{error}</p>
          </CardContent>
        </Card>
      )}

      {outputUrl && (
        <Card className="border-emerald-500/30 bg-emerald-500/5">
          <CardContent className="p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <div>
                <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">PDF Successfully Generated!</p>
                <p className="text-xs text-muted-foreground">{pageCountMsg}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleDownload} className="rounded-xl gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white">
                <Download className="h-3.5 w-3.5" /> Download ({outputName})
              </Button>
              <Button size="sm" variant="outline" onClick={() => window.open(outputUrl, "_blank")} className="rounded-xl gap-1.5">
                <Eye className="h-3.5 w-3.5" /> Preview PDF
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
        {/* Left: Input Selection & Editor */}
        <div className="min-w-0 space-y-4">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="space-y-4">
            <TabsList className="grid h-auto grid-cols-1 sm:grid-cols-2 rounded-lg p-1 bg-muted/50 border border-border/50">
              <TabsTrigger value="file" className="rounded-lg gap-2 text-xs sm:text-sm">
                <Upload className="h-4 w-4" /> Upload File (.txt, .md)
              </TabsTrigger>
              <TabsTrigger value="editor" className="rounded-lg gap-2 text-xs sm:text-sm">
                <FileCode className="h-4 w-4" /> Type / Paste Markdown
              </TabsTrigger>
            </TabsList>

            <TabsContent value="file" className="space-y-4">
              {!file ? (
                <div
                  className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
                    dragOver ? "border-blue-500 bg-blue-500/5 scale-[0.99]" : "border-border/60 hover:border-blue-500/40 bg-card/50"
                  }`}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files[0]) loadFile(e.dataTransfer.files[0]); }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600">
                    <FileText className="h-6 w-6" />
                  </div>
                  <h4 className="font-semibold text-sm mb-1">Drop a text or markdown file</h4>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto mb-3">
                    Supports .txt, .md, .log, .csv, and plain code files.
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".txt,.md,.log,.csv,.json,.markdown,text/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && loadFile(e.target.files[0])}
                  />
                  <Button variant="outline" onClick={(event) => { event.stopPropagation(); fileInputRef.current?.click(); }} className="rounded-lg">
                    Browse File
                  </Button>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-card border border-border/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="h-7 w-7 text-blue-600 shrink-0" />
                      <div>
                        <p className="text-xs font-semibold truncate max-w-[200px]">{file.name}</p>
                        <p className="text-[11px] text-muted-foreground">{(file.size / 1024).toFixed(1)} KB • {textContent.split("\n").length} lines</p>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => setFile(null)} className="text-xs h-7">
                      Replace File
                    </Button>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/20 border border-border/40 max-h-[220px] overflow-y-auto font-mono text-[11px] leading-relaxed whitespace-pre-wrap">
                    {textContent.slice(0, 1500)}
                    {textContent.length > 1500 && "... (truncated in preview)"}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="editor" className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <Label className="text-xs">Live Text & Markdown Editor</Label>
                  <span className="text-muted-foreground">{textContent.length} characters</span>
                </div>
                <textarea
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  placeholder="Type or paste your text or markdown here..."
                  aria-label="Text and Markdown editor"
                  className="w-full min-h-80 rounded-lg border border-border/60 bg-background p-3 text-sm font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right: Typography, Layout & Formatting Settings */}
        <section aria-label="PDF layout settings" className="min-w-0 space-y-4">
          <div>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-blue-600" />
                <h4 className="font-semibold text-sm">PDF Layout & Typography</h4>
              </div>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Document Title (Hero Header)</Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Project Whitepaper"
                    className="rounded-xl text-xs h-9"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Author / Organization (optional)</Label>
                  <Input
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="e.g. Engineering Team"
                    className="rounded-xl text-xs h-9"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Font Family</Label>
                    <select
                      value={fontFamily}
                      onChange={(e) => setFontFamily(e.target.value as typeof fontFamily)}
                      className="w-full rounded-xl border border-border/50 bg-background p-2 text-xs h-9"
                    >
                      <option value="Helvetica">Helvetica (Sans-Serif)</option>
                      <option value="TimesRoman">Times Roman (Serif)</option>
                      <option value="Courier">Courier (Monospace)</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Font Size</Label>
                    <select
                      value={fontSize}
                      onChange={(e) => setFontSize(Number(e.target.value))}
                      className="w-full rounded-xl border border-border/50 bg-background p-2 text-xs h-9"
                    >
                      <option value={9}>9 pt (Compact)</option>
                      <option value={10}>10 pt (Small)</option>
                      <option value={11}>11 pt (Standard)</option>
                      <option value={12}>12 pt (Large)</option>
                      <option value={14}>14 pt (Presentation)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Page Format</Label>
                    <select
                      value={pageSize}
                      onChange={(e) => setPageSize(e.target.value as typeof pageSize)}
                      className="w-full rounded-xl border border-border/50 bg-background p-2 text-xs h-9"
                    >
                      <option value="a4">A4 (Standard)</option>
                      <option value="letter">US Letter</option>
                      <option value="legal">US Legal</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Page Margins</Label>
                    <select
                      value={margin}
                      onChange={(e) => setMargin(e.target.value as typeof margin)}
                      className="w-full rounded-xl border border-border/50 bg-background p-2 text-xs h-9"
                    >
                      <option value="narrow">Narrow (0.5 in / 36pt)</option>
                      <option value="normal">Normal (0.75 in / 54pt)</option>
                      <option value="wide">Wide (1.0 in / 72pt)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2 border-t border-border/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs cursor-pointer" htmlFor="toggle-num">
                      Add page numbers (Page X of Y)
                    </Label>
                    <input
                      type="checkbox"
                      id="toggle-num"
                      checked={includePageNumbers}
                      onChange={(e) => setIncludePageNumbers(e.target.checked)}
                      className="rounded border-border text-blue-600 focus:ring-blue-500 h-4 w-4"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      value={headerText}
                      onChange={(e) => setHeaderText(e.target.value)}
                      placeholder="Header label (optional)"
                      className="rounded-xl text-[11px] h-8"
                    />
                    <Input
                      value={footerText}
                      onChange={(e) => setFooterText(e.target.value)}
                      placeholder="Footer label (optional)"
                      className="rounded-xl text-[11px] h-8"
                    />
                  </div>
                </div>
              </div>

              <Button
                onClick={handleConvert}
                disabled={processing}
                className="w-full py-5 rounded-2xl text-xs sm:text-sm font-semibold shadow-md gap-2 bg-blue-600 hover:bg-blue-700 text-white mt-2"
              >
                {processing ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                    Generating PDF...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" /> Convert to PDF
                  </>
                )}
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}