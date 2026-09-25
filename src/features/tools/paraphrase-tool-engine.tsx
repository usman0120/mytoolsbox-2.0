"use client";

import { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PenLine,
  Copy,
  Check,
  Trash2,
  Loader2,
  Sparkles,
  ChevronRight,
  BookOpen,
  Lightbulb,
  Minus,
  Plus,
  Star,
  Download,
  ArrowRightLeft,
} from "lucide-react";
import { paraphrase, type ParaphraseVariant } from "@/lib/ai/services/paraphrase-tool";
import { useCredits } from "@/lib/credits/use-credits";
import { toast } from "sonner";

// ---------------------------------------------------------------------------
// Client-side fallback: Smart synonym & phrase restructuring
// ---------------------------------------------------------------------------

const RICH_SYNONYMS: Record<string, string[]> = {
  good: ["exceptional", "superb", "commendable", "optimal", "favorable"],
  bad: ["suboptimal", "unfavorable", "detrimental", "adverse", "inadequate"],
  big: ["substantial", "prominent", "significant", "considerable", "extensive"],
  small: ["modest", "compact", "concise", "marginal", "incremental"],
  important: ["critical", "pivotal", "vital", "essential", "paramount"],
  help: ["facilitate", "assist", "empower", "reinforce", "catalyze"],
  make: ["generate", "synthesize", "construct", "formulate", "establish"],
  use: ["leverage", "utilize", "deploy", "implement", "harness"],
  show: ["illustrate", "demonstrate", "exemplify", "reveal", "indicate"],
  get: ["acquire", "obtain", "derive", "secure", "attain"],
  say: ["articulate", "convey", "emphasize", "assert", "delineate"],
  think: ["assess", "determine", "evaluate", "consider", "hypothesize"],
  very: ["notably", "exceptionally", "remarkably", "substantially"],
  fast: ["rapid", "swift", "expeditious", "accelerated", "nimble"],
  problem: ["challenge", "bottleneck", "obstacle", "impediment", "friction"],
  start: ["commence", "initiate", "embark upon", "launch", "kick-off"],
  end: ["conclude", "culminate", "terminate", "finalize", "wrap up"],
};

function generateOfflineParaphrases(text: string, style: Mode): ParaphraseVariant[] {
  const words = text.split(/\b/);

  // 1. Synonym-enhanced variant
  const synWords = words.map((w) => {
    const l = w.toLowerCase();
    if (RICH_SYNONYMS[l] && Math.random() > 0.4) {
      const candidates = RICH_SYNONYMS[l];
      const rep = candidates[Math.floor(Math.random() * candidates.length)];
      return w[0] === w[0].toUpperCase() ? rep.charAt(0).toUpperCase() + rep.slice(1) : rep;
    }
    return w;
  });
  const synText = synWords.join("");

  // 2. Academic / Formal variant
  const academicText = text
    .replace(/\b(a lot of|lots of)\b/gi, "a substantial volume of")
    .replace(/\b(in order to)\b/gi, "to")
    .replace(/\b(due to the fact that)\b/gi, "inasmuch as")
    .replace(/\b(think that|believe that)\b/gi, "contend that")
    .replace(/\b(good)\b/gi, "advantageous")
    .replace(/\b(bad)\b/gi, "detrimental")
    .replace(/\b(use)\b/gi, "utilize");

  // 3. Concise / Shortened variant
  const shortenedText = text
    .replace(/\b(very|really|quite|extremely|highly|absolutely|literally|basically)\s+/gi, "")
    .replace(/\b(in the process of)\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();

  // 4. Expanded / Descriptive variant
  const expandedText = text
    .replace(/\b(important)\b/gi, "essential and of utmost priority")
    .replace(/\b(help)\b/gi, "provide valuable guidance and assist")
    .replace(/\b(grow)\b/gi, "expand sustainably and thrive");

  const results: ParaphraseVariant[] = [];

  if (style === "shorten") {
    results.push({
      text: shortenedText,
      style: "Concise",
      description: "Trimmed filler words and intensifiers",
    });
    results.push({
      text: synText,
      style: "Alternative",
      description: "Alternative vocabulary",
    });
  } else if (style === "academic") {
    results.push({
      text: academicText,
      style: "Academic",
      description: "Elevated scholarly tone and precise terminology",
    });
    results.push({
      text: synText,
      style: "Refined",
      description: "Formal vocabulary substitution",
    });
  } else if (style === "expand") {
    results.push({
      text: expandedText,
      style: "Comprehensive",
      description: "Elaborated context with deeper descriptive power",
    });
    results.push({
      text: synText,
      style: "Rich",
      description: "Enhanced phrasing",
    });
  } else {
    results.push({
      text: synText,
      style: "Natural Flow",
      description: "Smooth synonym replacement and readability",
    });
    results.push({
      text: academicText,
      style: "Formal Alternative",
      description: "Professional tone variation",
    });
    results.push({
      text: shortenedText,
      style: "Punchy & Direct",
      description: "Direct and fluff-free",
    });
  }

  return results;
}

type Mode = "standard" | "fluent" | "academic" | "creative" | "shorten" | "expand";

const MODES: { id: Mode; label: string; icon: typeof PenLine }[] = [
  { id: "standard", label: "Standard", icon: PenLine },
  { id: "fluent", label: "Fluent", icon: ChevronRight },
  { id: "academic", label: "Academic", icon: BookOpen },
  { id: "creative", label: "Creative", icon: Lightbulb },
  { id: "shorten", label: "Shorten", icon: Minus },
  { id: "expand", label: "Expand", icon: Plus },
];

export function ParaphraseToolEngine() {
  const [input, setInput] = useState("");
  const [variants, setVariants] = useState<ParaphraseVariant[]>([]);
  const [bestPick, setBestPick] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [mode, setMode] = useState<Mode>("standard");
  const [error, setError] = useState<string | null>(null);
  const { refresh } = useCredits();

  const handleParaphrase = useCallback(async () => {
    if (!input.trim()) return;
    setIsLoading(true);
    setError(null);

    try {
      const result = await paraphrase({ text: input.trim(), mode });
      setVariants(result.variants);
      setBestPick(result.bestPick);
      toast.success("Paraphrase generated!");
      await refresh();
    } catch {
      const fallbackVariants = generateOfflineParaphrases(input.trim(), mode);
      setVariants(fallbackVariants);
      setBestPick(0);
      setError("AI service unavailable. Showing offline phrasing variations.");
    } finally {
      setIsLoading(false);
    }
  }, [input, mode, refresh]);

  const handleCopy = async (text: string, idx: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
    toast.success("Copied variation to clipboard!");
  };

  const handleUseAsInput = (text: string) => {
    setInput(text);
    toast.info("Transferred variation into source editor");
  };

  const handleDownloadAll = () => {
    if (variants.length === 0) return;
    const body = variants
      .map((v, i) => `--- Variation ${i + 1} (${v.style}) ---\n${v.text}\n`)
      .join("\n");
    const blob = new Blob([body], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `paraphrased-variations-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded all variations!");
  };

  const handleClear = () => {
    setInput("");
    setVariants([]);
    setBestPick(0);
    setError(null);
  };

  const inputWordCount = input.trim() ? input.trim().split(/\s+/).length : 0;

  return (
    <div className="space-y-5">
      {/* Mode Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-muted/40 rounded-xl border">
        <div className="flex gap-2 flex-wrap items-center">
          <span className="text-xs font-semibold text-muted-foreground mr-1">Rewrite Style:</span>
          {MODES.map((m) => (
            <Button
              key={m.id}
              variant={mode === m.id ? "default" : "outline"}
              size="sm"
              onClick={() => setMode(m.id)}
              className="gap-1.5 h-8 text-xs"
            >
              <m.icon className="h-3.5 w-3.5" />
              {m.label}
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          <Badge className="bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20 gap-1 text-xs">
            <Sparkles className="h-3 w-3" /> AI Powered
          </Badge>
        </div>
      </div>

      {/* Input Textarea Card */}
      <div className="rounded-xl border bg-card p-4 shadow-xs">
        <div className="flex items-center justify-between pb-2 border-b mb-3">
          <label className="text-sm font-semibold">Original Sentence or Paragraph</label>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-mono">
              {inputWordCount} words
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              disabled={!input && variants.length === 0}
              className="gap-1 h-7 text-xs text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" /> Clear
            </Button>
          </div>
        </div>
        <Textarea
          placeholder="Paste or write your text here to generate fresh, articulate paraphrased alternatives..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={6}
          className="font-mono text-sm leading-relaxed"
        />
        <div className="mt-3 flex gap-2">
          <Button onClick={handleParaphrase} disabled={!input.trim() || isLoading} className="gap-2">
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Rewriting Phrasing...
              </>
            ) : (
              <>
                <PenLine className="h-4 w-4" /> Paraphrase Text
              </>
            )}
          </Button>
        </div>
      </div>

      {error && (
        <p className="text-xs text-amber-500 p-2 bg-amber-500/10 rounded-lg">{error}</p>
      )}

      {/* Generated Variations */}
      {variants.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">
              {variants.length} Alternative Variations Generated
            </span>
            <Button variant="outline" size="sm" onClick={handleDownloadAll} className="gap-1 h-7 text-xs">
              <Download className="h-3.5 w-3.5" /> Download All
            </Button>
          </div>

          {variants.map((variant, idx) => {
            const vWords = variant.text.trim() ? variant.text.trim().split(/\s+/).length : 0;
            const wordDiff = vWords - inputWordCount;

            return (
              <Card
                key={idx}
                className={`transition-all ${
                  idx === bestPick
                    ? "border-emerald-500/50 bg-emerald-50/10 dark:bg-emerald-950/10 shadow-xs"
                    : ""
                }`}
              >
                <CardHeader className="pb-2 pt-3 px-4 flex flex-row items-center justify-between border-b">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-xs font-semibold flex items-center gap-1.5">
                      {variant.style}
                      {idx === bestPick && (
                        <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                      )}
                    </CardTitle>
                    <Badge variant="outline" className="text-[10px]">
                      {variant.description}
                    </Badge>
                    <span className="text-[11px] text-muted-foreground font-mono ml-2">
                      {vWords} words ({wordDiff >= 0 ? `+${wordDiff}` : wordDiff})
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleUseAsInput(variant.text)}
                      className="gap-1 h-7 text-xs text-muted-foreground hover:text-foreground"
                      title="Use this variation as new input"
                    >
                      <ArrowRightLeft className="h-3 w-3" /> Re-use
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(variant.text, idx)}
                      className="gap-1 h-7 text-xs"
                    >
                      {copiedIdx === idx ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-500" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" /> Copy
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap font-mono">
                    {variant.text}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}