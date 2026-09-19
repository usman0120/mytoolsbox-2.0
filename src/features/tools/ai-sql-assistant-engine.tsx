"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Check, Loader2, Sparkles, Database, Lightbulb, Zap, AlignLeft } from "lucide-react";
import { sqlAssist, type SQLAssistantOutput } from "@/lib/ai/services/sql-assistant";
import { getAvailableProviders } from "@/lib/ai";

function basicSQLAssist(query: string, action: string): SQLAssistantOutput {
  if (action === "format") {
    // Basic SQL formatting
    const formatted = query
      .replace(/\s+/g, " ")
      .replace(/\b(SELECT|FROM|WHERE|AND|OR|JOIN|LEFT JOIN|RIGHT JOIN|INNER JOIN|ON|GROUP BY|ORDER BY|HAVING|LIMIT|INSERT|UPDATE|DELETE|SET|VALUES|CREATE|ALTER|DROP)\b/gi, "\n$1")
      .trim();
    return { result: formatted, explanation: "Basic formatting applied. Use AI for better results." };
  }
  return {
    result: query,
    explanation: "AI-powered analysis unavailable. Showing raw query.",
    suggestions: ["Enable AI for detailed analysis and optimization suggestions."],
  };
}

const ACTIONS = [
  { id: "explain", label: "Explain", icon: Lightbulb },
  { id: "optimize", label: "Optimize", icon: Zap },
  { id: "format", label: "Format", icon: AlignLeft },
  { id: "generate", label: "Generate", icon: Sparkles },
] as const;

export function AISQLAssistantEngine() {
  const [input, setInput] = useState("");
  const [action, setAction] = useState<string>("explain");
  const [dialect, setDialect] = useState("");
  const [result, setResult] = useState<SQLAssistantOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");

  const hasAIProvider = getAvailableProviders().length > 0;

  const handleAssist = useCallback(async () => {
    if (!input.trim()) return;
    setIsLoading(true);
    setError("");
    try {
      if (hasAIProvider) {
        const r = await sqlAssist({
          query: input.trim(),
          action: action as any,
          dialect: dialect || undefined,
        });
        setResult(r);
      } else {
        setResult(basicSQLAssist(input.trim(), action));
      }
    } catch {
      setResult(basicSQLAssist(input.trim(), action));
      setError("AI service unavailable. Showing basic result.");
    }
    setIsLoading(false);
  }, [input, action, dialect, hasAIProvider]);

  const handleCopy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(""), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Action Tabs */}
      <div className="flex gap-1.5 flex-wrap">
        {ACTIONS.map((a) => (
          <Button
            key={a.id}
            variant={action === a.id ? "default" : "outline"}
            size="sm"
            onClick={() => { setAction(a.id); setResult(null); }}
            className="gap-1.5"
          >
            <a.icon className="h-3.5 w-3.5" /> {a.label}
          </Button>
        ))}
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">
          {action === "generate" ? "Describe the query you need" : "Enter SQL query"}
        </Label>
        <Textarea
          placeholder={
            action === "generate"
              ? "e.g. Find all users who registered in the last 30 days with their order count"
              : "SELECT * FROM users WHERE created_at > '2024-01-01'"
          }
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="min-h-[120px] font-mono text-sm"
        />
      </div>

      <div className="flex items-center gap-2">
        <div className="flex-1">
          <Label className="text-xs">Dialect (optional)</Label>
          <input
            value={dialect}
            onChange={(e) => setDialect(e.target.value)}
            placeholder="postgresql, mysql, sqlite..."
            className="w-full h-8 rounded-md border bg-transparent px-3 py-1 text-sm font-mono"
          />
        </div>
        <div className="flex items-end">
          <Button onClick={handleAssist} disabled={isLoading} className="gap-2">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />}
            {action === "generate" ? "Generate SQL" : `Run ${action}`}
          </Button>
        </div>
      </div>

      {error && <p className="text-xs text-amber-500">{error}</p>}

      {result && (
        <div className="space-y-3 animate-fade-in-up">
          {/* Main Result */}
          <Card>
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium">Result</Label>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 gap-1"
                  onClick={() => handleCopy(result.result, "result")}
                >
                  {copied === "result" ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                  Copy
                </Button>
              </div>
              <pre className="text-sm font-mono whitespace-pre-wrap bg-muted p-3 rounded-lg overflow-x-auto">
                {result.result}
              </pre>
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

          {/* Suggestions */}
          {result.suggestions && result.suggestions.length > 0 && (
            <Card>
              <CardContent className="p-3 space-y-1.5">
                <p className="text-xs font-medium">Suggestions</p>
                {result.suggestions.map((s, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Lightbulb className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <span>{s}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Optimized Query */}
          {result.optimizedQuery && (
            <Card className="border-green-500/20">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium text-green-600">Optimized Query</Label>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 gap-1"
                    onClick={() => handleCopy(result.optimizedQuery!, "optimized")}
                  >
                    {copied === "optimized" ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                    Copy
                  </Button>
                </div>
                <pre className="text-sm font-mono whitespace-pre-wrap bg-muted p-3 rounded-lg overflow-x-auto">
                  {result.optimizedQuery}
                </pre>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}