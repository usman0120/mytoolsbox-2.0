"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, Check, Trash2, Loader2, Sparkles, Regex, Play, Plus, X } from "lucide-react";
import { buildRegex, type RegexBuilderOutput } from "@/lib/ai/services/regex-builder";
import { getAvailableProviders } from "@/lib/ai";

function basicRegexBuild(description: string): RegexBuilderOutput {
  const patterns: Record<string, string> = {
    email: "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}",
    url: "https?:\\/\\/[\\w.-]+(?:\\.[\\w.-]+)+[\\w\\-._~:/?#[\\]@!$&'()*+,;=]*",
    phone: "\\+?\\d{1,3}?[-.\\s]?\\(?\\d{1,4}\\)?[-.\\s]?\\d{1,4}[-.\\s]?\\d{1,9}",
    ip: "\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b",
    date: "\\d{4}-\\d{2}-\\d{2}",
  };

  const descLower = description.toLowerCase();
  let pattern = "";
  for (const [key, val] of Object.entries(patterns)) {
    if (descLower.includes(key)) { pattern = val; break; }
  }

  return {
    pattern: pattern || "Could not generate pattern offline. Try with AI enabled.",
    explanation: pattern
      ? `Basic pattern for ${description}. Use AI for more precise patterns.`
      : "No offline pattern available for this description.",
    flags: "gi",
    testResults: [],
  };
}

export function AIRegexBuilderEngine() {
  const [description, setDescription] = useState("");
  const [testCases, setTestCases] = useState<string[]>([""]);
  const [flags, setFlags] = useState("gi");
  const [result, setResult] = useState<RegexBuilderOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");
  const [testInput, setTestInput] = useState("");
  const [testResult, setTestResult] = useState<string[] | null>(null);

  const hasAIProvider = getAvailableProviders().length > 0;

  const handleBuild = useCallback(async () => {
    if (!description.trim()) return;
    setIsLoading(true);
    setError("");
    try {
      if (hasAIProvider) {
        const r = await buildRegex({
          description: description.trim(),
          testCases: testCases.filter(Boolean),
          flags,
        });
        setResult(r);
      } else {
        setResult(basicRegexBuild(description.trim()));
      }
    } catch {
      setResult(basicRegexBuild(description.trim()));
      setError("AI service unavailable. Showing basic result.");
    }
    setIsLoading(false);
  }, [description, testCases, flags, hasAIProvider]);

  const handleCopy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(""), 2000);
  };

  const handleTest = () => {
    if (!result?.pattern || !testInput) return;
    try {
      const regex = new RegExp(result.pattern, result.flags);
      const matches = testInput.match(regex);
      setTestResult(matches ? Array.from(matches) : []);
    } catch {
      setTestResult(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label className="text-xs">Describe what you want to match</Label>
        <Textarea
          placeholder="e.g. Match valid email addresses"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="min-h-[80px]"
        />
      </div>

      {/* Test Cases */}
      <div className="space-y-1.5">
        <Label className="text-xs">Test Cases (optional)</Label>
        {testCases.map((tc, i) => (
          <div key={i} className="flex gap-1">
            <Input
              placeholder={`Test string ${i + 1}`}
              value={tc}
              onChange={(e) => {
                const next = [...testCases];
                next[i] = e.target.value;
                setTestCases(next);
              }}
              className="font-mono text-xs"
            />
            <Button
              size="icon"
              variant="ghost"
              className="h-9 w-9 shrink-0"
              onClick={() => setTestCases(testCases.filter((_, j) => j !== i))}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs gap-1"
          onClick={() => setTestCases([...testCases, ""])}
        >
          <Plus className="h-3 w-3" /> Add test case
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex-1">
          <Label className="text-xs">Flags</Label>
          <Input
            value={flags}
            onChange={(e) => setFlags(e.target.value)}
            className="font-mono text-sm h-8"
            placeholder="gi"
          />
        </div>
        <div className="flex items-end">
          <Button onClick={handleBuild} disabled={isLoading} className="gap-2">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Build Regex
          </Button>
        </div>
      </div>

      {error && <p className="text-xs text-amber-500">{error}</p>}

      {result && (
        <div className="space-y-3 animate-fade-in-up">
          {/* Pattern */}
          <Card className="bg-green-500/5 border-green-500/20">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium">Generated Pattern</Label>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 gap-1"
                  onClick={() => handleCopy(result.pattern, "pattern")}
                >
                  {copied === "pattern" ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                  Copy
                </Button>
              </div>
              <code className="block text-sm font-mono bg-muted p-2 rounded break-all">
                /{result.pattern}/{result.flags}
              </code>
            </CardContent>
          </Card>

          {/* Explanation */}
          {result.explanation && (
            <Card>
              <CardContent className="p-3">
                <p className="text-xs font-medium mb-1">Explanation</p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{result.explanation}</p>
              </CardContent>
            </Card>
          )}

          {/* Live Test */}
          <Card>
            <CardContent className="p-3 space-y-2">
              <p className="text-xs font-medium">Test Your Regex</p>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter test string..."
                  value={testInput}
                  onChange={(e) => setTestInput(e.target.value)}
                  className="font-mono text-sm"
                  onKeyDown={(e) => e.key === "Enter" && handleTest()}
                />
                <Button size="sm" onClick={handleTest} className="gap-1">
                  <Play className="h-3.5 w-3.5" /> Test
                </Button>
              </div>
              {testResult !== null && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    {testResult.length > 0 ? `${testResult.length} match(es)` : "No matches"}
                  </p>
                  {testResult.map((m, i) => (
                    <Badge key={i} variant="secondary" className="font-mono text-xs mr-1 mb-1">
                      {m}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}