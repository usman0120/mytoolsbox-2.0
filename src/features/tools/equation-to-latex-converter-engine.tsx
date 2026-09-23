"use client";

import { useState, useCallback } from "react";
import { Copy, Check, Sigma, Loader2, Download, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  convertToLatex, getFormulasByCategory, FORMULA_CATALOG,
  type FormulaTemplate,
} from "@/features/tools/equation-to-latex-converter";

const SYMBOL_GROUPS: Record<string, Array<{ label: string; insert: string }>> = {
  "Greek": [
    { label: "α", insert: "alpha" }, { label: "β", insert: "beta" },
    { label: "γ", insert: "gamma" }, { label: "δ", insert: "delta" },
    { label: "θ", insert: "theta" }, { label: "λ", insert: "lambda" },
    { label: "μ", insert: "mu" },   { label: "π", insert: "pi" },
    { label: "σ", insert: "sigma" }, { label: "ω", insert: "omega" },
    { label: "Γ", insert: "Gamma" }, { label: "Δ", insert: "Delta" },
    { label: "Σ", insert: "Sigma" }, { label: "Ω", insert: "Omega" },
  ],
  "Calculus": [
    { label: "∫(a,b)", insert: "int(a,b)" },
    { label: "∂/∂x", insert: "partial/partial x" },
    { label: "d/dx", insert: "d/dx" },
    { label: "∑(i=1,n)", insert: "sum(i=1,n)" },
    { label: "∏(i=1,n)", insert: "prod(i=1,n)" },
    { label: "lim", insert: "lim(x->inf)" },
    { label: "∞", insert: "infinity" },
    { label: "nabla", insert: "nabla" },
  ],
  "Relations": [
    { label: "≥", insert: ">=" }, { label: "≤", insert: "<=" },
    { label: "≠", insert: "!=" }, { label: "≈", insert: "~=" },
    { label: "→", insert: "->" }, { label: "⇒", insert: "=>" },
    { label: "⟺", insert: "<=>" }, { label: "±", insert: "+-" },
  ],
  "Structures": [
    { label: "√", insert: "sqrt()" },
    { label: "a/b", insert: "a/b" },
    { label: "x^n", insert: "x^n" },
    { label: "x_n", insert: "x_n" },
    { label: "|x|", insert: "abs(x)" },
    { label: "ℝ", insert: "RR" }, { label: "ℕ", insert: "NN" },
    { label: "ℤ", insert: "ZZ" }, { label: "ℂ", insert: "CC" },
  ],
};

export function EquationToLatexConverterEngine() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState<{ latex: string; inline: string; display: string } | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [expandedCat, setExpandedCat] = useState<string | null>("Algebra");

  const convert = useCallback(() => {
    if (!input.trim()) { toast.error("Enter an equation first."); return; }
    const result = convertToLatex(input);
    setOutput(result);
    toast.success("Converted to LaTeX!");
  }, [input]);

  const copyText = useCallback(async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    toast.success("Copied!");
    setTimeout(() => setCopied(null), 2000);
  }, []);

  const insertSymbol = useCallback((sym: string) => {
    setInput(prev => prev + (prev.endsWith(" ") || prev.length === 0 ? "" : " ") + sym + " ");
  }, []);

  const loadFormula = useCallback((f: FormulaTemplate) => {
    setInput(f.input);
    const result = convertToLatex(f.input);
    setOutput(result);
    toast.success(`Loaded: ${f.name}`);
  }, []);

  const byCategory = getFormulasByCategory();

  return (
    <div className="space-y-4">
      <Badge variant="outline" className="gap-1.5">
        <Sigma className="h-3.5 w-3.5" /> Equation → LaTeX Converter
      </Badge>

      <Tabs defaultValue="converter">
        <TabsList>
          <TabsTrigger value="converter" className="text-xs">Converter</TabsTrigger>
          <TabsTrigger value="catalog" className="text-xs">Formula Catalog</TabsTrigger>
        </TabsList>

        <TabsContent value="catalog" className="space-y-3 mt-3">
          <p className="text-xs text-muted-foreground">Click any formula to load it into the converter.</p>
          <div className="space-y-2">
            {Object.entries(byCategory).map(([cat, formulas]) => (
              <Card key={cat} className="overflow-hidden">
                <button
                  className="w-full flex items-center justify-between px-4 py-2 text-sm font-semibold hover:bg-muted/30 transition-colors"
                  onClick={() => setExpandedCat(expandedCat === cat ? null : cat)}
                >
                  {cat} <span className="text-xs text-muted-foreground">{formulas.length} formulas</span>
                  {expandedCat === cat ? <ChevronDown className="h-4 w-4 ml-2" /> : <ChevronRight className="h-4 w-4 ml-2" />}
                </button>
                {expandedCat === cat && (
                  <div className="border-t divide-y divide-border/30">
                    {formulas.map(f => (
                      <button
                        key={f.name}
                        onClick={() => loadFormula(f)}
                        className="w-full text-left px-4 py-2.5 hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs font-medium">{f.name}</p>
                            <p className="text-[10px] text-muted-foreground">{f.description}</p>
                            <code className="text-[10px] text-primary/80 font-mono mt-0.5 block">{f.latex}</code>
                          </div>
                          <Badge variant="secondary" className="text-[9px] shrink-0">Load</Badge>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="converter" className="space-y-4 mt-3">
          {/* Symbol palette */}
          <div className="space-y-2">
            {Object.entries(SYMBOL_GROUPS).map(([group, symbols]) => (
              <div key={group}>
                <Label className="text-[10px] text-muted-foreground mb-1 block">{group}</Label>
                <div className="flex flex-wrap gap-1">
                  {symbols.map(s => (
                    <button
                      key={s.label}
                      onClick={() => insertSymbol(s.insert)}
                      className="h-7 px-2 rounded border border-border hover:bg-muted/50 font-mono text-xs transition-colors"
                      title={s.insert}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div>
            <Label className="text-xs mb-1 block">Math Expression</Label>
            <Textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={"e.g.   (-b ± sqrt(b^2 - 4ac)) / (2a)\nor: int(0,inf) e^(-x^2) dx\nor: sum(k=1,n) 1/k^2"}
              className="font-mono text-sm min-h-20"
            />
            <p className="text-[10px] text-muted-foreground mt-1">
              Use: <code>sqrt(x)</code>, <code>int(a,b)</code>, <code>sum(i=1,n)</code>, <code>lim(x-&gt;inf)</code>, Greek names, <code>a/b</code> for fractions
            </p>
          </div>

          <Button onClick={convert} className="gap-2">
            <Sigma className="h-4 w-4" /> Convert to LaTeX
          </Button>

          {/* Output */}
          {output && (
            <div className="space-y-3">
              {[
                { id: "raw",     label: "Raw LaTeX",    value: output.latex },
                { id: "inline",  label: "Inline $...$", value: output.inline },
                { id: "display", label: "Display $$...", value: output.display },
              ].map(({ id, label, value }) => (
                <Card key={id}>
                  <CardContent className="pt-3 pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-xs">{label}</Label>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyText(value, id)}>
                        {copied === id ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                      </Button>
                    </div>
                    <code className="block bg-muted rounded px-3 py-2 text-sm font-mono whitespace-pre-wrap break-all">
                      {value}
                    </code>
                  </CardContent>
                </Card>
              ))}

              {/* Quick links */}
              <div className="flex gap-2 flex-wrap text-xs">
                <a
                  href={`https://www.overleaf.com/learn/latex/Mathematical_expressions`}
                  target="_blank" rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Open in Overleaf Docs ↗
                </a>
                <span className="text-muted-foreground">•</span>
                <a
                  href={`https://latexeditor.lagrida.com/`}
                  target="_blank" rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  LaTeX Live Preview ↗
                </a>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}