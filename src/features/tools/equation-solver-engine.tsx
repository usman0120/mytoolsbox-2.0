"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { solveEquation, type EquationSolution } from "@/features/tools/equation-solver";
import { Equal, Lightbulb, ChevronRight } from "lucide-react";

const EXAMPLES = [
  { label: "Linear", equation: "3x + 7 = 22" },
  { label: "Quadratic", equation: "x^2 - 5x + 6 = 0" },
  { label: "System", equation: "2x + y = 10; x - y = 2" },
  { label: "Cubic", equation: "x^3 - 6x^2 + 11x - 6 = 0" },
];

export function EquationSolverEngine() {
  const [equation, setEquation] = useState("");
  const [solution, setSolution] = useState<EquationSolution | null>(null);
  const [error, setError] = useState("");

  const handleSolve = () => {
    setError("");
    if (!equation.trim()) {
      setError("Please enter an equation");
      return;
    }
    const result = solveEquation(equation);
    if (result.roots.length === 0 && result.steps.length === 1) {
      setError(result.steps[0]);
      setSolution(null);
    } else {
      setSolution(result);
    }
  };

  const typeColors: Record<string, string> = {
    linear: "bg-blue-500/20 text-blue-400",
    quadratic: "bg-purple-500/20 text-purple-400",
    cubic: "bg-pink-500/20 text-pink-400",
    system2: "bg-cyan-500/20 text-cyan-400",
    unknown: "bg-muted text-muted-foreground",
  };

  return (
    <div className="space-y-4">
      {/* Examples */}
      <div className="flex flex-wrap gap-2">
        {EXAMPLES.map(ex => (
          <Button
            key={ex.label}
            variant="outline"
            size="sm"
            className="text-xs h-7"
            onClick={() => setEquation(ex.equation)}
          >
            {ex.label}
          </Button>
        ))}
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <div className="flex-1">
          <Label className="text-xs mb-1 block">Equation</Label>
          <Input
            value={equation}
            onChange={e => setEquation(e.target.value)}
            placeholder="e.g. x^2 - 5x + 6 = 0"
            className="font-mono"
            onKeyDown={e => e.key === "Enter" && handleSolve()}
          />
        </div>
        <Button onClick={handleSolve} className="gap-2 self-end">
          <Equal className="h-4 w-4" /> Solve
        </Button>
      </div>

      {error && (
        <Card className="border-red-500/30 bg-red-500/5">
          <CardContent className="p-3 text-sm text-red-400">{error}</CardContent>
        </Card>
      )}

      {solution && (
        <div className="space-y-3">
          {/* Type badge */}
          <div className="flex items-center gap-2">
            <Badge className={typeColors[solution.type] || ""}>
              {solution.type === "linear" ? "Linear" :
               solution.type === "quadratic" ? "Quadratic" :
               solution.type === "cubic" ? "Cubic" :
               solution.type === "system2" ? "System of 2" : "Unknown"}
            </Badge>
          </div>

          {/* Roots */}
          {solution.roots.length > 0 && (
            <Card className="border-green-500/30 bg-green-500/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-green-400" />
                  Solution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {solution.roots.map((root, i) => (
                    <div key={i} className="font-mono text-lg font-bold">
                      {root}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Steps */}
          {solution.steps.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Step-by-Step</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {solution.steps.map((step, i) => (
                    <div key={i} className="flex gap-2 text-sm">
                      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                      <span className="font-mono">{step}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}