"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Copy,
  Check,
  Loader2,
  Sparkles,
  Bug,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  ShieldCheck,
  Code2,
  Coins,
} from "lucide-react";
import { explainError, type ErrorExplainerOutput } from "@/lib/ai/services/error-explainer";
import { useCredits } from "@/lib/credits/use-credits";
import { toast } from "sonner";

interface ErrorRule {
  pattern: RegExp;
  summary: string;
  cause: string;
  solution: string;
  codeExample: string;
  severity: "low" | "medium" | "high" | "critical";
  relatedErrors: string[];
}

const ERROR_RULES: ErrorRule[] = [
  {
    pattern: /cannot read propert|is not a function|undefined is not an object/i,
    summary: "Cannot read property or invoke function on undefined/null",
    cause: "Code attempted to access an object property or invoke a method on a variable that evaluated to `undefined` or `null` (usually asynchronous data not yet loaded).",
    solution: "1. Add optional chaining (`?.`) when accessing nested properties.\n2. Provide default fallback values with nullish coalescing (`?? []`).\n3. Ensure parent data has finished loading before rendering.",
    codeExample: "// Before (Crashes if user or posts is undefined)\nconst list = user.posts.map(p => p.title);\n\n// After (Safe with optional chaining & default)\nconst list = user?.posts?.map(p => p.title) ?? [];",
    severity: "high",
    relatedErrors: ["TypeError: Cannot read properties of null", "TypeError: obj.map is not a function"],
  },
  {
    pattern: /hydration failed|initial ui does not match/i,
    summary: "Next.js / React SSR Hydration Mismatch",
    cause: "The HTML rendered on the server differs from the initial HTML rendered in the client browser during hydration. Common culprits include `window.innerWidth`, `localStorage`, `Date.now()`, or invalid HTML nesting (e.g. `<p>` inside `<p>`).",
    solution: "1. Defer client-only values until after mount using a `useEffect` or `useSyncExternalStore`.\n2. Ensure HTML tags are valid (e.g. no `<div>` inside `<p>`).\n3. Add `suppressHydrationWarning` on timestamp elements if minor differences are acceptable.",
    codeExample: "// Before (Server generates different timestamp than browser)\nreturn <span>{new Date().toLocaleTimeString()}</span>;\n\n// After (Guaranteed mounted client render)\nconst [mounted, setMounted] = useState(false);\nuseEffect(() => setMounted(true), []);\nif (!mounted) return null;\nreturn <span>{new Date().toLocaleTimeString()}</span>;",
    severity: "medium",
    relatedErrors: ["Warning: Text content did not match", "Hydration overlay error"],
  },
  {
    pattern: /modulenotfounderror|cannot find module/i,
    summary: "Missing Dependency / Module Not Found",
    cause: "The Node.js or Python runtime cannot resolve the specified package import path. The library has not been installed in `node_modules` or `site-packages`, or the import relative path has a typo.",
    solution: "1. Run your package manager install command (`npm install <package>` or `pip install <package>`).\n2. Verify the relative file path and casing (Linux is case-sensitive).\n3. Check `tsconfig.json` paths or `PYTHONPATH`.",
    codeExample: "# Terminal command to resolve:\nnpm install <missing-package>\n# or for Python:\npip install <missing-package>",
    severity: "high",
    relatedErrors: ["ModuleNotFoundError: No module named", "ERR_MODULE_NOT_FOUND"],
  },
  {
    pattern: /cors|access-control-allow-origin/i,
    summary: "Cross-Origin Resource Sharing (CORS) Block",
    cause: "The browser's security model prevented an AJAX/fetch request to an external origin because the server response did not include the `Access-Control-Allow-Origin` header.",
    solution: "1. Configure CORS middleware on the server (e.g. `cors()` in Express, `CORSMiddleware` in FastAPI).\n2. For Next.js, proxy the request through a server-side API Route / Route Handler (`src/app/api/...`).\n3. Note: CORS is a browser-only restriction; requests will work via cURL or Postman.",
    codeExample: "// Express.js Server Fix:\nimport cors from 'cors';\napp.use(cors({ origin: 'https://yourfrontend.com' }));",
    severity: "medium",
    relatedErrors: ["NetworkError when attempting to fetch resource", "Preflight response is not successful"],
  },
  {
    pattern: /maximum update depth exceeded|too many re-renders/i,
    summary: "Infinite Re-render Loop (React)",
    cause: "A component state setter function (`setState`) is being invoked directly during render instead of inside an event callback or `useEffect` hook with dependency safeguards.",
    solution: "1. Pass a function reference to `onClick={() => handleClick()}` rather than invoking `onClick={handleClick()}`.\n2. Ensure `useEffect` dependencies do not include state variables that get mutated inside the effect.",
    codeExample: "// Before (Triggers setState immediately during render)\n<button onClick={setCount(count + 1)}>Click</button>\n\n// After (Function reference callback)\n<button onClick={() => setCount(count + 1)}>Click</button>",
    severity: "critical",
    relatedErrors: ["Error: Too many re-renders", "RangeError: Maximum call stack size exceeded"],
  },
  {
    pattern: /econnrefused/i,
    summary: "Connection Refused (ECONNREFUSED)",
    cause: "The client attempted to connect to a TCP host and port (e.g. PostgreSQL, Redis, or localhost API), but nothing is listening on that port or the server process crashed.",
    solution: "1. Verify the target service is running (e.g. `docker ps` or `pg_isready`).\n2. Check host and port parameters (e.g. use `127.0.0.1` instead of `localhost` in Node 18+).\n3. Check for firewall blocks.",
    codeExample: "# Terminal verification:\ndocker ps\n# Test connection:\ncurl http://localhost:5432",
    severity: "high",
    relatedErrors: ["connect ECONNREFUSED 127.0.0.1:3000", "Redis connection lost"],
  },
];

function ruleBasedErrorExplain(errorText: string): ErrorExplainerOutput {
  for (const rule of ERROR_RULES) {
    if (rule.pattern.test(errorText)) {
      return {
        summary: rule.summary,
        cause: rule.cause,
        solution: rule.solution,
        codeExample: rule.codeExample,
        severity: rule.severity,
        relatedErrors: rule.relatedErrors,
      };
    }
  }

  return {
    summary: "Runtime Error Analysis",
    cause: "The error indicates an unexpected exception or unmet precondition during execution.",
    solution: "1. Inspect the stack trace top frame to find the exact file and line number.\n2. Wrap the failing call in a try/catch block and inspect the variable state with `console.log` or a debugger.\n3. Verify function arguments and types.",
    severity: "medium",
    relatedErrors: ["Unhandled Runtime Exception", "Process exited with code 1"],
  };
}

const ERROR_PRESETS = [
  "TypeError: Cannot read properties of undefined (reading 'map')",
  "Error: Hydration failed because the initial UI does not match that rendered on the server",
  "Error: Cannot find module 'axios' or its corresponding type declarations",
  "Access to fetch at 'https://api.external.com' from origin has been blocked by CORS policy",
  "Error: Maximum update depth exceeded. This can happen when a component repeatedly calls setState",
  "connect ECONNREFUSED 127.0.0.1:5432",
];

const SEVERITY_COLORS = {
  low: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30",
  medium: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
  high: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30",
  critical: "bg-destructive/10 text-destructive border-destructive/30",
};

export function AIErrorExplainerEngine() {
  const [errorInput, setErrorInput] = useState(
    "TypeError: Cannot read properties of undefined (reading 'map')"
  );
  const [language, setLanguage] = useState("typescript");
  const [context, setContext] = useState("Rendering user list component from API data");
  const [result, setResult] = useState<ErrorExplainerOutput>(() =>
    ruleBasedErrorExplain("TypeError: Cannot read properties of undefined (reading 'map')")
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const { remaining, refresh } = useCredits();

  const handleExplain = useCallback(async () => {
    if (!errorInput.trim()) return;
    setIsLoading(true);
    setError("");
    try {
      const r = await explainError({
        error: errorInput.trim(),
        language: language || undefined,
        context: context || undefined,
      });
      setResult(r);
      toast.success("AI diagnosis generated! (20 credits deducted)");
      await refresh();
    } catch {
      setResult(ruleBasedErrorExplain(errorInput.trim()));
      setError("AI service unavailable. Showing expert diagnosis from knowledgebase.");
    }
    setIsLoading(false);
  }, [errorInput, language, context, refresh]);

  const handleCopy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
    toast.success("Copied to clipboard!");
  };

  return (
    <div className="space-y-5">
      {/* Error Input */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-semibold flex items-center gap-1.5">
            <Bug className="h-4 w-4 text-primary" /> Error Message or Stack Trace
          </Label>
          <div className="flex items-center gap-1.5">
            <Badge variant="outline" className="text-xs gap-1 text-muted-foreground">
              <Coins className="h-3 w-3 text-amber-500" /> 20 credits {remaining !== undefined && remaining > 0 ? `(${remaining} left)` : ""}
            </Badge>
            <Badge className="bg-primary/10 text-primary border-primary/20 text-[11px] gap-1">
              <Sparkles className="h-3 w-3" /> AI Active
            </Badge>
          </div>
        </div>
        <Textarea
          placeholder="Paste console error message, exception, or stack trace here..."
          value={errorInput}
          onChange={(e) => setErrorInput(e.target.value)}
          className="min-h-24 font-mono text-xs leading-relaxed"
        />

        {/* Presets */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-xs text-muted-foreground mr-1">Common Errors:</span>
          {ERROR_PRESETS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => {
                setErrorInput(p);
                setResult(ruleBasedErrorExplain(p));
              }}
              className="px-2 py-0.5 rounded-full bg-muted hover:bg-primary/10 border text-[11px] font-medium transition-colors truncate max-w-xs text-left"
              title={p}
            >
              {p.split(":")[0] || p}
            </button>
          ))}
        </div>
      </div>

      {/* Language and Context */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Framework / Language</Label>
          <Input
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            placeholder="e.g. Next.js, React, Node.js, Python"
            className="text-xs h-8"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">What were you trying to do? (Optional)</Label>
          <Input
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="e.g. Fetching data in useEffect"
            className="text-xs h-8"
          />
        </div>
      </div>

      <Button onClick={handleExplain} disabled={isLoading} className="w-full gap-2 h-9 text-xs">
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bug className="h-4 w-4" />}
        Analyze & Explain Error
      </Button>

      {error && <p className="text-xs text-amber-500">{error}</p>}

      {/* Result Display */}
      {result && (
        <div className="space-y-4 pt-2">
          {/* Header Card */}
          <Card className={`border-2 ${SEVERITY_COLORS[result.severity] || ""}`}>
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    {result.severity} Severity Error
                  </span>
                </div>
              </div>
              <h3 className="font-bold text-base text-foreground">{result.summary}</h3>
            </CardContent>
          </Card>

          {/* Root Cause */}
          <Card>
            <CardContent className="p-4 space-y-1">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                Why This Happens (Root Cause)
              </span>
              <p className="text-xs text-foreground/90 leading-relaxed whitespace-pre-wrap">
                {result.cause}
              </p>
            </CardContent>
          </Card>

          {/* Solution & Fix */}
          <div className="p-4 rounded-xl border border-green-500/30 bg-green-500/5 space-y-3">
            <span className="text-xs font-bold text-green-700 dark:text-green-300 flex items-center gap-1.5">
              <Lightbulb className="h-4 w-4" /> Step-by-Step Resolution
            </span>
            <p className="text-xs text-foreground/90 leading-relaxed whitespace-pre-wrap">
              {result.solution}
            </p>

            {/* Code example */}
            {result.codeExample && (
              <div className="space-y-1 pt-1">
                <div className="flex items-center justify-between">
                  <Label className="text-[11px] font-semibold text-muted-foreground">Code Fix Example</Label>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 text-xs gap-1"
                    onClick={() => handleCopy(result.codeExample!, "fix-code")}
                  >
                    {copiedKey === "fix-code" ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                    Copy Fix
                  </Button>
                </div>
                <pre className="p-3 rounded-lg bg-background border font-mono text-xs overflow-x-auto whitespace-pre-wrap">
                  {result.codeExample}
                </pre>
              </div>
            )}
          </div>

          {/* Related Errors */}
          {result.relatedErrors && result.relatedErrors.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-muted-foreground block">Related Symptoms & Errors</span>
              <div className="border rounded-xl divide-y text-xs overflow-hidden">
                {result.relatedErrors.map((re, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 hover:bg-muted/20">
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <code className="text-xs font-mono">{re}</code>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}