"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  SpellCheck2, Copy, Check, Trash2, Loader2, Sparkles,
  AlertTriangle, Lightbulb, Type, ChevronRight, Wand2, Download,
} from "lucide-react";
import { checkGrammar, type GrammarIssue } from "@/lib/ai/services/grammar-checker";
import { getAvailableProviders } from "@/lib/ai";
import { toast } from "sonner";

// ---------------------------------------------------------------------------
// Client-side fallback – basic spell/grammar checks
// ---------------------------------------------------------------------------

interface BasicIssue {
  type: "spelling" | "grammar" | "style" | "punctuation";
  original: string;
  suggestion: string;
  explanation: string;
  offset: number;
  length: number;
}

const COMMON_MISTAKES: { pattern: RegExp; replacement: string; explanation: string; type: BasicIssue["type"] }[] = [
  { pattern: /\btheir\s+going\b/gi, replacement: "they're going", explanation: '"Their" is possessive; use "they\'re" (they are).', type: "grammar" },
  { pattern: /\byour\s+going\b/gi, replacement: "you're going", explanation: '"Your" is possessive; use "you\'re" (you are).', type: "grammar" },
  { pattern: /\bits\s+a\b/gi, replacement: "it's a", explanation: '"Its" is possessive; use "it\'s" (it is).', type: "grammar" },
  { pattern: /\bwould of\b/gi, replacement: "would have", explanation: '"Would of" is incorrect; use "would have".', type: "grammar" },
  { pattern: /\bcould of\b/gi, replacement: "could have", explanation: '"Could of" is incorrect; use "could have".', type: "grammar" },
  { pattern: /\bshould of\b/gi, replacement: "should have", explanation: '"Should of" is incorrect; use "should have".', type: "grammar" },
  { pattern: /\baffect\s+(\w+)\b/gi, replacement: "effect $1", explanation: '"Affect" is usually a verb; "effect" is usually a noun.', type: "grammar" },
  { pattern: /\b(?:alot)\b/gi, replacement: "a lot", explanation: '"Alot" is not a word; use "a lot".', type: "spelling" },
  { pattern: /\b(?:recieve)\b/gi, replacement: "receive", explanation: 'Spelling: "i before e except after c".', type: "spelling" },
  { pattern: /\b(?:seperate)\b/gi, replacement: "separate", explanation: 'Common misspelling of "separate".', type: "spelling" },
  { pattern: /\b(?:definately|definitley)\b/gi, replacement: "definitely", explanation: 'Common misspelling of "definitely".', type: "spelling" },
  { pattern: /\b(?:occured|ocurred)\b/gi, replacement: "occurred", explanation: 'Common misspelling of "occurred".', type: "spelling" },
];

function basicGrammarCheck(text: string): { correctedText: string; issues: BasicIssue[] } {
  let corrected = text;
  const issues: BasicIssue[] = [];

  for (const mistake of COMMON_MISTAKES) {
    const match = mistake.pattern.exec(text);
    if (match) {
      issues.push({
        type: mistake.type,
        original: match[0],
        suggestion: match[0].replace(mistake.pattern, mistake.replacement),
        explanation: mistake.explanation,
        offset: match.index,
        length: match[0].length,
      });
      corrected = corrected.replace(mistake.pattern, mistake.replacement);
      mistake.pattern.lastIndex = 0; // Reset regex state
    }
  }

  // Check for double spaces
  const doubleSpaceRegex = /  +/g;
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
  corrected = corrected.replace(/  +/g, " ");

  // Check for missing capital letter at start
  if (text.length > 0 && /^[a-z]/.test(text.trimStart())) {
    const trimmedStart = text.trimStart();
    const offset = text.indexOf(trimmedStart);
    issues.push({
      type: "punctuation",
      original: trimmedStart[0],
      suggestion: trimmedStart[0].toUpperCase(),
      explanation: "Sentence should start with a capital letter.",
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
  const [error, setError] = useState<string | null>(null);

  const hasAIProvider = getAvailableProviders().length > 0;

  const handleCheck = useCallback(async () => {
    if (!input.trim()) return;
    setIsLoading(true);
    setError(null);

    try {
      if (hasAIProvider) {
        const result = await checkGrammar({ text: input.trim(), mode });
        setOutput(result.correctedText);
        setIssues(result.issues);
        setSummary(result.summary);
      } else {
        // Fallback to basic client-side checks
        const result = basicGrammarCheck(input.trim());
        setOutput(result.correctedText);
        setIssues(result.issues as GrammarIssue[]);
        setSummary(
          result.issues.length > 0
            ? `Found ${result.issues.length} potential issue(s).`
            : "No common issues detected. Use AI for deeper analysis."
        );
      }
    } catch (err) {
      // AI failed, fall back to basic
      const result = basicGrammarCheck(input.trim());
      setOutput(result.correctedText);
      setIssues(result.issues as GrammarIssue[]);
      setSummary("AI unavailable. Basic check completed.");
      setError("AI service unavailable. Showing basic results.");
    } finally {
      setIsLoading(false);
    }
  }, [input, mode, hasAIProvider]);

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Copied to clipboard!");
  };

  const handleDownload = () => {
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `grammar-checked-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded!");
  };

  const handleClear = () => {
    setInput("");
    setOutput("");
    setIssues([]);
    setSummary("");
    setError(null);
  };

  const issueTypeIcon = (type: string) => {
    switch (type) {
      case "spelling": return <Type className="h-3.5 w-3.5 text-red-500" />;
      case "grammar": return <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />;
      case "style": return <Lightbulb className="h-3.5 w-3.5 text-blue-500" />;
      case "punctuation": return <ChevronRight className="h-3.5 w-3.5 text-purple-500" />;
      default: return <AlertTriangle className="h-3.5 w-3.5" />;
    }
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
        placeholder="Paste your text here to check for grammar, spelling, and style issues..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={8}
        className="font-mono text-sm"
      />

      {/* Actions */}
      <div className="flex gap-2">
        <Button onClick={handleCheck} disabled={!input.trim() || isLoading} className="gap-2">
          {isLoading ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Checking...</>
          ) : (
            <><SpellCheck2 className="h-4 w-4" /> Check {hasAIProvider ? "with AI" : "Text"}</>
          )}
        </Button>
        <Button variant="outline" onClick={handleClear} disabled={!input && !output} className="gap-1.5">
          <Trash2 className="h-4 w-4" /> Clear
        </Button>
      </div>

      {error && (
        <p className="text-sm text-amber-500 flex items-center gap-1.5">
          <AlertTriangle className="h-3.5 w-3.5" /> {error}
        </p>
      )}

      {/* Results */}
      {(output || issues.length > 0) && (
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v ?? "")}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="corrected" className="gap-1.5">
              <Check className="h-3.5 w-3.5" /> Corrected
            </TabsTrigger>
            <TabsTrigger value="issues" className="gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5" /> Issues ({issues.length})
            </TabsTrigger>
            <TabsTrigger value="compare" className="gap-1.5">
              <Wand2 className="h-3.5 w-3.5" /> Compare
            </TabsTrigger>
          </TabsList>

          <TabsContent value="corrected" className="mt-4 space-y-3">
            {summary && (
              <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                <Lightbulb className="h-3.5 w-3.5" /> {summary}
              </p>
            )}
            <Card>
              <CardContent className="p-4">
                <pre className="font-mono text-sm whitespace-pre-wrap">{output}</pre>
              </CardContent>
            </Card>
            <Button variant="outline" size="sm" onClick={() => handleCopy(output)} className="gap-1.5">
              {copied ? <><Check className="h-3.5 w-3.5" /> Copied</> : <><Copy className="h-3.5 w-3.5" /> Copy</>}
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownload} className="gap-1.5">
              <Download className="h-3.5 w-3.5" /> Download
            </Button>
          </TabsContent>

          <TabsContent value="issues" className="mt-4 space-y-2">
            {issues.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No issues found! 🎉</p>
            ) : (
              issues.map((issue, i) => (
                <Card key={i} className="border-l-2 border-l-amber-500">
                  <CardContent className="p-3">
                    <div className="flex items-start gap-2">
                      {issueTypeIcon(issue.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-[10px] capitalize">{issue.type}</Badge>
                          <span className="text-sm line-through text-red-500">{issue.original}</span>
                          <ChevronRight className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm text-green-600 dark:text-green-400 font-medium">{issue.suggestion}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{issue.explanation}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="compare" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">Original</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="font-mono text-sm whitespace-pre-wrap">{input}</pre>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-green-600 dark:text-green-400">Corrected</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="font-mono text-sm whitespace-pre-wrap">{output}</pre>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}