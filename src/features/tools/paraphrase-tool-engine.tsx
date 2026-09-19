"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PenLine, Copy, Check, Trash2, Loader2, Sparkles,
  ChevronRight, BookOpen, Lightbulb, Minus, Plus, Star,
} from "lucide-react";
import { paraphrase, type ParaphraseVariant } from "@/lib/ai/services/paraphrase-tool";
import { getAvailableProviders } from "@/lib/ai";

// ---------------------------------------------------------------------------
// Client-side fallback – basic synonym-based paraphrasing
// ---------------------------------------------------------------------------

const SYNONYM_MAP: Record<string, string[]> = {
  "good": ["excellent", "great", "fine", "superb", "wonderful"],
  "bad": ["poor", "terrible", "awful", "negative", "unfavorable"],
  "big": ["large", "substantial", "significant", "major", "considerable"],
  "small": ["tiny", "minor", "compact", "limited", "modest"],
  "important": ["crucial", "essential", "vital", "significant", "critical"],
  "help": ["assist", "support", "aid", "facilitate", "guide"],
  "make": ["create", "produce", "generate", "build", "develop"],
  "use": ["utilize", "employ", "apply", "leverage", "operate"],
  "show": ["demonstrate", "display", "reveal", "indicate", "present"],
  "get": ["obtain", "acquire", "receive", "gain", "secure"],
  "say": ["state", "express", "mention", "declare", "articulate"],
  "think": ["believe", "consider", "contemplate", "reflect", "ponder"],
  "very": ["extremely", "highly", "remarkably", "exceptionally", "notably"],
  "thing": ["item", "object", "element", "aspect", "factor"],
  "people": ["individuals", "persons", "citizens", "members", "participants"],
};

function basicParaphrase(text: string): ParaphraseVariant[] {
  const words = text.split(/\b/);
  const variants: ParaphraseVariant[] = [];

  // Variant 1: Synonym replacement
  const synonymVersion = words
    .map((word) => {
      const lower = word.toLowerCase();
      if (SYNONYM_MAP[lower] && Math.random() > 0.5) {
        const synonyms = SYNONYM_MAP[lower];
        return synonyms[Math.floor(Math.random() * synonyms.length)];
      }
      return word;
    })
    .join("");

  variants.push({
    text: synonymVersion,
    style: "Standard",
    description: "Basic synonym replacement",
  });

  // Variant 2: Shortened (remove some adjectives/adverbs)
  const shortened = text
    .replace(/\b(very|really|quite|extremely|highly|absolutely)\s+/gi, "")
    .replace(/\s{2,}/g, " ");
  variants.push({
    text: shortened,
    style: "Shortened",
    description: "Removed intensifiers for conciseness",
  });

  return variants;
}

// ---------------------------------------------------------------------------
// Engine Component
// ---------------------------------------------------------------------------

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

  const hasAIProvider = getAvailableProviders().length > 0;

  const handleParaphrase = useCallback(async () => {
    if (!input.trim()) return;
    setIsLoading(true);
    setError(null);

    try {
      if (hasAIProvider) {
        const result = await paraphrase({ text: input.trim(), mode });
        setVariants(result.variants);
        setBestPick(result.bestPick);
      } else {
        const fallbackVariants = basicParaphrase(input.trim());
        setVariants(fallbackVariants);
        setBestPick(0);
      }
    } catch {
      const fallbackVariants = basicParaphrase(input.trim());
      setVariants(fallbackVariants);
      setBestPick(0);
      setError("AI service unavailable. Showing basic results.");
    } finally {
      setIsLoading(false);
    }
  }, [input, mode, hasAIProvider]);

  const handleCopy = async (text: string, idx: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const handleClear = () => {
    setInput("");
    setVariants([]);
    setBestPick(0);
    setError(null);
  };

  return (
    <div className="space-y-4">
      {/* Mode selector */}
      <div className="flex gap-2 flex-wrap">
        {MODES.map((m) => (
          <Button
            key={m.id}
            variant={mode === m.id ? "default" : "outline"}
            size="sm"
            onClick={() => setMode(m.id)}
            className="gap-1.5"
          >
            <m.icon className="h-3.5 w-3.5" />
            {m.label}
          </Button>
        ))}
        {hasAIProvider && (
          <Badge className="bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20 gap-1 ml-auto">
            <Sparkles className="h-3 w-3" />AI Ready
          </Badge>
        )}
      </div>

      {/* Input */}
      <Textarea
        placeholder="Paste your text here to paraphrase..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={6}
        className="font-mono text-sm"
      />

      {/* Actions */}
      <div className="flex gap-2">
        <Button onClick={handleParaphrase} disabled={!input.trim() || isLoading} className="gap-2">
          {isLoading ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Paraphrasing...</>
          ) : (
            <><PenLine className="h-4 w-4" /> Paraphrase {hasAIProvider ? "with AI" : ""}</>
          )}
        </Button>
        <Button variant="outline" onClick={handleClear} disabled={!input && variants.length === 0} className="gap-1.5">
          <Trash2 className="h-4 w-4" /> Clear
        </Button>
      </div>

      {error && (
        <p className="text-sm text-amber-500">{error}</p>
      )}

      {/* Results */}
      {variants.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {variants.length} variant{variants.length > 1 ? "s" : ""} generated
          </p>
          {variants.map((variant, idx) => (
            <Card key={idx} className={idx === bestPick ? "border-green-500/30" : ""}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-sm flex items-center gap-1.5">
                      {variant.style}
                      {idx === bestPick && (
                        <Star className="h-3.5 w-3.5 text-green-500 fill-green-500" />
                      )}
                    </CardTitle>
                    <Badge variant="outline" className="text-[10px]">{variant.description}</Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(variant.text, idx)}
                    className="gap-1 h-7"
                  >
                    {copiedIdx === idx ? (
                      <><Check className="h-3.5 w-3.5" /> Copied</>
                    ) : (
                      <><Copy className="h-3.5 w-3.5" /> Copy</>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{variant.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}