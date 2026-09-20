"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import {
  FileText, Loader2, Copy, CheckCircle2, Settings2, Sparkles,
} from "lucide-react";

export function TextSummarizerEngine() {
  const [input, setInput] = useState("");
  const [summary, setSummary] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [length, setLength] = useState(30); // percentage of original
  const [copied, setCopied] = useState(false);

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
      // Extractive summarization using sentence scoring
      const sentences = input
        .replace(/([.!?])\s+/g, "$1|")
        .split("|")
        .map((s) => s.trim())
        .filter((s) => s.length > 10);

      if (sentences.length <= 2) {
        setSummary(input.trim());
        toast.success("Text is already concise!");
        setIsProcessing(false);
        return;
      }

      // Calculate word frequencies
      const words = input.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/);
      const wordFreq: Record<string, number> = {};
      for (const w of words) {
        if (w.length > 3) {
          wordFreq[w] = (wordFreq[w] || 0) + 1;
        }
      }

      // Score each sentence
      const sentenceScores = sentences.map((sentence, idx) => {
        const sentenceWords = sentence.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/);
        let score = 0;
        for (const w of sentenceWords) {
          if (wordFreq[w]) {
            score += wordFreq[w] / words.length;
          }
        }
        // Bonus for position (first sentences are often more important)
        score += (1 - idx / sentences.length) * 0.1;
        // Bonus for shorter sentences
        score += Math.min(10 / sentenceWords.length, 0.05);
        return { sentence, score, idx };
      });

      // Sort by score and pick top sentences
      const targetCount = Math.max(2, Math.ceil(sentences.length * (length / 100)));
      sentenceScores.sort((a, b) => b.score - a.score);
      const topSentences = sentenceScores.slice(0, targetCount);

      // Restore original order
      topSentences.sort((a, b) => a.idx - b.idx);

      const result = topSentences.map((s) => s.sentence).join(". ") + ".";
      setSummary(result);
      toast.success("Text summarized successfully!");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Summarization failed";
      setError(message);
      toast.error("Summarization failed: " + message);
    } finally {
      setIsProcessing(false);
    }
  }, [input, length]);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(summary);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  }, [summary]);

  const wordCount = input.trim() ? input.trim().split(/\s+/).length : 0;
  const summaryWordCount = summary.trim() ? summary.trim().split(/\s+/).length : 0;

  return (
    <div className="space-y-4">
      <Badge variant="outline" className="gap-1.5">
        <Sparkles className="h-3.5 w-3.5" /> Text Summarizer
      </Badge>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Enter Text</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste or type your text here to summarize..."
            className="min-h-50"
          />
          <p className="text-xs text-muted-foreground mt-2">
            {wordCount} word{wordCount !== 1 ? "s" : ""} — {input.length} character{input.length !== 1 ? "s" : ""}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="py-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Settings2 className="h-4 w-4" />
              <span className="text-sm font-medium">Summary Length: {length}%</span>
            </div>
            <Slider
              value={[length]}
              min={10}
              max={80}
              step={5}
              onValueChange={([v]) => setLength(v)}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Shorter</span>
              <span>Longer</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="py-3">
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {summary && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Summary</CardTitle>
              <Button variant="ghost" size="sm" onClick={handleCopy} className="gap-1.5">
                {copied ? <CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{summary}</p>
            <p className="text-xs text-muted-foreground mt-2">
              {summaryWordCount} word{summaryWordCount !== 1 ? "s" : ""} — Reduced from {wordCount} words ({Math.round((1 - summaryWordCount / Math.max(wordCount, 1)) * 100)}% reduction)
            </p>
          </CardContent>
        </Card>
      )}

      <Button
        onClick={handleSummarize}
        disabled={!input.trim() || isProcessing}
        className="w-full gap-2"
      >
        {isProcessing ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Summarizing...</>
        ) : (
          <><Sparkles className="h-4 w-4" /> Summarize Text</>
        )}
      </Button>
    </div>
  );
}