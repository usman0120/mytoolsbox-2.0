"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, Check, Loader2, Sparkles, Bug, AlertTriangle, Lightbulb, ArrowRight } from "lucide-react";
import { explainError, type ErrorExplainerOutput } from "@/lib/ai/services/error-explainer";
import { getAvailableProviders } from "@/lib/ai";

function basicErrorExplain(error: string): ErrorExplainerOutput {
  const errorLower = error.toLowerCase();

  if (errorLower.includes("cannot read propert") || errorLower.includes("undefined")) {
    return {
      summary: "Cannot read property of undefined/null",
      cause: "You're trying to access a property on a variable that is undefined or null.",
      solution: "Check if the variable exists before accessing its properties. Use optional chaining (?.) or add a null check.",
      codeExample: "// Before\nobj.property.subproperty\n\n// After\nobj?.property?.subproperty",
      severity: "high",
      relatedErrors: ["TypeError: Cannot read properties of null", "TypeError: undefined is not an object"],
    };
  }

  if (errorLower.includes("network") || errorLower.includes("fetch")) {
    return {
      summary: "Network request failed",
      cause: "The network request could not be completed. This could be due to CORS, network connectivity, or server issues.",
      solution: "Check your network connection, verify the URL is correct, ensure CORS is configured on the server, and check if the server is running.",
      severity: "high",
      relatedErrors: ["TypeError: Failed to fetch", "NetworkError when attempting to fetch resource"],
    };
  }

  return {
    summary: "Error analysis unavailable offline",
    cause: "Could not analyze this error without AI.",
    solution: "Enable AI for detailed error analysis. In the meantime, search for this error message online.",
    severity: "medium",
    relatedErrors: [],
  };
}

const SEVERITY_COLORS: Record<string, string> = {
  low: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  medium: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  high: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  critical: "bg-red-500/10 text-red-600 border-red-500/20",
};

export function AIErrorExplainerEngine() {
  const [errorInput, setErrorInput] = useState("");
  const [language, setLanguage] = useState("");
  const [context, setContext] = useState("");
  const [result, setResult] = useState<ErrorExplainerOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");

  const hasAIProvider = getAvailableProviders().length > 0;

  const handleExplain = useCallback(async () => {
    if (!errorInput.trim()) return;
    setIsLoading(true);
    setError("");
    try {
      if (hasAIProvider) {
        const r = await explainError({
          error: errorInput.trim(),
          language: language || undefined,
          context: context || undefined,
        });
        setResult(r);
      } else {
        setResult(basicErrorExplain(errorInput.trim()));
      }
    } catch {
      setResult(basicErrorExplain(errorInput.trim()));
      setError("AI service unavailable. Showing basic result.");
    }
    setIsLoading(false);
  }, [errorInput, language, context, hasAIProvider]);

  const handleCopy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(""), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label className="text-xs">Error Message</Label>
        <Textarea
          placeholder="Paste your error message here..."
          value={errorInput}
          onChange={(e) => setErrorInput(e.target.value)}
          className="min-h-20 font-mono text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1.5">
          <Label className="text-xs">Language / Environment</Label>
          <Input
            placeholder="e.g. JavaScript, Python, React"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Code Context (optional)</Label>
          <Input
            placeholder="What were you doing?"
            value={context}
            onChange={(e) => setContext(e.target.value)}
          />
        </div>
      </div>

      <Button onClick={handleExplain} disabled={isLoading} className="w-full gap-2">
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bug className="h-4 w-4" />}
        Explain Error
      </Button>

      {error && <p className="text-xs text-amber-500">{error}</p>}

      {result && (
        <div className="space-y-3 animate-fade-in-up">
          {/* Severity + Summary */}
          <Card className={SEVERITY_COLORS[result.severity] || ""}>
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                <Badge variant="outline" className="text-xs capitalize">{result.severity} severity</Badge>
              </div>
              <p className="font-semibold">{result.summary}</p>
            </CardContent>
          </Card>

          {/* Cause */}
          {result.cause && (
            <Card>
              <CardContent className="p-3">
                <p className="text-xs font-medium mb-1">Root Cause</p>
                <p className="text-sm text-muted-foreground">{result.cause}</p>
              </CardContent>
            </Card>
          )}

          {/* Solution */}
          {result.solution && (
            <Card className="border-green-500/20">
              <CardContent className="p-3 space-y-2">
                <p className="text-xs font-medium text-green-600">Solution</p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{result.solution}</p>
                {result.codeExample && (
                  <div className="relative">
                    <pre className="text-xs font-mono bg-muted p-3 rounded-lg overflow-x-auto whitespace-pre-wrap">
                      {result.codeExample}
                    </pre>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-1 right-1 h-7 gap-1"
                      onClick={() => handleCopy(result.codeExample!, "code")}
                    >
                      {copied === "code" ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Related Errors */}
          {result.relatedErrors.length > 0 && (
            <Card>
              <CardContent className="p-3 space-y-1.5">
                <p className="text-xs font-medium">Related Errors</p>
                {result.relatedErrors.map((e, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ArrowRight className="h-3 w-3 shrink-0" />
                    <code className="text-xs">{e}</code>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}