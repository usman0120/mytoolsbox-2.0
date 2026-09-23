"use client";

import { useState, useCallback, useMemo } from "react";
import {
  FileText,
  Download,
  Copy,
  Check,
  Trash2,
  Loader2,
  Sparkles,
  RefreshCw,
  Type,
  AlignLeft,
  ArrowRightLeft,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const STORAGE_KEY_INPUT = "mytoolsbox-paragraph-rewriter-input";

function loadInput(): string {
  try {
    return localStorage.getItem(STORAGE_KEY_INPUT) || "";
  } catch {
    return "";
  }
}

function saveInput(text: string) {
  localStorage.setItem(STORAGE_KEY_INPUT, text);
}

type RewriteStyle = "fluent" | "formal" | "casual" | "creative" | "simplified" | "persuasive";

const STYLE_DESCRIPTIONS: Record<RewriteStyle, string> = {
  fluent: "Improve sentence flow, transitions, and natural readability while preserving original meaning.",
  formal: "Elevate vocabulary for executive proposals, business communications, and academic papers.",
  casual: "Convert stiff phrasing into a friendly, approachable, and engaging conversational tone.",
  creative: "Enrich with vivid adjectives, dynamic verbs, and engaging metaphoric expressions.",
  simplified: "Strip unnecessary fluff and complex jargon for direct, crystal-clear comprehension.",
  persuasive: "Sharpen calls-to-action, conviction, and compelling rhetoric to drive user action.",
};

function generateVariations(text: string, style: RewriteStyle): { text: string; label: string }[] {
  if (!text.trim()) return [];

  const sentences = text.match(/[^.!?\n]+[.!?\n]*/g) || [text];

  const build = (mapper: (s: string) => string) =>
    sentences.map((s) => mapper(s.trim())).filter(Boolean).join(" ");

  switch (style) {
    case "formal":
      return [
        {
          label: "Executive Professional",
          text: build((s) =>
            s
              .replace(/\b(get|got)\b/gi, "obtain")
              .replace(/\b(start|begin)\b/gi, "commence")
              .replace(/\b(end|finish)\b/gi, "conclude")
              .replace(/\b(help)\b/gi, "assist")
              .replace(/\b(need)\b/gi, "require")
              .replace(/\b(show)\b/gi, "demonstrate")
              .replace(/\b(use)\b/gi, "utilize")
              .replace(/\b(about)\b/gi, "regarding")
              .replace(/\b(a lot of|lots of)\b/gi, "a substantial volume of")
              .replace(/\b(I think|I believe)\b/gi, "It is our assessment that")
          ),
        },
        {
          label: "Authoritative & Direct",
          text: build((s) =>
            s
              .replace(/\b(can|could)\b/gi, "shall")
              .replace(/\b(good)\b/gi, "advantageous")
              .replace(/\b(bad)\b/gi, "adverse")
              .replace(/\b(make)\b/gi, "establish")
              .replace(/\b(talk about)\b/gi, "address")
          ),
        },
      ];

    case "casual":
      return [
        {
          label: "Conversational & Friendly",
          text: build((s) =>
            s
              .replace(/\b(obtain|acquire)\b/gi, "get")
              .replace(/\b(commence|initiate)\b/gi, "start")
              .replace(/\b(conclude|terminate)\b/gi, "wrap up")
              .replace(/\b(assist|facilitate)\b/gi, "help out")
              .replace(/\b(utilize|employ)\b/gi, "use")
              .replace(/\b(regarding|concerning)\b/gi, "about")
              .replace(/\b(however|nevertheless)\b/gi, "but")
              .replace(/\b(therefore|consequently)\b/gi, "so")
          ),
        },
        {
          label: "Breezy & Relatable",
          text: build((s) =>
            s
              .replace(/\b(in addition|furthermore)\b/gi, "plus,")
              .replace(/\b(subsequently)\b/gi, "then")
              .replace(/\b(significant)\b/gi, "huge")
              .replace(/\b(difficult)\b/gi, "tough")
          ),
        },
      ];

    case "creative":
      return [
        {
          label: "Evocative & Descriptive",
          text: build((s) =>
            s
              .replace(/\b(is|was)\s+(\w+)\b/gi, "$1 remarkably $2")
              .replace(/\b(good|nice|great)\b/gi, "exceptional")
              .replace(/\b(important)\b/gi, "pivotal")
              .replace(/\b(fast)\b/gi, "lightning-quick")
          ),
        },
        {
          label: "Vibrant & Dynamic",
          text: build((s) =>
            s
              .replace(/\b(make|create)\b/gi, "bring to life")
              .replace(/\b(change)\b/gi, "transform")
              .replace(/\b(grow)\b/gi, "flourish")
          ),
        },
      ];

    case "simplified":
      return [
        {
          label: "Plain English (Jargon-Free)",
          text: build((s) =>
            s
              .replace(/\b(in order to)\b/gi, "to")
              .replace(/\b(due to the fact that)\b/gi, "because")
              .replace(/\b(at this point in time)\b/gi, "now")
              .replace(/\b(with regard to)\b/gi, "about")
              .replace(/\b(has the capability to)\b/gi, "can")
              .replace(/\b(utilize)\b/gi, "use")
              .replace(/\b(commence)\b/gi, "start")
          ),
        },
        {
          label: "Ultra-Concise",
          text: build((s) =>
            s
              .replace(/\b(very|extremely|really|quite|basically|literally)\s+/gi, "")
              .replace(/\s{2,}/g, " ")
          ),
        },
      ];

    case "persuasive":
      return [
        {
          label: "Action-Driven Pitch",
          text: build((s) =>
            s
              .replace(/\b(maybe|perhaps|possibly)\b/gi, "undoubtedly")
              .replace(/\b(could|might)\b/gi, "will")
              .replace(/\b(should)\b/gi, "must")
              .replace(/\b(try)\b/gi, "seize the opportunity to")
              .replace(/\b(important)\b/gi, "mission-critical")
              .replace(/\b(help)\b/gi, "accelerate")
          ),
        },
        {
          label: "High-Conviction Visionary",
          text: build((s) =>
            s
              .replace(/\b(good)\b/gi, "transformative")
              .replace(/\b(benefit)\b/gi, "decisive competitive advantage")
              .replace(/\b(think)\b/gi, "are convinced that")
          ),
        },
      ];

    default: // fluent
      return [
        {
          label: "Smooth Flow & Rhythm",
          text: build((s) =>
            s
              .replace(/\b(but|however)\b/gi, "however,")
              .replace(/\b(also|in addition)\b/gi, "additionally,")
              .replace(/\b(so|therefore)\b/gi, "consequently,")
              .replace(/\bvery\s+(\w+)\b/gi, (_, w) => {
                const map: Record<string, string> = {
                  good: "superb",
                  bad: "detrimental",
                  big: "substantial",
                  small: "marginal",
                  fast: "rapid",
                };
                return map[w.toLowerCase()] || w;
              })
          ),
        },
        {
          label: "Balanced Clarity",
          text: build((s) =>
            s
              .replace(/\b(because)\b/gi, "since")
              .replace(/\b(show)\b/gi, "illustrate")
              .replace(/\b(many)\b/gi, "numerous")
          ),
        },
      ];
  }
}

export function ParagraphRewriterEngine() {
  const [input, setInput] = useState(() => loadInput());
  const [variations, setVariations] = useState<{ text: string; label: string }[]>([]);
  const [style, setStyle] = useState<RewriteStyle>("fluent");
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const handleInputChange = useCallback((value: string) => {
    setInput(value);
    saveInput(value);
  }, []);

  const handleRewrite = useCallback(async () => {
    if (!input.trim()) {
      toast.error("Please enter some text to rewrite.");
      return;
    }
    setIsProcessing(true);
    const results = generateVariations(input, style);
    setVariations(results);
    setIsProcessing(false);
    toast.success(`Generated rewritten variations in ${style} style!`);
  }, [input, style]);

  const handleCopy = useCallback(async (text: string, idx: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
    toast.success("Copied variation to clipboard!");
  }, []);

  const handleUseAsInput = (text: string) => {
    setInput(text);
    saveInput(text);
    toast.info("Transferred variation into source editor");
  };

  const handleDownload = useCallback((text: string, label: string) => {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rewritten-${label.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded variation!");
  }, []);

  const handleClear = useCallback(() => {
    setInput("");
    setVariations([]);
    localStorage.removeItem(STORAGE_KEY_INPUT);
    toast.info("Cleared.");
  }, []);

  const wordCount = useMemo(
    () => (input.trim() ? input.trim().split(/\s+/).length : 0),
    [input]
  );

  return (
    <div className="space-y-6">
      {/* Style Selector Ribbon */}
      <div className="rounded-xl border bg-card p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Target Rewriting Style
          </Label>
          <span className="text-xs text-muted-foreground font-mono">{wordCount} input words</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {(
            [
              { value: "fluent" as const, icon: RefreshCw, label: "Fluent" },
              { value: "formal" as const, icon: FileText, label: "Formal" },
              { value: "casual" as const, icon: Type, label: "Casual" },
              { value: "creative" as const, icon: Sparkles, label: "Creative" },
              { value: "simplified" as const, icon: AlignLeft, label: "Simplified" },
              { value: "persuasive" as const, icon: Sparkles, label: "Persuasive" },
            ] as const
          ).map(({ value, icon: Icon, label }) => (
            <Button
              key={value}
              variant={style === value ? "default" : "outline"}
              size="sm"
              onClick={() => setStyle(value)}
              className="gap-1.5 h-8 text-xs capitalize"
            >
              <Icon className="h-3.5 w-3.5" /> {label}
            </Button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground pt-1">{STYLE_DESCRIPTIONS[style]}</p>
      </div>

      {/* Input Text Box */}
      <div className="rounded-xl border bg-card p-4 shadow-xs">
        <div className="flex items-center justify-between pb-2 border-b mb-3">
          <label className="text-sm font-semibold">Original Paragraph</label>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            disabled={!input}
            className="gap-1 h-7 text-xs text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" /> Clear
          </Button>
        </div>
        <Textarea
          placeholder="Paste or write any paragraph here to rewrite with improved cadence, clarity, and phrasing..."
          className="min-h-40 font-mono text-xs leading-relaxed"
          value={input}
          onChange={(e) => handleInputChange(e.target.value)}
        />
        <div className="mt-3">
          <Button
            onClick={handleRewrite}
            disabled={!input.trim() || isProcessing}
            className="w-full gap-2 font-medium"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Rewriting Sentences...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" /> Rewrite in {style.charAt(0).toUpperCase() + style.slice(1)} Style
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Generated Variations */}
      {variations.length > 0 && (
        <div className="space-y-4">
          <span className="text-xs font-semibold text-muted-foreground block">
            {variations.length} Rewritten Variations Generated
          </span>

          {variations.map((v, idx) => {
            const vWords = v.text.trim() ? v.text.trim().split(/\s+/).length : 0;
            const diff = vWords - wordCount;

            return (
              <Card key={idx} className="shadow-xs overflow-hidden">
                <CardHeader className="py-2.5 px-4 flex flex-row items-center justify-between border-b bg-muted/20">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-xs font-semibold flex items-center gap-1.5">
                      <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                      Variation {idx + 1}: {v.label}
                    </CardTitle>
                    <span className="text-[11px] text-muted-foreground font-mono ml-2">
                      {vWords} words ({diff >= 0 ? `+${diff}` : diff})
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleUseAsInput(v.text)}
                      className="gap-1 h-7 text-xs text-muted-foreground hover:text-foreground"
                      title="Transfer variation into input editor to refine further"
                    >
                      <ArrowRightLeft className="h-3 w-3" /> Re-use
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(v.text, idx)}
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
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDownload(v.text, v.label)}
                      className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap font-sans">
                    {v.text}
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