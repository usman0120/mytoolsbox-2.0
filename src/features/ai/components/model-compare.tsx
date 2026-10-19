"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MarkdownRenderer } from "./markdown-renderer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bot,
  Zap,
  Clock,
  Trophy,
  Copy,
  Check,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { SignInDialog } from "@/components/auth/signin-dialog";
import { completeViaServer } from "@/lib/ai";
import { toast } from "sonner";
import type { AIProvider } from "@/lib/ai";

interface CompareModelConfig {
  id: string;
  provider: AIProvider;
  model?: string;
  name: string;
  badge: string;
  color: string;
}

const AVAILABLE_COMPARE_MODELS: CompareModelConfig[] = [
  {
    id: "gemini-flash",
    provider: "gemini",
    model: "gemini-2.0-flash",
    name: "Google Gemini",
    badge: "Gemini 2.0 Flash",
    color: "from-blue-500/10 to-cyan-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  },
  {
    id: "groq-llama-70b",
    provider: "groq",
    model: "llama-3.3-70b-versatile",
    name: "Groq Llama 3.3",
    badge: "Llama 3.3 70B",
    color: "from-orange-500/10 to-amber-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
  },
  {
    id: "groq-deepseek-r1",
    provider: "groq",
    model: "deepseek-r1-distill-llama-70b",
    name: "Groq DeepSeek R1",
    badge: "R1 Reasoning 70B",
    color: "from-emerald-500/10 to-teal-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  {
    id: "groq-llama-8b",
    provider: "groq",
    model: "llama-3.1-8b-instant",
    name: "Groq Instant 8B",
    badge: "Llama 3.1 8B Instant",
    color: "from-violet-500/10 to-purple-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
  },
];

interface ModelResult {
  model?: string;
  provider?: string;
  text: string;
  latencyMs: number;
  tokens?: number;
  loading: boolean;
  error?: string;
}

const SAMPLE_COMPARISON_PROMPTS = [
  "Write an efficient TypeScript function to flatten deeply nested arrays with depth limit.",
  "Explain the difference between optimistic updates and pessimistic locking in distributed systems.",
  "Write a polite, firm email declining a client's request for out-of-scope work.",
  "Provide a concise summary of the causes and ramifications of the 2008 financial crisis.",
];

export function ModelCompare() {
  const { user } = useAuth();
  const [prompt, setPrompt] = useState("");
  const [modelA, setModelA] = useState<string>("gemini-flash");
  const [modelB, setModelB] = useState<string>("groq-llama-70b");
  const [isComparing, setIsComparing] = useState(false);
  const [resultA, setResultA] = useState<ModelResult | null>(null);
  const [resultB, setResultB] = useState<ModelResult | null>(null);
  const [winner, setWinner] = useState<"A" | "B" | null>(null);
  const [copiedCard, setCopiedCard] = useState<string | null>(null);
  const [showSignInDialog, setShowSignInDialog] = useState(false);

  const configA =
    AVAILABLE_COMPARE_MODELS.find((m) => m.id === modelA) ||
    AVAILABLE_COMPARE_MODELS[0];
  const configB =
    AVAILABLE_COMPARE_MODELS.find((m) => m.id === modelB) ||
    AVAILABLE_COMPARE_MODELS[1];

  const handleRunComparison = async () => {
    const trimmed = prompt.trim();
    if (!trimmed || isComparing) return;

    if (!user) {
      setShowSignInDialog(true);
      toast.info("Please sign in to compare models. Each successful request uses credits.", {
        duration: 5000,
      });
      return;
    }

    setIsComparing(true);
    setWinner(null);
    setResultA({ text: "", latencyMs: 0, loading: true });
    setResultB({ text: "", latencyMs: 0, loading: true });

    // Run Model A
    const runA = async () => {
      const start = Date.now();
      try {
        const res = await completeViaServer({
          prompt: trimmed,
          provider: configA.provider,
          model: configA.model,
          tier: "cheap",
        });
        if (typeof res.text !== "string" || !res.text.trim()) throw new Error("The provider returned an empty response.");
        setResultA({
          model: res.model,
          provider: res.provider,
          text: res.text,
          latencyMs: Date.now() - start,
          tokens: res.usage?.totalTokens,
          loading: false,
        });
      } catch (err) {
        setResultA({
          text: "",
          latencyMs: Date.now() - start,
          loading: false,
          error: err instanceof Error ? err.message : "Failed to generate",
        });
      }
    };

    // Run Model B
    const runB = async () => {
      const start = Date.now();
      try {
        const res = await completeViaServer({
          prompt: trimmed,
          provider: configB.provider,
          model: configB.model,
          tier: "cheap",
        });
        if (typeof res.text !== "string" || !res.text.trim()) throw new Error("The provider returned an empty response.");
        setResultB({
          model: res.model,
          provider: res.provider,
          text: res.text,
          latencyMs: Date.now() - start,
          tokens: res.usage?.totalTokens,
          loading: false,
        });
      } catch (err) {
        setResultB({
          text: "",
          latencyMs: Date.now() - start,
          loading: false,
          error: err instanceof Error ? err.message : "Failed to generate",
        });
      }
    };

    await Promise.allSettled([runA(), runB()]);
    setIsComparing(false);
  };

  const handleCopy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCard(id);
      toast.success("Copied response to clipboard");
      setTimeout(() => setCopiedCard(null), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <div className="w-full min-w-0 space-y-4">
      {/* Intro Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">Two provider requests. Each successful request uses credits.</p>

        {/* Model Selectors */}
        <div className="flex w-full min-w-0 flex-wrap items-center gap-2 sm:w-auto">
          <Select disabled={isComparing} value={modelA} onValueChange={(val) => { if (val) { setModelA(val); setResultA(null); setResultB(null); setWinner(null); } }}>
            <SelectTrigger aria-label="First model" className="h-10 min-w-0 flex-1 text-xs rounded-md font-medium sm:w-40 sm:flex-none">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl text-xs">
              {AVAILABLE_COMPARE_MODELS.map((m) => (
                <SelectItem key={m.id} value={m.id} disabled={m.id === modelB}>
                  {m.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <span className="text-xs font-bold text-muted-foreground">VS</span>

          <Select disabled={isComparing} value={modelB} onValueChange={(val) => { if (val) { setModelB(val); setResultA(null); setResultB(null); setWinner(null); } }}>
            <SelectTrigger aria-label="Second model" className="h-10 min-w-0 flex-1 text-xs rounded-md font-medium sm:w-40 sm:flex-none">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl text-xs">
              {AVAILABLE_COMPARE_MODELS.map((m) => (
                <SelectItem key={m.id} value={m.id} disabled={m.id === modelA}>
                  {m.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Input Prompt Area */}
      <section className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <textarea
              aria-label="Comparison prompt"
              disabled={isComparing}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter a prompt to test across both models..."
              rows={2}
              className="flex-1 min-w-0 rounded-md border border-input p-3 bg-background text-base resize-y focus:outline-none focus:ring-2 focus:ring-ring leading-relaxed"
            />
            <Button
              onClick={handleRunComparison}
              disabled={!prompt.trim() || isComparing}
              className="h-11 px-4 rounded-md font-medium gap-2 shrink-0"
            >
              {isComparing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Comparing...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  Compare
                </>
              )}
            </Button>
          </div>

          {/* Quick sample prompts */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-1 scrollbar-none">
            <span className="text-[11px] font-medium text-muted-foreground shrink-0">
              Try sample:
            </span>
            {SAMPLE_COMPARISON_PROMPTS.map((sample, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setPrompt(sample)}
                disabled={isComparing}
                className="text-[11px] text-muted-foreground hover:text-foreground bg-muted/50 hover:bg-muted px-2.5 py-1 rounded-full whitespace-nowrap transition-colors"
              >
                {sample.slice(0, 45)}...
              </button>
            ))}
          </div>
      </section>

      {/* Comparison Results Grid */}
      <div className="grid min-w-0 grid-cols-1 md:grid-cols-2 gap-4">
        {/* Model A Result Card */}
        <Card
          className={`min-w-0 rounded-lg border ${
            winner === "A"
              ? "ring-2 ring-amber-500/50 border-amber-500/40 bg-amber-500/5"
              : "border-border/60 bg-card/60"
          }`}
        >
          <CardHeader className="p-3 border-b border-border/50 flex flex-row flex-wrap items-center justify-between gap-2">
            <div className="flex min-w-0 flex-1 basis-40 items-center gap-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0 wrap-anywhere">
                <CardTitle className="text-sm font-semibold">
                  {configA.name}
                </CardTitle>
                <span className="text-[10px] text-muted-foreground font-mono">
                  {resultA?.model || configA.badge}{resultA?.provider && ` / ${resultA.provider}`}
                </span>
              </div>
            </div>

            <div className="flex max-w-full flex-wrap items-center gap-2">
              {resultA && !resultA.loading && !resultA.error && (
                <>
                  <Badge variant="outline" className="text-[10px] h-5 gap-1 font-mono">
                    <Clock className="h-3 w-3" />
                    {resultA.latencyMs}ms
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Copy first response"
                    title="Copy first response"
                    onClick={() => handleCopy("A", resultA.text)}
                    className="h-7 w-7 rounded-md"
                  >
                    {copiedCard === "A" ? (
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </Button>
                  <Button
                    variant={winner === "A" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setWinner("A")}
                    className="h-7 px-2 text-xs rounded-lg gap-1"
                  >
                    <Trophy className="h-3 w-3 text-amber-500" />
                    {winner === "A" ? "Winner" : "Vote Best"}
                  </Button>
                </>
              )}
            </div>
          </CardHeader>

          <CardContent className="min-w-0 p-3 min-h-64 max-h-[32rem] overflow-auto wrap-anywhere">
            {resultA?.loading ? (
              <div className="flex flex-col items-center justify-center h-48 text-muted-foreground gap-3">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <p className="text-xs">Generating with {configA.name}...</p>
              </div>
            ) : resultA?.error ? (
              <div role="alert" className="p-3 rounded-md bg-destructive/10 text-destructive text-sm wrap-anywhere">
                {resultA.error}
              </div>
            ) : resultA?.text ? (
              <MarkdownRenderer content={resultA.text} />
            ) : (
              <div className="flex items-center justify-center h-48 text-xs text-muted-foreground/60 italic">
                No response yet.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Model B Result Card */}
        <Card
          className={`min-w-0 rounded-lg border ${
            winner === "B"
              ? "ring-2 ring-amber-500/50 border-amber-500/40 bg-amber-500/5"
              : "border-border/60 bg-card/60"
          }`}
        >
          <CardHeader className="p-3 border-b border-border/50 flex flex-row flex-wrap items-center justify-between gap-2">
            <div className="flex min-w-0 flex-1 basis-40 items-center gap-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0 wrap-anywhere">
                <CardTitle className="text-sm font-semibold">
                  {configB.name}
                </CardTitle>
                <span className="text-[10px] text-muted-foreground font-mono">
                  {resultB?.model || configB.badge}{resultB?.provider && ` / ${resultB.provider}`}
                </span>
              </div>
            </div>

            <div className="flex max-w-full flex-wrap items-center gap-2">
              {resultB && !resultB.loading && !resultB.error && (
                <>
                  <Badge variant="outline" className="text-[10px] h-5 gap-1 font-mono">
                    <Clock className="h-3 w-3" />
                    {resultB.latencyMs}ms
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Copy second response"
                    title="Copy second response"
                    onClick={() => handleCopy("B", resultB.text)}
                    className="h-7 w-7 rounded-md"
                  >
                    {copiedCard === "B" ? (
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </Button>
                  <Button
                    variant={winner === "B" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setWinner("B")}
                    className="h-7 px-2 text-xs rounded-lg gap-1"
                  >
                    <Trophy className="h-3 w-3 text-amber-500" />
                    {winner === "B" ? "Winner" : "Vote Best"}
                  </Button>
                </>
              )}
            </div>
          </CardHeader>

          <CardContent className="min-w-0 p-3 min-h-64 max-h-[32rem] overflow-auto wrap-anywhere">
            {resultB?.loading ? (
              <div className="flex flex-col items-center justify-center h-48 text-muted-foreground gap-3">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <p className="text-xs">Generating with {configB.name}...</p>
              </div>
            ) : resultB?.error ? (
              <div role="alert" className="p-3 rounded-md bg-destructive/10 text-destructive text-sm wrap-anywhere">
                {resultB.error}
              </div>
            ) : resultB?.text ? (
              <MarkdownRenderer content={resultB.text} />
            ) : (
              <div className="flex items-center justify-center h-48 text-xs text-muted-foreground/60 italic">
                No response yet.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <SignInDialog
        open={showSignInDialog}
        onOpenChange={setShowSignInDialog}
      />
    </div>
  );
}
