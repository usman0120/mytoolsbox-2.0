"use client";

import { useState, useMemo, useRef } from "react";
import {
  TextQuote, Copy, Check, Trash2, Download, Upload,
  BarChart3, Clock, Sparkles, BookOpen, Share2, Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const STOP_WORDS = new Set([
  "the", "be", "to", "of", "and", "a", "in", "that", "have", "i",
  "it", "for", "not", "on", "with", "he", "as", "you", "do", "at",
  "this", "but", "his", "by", "from", "they", "we", "say", "her",
  "she", "or", "an", "will", "my", "one", "all", "would", "there",
  "their", "what", "so", "up", "out", "if", "about", "who", "get",
  "which", "go", "me", "when", "make", "can", "like", "time", "no",
  "just", "him", "know", "take", "people", "into", "year", "your",
  "good", "some", "could", "them", "see", "other", "than", "then",
  "now", "look", "only", "come", "its", "over", "think", "also",
  "back", "after", "use", "two", "how", "our", "work", "first",
  "well", "way", "even", "new", "want", "because", "any", "these",
  "give", "day", "most", "us", "is", "are", "was", "were", "been",
]);

const SOCIAL_LIMITS = [
  { platform: "X (Twitter)", limit: 280, icon: "𝕏" },
  { platform: "LinkedIn Post", limit: 3000, icon: "💼" },
  { platform: "Instagram Caption", limit: 2200, icon: "📸" },
  { platform: "Meta Description", limit: 160, icon: "🔍" },
  { platform: "Google Ad Headline", limit: 30, icon: "📢" },
];

export function WordCounterEngine() {
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);
  const [filterStopWords, setFilterStopWords] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Compute stats
  const stats = useMemo(() => {
    if (!text.trim()) {
      return {
        words: 0,
        characters: 0,
        charactersNoSpaces: 0,
        sentences: 0,
        paragraphs: 0,
        lines: 0,
        readingTimeSec: 0,
        speakingTimeSec: 0,
        avgWordLength: 0,
        avgSentenceLength: 0,
        fleschScore: 0,
        readabilityLabel: "N/A",
      };
    }

    const trimmed = text.trim();
    const wordsArray = trimmed.split(/\s+/).filter((w) => w.length > 0);
    const words = wordsArray.length;
    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, "").length;
    const sentences = Math.max(1, trimmed.split(/[.!?]+/).filter((s) => s.trim().length > 0).length);
    const paragraphs = Math.max(1, trimmed.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length);
    const lines = text.split(/\n/).length;

    // Reading & Speaking times
    const readingTimeSec = Math.round((words / 225) * 60); // 225 wpm
    const speakingTimeSec = Math.round((words / 130) * 60); // 130 wpm

    const avgWordLength = words > 0 ? charactersNoSpaces / words : 0;
    const avgSentenceLength = words > 0 ? words / sentences : 0;

    // Flesch Reading Ease
    // Count approximate syllables
    let syllables = 0;
    for (const word of wordsArray) {
      const clean = word.toLowerCase().replace(/[^a-z]/g, "");
      if (clean.length <= 3) {
        syllables += 1;
      } else {
        const matches = clean.match(/[aeiouy]{1,2}/g);
        syllables += matches ? matches.length : 1;
      }
    }
    const syllablesPerWord = words > 0 ? syllables / words : 1;
    const flesch = 206.835 - 1.015 * avgSentenceLength - 84.6 * syllablesPerWord;
    const fleschScore = Math.max(0, Math.min(100, Math.round(flesch)));

    let readabilityLabel = "Easy (6th Grade)";
    if (fleschScore < 30) readabilityLabel = "Very Difficult (College Graduate)";
    else if (fleschScore < 50) readabilityLabel = "Difficult (College)";
    else if (fleschScore < 60) readabilityLabel = "Fairly Difficult (10th–12th Grade)";
    else if (fleschScore < 70) readabilityLabel = "Plain English (8th–9th Grade)";
    else if (fleschScore < 80) readabilityLabel = "Fairly Easy (7th Grade)";
    else if (fleschScore < 90) readabilityLabel = "Easy (6th Grade)";
    else readabilityLabel = "Very Easy (5th Grade)";

    return {
      words,
      characters,
      charactersNoSpaces,
      sentences,
      paragraphs,
      lines,
      readingTimeSec,
      speakingTimeSec,
      avgWordLength,
      avgSentenceLength,
      fleschScore,
      readabilityLabel,
    };
  }, [text]);

  // Keyword Density
  const keywordDensity = useMemo(() => {
    if (!text.trim()) return [];
    const tokens = text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2);

    const freq: Record<string, number> = {};
    for (const t of tokens) {
      if (filterStopWords && STOP_WORDS.has(t)) continue;
      freq[t] = (freq[t] || 0) + 1;
    }

    const totalCount = tokens.length || 1;
    return Object.entries(freq)
      .map(([word, count]) => ({
        word,
        count,
        density: Math.round((count / totalCount) * 1000) / 10,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [text, filterStopWords]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Text copied to clipboard!");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === "string") {
        setText(content);
        toast.success(`Loaded "${file.name}"`);
      }
    };
    reader.readAsText(file);
  };

  const handleDownloadReport = () => {
    const report = `Word Counter & Text Analytics Report
===================================
Words: ${stats.words.toLocaleString()}
Characters (with spaces): ${stats.characters.toLocaleString()}
Characters (without spaces): ${stats.charactersNoSpaces.toLocaleString()}
Sentences: ${stats.sentences.toLocaleString()}
Paragraphs: ${stats.paragraphs.toLocaleString()}
Lines: ${stats.lines.toLocaleString()}

Reading Time: ${Math.floor(stats.readingTimeSec / 60)}m ${stats.readingTimeSec % 60}s
Speaking Time: ${Math.floor(stats.speakingTimeSec / 60)}m ${stats.speakingTimeSec % 60}s
Average Word Length: ${stats.avgWordLength.toFixed(1)} chars
Average Sentence Length: ${stats.avgSentenceLength.toFixed(1)} words

Flesch Reading Ease: ${stats.fleschScore} / 100
Reading Level: ${stats.readabilityLabel}

Top Keywords:
${keywordDensity.map((k) => ` - ${k.word}: ${k.count} (${k.density}%)`).join("\n")}
===================================
Generated by MyToolsBox.me`;

    const blob = new Blob([report], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `word-count-report-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Report downloaded!");
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    if (m === 0) return `${s}s`;
    return `${m}m ${s}s`;
  };

  return (
    <div className="space-y-6">
      {/* Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Badge variant="outline" className="gap-1.5">
          <TextQuote className="h-3.5 w-3.5 text-primary" /> Professional Word Counter & Readability Analyzer
        </Badge>
        <div className="flex items-center gap-1.5">
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.md,.json,.csv,.rtf"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="gap-1.5 h-7 text-xs"
          >
            <Upload className="h-3.5 w-3.5" /> Upload File
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadReport}
            className="gap-1.5 h-7 text-xs"
            disabled={!text.trim()}
          >
            <Download className="h-3.5 w-3.5" /> Export Report
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="gap-1.5 h-7 text-xs"
            disabled={!text.trim()}
          >
            {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setText("")}
            className="gap-1.5 h-7 text-xs text-destructive hover:bg-destructive/10"
            disabled={!text.trim()}
          >
            <Trash2 className="h-3.5 w-3.5" /> Clear
          </Button>
        </div>
      </div>

      {/* Main Text Area */}
      <div>
        <Textarea
          placeholder="Paste or start typing your text to analyze words, reading level, sentence metrics, and platform character limits in real time..."
          className="min-h-[220px] text-sm leading-relaxed"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </div>

      {/* Primary Analytics Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        <Card className="text-center p-3">
          <p className="text-2xl font-bold text-primary">{stats.words.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Words</p>
        </Card>
        <Card className="text-center p-3">
          <p className="text-2xl font-bold">{stats.characters.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Characters</p>
        </Card>
        <Card className="text-center p-3">
          <p className="text-2xl font-bold">{stats.charactersNoSpaces.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Chars (No Spaces)</p>
        </Card>
        <Card className="text-center p-3">
          <p className="text-2xl font-bold">{stats.sentences.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Sentences</p>
        </Card>
        <Card className="text-center p-3">
          <p className="text-2xl font-bold">{stats.paragraphs.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Paragraphs</p>
        </Card>
        <Card className="text-center p-3">
          <p className="text-2xl font-bold">{stats.lines.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Lines</p>
        </Card>
      </div>

      {/* Secondary Analytics: Readability, Times & Keyword Density */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Readability & Times */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5 text-primary" /> Readability & Time
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-xs text-muted-foreground">Flesch Reading Ease:</span>
              <Badge variant={stats.fleschScore >= 60 ? "default" : "secondary"}>
                {stats.fleschScore} / 100
              </Badge>
            </div>
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-xs text-muted-foreground">Grade Level:</span>
              <span className="text-xs font-medium text-right truncate max-w-[140px]">
                {stats.readabilityLabel}
              </span>
            </div>
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-xs text-muted-foreground">Reading Time:</span>
              <span className="text-xs font-mono font-semibold">{formatSeconds(stats.readingTimeSec)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Speaking Time:</span>
              <span className="text-xs font-mono font-semibold">{formatSeconds(stats.speakingTimeSec)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Top Keywords Density */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1.5">
                <BarChart3 className="h-3.5 w-3.5 text-primary" /> Keyword Density
              </CardTitle>
              <button
                type="button"
                onClick={() => setFilterStopWords(!filterStopWords)}
                className="text-[10px] text-primary hover:underline"
              >
                {filterStopWords ? "Hide stop words" : "Show all"}
              </button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {keywordDensity.length > 0 ? (
              keywordDensity.slice(0, 5).map((k) => (
                <div key={k.word} className="space-y-0.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium truncate">{k.word}</span>
                    <span className="text-muted-foreground text-[11px]">
                      {k.count}× ({k.density}%)
                    </span>
                  </div>
                  <div className="h-1 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${Math.min(100, k.density * 5)}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground text-center py-4">
                Type text to see keyword density.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Social Media Character Limits */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1.5">
              <Share2 className="h-3.5 w-3.5 text-primary" /> Social Media Limits
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {SOCIAL_LIMITS.map((soc) => {
              const remaining = soc.limit - stats.characters;
              const isOver = remaining < 0;
              const pct = Math.min(100, Math.round((stats.characters / soc.limit) * 100));

              return (
                <div key={soc.platform} className="space-y-0.5">
                  <div className="flex justify-between text-xs">
                    <span className="truncate flex items-center gap-1">
                      <span>{soc.icon}</span> {soc.platform}
                    </span>
                    <span
                      className={`font-mono text-[11px] ${
                        isOver ? "text-destructive font-bold" : "text-muted-foreground"
                      }`}
                    >
                      {isOver ? `-${Math.abs(remaining)}` : `${remaining} left`}
                    </span>
                  </div>
                  <div className="h-1 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${isOver ? "bg-destructive" : "bg-primary"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}