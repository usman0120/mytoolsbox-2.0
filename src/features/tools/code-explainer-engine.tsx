"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Code2, Copy, Check, Trash2, Loader2, Sparkles,
  Lightbulb, BookOpen, GraduationCap, User, ChevronRight,
} from "lucide-react";
import { explainCode, type CodeExplainOutput } from "@/lib/ai/services/code-explainer";
import { getAvailableProviders } from "@/lib/ai";

// ---------------------------------------------------------------------------
// Client-side fallback – basic code analysis
// ---------------------------------------------------------------------------

function basicCodeAnalysis(code: string, language?: string): CodeExplainOutput {
  const lines = code.split("\n");
  const lineByLine = lines.map((line, i) => {
    const trimmed = line.trim();
    let explanation = "";

    if (!trimmed) {
      explanation = "Empty line";
    } else if (/^(import|require|from|include|using)\b/i.test(trimmed)) {
      explanation = "Imports or includes external modules/dependencies";
    } else if (/^(export|module\.exports)\b/i.test(trimmed)) {
      explanation = "Exports this for use in other modules";
    } else if (/^(function|def|func|fn|class|interface|type|struct|enum)\b/i.test(trimmed)) {
      explanation = `Declares a ${/^class/.test(trimmed) ? "class" : "function"}`;
    } else if (/^(const|let|var|val|int|string|bool|float|double)\b/i.test(trimmed)) {
      explanation = "Variable declaration";
    } else if (/^(if|else|elif|switch|match)\b/i.test(trimmed)) {
      explanation = "Conditional logic";
    } else if (/^(for|while|do|foreach|loop)\b/i.test(trimmed)) {
      explanation = "Loop construct";
    } else if (/^(return|yield|break|continue)\b/i.test(trimmed)) {
      explanation = "Control flow statement";
    } else if (/^(try|catch|except|finally|throw|raise)\b/i.test(trimmed)) {
      explanation = "Error handling";
    } else if (/^(\/\/|#|--|\/\*|\*|<!--|%)\b/.test(trimmed)) {
      explanation = "Comment";
    } else if (trimmed) {
      explanation = "Statement or expression";
    }

    return { line: i + 1, code: line, explanation };
  });

  // Detect concepts
  const concepts: string[] = [];
  const codeLower = code.toLowerCase();
  if (/\b(class|interface|extends|implements|inheritance)\b/.test(codeLower)) concepts.push("Object-Oriented Programming");
  if (/\b(async|await|promise|then|callback|future)\b/.test(codeLower)) concepts.push("Asynchronous Programming");
  if (/\b(function|def|fn|=>|lambda)\b/.test(codeLower)) concepts.push("Functions");
  if (/\b(for|while|loop|map|filter|reduce|forEach)\b/.test(codeLower)) concepts.push("Iteration");
  if (/\b(try|catch|except|throw|error)\b/.test(codeLower)) concepts.push("Error Handling");
  if (/\b(import|require|export|module)\b/.test(codeLower)) concepts.push("Modules");
  if (/\b(array|list|object|dict|map|set|vector)\b/.test(codeLower)) concepts.push("Data Structures");

  return {
    summary: `This ${language || "code"} snippet contains ${lines.length} lines. It appears to ${concepts.length > 0 ? "involve " + concepts.slice(0, 3).join(", ") : "perform basic operations"}. Use AI for a detailed explanation.`,
    lineByLine,
    concepts,
    suggestions: ["Use AI-powered explanation for detailed line-by-line analysis and improvement suggestions."],
  };
}

// ---------------------------------------------------------------------------
// Engine Component
// ---------------------------------------------------------------------------

type Audience = "beginner" | "intermediate" | "expert";

const AUDIENCES: { id: Audience; label: string; icon: typeof User }[] = [
  { id: "beginner", label: "Beginner", icon: GraduationCap },
  { id: "intermediate", label: "Intermediate", icon: BookOpen },
  { id: "expert", label: "Expert", icon: Lightbulb },
];

const LANGUAGES = [
  "auto", "javascript", "typescript", "python", "java", "c", "cpp", "csharp",
  "go", "rust", "ruby", "php", "swift", "kotlin", "sql", "html", "css",
  "bash", "yaml", "json", "xml",
];

export function CodeExplainerEngine() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<CodeExplainOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [audience, setAudience] = useState<Audience>("intermediate");
  const [language, setLanguage] = useState("auto");
  const [activeTab, setActiveTab] = useState("summary");
  const [error, setError] = useState<string | null>(null);

  const hasAIProvider = getAvailableProviders().length > 0;

  const handleExplain = useCallback(async () => {
    if (!input.trim()) return;
    setIsLoading(true);
    setError(null);

    try {
      if (hasAIProvider) {
        const result = await explainCode({
          code: input.trim(),
          language: language === "auto" ? undefined : language,
          audience,
        });
        setResult(result);
      } else {
        setResult(basicCodeAnalysis(input.trim(), language === "auto" ? undefined : language));
      }
    } catch {
      setResult(basicCodeAnalysis(input.trim(), language === "auto" ? undefined : language));
      setError("AI service unavailable. Showing basic analysis.");
    } finally {
      setIsLoading(false);
    }
  }, [input, language, audience, hasAIProvider]);

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setInput("");
    setResult(null);
    setError(null);
  };

  return (
    <div className="space-y-4">
      {/* Settings */}
      <div className="flex gap-2 flex-wrap items-center">
        {AUDIENCES.map((a) => (
          <Button
            key={a.id}
            variant={audience === a.id ? "default" : "outline"}
            size="sm"
            onClick={() => setAudience(a.id)}
            className="gap-1.5"
          >
            <a.icon className="h-3.5 w-3.5" />
            {a.label}
          </Button>
        ))}
        <div className="w-px h-6 bg-border mx-1" />
        <span className="text-xs text-muted-foreground">Language:</span>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="text-sm border rounded-md px-2 py-1.5 bg-background"
        >
          {LANGUAGES.map((l) => (
            <option key={l} value={l}>{l === "auto" ? "Auto-detect" : l === "cpp" ? "C++" : l === "csharp" ? "C#" : l.charAt(0).toUpperCase() + l.slice(1)}</option>
          ))}
        </select>
        {hasAIProvider && (
          <Badge className="bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20 gap-1 ml-auto">
            <Sparkles className="h-3 w-3" />AI Ready
          </Badge>
        )}
      </div>

      {/* Input */}
      <Textarea
        placeholder="Paste your code here to get an explanation..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={10}
        className="font-mono text-sm"
      />

      {/* Actions */}
      <div className="flex gap-2">
        <Button onClick={handleExplain} disabled={!input.trim() || isLoading} className="gap-2">
          {isLoading ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Explaining...</>
          ) : (
            <><Code2 className="h-4 w-4" /> Explain {hasAIProvider ? "with AI" : "Code"}</>
          )}
        </Button>
        <Button variant="outline" onClick={handleClear} disabled={!input && !result} className="gap-1.5">
          <Trash2 className="h-4 w-4" /> Clear
        </Button>
      </div>

      {error && (
        <p className="text-sm text-amber-500">{error}</p>
      )}

      {/* Results */}
      {result && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="summary" className="gap-1.5">
              <Lightbulb className="h-3.5 w-3.5" /> Summary
            </TabsTrigger>
            <TabsTrigger value="linebyline" className="gap-1.5">
              <ChevronRight className="h-3.5 w-3.5" /> Line by Line
            </TabsTrigger>
            <TabsTrigger value="concepts" className="gap-1.5">
              <BookOpen className="h-3.5 w-3.5" /> Concepts
            </TabsTrigger>
            <TabsTrigger value="suggestions" className="gap-1.5">
              <Lightbulb className="h-3.5 w-3.5" /> Tips
            </TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="mt-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" /> Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">{result.summary}</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="linebyline" className="mt-4">
            <div className="space-y-1 max-h-[500px] overflow-y-auto">
              {result.lineByLine.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Line-by-line analysis not available. Use AI for detailed breakdown.</p>
              ) : (
                result.lineByLine.map((item, i) => (
                  <div key={i} className="flex gap-3 p-2 rounded hover:bg-muted/30 text-sm">
                    <span className="text-muted-foreground w-8 text-right shrink-0 font-mono text-xs pt-0.5">
                      {item.line}
                    </span>
                    <code className="font-mono text-xs shrink-0 min-w-[120px] max-w-[300px] truncate">
                      {item.code}
                    </code>
                    <span className="text-muted-foreground text-xs flex-1">
                      {item.explanation}
                    </span>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="concepts" className="mt-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BookOpen className="h-4 w-4" /> Programming Concepts
                </CardTitle>
              </CardHeader>
              <CardContent>
                {result.concepts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No specific concepts detected.</p>
                ) : (
                  <div className="flex gap-2 flex-wrap">
                    {result.concepts.map((concept, i) => (
                      <Badge key={i} variant="secondary">{concept}</Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="suggestions" className="mt-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" /> Improvement Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {result.suggestions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No suggestions available.</p>
                ) : (
                  <div className="space-y-2">
                    {result.suggestions.map((suggestion, i) => (
                      <p key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-amber-500 shrink-0 mt-0.5">•</span> {suggestion}
                      </p>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}