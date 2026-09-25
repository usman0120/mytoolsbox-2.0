"use client";

import { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  SpellCheck2,
  Copy,
  Check,
  Trash2,
  Loader2,
  Sparkles,
  AlertTriangle,
  Lightbulb,
  Type,
  ChevronRight,
  Wand2,
  Download,
  CheckCheck,
  X,
  FileCheck,
} from "lucide-react";
import { checkGrammar, type GrammarIssue } from "@/lib/ai/services/grammar-checker";
import { useCredits } from "@/lib/credits/use-credits";
import { toast } from "sonner";

// ---------------------------------------------------------------------------
// Client-side rule-based checker
// ---------------------------------------------------------------------------

interface RuleIssue {
  type: "spelling" | "grammar" | "style" | "punctuation";
  original: string;
  suggestion: string;
  explanation: string;
  offset: number;
  length: number;
}

const EXTENDED_MISTAKES: {
  pattern: RegExp;
  replacement: string;
  explanation: string;
  type: RuleIssue["type"];
}[] = [
  { pattern: /\btheir\s+going\b/gi, replacement: "they're going", explanation: '"Their" is possessive; use "they\'re" (they are).', type: "grammar" },
  { pattern: /\byour\s+going\b/gi, replacement: "you're going", explanation: '"Your" is possessive; use "you\'re" (you are).', type: "grammar" },
  { pattern: /\bits\s+a\b/gi, replacement: "it's a", explanation: '"Its" is possessive; use "it\'s" (it is).', type: "grammar" },
  { pattern: /\bwould of\b/gi, replacement: "would have", explanation: '"Would of" is incorrect; use "would have".', type: "grammar" },
  { pattern: /\bcould of\b/gi, replacement: "could have", explanation: '"Could of" is incorrect; use "could have".', type: "grammar" },
  { pattern: /\bshould of\b/gi, replacement: "should have", explanation: '"Should of" is incorrect; use "should have".', type: "grammar" },
  { pattern: /\baffect\s+(the|a|an)\b/gi, replacement: "effect $1", explanation: '"Affect" is usually a verb; "effect" is usually a noun.', type: "grammar" },
  { pattern: /\bthe\s+affect\b/gi, replacement: "the effect", explanation: 'Use "effect" as a noun following an article.', type: "grammar" },
  { pattern: /\bthen\s+(I|we|they|he|she)\b/gi, replacement: "then $1", explanation: 'Check distinction between "than" (comparison) and "then" (time).', type: "grammar" },
  { pattern: /\bmore\s+better\b/gi, replacement: "better", explanation: '"Better" is already comparative; omit "more".', type: "grammar" },
  { pattern: /\bmost\s+best\b/gi, replacement: "best", explanation: '"Best" is already superlative; omit "most".', type: "grammar" },
  { pattern: /\b(very|extremely)\s+unique\b/gi, replacement: "unique", explanation: '"Unique" is absolute and cannot be graded.', type: "style" },
  { pattern: /\bless\s+people\b/gi, replacement: "fewer people", explanation: 'Use "fewer" for countable items like people.', type: "grammar" },
  { pattern: /\bamount\s+of\s+people\b/gi, replacement: "number of people", explanation: 'Use "number of" for countable nouns.', type: "grammar" },
  { pattern: /\blaying\s+down\b/gi, replacement: "lying down", explanation: 'Use "lying" for resting; "laying" requires an object.', type: "grammar" },
  // Common misspellings
  { pattern: /\b(?:alot)\b/gi, replacement: "a lot", explanation: '"Alot" is not a word; use "a lot".', type: "spelling" },
  { pattern: /\b(?:recieve|recieved|recieving)\b/gi, replacement: "receive", explanation: 'Spelling rule: "i before e except after c".', type: "spelling" },
  { pattern: /\b(?:seperate|seperated)\b/gi, replacement: "separate", explanation: 'Common misspelling of "separate".', type: "spelling" },
  { pattern: /\b(?:definately|definitley)\b/gi, replacement: "definitely", explanation: 'Common misspelling of "definitely".', type: "spelling" },
  { pattern: /\b(?:occured|ocurred)\b/gi, replacement: "occurred", explanation: 'Spelling error: double "c" and double "r" in "occurred".', type: "spelling" },
  { pattern: /\b(?:untill)\b/gi, replacement: "until", explanation: 'Spelling error: "until" ends with a single "l".', type: "spelling" },
  { pattern: /\b(?:goverment)\b/gi, replacement: "government", explanation: 'Missing "n" in "government".', type: "spelling" },
  { pattern: /\b(?:tommorrow|tomorow)\b/gi, replacement: "tomorrow", explanation: 'Spelling error: single "m", double "r" in "tomorrow".', type: "spelling" },
  { pattern: /\b(?:accommodate|accomodate)\b/gi, replacement: "accommodate", explanation: 'Double "c" and double "m" in "accommodate".', type: "spelling" },
  { pattern: /\b(?:embarass|embarassed)\b/gi, replacement: "embarrass", explanation: 'Double "r" and double "s" in "embarrass".', type: "spelling" },
  { pattern: /\b(?:truely)\b/gi, replacement: "truly", explanation: 'Drop the "e" in "truly".', type: "spelling" },
  { pattern: /\b(?:loose\s+money)\b/gi, replacement: "lose money", explanation: '"Loose" is untied; use "lose" for misplacing or forfeiting.', type: "spelling" },
  // Repeated words
  { pattern: /\b(\w+)\s+\1\b/gi, replacement: "$1", explanation: "Repeated duplicate word detected.", type: "grammar" },
];

function runClientGrammarCheck(text: string): { correctedText: string; issues: RuleIssue[] } {
  let corrected = text;
  const issues: RuleIssue[] = [];

  for (const rule of EXTENDED_MISTAKES) {
    const match = rule.pattern.exec(text);
    if (match) {
      const suggestion = match[0].replace(rule.pattern, rule.replacement);
      issues.push({
        type: rule.type,
        original: match[0],
        suggestion,
        explanation: rule.explanation,
        offset: match.index,
        length: match[0].length,
      });
      corrected = corrected.replace(rule.pattern, rule.replacement);
      rule.pattern.lastIndex = 0;
    }
  }

  // Consecutive spaces
  const doubleSpaceRegex = /[ \t]{2,}/g;
  let dsMatch: RegExpExecArray | null;
  while ((dsMatch = doubleSpaceRegex.exec(text)) !== null) {
    issues.push({
      type: "style",
      original: dsMatch[0],
      suggestion: " ",
      explanation: "Multiple consecutive spaces detected.",
      offset: dsMatch.index,
      length: dsMatch[0].length,
    });
  }
  corrected = corrected.replace(/[ \t]{2,}/g, " ");

  // Missing capital letter at sentence start
  if (text.length > 0 && /^[a-z]/.test(text.trimStart())) {
    const trimmedStart = text.trimStart();
    const offset = text.indexOf(trimmedStart);
    issues.push({
      type: "punctuation",
      original: trimmedStart[0],
      suggestion: trimmedStart[0].toUpperCase(),
      explanation: "Sentences should start with a capitalized letter.",
      offset,
      length: 1,
    });
    corrected = corrected.trimStart();
    corrected = corrected[0].toUpperCase() + corrected.slice(1);
  }

  return { correctedText: corrected, issues };
}

// ---------------------------------------------------------------------------
// Engine Component
// ---------------------------------------------------------------------------

type Mode = "proofread" | "concise" | "formal" | "casual";

const MODES: { id: Mode; label: string; icon: typeof Wand2 }[] = [
  { id: "proofread", label: "Proofread", icon: SpellCheck2 },
  { id: "concise", label: "Concise", icon: ChevronRight },
  { id: "formal", label: "Formal", icon: Type },
  { id: "casual", label: "Casual", icon: Lightbulb },
];

export function GrammarCheckerEngine() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [issues, setIssues] = useState<GrammarIssue[]>([]);
  const [summary, setSummary] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mode, setMode] = useState<Mode>("proofread");
  const [activeTab, setActiveTab] = useState("corrected");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [error, setError] = useState<string | null>(null);
  const { refresh } = useCredits();

  const handleCheck = useCallback(async () => {
    if (!input.trim()) return;
    setIsLoading(true);
    setError(null);

    try {
      const result = await checkGrammar({ text: input.trim(), mode });
      setOutput(result.correctedText);
      setIssues(result.issues);
      setSummary(result.summary);
      toast.success("Grammar analysis completed!");
      await refresh();
    } catch {
      const result = runClientGrammarCheck(input.trim());
      setOutput(result.correctedText);
      setIssues(result.issues as GrammarIssue[]);
      setSummary("Offline rule check completed.");
      setError("AI service unavailable. Showing offline rule-based results.");
    } finally {
      setIsLoading(false);
    }
  }, [input, mode, refresh]);

  const handleAcceptSingle = (issue: GrammarIssue) => {
    if (!issue.original || !issue.suggestion) return;
    const nextInput = input.replace(issue.original, issue.suggestion);
    setInput(nextInput);
    setIssues((prev) => prev.filter((i) => i !== issue));
    toast.success(`Applied fix: "${issue.suggestion}"`);
  };

  const handleAcceptAll = () => {
    if (!output) return;
    setInput(output);
    setIssues([]);
    toast.success("Applied all suggestions to source text!");
  };

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Copied to clipboard!");
  };

  const handleDownload = () => {
    const blob = new Blob([output || input], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `proofread-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded proofread document!");
  };

  const handleClear = () => {
    setInput("");
    setOutput("");
    setIssues([]);
    setSummary("");
    setError(null);
  };

  const filteredIssues = useMemo(() => {
    if (categoryFilter === "all") return issues;
    return issues.filter((i) => i.type === categoryFilter);
  }, [issues, categoryFilter]);

  const issueTypeIcon = (type: string) => {
    switch (type) {
      case "spelling": return <Type className="h-3.5 w-3.5 text-rose-500" />;
      case "grammar": return <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />;
      case "style": return <Lightbulb className="h-3.5 w-3.5 text-sky-500" />;
      case "punctuation": return <ChevronRight className="h-3.5 w-3.5 text-purple-500" />;
      default: return <AlertTriangle className="h-3.5 w-3.5" />;
    }
  };

  const wordCount = input.trim() ? input.trim().split(/\s+/).length : 0;
  const charCount = input.length;

  return (
    <div className="space-y-5">
      {/* Header ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-muted/40 rounded-xl border">
        <div className="flex gap-2 flex-wrap items-center">
          <span className="text-xs font-semibold text-muted-foreground mr-1">Proofreading Tone:</span>
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
            <Sparkles className="h-3 w-3" /> AI Assistant Connected
          </Badge>
        </div>
      </div>

      {/* Input Textarea */}
      <div className="rounded-xl border bg-card p-4 shadow-xs">
        <div className="flex items-center justify-between pb-2 border-b mb-3">
          <label className="text-sm font-semibold">Your Draft Text</label>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-mono">
              {wordCount} words • {charCount} chars
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              disabled={!input && !output}
              className="gap-1 h-7 text-xs text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" /> Clear
            </Button>
          </div>
        </div>
        <Textarea
          placeholder="Paste or write your text here to check spelling, grammar, flow, and phrasing..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={7}
          className="font-mono text-sm leading-relaxed"
        />
        <div className="mt-3 flex gap-2">
          <Button onClick={handleCheck} disabled={!input.trim() || isLoading} className="gap-2">
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Analyzing Text...
              </>
            ) : (
              <>
                <SpellCheck2 className="h-4 w-4" /> Check Spelling & Grammar
              </>
            )}
          </Button>
        </div>
      </div>

      {error && (
        <p className="text-xs text-amber-500 flex items-center gap-1.5 p-2 bg-amber-500/10 rounded-lg">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" /> {error}
        </p>
      )}

      {/* Results Tabs */}
      {(output || issues.length > 0) && (
        <div className="rounded-xl border bg-card p-4 shadow-xs space-y-4">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v ?? "")}>
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b">
              <TabsList>
                <TabsTrigger value="corrected" className="gap-1.5 text-xs">
                  <Check className="h-3.5 w-3.5 text-emerald-500" /> Corrected Text
                </TabsTrigger>
                <TabsTrigger value="issues" className="gap-1.5 text-xs">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-500" /> Issues ({issues.length})
                </TabsTrigger>
                <TabsTrigger value="compare" className="gap-1.5 text-xs">
                  <Wand2 className="h-3.5 w-3.5" /> Side-by-Side
                </TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-1.5">
                {issues.length > 0 && (
                  <Button variant="default" size="sm" onClick={handleAcceptAll} className="gap-1.5 h-8 text-xs bg-emerald-600 hover:bg-emerald-700">
                    <CheckCheck className="h-3.5 w-3.5" /> Accept All ({issues.length})
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={() => handleCopy(output)} className="gap-1.5 h-8 text-xs">
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Copied" : "Copy"}
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownload} className="gap-1.5 h-8 text-xs">
                  <Download className="h-3.5 w-3.5" /> Download
                </Button>
              </div>
            </div>

            {/* Corrected Content Tab */}
            <TabsContent value="corrected" className="mt-4 space-y-3">
              {summary && (
                <div className="text-xs text-muted-foreground flex items-center gap-1.5 p-2 bg-muted/30 rounded-lg">
                  <Lightbulb className="h-3.5 w-3.5 text-amber-500 shrink-0" /> {summary}
                </div>
              )}
              <div className="p-4 rounded-lg bg-muted/20 border font-mono text-sm whitespace-pre-wrap leading-relaxed">
                {output}
              </div>
            </TabsContent>

            {/* Issues Cards Tab */}
            <TabsContent value="issues" className="mt-4 space-y-3">
              {/* Category Filter Pills */}
              <div className="flex gap-1.5 flex-wrap">
                {["all", "spelling", "grammar", "style", "punctuation"].map((cat) => (
                  <Button
                    key={cat}
                    variant={categoryFilter === cat ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCategoryFilter(cat)}
                    className="capitalize text-xs h-7"
                  >
                    {cat}
                  </Button>
                ))}
              </div>

              {filteredIssues.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No issues found in this category! 🎉
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-2.5">
                  {filteredIssues.map((issue, i) => (
                    <Card key={i} className="border-l-4 border-l-amber-500 shadow-none">
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2.5">
                            {issueTypeIcon(issue.type)}
                            <div>
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <Badge variant="outline" className="text-[10px] capitalize">
                                  {issue.type}
                                </Badge>
                                <span className="text-xs line-through text-rose-500 font-mono bg-rose-50 dark:bg-rose-950/40 px-1 rounded">
                                  {issue.original}
                                </span>
                                <ChevronRight className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold font-mono bg-emerald-50 dark:bg-emerald-950/40 px-1 rounded">
                                  {issue.suggestion}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground">{issue.explanation}</p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAcceptSingle(issue)}
                            className="h-7 text-xs gap-1 hover:border-emerald-500 hover:text-emerald-600 shrink-0"
                          >
                            <Check className="h-3 w-3" /> Apply
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Compare Tab */}
            <TabsContent value="compare" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-semibold text-rose-500 uppercase tracking-wide">
                      Original Text
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="font-mono text-xs whitespace-pre-wrap leading-relaxed text-muted-foreground">
                      {input}
                    </pre>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-semibold text-emerald-500 uppercase tracking-wide">
                      Polished Version
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="font-mono text-xs whitespace-pre-wrap leading-relaxed text-foreground">
                      {output}
                    </pre>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}