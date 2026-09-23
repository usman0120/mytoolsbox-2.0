"use client";

import { useState, useRef, useCallback } from "react";
import {
  Upload,
  Download,
  Trash2,
  FileText,
  Search,
  Sparkles,
  Bot,
  Copy,
  Check,
  Zap,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Send,
  FileDown,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { extractPdfPages, ExtractedPdfPage } from "@/lib/documents/pdf-text-extractor";
import { createDocxBlob } from "@/lib/documents/openxml-builder";
import { complete } from "@/lib/ai";

export function FoxitPDFEngine() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pages, setPages] = useState<ExtractedPdfPage[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  // Search
  const [searchQuery, setSearchQuery] = useState("");

  // AI Assistant
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadFile = useCallback(async (f: File) => {
    if (!f.name.toLowerCase().endsWith(".pdf")) {
      setError("Please select a valid PDF file.");
      return;
    }

    setLoading(true);
    setError(null);
    setPages([]);
    setAiResponse(null);

    try {
      const extracted = await extractPdfPages(f);
      if (extracted.length === 0) {
        throw new Error("Could not extract any pages from this PDF.");
      }
      setFile(f);
      setPages(extracted);
      setCurrentPageIndex(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load and index PDF document.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Filter pages or text matches
  const currentText = pages[currentPageIndex]?.text || "";
  const matchingPages = searchQuery.trim()
    ? pages
        .map((p, idx) => ({ pageNum: p.pageNumber, index: idx, matches: p.text.toLowerCase().includes(searchQuery.toLowerCase()) }))
        .filter((p) => p.matches)
    : [];

  const handleRunAi = async (type: "summary" | "actions" | "qa") => {
    if (!pages.length) return;

    setAiLoading(true);
    setError(null);

    try {
      // Gather first ~15,000 characters of text to stay within fast context
      const fullText = pages.map((p) => `--- PAGE ${p.pageNumber} ---\n${p.text}`).join("\n\n").slice(0, 15000);

      let prompt = "";
      if (type === "summary") {
        prompt = `Please provide a clear, high-level executive summary of this PDF document. Highlight the key objective, major findings, and conclusions:\n\n${fullText}`;
      } else if (type === "actions") {
        prompt = `Extract all action items, deliverables, next steps, dates, and assigned parties from this document:\n\n${fullText}`;
      } else {
        if (!aiPrompt.trim()) return;
        prompt = `Based on the following PDF document content, please answer the question: "${aiPrompt}"\n\nDocument:\n${fullText}`;
      }

      const res = await complete({
        prompt,
        tier: "reasoning",
        maxTokens: 1500,
      });

      setAiResponse(res.text);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate AI response.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleExportText = () => {
    const allText = pages.map((p) => `=== Page ${p.pageNumber} ===\n\n${p.text}`).join("\n\n");
    const blob = new Blob([allText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${file?.name.replace(/\.[^.]+$/, "") || "document"}_extracted.txt`;
    a.click();
  };

  const handleExportDocx = async () => {
    if (!file) return;
    const paragraphs: string[] = [];
    pages.forEach((p) => {
      paragraphs.push(`## Page ${p.pageNumber}`);
      p.lines.forEach((l: string) => {
        if (l.trim()) paragraphs.push(l);
      });
      paragraphs.push("");
    });

    const docxBlob = await createDocxBlob(paragraphs, file.name.replace(/\.[^.]+$/, ""));
    const url = URL.createObjectURL(docxBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${file.name.replace(/\.[^.]+$/, "")}.docx`;
    a.click();
  };

  const handleCopyCurrentPage = () => {
    navigator.clipboard.writeText(currentText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setFile(null);
    setPages([]);
    setAiResponse(null);
    setError(null);
    setSearchQuery("");
    setAiPrompt("");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-border/50">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20">
            Foxit Fast Reader & AI Studio
          </Badge>
          <span className="text-xs text-muted-foreground">
            Ultra-fast document reading, full text indexing, OCR viewer & AI intelligence
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
            dragOver ? "border-red-500 bg-red-500/5 scale-[0.99]" : "border-border/60 hover:border-red-500/40 bg-card/50"
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); e.dataTransfer.files[0] && loadFile(e.dataTransfer.files[0]); }}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 ring-1 ring-red-500/20 text-red-600">
            <Zap className="h-7 w-7" />
          </div>
          <h3 className="font-semibold text-base mb-1">Open PDF with Foxit Speed</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
            Instant client-side text indexing, real-time keyword search, and integrated AI document summaries & Q&A.
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf,.pdf"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && loadFile(e.target.files[0])}
          />
          <Button size="sm" className="rounded-xl gap-2 pointer-events-none bg-red-600 hover:bg-red-700 text-white">
            <Upload className="h-4 w-4" /> Open PDF
          </Button>
        </div>
      )}

      {loading && (
        <div className="py-12 text-center space-y-3">
          <div className="animate-spin h-8 w-8 border-3 border-red-500 border-t-transparent rounded-full mx-auto" />
          <p className="text-sm text-muted-foreground">Indexing document pages with Foxit engine...</p>
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

      {file && pages.length > 0 && (
        <div className="space-y-6">
          {/* Header Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-card border border-border/50 shadow-xs">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-500/10 text-red-600 shrink-0">
                <FileText className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm truncate">{file.name}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                  <span>•</span>
                  <span>{pages.length} page(s) indexed</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={handleExportText} className="rounded-xl gap-1.5 text-xs">
                <FileDown className="h-3.5 w-3.5" /> Export TXT
              </Button>
              <Button size="sm" onClick={handleExportDocx} className="rounded-xl gap-1.5 text-xs bg-red-600 hover:bg-red-700 text-white">
                <Download className="h-3.5 w-3.5" /> Export Word (.docx)
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 7 Cols: Document Reader & Search */}
            <div className="lg:col-span-7 space-y-4">
              <Card className="border-border/50">
                <CardContent className="p-4 space-y-3">
                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search keywords across all pages..."
                      className="pl-9 rounded-xl text-xs h-9"
                    />
                    {searchQuery && (
                      <span className="absolute right-3 top-2.5 text-[11px] text-muted-foreground">
                        {matchingPages.length} page(s) match
                      </span>
                    )}
                  </div>

                  {/* Matching Pages chips if searching */}
                  {searchQuery && matchingPages.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 text-xs">
                      <span className="text-muted-foreground">Found on:</span>
                      {matchingPages.map((mp) => (
                        <button
                          key={mp.index}
                          onClick={() => setCurrentPageIndex(mp.index)}
                          className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-all ${
                            currentPageIndex === mp.index
                              ? "bg-red-600 text-white"
                              : "bg-muted hover:bg-muted/80 text-foreground"
                          }`}
                        >
                          P.{mp.pageNum}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Page Navigation & Copy */}
                  <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={currentPageIndex === 0}
                        onClick={() => setCurrentPageIndex((prev) => Math.max(0, prev - 1))}
                        className="h-8 w-8 p-0 rounded-lg"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="font-medium">
                        Page {currentPageIndex + 1} of {pages.length}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={currentPageIndex === pages.length - 1}
                        onClick={() => setCurrentPageIndex((prev) => Math.min(pages.length - 1, prev + 1))}
                        className="h-8 w-8 p-0 rounded-lg"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCopyCurrentPage}
                      className="h-8 gap-1.5 rounded-lg text-xs"
                    >
                      {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                      {copied ? "Copied!" : "Copy Page Text"}
                    </Button>
                  </div>

                  {/* Text Content Area */}
                  <div className="p-4 rounded-xl bg-muted/20 border border-border/40 min-h-[360px] max-h-[500px] overflow-y-auto font-sans text-xs leading-relaxed whitespace-pre-wrap selection:bg-red-500/20">
                    {currentText.trim() ? (
                      currentText
                    ) : (
                      <span className="text-muted-foreground italic">
                        No selectable text found on this page (likely a scanned image or empty page).
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right 5 Cols: AI Document Intelligence */}
            <div className="lg:col-span-5 space-y-4">
              <Card className="border-border/50 bg-linear-to-b from-red-500/5 to-transparent">
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 text-red-600">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-xs">AI Document Intelligence</h4>
                      <p className="text-[11px] text-muted-foreground">2 credits per query</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={aiLoading}
                      onClick={() => handleRunAi("summary")}
                      className="rounded-xl text-xs h-9 justify-start gap-1.5 hover:border-red-500/50"
                    >
                      <BookOpen className="h-3.5 w-3.5 text-red-500 shrink-0" />
                      Executive Summary
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={aiLoading}
                      onClick={() => handleRunAi("actions")}
                      className="rounded-xl text-xs h-9 justify-start gap-1.5 hover:border-red-500/50"
                    >
                      <Zap className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                      Action Items
                    </Button>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-border/40">
                    <p className="text-xs font-medium">Ask Document Anything:</p>
                    <div className="flex gap-2">
                      <Input
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        placeholder="What are the main risks discussed?"
                        onKeyDown={(e) => e.key === "Enter" && !aiLoading && handleRunAi("qa")}
                        className="rounded-xl text-xs h-9"
                      />
                      <Button
                        size="sm"
                        disabled={aiLoading || !aiPrompt.trim()}
                        onClick={() => handleRunAi("qa")}
                        className="rounded-xl bg-red-600 hover:bg-red-700 text-white shrink-0"
                      >
                        <Send className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  {aiLoading && (
                    <div className="p-6 text-center space-y-2">
                      <div className="animate-spin h-6 w-6 border-2 border-red-500 border-t-transparent rounded-full mx-auto" />
                      <p className="text-xs text-muted-foreground">Analyzing document text...</p>
                    </div>
                  )}

                  {aiResponse && !aiLoading && (
                    <div className="space-y-2 pt-2 border-t border-border/40">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-red-600 dark:text-red-400 flex items-center gap-1">
                          <Bot className="h-3.5 w-3.5" /> AI Response
                        </span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(aiResponse);
                            setCopied(true);
                            setTimeout(() => setCopied(false), 2000);
                          }}
                          className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1"
                        >
                          <Copy className="h-3 w-3" /> {copied ? "Copied" : "Copy"}
                        </button>
                      </div>
                      <div className="p-3 rounded-xl bg-background border border-border/50 text-xs leading-relaxed max-h-[300px] overflow-y-auto whitespace-pre-wrap">
                        {aiResponse}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}