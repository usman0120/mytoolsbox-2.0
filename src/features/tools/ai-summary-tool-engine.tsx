"use client";

import { useState, useCallback } from "react";
import {
  FileText, Download, Copy, Check, Trash2, Loader2,
  Sparkles, Zap, AlignLeft, List, FileCode,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useCredits } from "@/lib/credits/use-credits";
import { completeViaServer } from "@/lib/ai";

const STORAGE_KEY = "mytoolsbox-ai-summary";

function loadText(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) || "";
  } catch {
    return "";
  }
}

function saveText(text: string) {
  localStorage.setItem(STORAGE_KEY, text);
}

type SummaryStyle = "concise" | "detailed" | "bullets" | "executive";

function generateSummary(text: string, style: SummaryStyle): string {
  if (!text.trim()) return "";

  const sentences = text.match(/[^.!?\n]+[.!?\n]*/g) || [text];
  const words = text.match(/\b\w+\b/g) || [];

  // Word frequency analysis
  const wordFreq: Record<string, number> = {};
  const stopWords = new Set(["the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "by", "from", "is", "are", "was", "were", "be", "been", "being", "have", "has", "had", "do", "does", "did", "will", "would", "could", "should", "may", "might", "can", "shall", "you", "your", "we", "our", "they", "their", "it", "its", "this", "that", "these", "those", "i", "me", "my", "he", "she", "him", "her", "not", "no", "so", "if", "then", "than", "too", "very", "just", "about", "also"]);

  words.forEach((w) => {
    const lower = w.toLowerCase();
    if (!stopWords.has(lower) && lower.length > 2) {
      wordFreq[lower] = (wordFreq[lower] || 0) + 1;
    }
  });

  const maxFreq = Math.max(...Object.values(wordFreq), 1);
  const keywords = Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([w]) => w);

  // Score sentences
  const scored = sentences.map((sentence, index) => {
    const sentenceWords = sentence.toLowerCase().match(/\b\w+\b/g) || [];
    if (sentenceWords.length === 0) return { sentence: sentence.trim(), score: 0, index };

    const keywordScore = sentenceWords.reduce((sum, w) => sum + (wordFreq[w] || 0) / maxFreq, 0) / sentenceWords.length;
    const positionScore = index < sentences.length * 0.3 ? 0.2 : 0;
    const lengthScore = sentenceWords.length >= 8 && sentenceWords.length <= 35 ? 0.15 : -0.1;

    return { sentence: sentence.trim(), score: keywordScore + positionScore + lengthScore, index };
  });

  const targetCount = style === "concise" ? Math.max(2, Math.round(sentences.length * 0.2))
    : style === "bullets" ? Math.max(3, Math.round(sentences.length * 0.3))
    : style === "executive" ? Math.max(3, Math.round(sentences.length * 0.25))
    : Math.max(3, Math.round(sentences.length * 0.4));

  const topSentences = scored
    .sort((a, b) => b.score - a.score)
    .slice(0, targetCount)
    .sort((a, b) => a.index - b.index)
    .map((s) => s.sentence);

  if (style === "bullets") {
    return `Key Points:\n${topSentences.map((s) => `• ${s}`).join("\n")}`;
  }

  if (style === "executive") {
    const keyFindings = keywords.slice(0, 5).map((k) => k.charAt(0).toUpperCase() + k.slice(1));
    return `Executive Summary:\n\nThis document covers key topics including ${keyFindings.join(", ")}.\n\n${topSentences.join(" ")}`;
  }

  return topSentences.join(" ");
}

export function AISummaryToolEngine() {
  const [input, setInput] = useState(() => loadText());
  const [output, setOutput] = useState("");
  const [style, setStyle] = useState<SummaryStyle>("concise");
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);
  const { refresh } = useCredits();

  const handleInputChange = useCallback((value: string) => {
    setInput(value);
    saveText(value);
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!input.trim()) {
      toast.error("Please enter some text to summarize.");
      return;
    }
    if (input.trim().length < 50) {
      toast.error("Text is too short. Please enter at least 50 characters.");
      return;
    }
    setIsProcessing(true);

    try {
      const stylePrompts: Record<SummaryStyle, string> = {
        concise: "Provide a concise 2-3 sentence executive summary of the core thesis.",
        detailed: "Provide a detailed summary capturing all primary arguments and nuanced takeaways.",
        bullets: "Extract the most important points as clear, impactful bullet points.",
        executive: "Write a high-level executive briefing with core findings and strategic recommendations.",
      };

      const aiRes = await completeViaServer({
        systemPrompt: "You are an expert analyst and executive editor. Generate a clear, well-structured, insightful summary.",
        prompt: `${stylePrompts[style]}\n\nSource Text:\n"""\n${input.trim()}\n"""`,
        tier: "cheap",
        operation: "ai_summary",
        temperature: 0.3,
      });

      if (aiRes?.text) {
        setOutput(aiRes.text.trim());
        toast.success("AI summary generated!");
        await refresh();
      } else {
        throw new Error("Empty response");
      }
    } catch {
      // Deterministic offline fallback
      const result = generateSummary(input, style);
      setOutput(result);
      toast.info("Generated via local engine (offline fallback).");
    } finally {
      setIsProcessing(false);
    }
  }, [input, style, refresh]);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Copied!");
  }, [output]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ai-summary-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded!");
  }, [output]);

  const handleClear = useCallback(() => {
    setInput("");
    setOutput("");
    localStorage.removeItem(STORAGE_KEY);
    toast.success("Cleared.");
  }, []);

  const wordCount = input.trim() ? input.trim().split(/\s+/).length : 0;
  const outputWordCount = output.trim() ? output.trim().split(/\s+/).length : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge className="bg-violet-500/10 text-violet-600 dark:text-violet-400 gap-1">
            <Sparkles className="h-3 w-3" /> AI Summary
          </Badge>
          <span className="text-xs text-muted-foreground">{wordCount} words</span>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={handleDownload} className="gap-1 h-7" disabled={!output}>
            <Download className="h-3.5 w-3.5" /> Download
          </Button>
          <Button variant="ghost" size="sm" onClick={handleClear} className="gap-1 h-7 text-destructive">
            <Trash2 className="h-3.5 w-3.5" /> Clear
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-4 space-y-2">
          <Label className="text-sm font-medium">Input Text</Label>
          <Textarea
            placeholder="Paste or type text to summarize..."
            className="min-h-[200px]"
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
          />
        </CardContent>
      </Card>

      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg flex-wrap">
        <Label className="text-sm font-medium">Style:</Label>
        {([
          { value: "concise" as const, icon: Zap, label: "Concise" },
          { value: "detailed" as const, icon: AlignLeft, label: "Detailed" },
          { value: "bullets" as const, icon: List, label: "Bullet Points" },
          { value: "executive" as const, icon: FileCode, label: "Executive" },
        ]).map(({ value, icon: Icon, label: lbl }) => (
          <Button
            key={value}
            variant={style === value ? "default" : "outline"}
            size="sm"
            onClick={() => setStyle(value)}
            className="gap-1.5"
          >
            <Icon className="h-3.5 w-3.5" /> {lbl}
          </Button>
        ))}
        <Button onClick={handleGenerate} disabled={!input.trim() || isProcessing} className="gap-1.5 ml-auto">
          {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          Generate
        </Button>
      </div>

      {output && (
        <Card>
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Summary</Label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{outputWordCount} words</span>
                <Button variant="ghost" size="sm" onClick={handleCopy} className="gap-1 h-7">
                  {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                  Copy
                </Button>
              </div>
            </div>
            <div className="p-3 bg-muted/30 rounded-md text-sm leading-relaxed whitespace-pre-wrap">
              {output}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}