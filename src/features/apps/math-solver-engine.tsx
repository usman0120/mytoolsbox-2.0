"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Sigma, Send, Trash2, Copy, Download, History, Calculator,
  FunctionSquare, Pi, Superscript, Divide, X, Check, Sparkles,
  ChevronRight, Lightbulb, BookOpen, RotateCcw, Loader2,
  Image, Camera, BarChart3, Target, Brain, TrendingUp,
  ScanLine, Maximize2, Minimize2, ChevronDown, ChevronUp,
} from "lucide-react";
import { solveMath as aiSolveMath } from "@/lib/ai/services/math-solver";
import { getAvailableProviders } from "@/lib/ai";
import { solveMath, type MathSolution, type GraphData } from "@/lib/math/engine";
import { MathGraph } from "./math-graph";
import { MathImageUpload } from "./math-image-upload";
import { RelatedContent } from "./math-related-content";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Solution {
  id: string;
  input: string;
  result: string;
  steps: string[];
  topic: string;
  timestamp: number;
  graphData?: GraphData;
  relatedConcepts: string[];
  practiceQuestions: { question: string; answer: string; difficulty: "easy" | "medium" | "hard" }[];
  isAI: boolean;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const EXAMPLE_PROBLEMS = [
  { text: "Solve: 2x² + 5x - 3 = 0", topic: "Algebra" },
  { text: "Find derivative: f(x) = x³sin(x)", topic: "Calculus" },
  { text: "Integrate: ∫(3x² + 2x)dx", topic: "Calculus" },
  { text: "Solve: sin(2θ) = cos(θ)", topic: "Trigonometry" },
  { text: "Calculate: P(X>2) for Poisson(λ=3)", topic: "Statistics" },
  { text: "What is 15% of 200?", topic: "Arithmetic" },
];

const MATH_SYMBOLS = [
  { symbol: "x²", label: "Square" },
  { symbol: "x³", label: "Cube" },
  { symbol: "√", label: "Root" },
  { symbol: "π", label: "Pi" },
  { symbol: "∫", label: "Integral" },
  { symbol: "d/dx", label: "Derivative" },
  { symbol: "Σ", label: "Sum" },
  { symbol: "θ", label: "Theta" },
  { symbol: "±", label: "Plus-Minus" },
  { symbol: "∞", label: "Infinity" },
  { symbol: "≤", label: "≤" },
  { symbol: "≥", label: "≥" },
  { symbol: "≠", label: "≠" },
  { symbol: "≈", label: "≈" },
  { symbol: "→", label: "→" },
  { symbol: "∴", label: "Therefore" },
];

// ---------------------------------------------------------------------------
// Engine
// ---------------------------------------------------------------------------

export function MathSolverEngine() {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<Solution[]>([]);
  const [currentSolution, setCurrentSolution] = useState<Solution | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("solve");
  const [showSymbols, setShowSymbols] = useState(false);
  const [showGraph, setShowGraph] = useState(true);
  const [stepReveal, setStepReveal] = useState<Set<number>>(new Set());
  const [copiedStep, setCopiedStep] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const animatingSolutionRef = useRef<string | undefined>(undefined);
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  // Reveal steps one by one with animation (imperative timers via effect)
  useEffect(() => {
    if (!currentSolution || currentSolution.id === animatingSolutionRef.current) return;
    // Clear previous timers
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    animatingSolutionRef.current = currentSolution.id;
    setStepReveal(new Set());
    if (currentSolution.steps.length > 0) {
      currentSolution.steps.forEach((_, i) => {
        timersRef.current.push(setTimeout(() => {
          setStepReveal((prev) => new Set([...prev, i]));
        }, i * 200 + 300));
      });
    }
    return () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };
  }, [currentSolution]);

  // -----------------------------------------------------------------------
  // Handlers
  // -----------------------------------------------------------------------

  const handleSolve = useCallback(async () => {
    if (!input.trim()) return;
    setIsLoading(true);

    const hasAIProvider = getAvailableProviders().length > 0;

    try {
      if (hasAIProvider) {
        // Use AI service for real math solving
        const aiResult = await aiSolveMath({ problem: input.trim(), showSteps: true });
        const solution: Solution = {
          id: Date.now().toString(),
          input: input.trim(),
          result: aiResult.solution,
          steps: aiResult.steps.length > 0 ? aiResult.steps : [aiResult.explanation],
          topic: "AI Solved",
          timestamp: Date.now(),
          relatedConcepts: [],
          practiceQuestions: [],
          isAI: true,
        };
        setCurrentSolution(solution);
        setHistory((prev) => [solution, ...prev].slice(0, 20));
        setActiveTab("solution");
      } else {
        // Use client-side math engine
        await new Promise((r) => setTimeout(r, 400));
        const mathResult = solveMath(input);
        const solution: Solution = {
          id: Date.now().toString(),
          input: input.trim(),
          result: mathResult.result,
          steps: mathResult.steps,
          topic: mathResult.topic,
          timestamp: Date.now(),
          graphData: mathResult.graphData,
          relatedConcepts: mathResult.relatedConcepts,
          practiceQuestions: mathResult.practiceQuestions,
          isAI: false,
        };
        setCurrentSolution(solution);
        setHistory((prev) => [solution, ...prev].slice(0, 20));
        setActiveTab("solution");
      }
    } catch {
      // AI failed, fall back to client-side engine
      const mathResult = solveMath(input);
      const solution: Solution = {
        id: Date.now().toString(),
        input: input.trim(),
        result: mathResult.result,
        steps: mathResult.steps,
        topic: mathResult.topic,
        timestamp: Date.now(),
        graphData: mathResult.graphData,
        relatedConcepts: mathResult.relatedConcepts,
        practiceQuestions: mathResult.practiceQuestions,
        isAI: false,
      };
      setCurrentSolution(solution);
      setHistory((prev) => [solution, ...prev].slice(0, 20));
      setActiveTab("solution");
    } finally {
      setIsLoading(false);
    }
  }, [input]);

  const handleExample = (text: string) => {
    setInput(text);
    setActiveTab("solve");
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSolve();
    }
  };

  const handleSymbol = (symbol: string) => {
    setInput((prev) => prev + symbol);
    inputRef.current?.focus();
  };

  const handleImageText = (text: string) => {
    setInput(text);
    setActiveTab("solve");
  };

  const handleTryQuestion = (question: string) => {
    setInput(question);
    setActiveTab("solve");
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const copyToClipboard = (text: string, label?: string) => {
    navigator.clipboard.writeText(text);
    if (label) {
      setCopiedStep(label);
      setTimeout(() => setCopiedStep(null), 1500);
    }
  };

  const downloadSolution = () => {
    if (!currentSolution) return;
    const content = [
      `Math Solution - MyToolsBox`,
      ``,
      `Problem: ${currentSolution.input}`,
      `Topic: ${currentSolution.topic}`,
      ``,
      `Step-by-step Solution:`,
      ...currentSolution.steps.map((s, i) => `  ${i + 1}. ${s}`),
      ``,
      `Result: ${currentSolution.result}`,
      ``,
      `Solved at: ${new Date(currentSolution.timestamp).toLocaleString()}`,
    ].join("\n");

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `math-solution-${currentSolution.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v ?? "")}>
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="solve" className="gap-1.5">
            <Calculator className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Solve</span>
          </TabsTrigger>
          <TabsTrigger value="solution" className="gap-1.5" disabled={!currentSolution}>
            <FunctionSquare className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Solution</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-1.5" disabled={history.length === 0}>
            <History className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">History</span>
          </TabsTrigger>
        </TabsList>

        {/* ================================================================ */}
        {/* SOLVE TAB */}
        {/* ================================================================ */}
        <TabsContent value="solve" className="space-y-4 mt-4">
          {/* Image Upload */}
          <MathImageUpload onTextExtracted={handleImageText} isProcessing={isLoading} />

          {/* Input Area */}
          <div className="space-y-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Sigma className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a math problem... e.g., Solve: 2x² + 5x - 3 = 0"
                  className="pl-10 pr-4 h-12 text-base font-mono"
                />
              </div>
              <Button
                onClick={() => setShowSymbols(!showSymbols)}
                variant="outline"
                size="icon"
                className="h-12 w-12 shrink-0"
                title="Math symbols"
              >
                <Pi className="h-5 w-5" />
              </Button>
              <Button onClick={handleSolve} disabled={!input.trim() || isLoading} size="lg" className="gap-2 h-12">
                {isLoading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Solving...</>
                ) : (
                  <><Send className="h-4 w-4" /> Solve</>
                )}
              </Button>
            </div>

            {/* Math Symbols Panel */}
            {showSymbols && (
              <div className="rounded-xl border border-border/50 bg-muted/20 p-3 animate-fade-in-up">
                <div className="flex flex-wrap gap-1.5">
                  {MATH_SYMBOLS.map((sym) => (
                    <Button
                      key={sym.symbol}
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2.5 text-sm font-mono hover:bg-cyan-500/10 hover:text-cyan-600"
                      onClick={() => handleSymbol(sym.symbol)}
                      title={sym.label}
                    >
                      {sym.symbol}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Example Problems */}
            <div>
              <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                <Lightbulb className="h-3 w-3" /> Try an example:
              </p>
              <div className="flex flex-wrap gap-2">
                {EXAMPLE_PROBLEMS.map((ex, i) => (
                  <Badge
                    key={i}
                    variant="secondary"
                    className="cursor-pointer hover:bg-secondary/80 transition-colors py-1.5 px-3"
                    onClick={() => handleExample(ex.text)}
                  >
                    {ex.text.length > 40 ? ex.text.slice(0, 40) + "..." : ex.text}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ================================================================ */}
        {/* SOLUTION TAB */}
        {/* ================================================================ */}
        <TabsContent value="solution" className="mt-4 space-y-4">
          {currentSolution && (
            <>
              {/* Solution Card */}
              <Card className="border-cyan-500/20 bg-linear-to-br from-cyan-500/5 to-blue-500/5 overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10">
                        <FunctionSquare className="h-4 w-4 text-cyan-500" />
                      </div>
                      <div>
                        <CardTitle className="text-base">Solution</CardTitle>
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-muted-foreground">{currentSolution.topic}</p>
                          {currentSolution.isAI && (
                            <Badge className="text-[10px] h-4 px-1.5 bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20 rounded-full">
                              <Sparkles className="h-2.5 w-2.5 mr-0.5" />AI
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyToClipboard(
                          currentSolution.result + "\n\n" + currentSolution.steps.join("\n"),
                          "solution"
                        )}
                        title="Copy solution"
                      >
                        {copiedStep === "solution" ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                      <Button variant="ghost" size="icon" onClick={downloadSolution} title="Download">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Problem */}
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground mb-1">Problem</p>
                    <p className="font-mono text-sm">{currentSolution.input}</p>
                  </div>

                  {/* Steps with animated reveal */}
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                      <BookOpen className="h-3 w-3" /> Step-by-step
                    </p>
                    <div className="space-y-2">
                      {currentSolution.steps.map((step, i) => (
                        <div
                          key={i}
                          className={`flex gap-3 items-start transition-all duration-300 ${
                            stepReveal.has(i)
                              ? "opacity-100 translate-x-0"
                              : "opacity-0 -translate-x-4"
                          }`}
                        >
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-500/10 text-xs font-medium text-cyan-600 dark:text-cyan-400">
                            {i + 1}
                          </div>
                          <p className="text-sm font-mono leading-relaxed pt-0.5 flex-1">{step}</p>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => copyToClipboard(step, `step-${i}`)}
                          >
                            {copiedStep === `step-${i}` ? (
                              <Check className="h-3 w-3 text-green-500" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Result */}
                  <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-4">
                    <p className="text-xs text-green-600 dark:text-green-400 mb-1 font-medium">Result</p>
                    <p className="text-lg font-bold font-mono text-green-700 dark:text-green-300">
                      {currentSolution.result}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Graph */}
              {currentSolution.graphData && (
                <Card className="border-border/50">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-cyan-500" />
                        Graph
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => setShowGraph(!showGraph)}
                      >
                        {showGraph ? (
                          <><Minimize2 className="h-3 w-3 mr-1" /> Hide</>
                        ) : (
                          <><Maximize2 className="h-3 w-3 mr-1" /> Show</>
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  {showGraph && (
                    <CardContent>
                      <MathGraph data={currentSolution.graphData} />
                    </CardContent>
                  )}
                </Card>
              )}

              {/* Related Concepts & Practice */}
              {(currentSolution.relatedConcepts.length > 0 || currentSolution.practiceQuestions.length > 0) && (
                <RelatedContent
                  concepts={currentSolution.relatedConcepts}
                  practiceQuestions={currentSolution.practiceQuestions}
                  onTryQuestion={handleTryQuestion}
                />
              )}
            </>
          )}
        </TabsContent>

        {/* ================================================================ */}
        {/* HISTORY TAB */}
        {/* ================================================================ */}
        <TabsContent value="history" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <History className="h-4 w-4" /> History
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setHistory([]); setCurrentSolution(null); }}
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" /> Clear
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors group"
                    onClick={() => { setCurrentSolution(item); setActiveTab("solution"); }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Badge variant="outline" className="shrink-0 text-xs">
                        {item.topic}
                      </Badge>
                      <span className="text-sm truncate">{item.input}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {item.isAI && (
                        <Sparkles className="h-3 w-3 text-violet-500 shrink-0" />
                      )}
                      <span className="text-xs text-muted-foreground shrink-0">
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}