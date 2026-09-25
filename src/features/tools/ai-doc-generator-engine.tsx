"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Copy,
  Check,
  Loader2,
  Sparkles,
  FileCode,
  BookOpen,
  Code2,
} from "lucide-react";
import { generateDocs, type DocGeneratorOutput } from "@/lib/ai/services/doc-generator";
import { useCredits } from "@/lib/credits/use-credits";
import { toast } from "sonner";

function ruleBasedDocGenerate(code: string, language = "typescript", style = "jsdoc"): DocGeneratorOutput {
  const trimmed = code.trim();

  // Pattern matching for function signature
  // e.g. function calculateDiscount(price: number, discountRate: number = 0.1): number
  // or const fetchUserData = async (userId: string, options?: RequestOptions): Promise<User>
  // or def calculate_discount(price: float, rate: float = 0.1) -> float:
  // or func CalculateDiscount(price float64, rate float64) (float64, error)

  let funcName = "processData";
  let params: Array<{ name: string; type: string; description: string }> = [];
  let returnType = "any";

  // JS/TS Matcher
  const tsFuncMatch = trimmed.match(/(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\(([^)]*)\)(?:\s*:\s*([^;{]+))?/);
  const arrowMatch = trimmed.match(/(?:export\s+)?(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?\(([^)]*)\)(?:\s*:\s*([^=>]+))?\s*=>/);
  // Python Matcher
  const pyMatch = trimmed.match(/def\s+(\w+)\s*\(([^)]*)\)(?:\s*->\s*([^:]+))?:/);
  // Go Matcher
  const goMatch = trimmed.match(/func\s+(\w+)\s*\(([^)]*)\)(?:\s*\(?([^;{]+)\)?)?/);

  if (tsFuncMatch || arrowMatch) {
    const m = tsFuncMatch || arrowMatch;
    funcName = m![1];
    const rawParams = m![2] || "";
    if (m![3]) returnType = m![3].trim();

    if (rawParams.trim()) {
      params = rawParams.split(",").map((p) => {
        const parts = p.trim().split(":");
        const name = parts[0].replace(/[?]/g, "").trim();
        const type = parts[1] ? parts[1].split("=")[0].trim() : "any";
        return {
          name,
          type,
          description: `The ${name} argument.`,
        };
      });
    }
  } else if (pyMatch) {
    funcName = pyMatch[1];
    const rawParams = pyMatch[2] || "";
    if (pyMatch[3]) returnType = pyMatch[3].trim();

    if (rawParams.trim()) {
      params = rawParams
        .split(",")
        .filter((p) => p.trim() !== "self" && p.trim() !== "cls")
        .map((p) => {
          const parts = p.trim().split(":");
          const name = parts[0].trim();
          const type = parts[1] ? parts[1].split("=")[0].trim() : "Any";
          return {
            name,
            type,
            description: `The ${name} value.`,
          };
        });
    }
  } else if (goMatch) {
    funcName = goMatch[1];
    const rawParams = goMatch[2] || "";
    if (goMatch[3]) returnType = goMatch[3].trim();

    if (rawParams.trim()) {
      params = rawParams.split(",").map((p) => {
        const parts = p.trim().split(/\s+/);
        const name = parts[0] || "param";
        const type = parts[1] || "interface{}";
        return {
          name,
          type,
          description: `Parameter ${name}.`,
        };
      });
    }
  }

  // Format documentation string
  let docComment = "";
  if (language === "python" || style === "docstring") {
    const argsStr = params.length > 0
      ? `\n    Args:\n${params.map((p) => `        ${p.name} (${p.type}): ${p.description}`).join("\n")}`
      : "";
    const retStr = returnType !== "unknown" ? `\n    Returns:\n        ${returnType}: Computed result.` : "";

    docComment = `"""\n${funcName} - Executes operation.\n${argsStr}${retStr}\n"""\n${trimmed}`;
  } else if (language === "go" || style === "godoc") {
    docComment = `// ${funcName} processes input arguments and returns ${returnType}.\n${trimmed}`;
  } else {
    // JSDoc
    const paramsJsDoc = params
      .map((p) => ` * @param {${p.type}} ${p.name} - ${p.description}`)
      .join("\n");
    const returnsJsDoc = ` * @returns {${returnType}} Output result`;

    docComment = `/**\n * ${funcName}\n *\n * Description of ${funcName}.\n *\n${paramsJsDoc ? `${paramsJsDoc}\n` : ""}${returnsJsDoc}\n */\n${trimmed}`;
  }

  return {
    documentedCode: docComment,
    summary: `Computes and returns result for ${funcName} with typed parameters.`,
    parameters: params,
    returns: {
      type: returnType,
      description: `Returns ${returnType} upon completion.`,
    },
    examples: [
      `const result = ${funcName}(${params.map((p) => (p.type === "number" ? "42" : p.type === "boolean" ? "true" : '"example"')).join(", ")});`,
    ],
  };
}

const SAMPLE_CODE = `export async function calculateInvoice(
  subtotal: number,
  taxRate: number = 0.08,
  discountCode?: string
): Promise<{ total: number; savings: number }> {
  const discount = discountCode === "SAVE20" ? subtotal * 0.2 : 0;
  const taxable = subtotal - discount;
  const total = taxable + (taxable * taxRate);
  return { total: Math.round(total * 100) / 100, savings: discount };
}`;

export function AIDocumentationGeneratorEngine() {
  const [code, setCode] = useState(SAMPLE_CODE);
  const [language, setLanguage] = useState("typescript");
  const [style, setStyle] = useState("jsdoc");
  const [detail, setDetail] = useState("standard");
  const [result, setResult] = useState<DocGeneratorOutput>(() =>
    ruleBasedDocGenerate(SAMPLE_CODE, "typescript", "jsdoc")
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const { refresh } = useCredits();

  const handleGenerate = useCallback(async () => {
    if (!code.trim()) return;
    setIsLoading(true);
    setError("");
    try {
      const r = await generateDocs({
        code: code.trim(),
        language: language === "auto" ? undefined : language,
        style: style === "auto" ? undefined : (style as any),
        detail: detail as any,
      });
      setResult(r);
      toast.success("Documentation generated!");
      await refresh();
    } catch {
      setResult(ruleBasedDocGenerate(code.trim(), language, style));
      setError("AI service unavailable. Generated with syntactic code analyzer.");
    }
    setIsLoading(false);
  }, [code, language, style, detail, refresh]);

  const handleCopy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
    toast.success("Copied to clipboard!");
  };

  return (
    <div className="space-y-5">
      {/* Code Input */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-semibold flex items-center gap-1.5">
            <Code2 className="h-4 w-4 text-primary" /> Source Code
          </Label>
          <div className="flex items-center gap-1.5">
            <Badge className="bg-primary/10 text-primary border-primary/20 text-[11px] gap-1">
              <Sparkles className="h-3 w-3" /> AI Active
            </Badge>
          </div>
        </div>
        <Textarea
          placeholder="Paste function, class, or module code here..."
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="min-h-40 font-mono text-xs leading-relaxed"
        />
      </div>

      {/* Settings Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-muted/40 rounded-xl text-xs">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground font-medium">Language:</span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="text-xs border rounded-md px-2 py-1 bg-background font-medium"
            >
              <option value="typescript">TypeScript</option>
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="go">Go</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-muted-foreground font-medium">Doc Format:</span>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="text-xs border rounded-md px-2 py-1 bg-background font-medium"
            >
              <option value="jsdoc">JSDoc / TSDoc</option>
              <option value="docstring">Python Docstring (Google style)</option>
              <option value="godoc">GoDoc</option>
            </select>
          </div>
        </div>

        <Button onClick={handleGenerate} disabled={isLoading} className="gap-2 h-8 text-xs ml-auto">
          {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
          Generate Documentation
        </Button>
      </div>

      {error && <p className="text-xs text-amber-500">{error}</p>}

      {/* Results */}
      {result && (
        <div className="space-y-4 pt-2">
          {/* Documented Code Card */}
          <Card className="border-2 border-primary/20">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-foreground">Documented Source Code</Label>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs gap-1"
                  onClick={() => handleCopy(result.documentedCode, "doc-code")}
                >
                  {copiedKey === "doc-code" ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                  Copy Code
                </Button>
              </div>
              <pre className="p-3.5 rounded-xl bg-muted/40 font-mono text-xs overflow-x-auto whitespace-pre-wrap select-all">
                {result.documentedCode}
              </pre>
            </CardContent>
          </Card>

          {/* Parameters Table */}
          {result.parameters.length > 0 && (
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">Parameter Breakdown</Label>
              <div className="border rounded-xl divide-y text-xs overflow-hidden">
                <div className="grid grid-cols-12 gap-2 bg-muted/50 p-2 font-semibold text-muted-foreground">
                  <div className="col-span-3">Parameter</div>
                  <div className="col-span-3">Type</div>
                  <div className="col-span-6">Description</div>
                </div>
                {result.parameters.map((p, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 p-2 items-center hover:bg-muted/20">
                    <div className="col-span-3 font-mono font-bold text-primary">{p.name}</div>
                    <div className="col-span-3">
                      <Badge variant="secondary" className="font-mono text-[10px]">
                        {p.type}
                      </Badge>
                    </div>
                    <div className="col-span-6 text-muted-foreground">{p.description}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Returns & Usage Example */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Card>
              <CardContent className="p-4 space-y-1">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase">Return Value</span>
                <div className="flex items-center gap-2 pt-1">
                  <Badge variant="outline" className="font-mono text-xs">
                    {result.returns.type}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{result.returns.description}</span>
                </div>
              </CardContent>
            </Card>

            {result.examples.length > 0 && (
              <Card>
                <CardContent className="p-4 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase">Usage Example</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleCopy(result.examples[0], "example")}
                    >
                      {copiedKey === "example" ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                    </Button>
                  </div>
                  <pre className="p-2 rounded bg-muted font-mono text-[11px] overflow-x-auto">
                    {result.examples[0]}
                  </pre>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}