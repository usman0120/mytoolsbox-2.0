"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, Check, Loader2, Sparkles, FileText, Code2, BookOpen } from "lucide-react";
import { generateDocs, type DocGeneratorOutput } from "@/lib/ai/services/doc-generator";
import { getAvailableProviders } from "@/lib/ai";

function basicDocGenerate(code: string, language?: string): DocGeneratorOutput {
  const lines = code.split("\n");
  const funcMatch = code.match(/(?:function|def|fn|func)\s+(\w+)/);
  const funcName = funcMatch?.[1] || "function";

  return {
    documentedCode: `/**\n * ${funcName} - Brief description\n * @returns {void}\n */\n${code}`,
    summary: `This ${language || "code"} defines a ${funcName} function. Use AI for detailed documentation.`,
    parameters: [],
    returns: { type: "unknown", description: "" },
    examples: [],
  };
}

const LANGUAGES = ["auto", "javascript", "typescript", "python", "java", "go", "rust", "ruby", "php", "csharp", "swift", "kotlin"];
const STYLES = ["auto", "jsdoc", "docstring", "godoc", "rubydoc"];
const DETAILS = ["standard", "brief", "detailed"];

export function AIDocumentationGeneratorEngine() {
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState("auto");
  const [style, setStyle] = useState("auto");
  const [detail, setDetail] = useState("standard");
  const [result, setResult] = useState<DocGeneratorOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");

  const hasAIProvider = getAvailableProviders().length > 0;

  const handleGenerate = useCallback(async () => {
    if (!input.trim()) return;
    setIsLoading(true);
    setError("");
    try {
      if (hasAIProvider) {
        const r = await generateDocs({
          code: input.trim(),
          language: language === "auto" ? undefined : language,
          style: style === "auto" ? undefined : (style as "jsdoc" | "godoc" | "docstring" | "rubydoc"),
          detail: detail as "brief" | "standard" | "detailed",
        });
        setResult(r);
      } else {
        setResult(basicDocGenerate(input.trim(), language === "auto" ? undefined : language));
      }
    } catch {
      setResult(basicDocGenerate(input.trim(), language === "auto" ? undefined : language));
      setError("AI service unavailable. Showing basic result.");
    }
    setIsLoading(false);
  }, [input, language, style, detail, hasAIProvider]);

  const handleCopy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(""), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label className="text-xs">Paste your code</Label>
        <Textarea
          placeholder="function calculateTotal(items) { return items.reduce((sum, i) => sum + i.price, 0); }"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="min-h-37.5 font-mono text-sm"
        />
      </div>

      {/* Options */}
      <div className="flex gap-2 flex-wrap">
        <Select value={language} onValueChange={(v) => setLanguage(v ?? "")}>
          <SelectTrigger className="w-32.5 h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LANGUAGES.map((l) => (
              <SelectItem key={l} value={l} className="text-xs">{l}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={style} onValueChange={(v) => setStyle(v ?? "")}>
          <SelectTrigger className="w-30 h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STYLES.map((s) => (
              <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={detail} onValueChange={(v) => setDetail(v ?? "")}>
          <SelectTrigger className="w-30 h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DETAILS.map((d) => (
              <SelectItem key={d} value={d} className="text-xs">{d}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button onClick={handleGenerate} disabled={isLoading} className="w-full gap-2">
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        Generate Documentation
      </Button>

      {error && <p className="text-xs text-amber-500">{error}</p>}

      {result && (
        <div className="space-y-3 animate-fade-in-up">
          {/* Documented Code */}
          <Card>
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium">Documented Code</Label>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 gap-1"
                  onClick={() => handleCopy(result.documentedCode, "code")}
                >
                  {copied === "code" ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                  Copy
                </Button>
              </div>
              <pre className="text-sm font-mono whitespace-pre-wrap bg-muted p-3 rounded-lg overflow-x-auto max-h-75 overflow-y-auto">
                {result.documentedCode}
              </pre>
            </CardContent>
          </Card>

          {/* Summary */}
          {result.summary && (
            <Card>
              <CardContent className="p-3">
                <p className="text-xs font-medium mb-1">Summary</p>
                <p className="text-sm text-muted-foreground">{result.summary}</p>
              </CardContent>
            </Card>
          )}

          {/* Parameters */}
          {result.parameters.length > 0 && (
            <Card>
              <CardContent className="p-3 space-y-2">
                <p className="text-xs font-medium">Parameters</p>
                {result.parameters.map((p, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <Badge variant="outline" className="font-mono text-xs shrink-0">{p.name}</Badge>
                    <Badge variant="secondary" className="text-xs shrink-0">{p.type}</Badge>
                    <span className="text-muted-foreground">{p.description}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Returns */}
          {result.returns.type && (
            <Card>
              <CardContent className="p-3">
                <p className="text-xs font-medium mb-1">Returns</p>
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="secondary" className="text-xs">{result.returns.type}</Badge>
                  <span className="text-muted-foreground">{result.returns.description}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Examples */}
          {result.examples.length > 0 && (
            <Card>
              <CardContent className="p-3 space-y-2">
                <p className="text-xs font-medium">Examples</p>
                {result.examples.map((ex, i) => (
                  <pre key={i} className="text-xs font-mono bg-muted p-2 rounded whitespace-pre-wrap">
                    {ex}
                  </pre>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}