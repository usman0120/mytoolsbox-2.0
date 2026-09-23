"use client";

import { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import {
  FileText,
  Loader2,
  Copy,
  CheckCircle2,
  Settings2,
  Sparkles,
  Download,
  ListOrdered,
  BookOpen,
  Zap,
  Clock,
  Trash2,
} from "lucide-react";

type SummaryFormat = "paragraph" | "bullets" | "tldr";

export function TextSummarizerEngine() {
  const [input, setInput] = useState("");
  const [summary, setSummary] = useState("");
  const [format, setFormat] = useState<SummaryFormat>("paragraph");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [length, setLength] = useState(30);
  const [copied, setCopied] = useState(false);

  const wordCount = useMemo(
    () => (input.trim() ? input.trim().split(/\s+/).length : 0),
    [input]
  );
  const readingTime = Math.ceil(wordCount / 200);

  const summaryWordCount = useMemo(
    () => (summary.trim() ? summary.trim().split(/\s+/).length : 0),
    [summary]
  );
  const summaryReadingTime = Math.ceil(summaryWordCount / 200);

  const handleSummarize = useCallback(async () => {
    if (!input.trim()) {
      setError("Please enter some text to summarize.");
      return;
    }

    if (input.trim().length < 50) {
      setError("Text is too short to summarize. Please enter at least 50 characters.");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Split sentences cleanly
      const rawSentences = input
        .replace(/([.!?])\s+/g, "$1|")
        .split("|")
        .map((s) => s.trim())
        .filter((s) => s.length > 12);

      if (rawSentences.length <= 2) {
        setSummary(input.trim());
        toast.info("Input text is already short and concise!");
        setIsProcessing(false);
        return;
      }

      // Compute word frequencies excluding common stop-words
      const stopWords = new Set([
        "the", "and", "a", "an", "in", "on", "at", "to", "for", "of", "with",
        "is", "are", "was", "were", "it", "this", "that", "as", "by", "from",
      ]);
      const words = input.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/);
      const wordFreq: Record<string, number> = {};
      for (const w of words) {
        if (w.length > 2 && !stopWords.has(w)) {
          wordFreq[w] = (wordFreq[w] || 0) + 1;
        }
      }

      // Sentence scoring
      const sentenceScores = rawSentences.map((sentence, idx) => {
        const sentenceWords = sentence.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/);
        let score = 0;
        for (const w of sentenceWords) {
          if (wordFreq[w]) {
            score += wordFreq[w];
          }
        }
        // Position bias (earlier sentences often contain topic sentences)
        score += (1 - idx / rawSentences.length) * 2;
        return { sentence, score, idx };
      });

      if (format === "tldr") {
        // Pick absolute top 1 or 2 highest scoring sentences
        sentenceScores.sort((a, b) => b.score - a.score);
        const top = sentenceScores.slice(0, 1);
        setSummary(`TL;DR: ${top[0].sentence}`);
      } else if (format === "bullets") {
        const targetCount = Math.max(3, Math.ceil(rawSentences.length * (length / 100)));
        sentenceScores.sort((a, b) => b.score - a.score);
        const top = sentenceScores.slice(0, targetCount).sort((a, b) => a.idx - b.idx);
        const bulletText = top.map((s) => `• ${s.sentence}`).join("\n\n");
        setSummary(bulletText);
      } else {
        // Narrative paragraph
        const targetCount = Math.max(2, Math.ceil(rawSentences.length * (length / 100)));
        sentenceScores.sort((a, b) => b.score - a.score);
        const top = sentenceScores.slice(0, targetCount).sort((a, b) => a.idx - b.idx);
        const paraText = top.map((s) => s.sentence).join(" ");
        setSummary(paraText);
      }

      toast.success("Text summarized successfully!");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Summarization failed";
      setError(message);
      toast.error("Summarization error: " + message);
    } finally {
      setIsProcessing(false);
    }
  }, [input, length, format]);

  const handleCopy = useCallback(async () => {
    if (!summary) return;
    await navigator.clipboard.writeText(summary);
    setCopied(true);
    toast.success("Copied summary to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  }, [summary]);

  const handleDownload = () => {
    if (!summary) return;
    const blob = new Blob([summary], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `summary-${format}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded summary file!");
  };

  const compressionRate =
    wordCount > 0 ? Math.max(0, Math.round((1 - summaryWordCount / wordCount) * 100)) : 0;

  return (
    <div className="space-y-6">
      {/* Format Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-muted/40 rounded-xl border">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground mr-1">Summary Format:</span>
          <Button
            variant={format === "paragraph" ? "default" : "outline"}
            size="sm"
            onClick={() => setFormat("paragraph")}
            className="h-8 text-xs gap-1.5"
          >
            <BookOpen className="h-3.5 w-3.5" /> Executive Paragraph
          </Button>
          <Button
            variant={format === "bullets" ? "default" : "outline"}
            size="sm"
            onClick={() => setFormat("bullets")}
            className="h-8 text-xs gap-1.5"
          >
            <ListOrdered className="h-3.5 w-3.5" /> Key Bullet Points
          </Button>
          <Button
            variant={format === "tldr" ? "default" : "outline"}
            size="sm"
            onClick={() => setFormat("tldr")}
            className="h-8 text-xs gap-1.5"
          >
            <Zap className="h-3.5 w-3.5" /> TL;DR Quick Bite
          </Button>
        </div>
      </div>

      {/* Input Text Box */}
      <div className="rounded-xl border bg-card p-4 shadow-xs">
        <div className="flex items-center justify-between pb-2 border-b mb-3">
          <label className="text-sm font-semibold">Source Article / Document</label>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-mono flex items-center gap-1">
              <Clock className="h-3 w-3" /> ~{readingTime} min read ({wordCount} words)
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setInput("");
                setSummary("");
              }}
              disabled={!input}
              className="gap-1 h-7 text-xs text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" /> Clear
            </Button>
          </div>
        </div>
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste essays, articles, meeting transcripts, research papers, or documentation here..."
          className="min-h-52 font-mono text-xs leading-relaxed"
        />
      </div>

      {/* Compression Slider */}
      {format !== "tldr" && (
        <Card className="shadow-xs">
          <CardContent className="py-3 px-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold flex items-center gap-1.5">
                  <Settings2 className="h-3.5 w-3.5 text-primary" /> Target Detail Level: {length}% of original
                </span>
                <span className="text-muted-foreground">
                  {length <= 25 ? "Highly Condensed" : length <= 50 ? "Balanced Overview" : "Comprehensive"}
                </span>
              </div>
              <Slider
                value={[length]}
                min={15}
                max={75}
                step={5}
                onValueChange={(v) => setLength(Array.isArray(v) ? v[0] : v)}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <p className="text-xs text-destructive p-2.5 bg-destructive/10 rounded-lg">{error}</p>
      )}

      <Button
        onClick={handleSummarize}
        disabled={!input.trim() || isProcessing}
        className="w-full gap-2 font-medium"
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Distilling Key Insights...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" /> Generate Concise Summary
          </>
        )}
      </Button>

      {/* Output Card */}
      {summary && (
        <div className="rounded-xl border bg-card p-5 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between pb-3 border-b gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">Distilled Summary</span>
              <Badge variant="secondary" className="text-xs font-mono">
                {summaryWordCount} words (~{summaryReadingTime} min read)
              </Badge>
              {compressionRate > 0 && (
                <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs">
                  {compressionRate}% compressed
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" onClick={handleCopy} className="gap-1.5 h-8 text-xs">
                {copied ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied" : "Copy"}
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload} className="gap-1.5 h-8 text-xs">
                <Download className="h-3.5 w-3.5" /> Download
              </Button>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-muted/20 border font-sans text-sm leading-relaxed whitespace-pre-wrap">
            {summary}
          </div>
        </div>
      )}
    </div>
  );
}