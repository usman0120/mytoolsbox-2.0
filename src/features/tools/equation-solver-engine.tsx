"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { solveEquation, solveSystem2, solveSystem3, type EquationSolution } from "@/features/tools/equation-solver";
import { Equal, Lightbulb, ChevronRight, Copy, Check, FunctionSquare } from "lucide-react";

interface Example {
  label: string;
  mode: "single" | "system2" | "system3";
  equation: string;
}

const EXAMPLES: Example[] = [
  { label: "Linear", mode: "single", equation: "3x + 7 = 22" },
  { label: "Quadratic (Real)", mode: "single", equation: "x^2 - 5x + 6 = 0" },
  { label: "Quadratic (Complex)", mode: "single", equation: "x^2 + 4x + 13 = 0" },
  { label: "Cubic", mode: "single", equation: "x^3 - 6x^2 + 11x - 6 = 0" },
  { label: "2x2 System", mode: "system2", equation: "2x + y = 10\nx - y = 2" },
  { label: "3x3 System", mode: "system3", equation: "x + y + z = 6\n2y + 5z = -4\n2x + 5y - z = 27" },
];

export function EquationSolverEngine() {
  const [mode, setMode] = useState<"single" | "system2" | "system3">("single");
  const [singleEq, setSingleEq] = useState("x^2 - 5x + 6 = 0");
  const [eq1, setEq1] = useState("2x + y = 10");
  const [eq2, setEq2] = useState("x - y = 2");
  const [eq3, setEq3] = useState("2x + 5y - z = 27");
  const [solution, setSolution] = useState<EquationSolution | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleSolve = () => {
    setError("");
    setSolution(null);

    let res: EquationSolution;
    if (mode === "single") {
      if (!singleEq.trim()) {
        setError("Please enter an equation.");
        return;
      }
      res = solveEquation(singleEq);
    } else if (mode === "system2") {
      if (!eq1.trim() || !eq2.trim()) {
        setError("Please provide both linear equations.");
        return;
      }
      res = solveSystem2(eq1, eq2);
    } else {
      if (!eq1.trim() || !eq2.trim() || !eq3.trim()) {
        setError("Please provide all 3 equations for the 3x3 system.");
        return;
      }
      res = solveSystem3(eq1, eq2, eq3);
    }

    if (res.roots.length === 0 && res.steps.length === 1 && res.steps[0].includes("Could not detect")) {
      setError(res.steps[0]);
    } else {
      setSolution(res);
    }
  };

  const copySolution = () => {
    if (!solution) return;
    const text = `Solution:\n${solution.roots.join("\n")}\n\nSteps:\n${solution.steps.join("\n")}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const loadExample = (ex: Example) => {
    setMode(ex.mode);
    if (ex.mode === "single") {
      setSingleEq(ex.equation);
    } else if (ex.mode === "system2") {
      const parts = ex.equation.split("\n");
      setEq1(parts[0]);
      setEq2(parts[1]);
    } else {
      const parts = ex.equation.split("\n");
      setEq1(parts[0] || "");
      setEq2(parts[1] || "");
      setEq3(parts[2] || "");
    }
  };

  const typeLabels: Record<string, { label: string; badge: string }> = {
    linear: { label: "Linear Equation", badge: "bg-blue-500/20 text-blue-400" },
    quadratic: { label: "Quadratic Equation", badge: "bg-purple-500/20 text-purple-400" },
    cubic: { label: "Cubic Equation", badge: "bg-pink-500/20 text-pink-400" },
    system2: { label: "2-Variable Linear System", badge: "bg-cyan-500/20 text-cyan-400" },
    system3: { label: "3-Variable Linear System", badge: "bg-amber-500/20 text-amber-400" },
    unknown: { label: "General Equation", badge: "bg-muted text-muted-foreground" },
  };

  return (
    <div className="space-y-4">
      {/* Mode Tabs */}
      <Tabs value={mode} onValueChange={(v) => setMode(v as typeof mode)}>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <TabsList>
            <TabsTrigger value="single">Single Equation</TabsTrigger>
            <TabsTrigger value="system2">2-Variable System (x, y)</TabsTrigger>
            <TabsTrigger value="system3">3-Variable System (x, y, z)</TabsTrigger>
          </TabsList>
        </div>
      </Tabs>

      {/* Examples Bar */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-xs text-muted-foreground mr-1">Presets:</span>
        {EXAMPLES.map(ex => (
          <Button
            key={ex.label}
            variant="outline"
            size="sm"
            className="text-xs h-7"
            onClick={() => loadExample(ex)}
          >
            {ex.label}
          </Button>
        ))}
      </div>

      {/* Inputs according to Mode */}
      <div className="p-4 rounded-xl border bg-card/60 space-y-3">
        {mode === "single" ? (
          <div>
            <Label className="text-xs mb-1.5 block font-medium">Equation (in terms of x)</Label>
            <div className="flex gap-2">
              <Input
                value={singleEq}
                onChange={e => setSingleEq(e.target.value)}
                placeholder="e.g. 2x^2 + 5x - 3 = 0 or 3x + 4 = 19"
                className="font-mono text-sm"
                onKeyDown={e => e.key === "Enter" && handleSolve()}
              />
              <Button onClick={handleSolve} className="gap-2 shrink-0">
                <Equal className="h-4 w-4" /> Solve
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">
              Supports linear (ax + b = c), quadratic (ax^2 + bx + c = 0), and cubic (ax^3 + bx^2 + cx + d = 0).
            </p>
          </div>
        ) : mode === "system2" ? (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs mb-1.5 block font-medium">Equation 1</Label>
                <Input
                  value={eq1}
                  onChange={e => setEq1(e.target.value)}
                  placeholder="2x + y = 10"
                  className="font-mono text-sm"
                />
              </div>
              <div>
                <Label className="text-xs mb-1.5 block font-medium">Equation 2</Label>
                <Input
                  value={eq2}
                  onChange={e => setEq2(e.target.value)}
                  placeholder="x - y = 2"
                  className="font-mono text-sm"
                />
              </div>
            </div>
            <Button onClick={handleSolve} className="w-full gap-2">
              <Equal className="h-4 w-4" /> Solve 2x2 System (Cramer's Rule)
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <Label className="text-xs mb-1.5 block font-medium">Equation 1</Label>
                <Input
                  value={eq1}
                  onChange={e => setEq1(e.target.value)}
                  placeholder="x + y + z = 6"
                  className="font-mono text-sm"
                />
              </div>
              <div>
                <Label className="text-xs mb-1.5 block font-medium">Equation 2</Label>
                <Input
                  value={eq2}
                  onChange={e => setEq2(e.target.value)}
                  placeholder="2y + 5z = -4"
                  className="font-mono text-sm"
                />
              </div>
              <div>
                <Label className="text-xs mb-1.5 block font-medium">Equation 3</Label>
                <Input
                  value={eq3}
                  onChange={e => setEq3(e.target.value)}
                  placeholder="2x + 5y - z = 27"
                  className="font-mono text-sm"
                />
              </div>
            </div>
            <Button onClick={handleSolve} className="w-full gap-2">
              <Equal className="h-4 w-4" /> Solve 3x3 System (Gauss-Jordan)
            </Button>
          </div>
        )}
      </div>

      {/* Error Card */}
      {error && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="p-3 text-sm text-destructive">{error}</CardContent>
        </Card>
      )}

      {/* Solution Section */}
      {solution && (
        <div className="space-y-4">
          {/* Header & Badges */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge className={typeLabels[solution.type]?.badge || ""}>
                {typeLabels[solution.type]?.label || solution.type}
              </Badge>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs gap-1.5"
              onClick={copySolution}
            >
              {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
              Copy Solution
            </Button>
          </div>

          {/* Roots Card */}
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader className="py-2.5 px-4 flex flex-row items-center justify-between border-b">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-primary" />
                <span>Computed Solutions</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {solution.roots.map((root, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-lg border bg-background flex flex-col justify-center shadow-xs"
                  >
                    <span className="text-xs text-muted-foreground font-mono">
                      {solution.type === "quadratic" ? `Root ${i + 1}` : `Solution ${i + 1}`}
                    </span>
                    <span className="font-mono text-lg font-bold text-foreground mt-0.5">
                      {root}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Parabola / Quadratic Properties Card if applicable */}
          {solution.properties && (
            <Card>
              <CardHeader className="py-2.5 px-4 border-b">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <FunctionSquare className="h-4 w-4 text-primary" />
                  <span>Quadratic Parabola Properties</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-2 rounded bg-muted/50 border">
                  <span className="text-xs text-muted-foreground block">Discriminant (Δ)</span>
                  <span className="font-mono font-bold text-base">{solution.properties.discriminant}</span>
                </div>
                <div className="p-2 rounded bg-muted/50 border">
                  <span className="text-xs text-muted-foreground block">Vertex (h, k)</span>
                  <span className="font-mono font-bold text-base">
                    ({solution.properties.vertex?.x}, {solution.properties.vertex?.y})
                  </span>
                </div>
                <div className="p-2 rounded bg-muted/50 border">
                  <span className="text-xs text-muted-foreground block">Axis of Symmetry</span>
                  <span className="font-mono font-bold text-base">x = {solution.properties.axisOfSymmetry}</span>
                </div>
                <div className="p-2 rounded bg-muted/50 border">
                  <span className="text-xs text-muted-foreground block">y-Intercept</span>
                  <span className="font-mono font-bold text-base">y = {solution.properties.yIntercept}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step-by-Step Breakdown */}
          {solution.steps.length > 0 && (
            <Card>
              <CardHeader className="py-2.5 px-4 border-b">
                <CardTitle className="text-sm font-semibold">Step-by-Step Solution Working</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-2.5">
                {solution.steps.map((step, i) => (
                  <div key={i} className="flex gap-2.5 text-sm items-start">
                    <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center text-xs font-mono shrink-0 mt-0.5 text-muted-foreground">
                      {i + 1}
                    </div>
                    <span className="font-mono leading-relaxed text-foreground/90">{step}</span>
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