"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Sigma, Loader2, Copy, CheckCircle2, XCircle, Subscript,
} from "lucide-react";

// Common LaTeX templates for equations
const TEMPLATES: Record<string, string> = {
  fraction: "\\frac{a}{b}",
  sqrt: "\\sqrt{x}",
  integral: "\\int_{a}^{b} f(x)\\,dx",
  sum: "\\sum_{i=1}^{n} x_i",
  product: "\\prod_{i=1}^{n} x_i",
  limit: "\\lim_{x \\to \\infty} f(x)",
  matrix: "\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}",
  greek: "\\alpha, \\beta, \\gamma, \\delta, \\theta, \\pi, \\sigma, \\omega",
  power: "x^{n}",
  subscript: "x_{n}",
  derivative: "\\frac{d}{dx}f(x)",
  partial: "\\frac{\\partial}{\\partial x}f(x,y)",
};

export function EquationToLatexConverterEngine() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleConvert = useCallback(async () => {
    if (!input.trim()) {
      setError("Please enter an equation or mathematical expression.");
      return;
    }

    setIsConverting(true);
    setError(null);

    try {
      let latex = input.trim();

      // Convert common patterns to LaTeX
      const conversions: Array<[RegExp, string | ((match: string, ...groups: string[]) => string)]> = [
        // Fractions: a/b -> \frac{a}{b}
        [/([a-zA-Z0-9]+)\s*\/\s*([a-zA-Z0-9]+)/g, "\\frac{$1}{$2}"],
        // Square root: sqrt(x) -> \sqrt{x}
        [/sqrt\s*\(([^)]+)\)/g, "\\sqrt{$1}"],
        // nth root: nrt(x) or root[n](x)
        [/nrt\s*\(([^)]+)\)/g, "\\sqrt[n]{$1}"],
        [/root\[([^\]]+)\]\(([^)]+)\)/g, "\\sqrt[$1]{$2}"],
        // Power: x^n -> x^{n}
        [/([a-zA-Z0-9)\]}])\^([a-zA-Z0-9]+)/g, "$1^{$2}"],
        // Subscript: x_n -> x_{n}
        [/([a-zA-Z0-9)\]}])\_([a-zA-Z0-9]+)/g, "$1_{$2}"],
        // Sum: sum(i=1,n) -> \sum_{i=1}^{n}
        [/sum\s*\(([^,]+),([^)]+)\)/g, "\\sum_{$1}^{$2}"],
        // Product: prod(i=1,n) -> \prod_{i=1}^{n}
        [/prod\s*\(([^,]+),([^)]+)\)/g, "\\prod_{$1}^{$2}"],
        // Integral: int(a,b) -> \int_{a}^{b}
        [/int\s*\(([^,]+),([^)]+)\)/g, "\\int_{$1}^{$2}"],
        // Limit: lim(x->a) -> \lim_{x \to a}
        [/lim\s*\(([^)]+)\)/g, "\\lim_{$1}"],
        // Greek letters
        [/alpha/g, "\\alpha"],
        [/beta/g, "\\beta"],
        [/gamma/g, "\\gamma"],
        [/delta/g, "\\delta"],
        [/theta/g, "\\theta"],
        [/pi(?!pe)/g, "\\pi"],
        [/sigma/g, "\\sigma"],
        [/omega/g, "\\omega"],
        [/lambda/g, "\\lambda"],
        [/mu/g, "\\mu"],
        [/epsilon/g, "\\epsilon"],
        [/phi/g, "\\phi"],
        [/rho/g, "\\rho"],
        // Infinity
        [/infinity|inf/g, "\\infty"],
        // Times
        [/\*/g, " \\times "],
        // Arrows
        [/->/g, "\\to"],
        [/=>/g, "\\Rightarrow"],
        [/<=>/g, "\\Leftrightarrow"],
        // Inequalities
        [/>=/g, "\\geq"],
        [/<=/g, "\\leq"],
        [/!=/g, "\\neq"],
        // Plus/minus
        [/\+-/g, "\\pm"],
        // Dot product
        [/dot/g, "\\cdot"],
        // Trig functions
        [/sin\(/g, "\\sin("],
        [/cos\(/g, "\\cos("],
        [/tan\(/g, "\\tan("],
        [/log\(/g, "\\log("],
        [/ln\(/g, "\\ln("],
        [/exp\(/g, "\\exp("],
      ];

      for (const [pattern, replacement] of conversions) {
        latex = latex.replace(pattern, replacement as string);
      }

      // Clean up extra spaces around LaTeX commands
      latex = latex.replace(/\s*\\times\s*/g, " \\times ");
      latex = latex.replace(/\s+/g, " ").trim();

      setOutput(latex);
      toast.success("Equation converted to LaTeX!");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Conversion failed";
      setError(message);
      toast.error("Conversion failed: " + message);
    } finally {
      setIsConverting(false);
    }
  }, [input]);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    toast.success("LaTeX copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  }, [output]);

  const insertTemplate = useCallback((template: string) => {
    setInput((prev) => prev + (prev ? " " : "") + template);
  }, []);

  return (
    <div className="space-y-4">
      <Badge variant="outline" className="gap-1.5">
        <Sigma className="h-3.5 w-3.5" /> Equation to LaTeX Converter
      </Badge>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Enter Equation</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter a mathematical expression, e.g.: x^2 + 2x + 1 = 0 or int(0,1) x^2 dx"
            className="min-h-[120px] font-mono"
          />
        </CardContent>
      </Card>

      {/* Templates */}
      <Card>
        <CardContent className="py-3">
          <div className="space-y-2">
            <p className="text-xs font-medium">Quick Templates</p>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(TEMPLATES).map(([name, template]) => (
                <Button
                  key={name}
                  variant="outline"
                  size="sm"
                  onClick={() => insertTemplate(template)}
                  className="text-xs font-mono"
                >
                  {name}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="py-3">
            <div className="flex items-center gap-2 text-destructive">
              <XCircle className="h-4 w-4" />
              <p className="text-sm">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {output && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">LaTeX Output</CardTitle>
              <Button variant="ghost" size="sm" onClick={handleCopy} className="gap-1.5">
                {copied ? <CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <pre className="text-sm font-mono bg-muted p-3 rounded-md whitespace-pre-wrap break-all">
              {output}
            </pre>
            <p className="text-xs text-muted-foreground mt-2">
              Paste this into any LaTeX editor or use with $$ delimiters in Markdown.
            </p>
          </CardContent>
        </Card>
      )}

      <Button
        onClick={handleConvert}
        disabled={!input.trim() || isConverting}
        className="w-full gap-2"
      >
        {isConverting ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Converting...</>
        ) : (
          <><Sigma className="h-4 w-4" /> Convert to LaTeX</>
        )}
      </Button>
    </div>
  );
}