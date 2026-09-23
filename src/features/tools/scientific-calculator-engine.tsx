"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { evaluateExpression, type TrigUnit } from "@/features/tools/scientific-calculator";
import { Delete, Divide, Equal, Minus, Plus, X, Trash2, Download, Copy, Check } from "lucide-react";

export function ScientificCalculatorEngine() {
  const [display, setDisplay] = useState("");
  const [result, setResult] = useState("");
  const [trigUnit, setTrigUnit] = useState<TrigUnit>("deg");
  const [memory, setMemory] = useState<number>(0);
  const [isHyp, setIsHyp] = useState(false);
  const [history, setHistory] = useState<{ expr: string; res: string; timestamp: string }[]>([]);
  const [copied, setCopied] = useState(false);

  const calculate = useCallback(() => {
    if (!display.trim()) return;
    const lastAns = history.length > 0 ? parseFloat(history[0].res) || 0 : 0;
    const res = evaluateExpression(display, trigUnit, lastAns);
    setResult(res);

    if (!res.startsWith("Error:")) {
      const now = new Date().toLocaleTimeString();
      setHistory(prev => [{ expr: display, res, timestamp: now }, ...prev].slice(0, 30));
    }
  }, [display, trigUnit, history]);

  const handleInput = useCallback((btn: string) => {
    if (btn === "C") {
      setDisplay("");
      setResult("");
      return;
    }
    if (btn === "⌫" || btn === "Backspace") {
      setDisplay(prev => prev.slice(0, -1));
      return;
    }
    if (btn === "=" || btn === "Enter") {
      calculate();
      return;
    }
    if (btn === "±") {
      if (display.startsWith("-")) {
        setDisplay(prev => prev.slice(1));
      } else if (display) {
        setDisplay(prev => `-${prev}`);
      }
      return;
    }
    if (btn === "Ans") {
      setDisplay(prev => prev + "Ans");
      return;
    }
    if (btn === "1/x") {
      if (display) {
        setDisplay(prev => `1/(${prev})`);
      }
      return;
    }
    if (btn === "x²") {
      setDisplay(prev => prev + "^2");
      return;
    }
    if (btn === "x³") {
      setDisplay(prev => prev + "^3");
      return;
    }

    // Mapping operators
    const mapping: Record<string, string> = {
      "÷": "/",
      "×": "*",
      "x^y": "^",
      "n!": "!",
    };
    const char = mapping[btn] || btn;

    const funcs = [
      "sin", "cos", "tan", "asin", "acos", "atan",
      "sinh", "cosh", "tanh",
      "sqrt", "cbrt", "log", "ln", "abs", "exp"
    ];
    if (funcs.includes(char)) {
      setDisplay(prev => prev + char + "(");
      return;
    }

    setDisplay(prev => prev + char);
  }, [calculate, display]);

  // Memory buttons
  const handleMemory = (action: "MC" | "MR" | "M+" | "M-" | "MS") => {
    const currentVal = parseFloat(result || display) || 0;
    switch (action) {
      case "MC":
        setMemory(0);
        break;
      case "MR":
        setDisplay(prev => prev + String(memory));
        break;
      case "M+":
        setMemory(prev => prev + currentVal);
        break;
      case "M-":
        setMemory(prev => prev - currentVal);
        break;
      case "MS":
        setMemory(currentVal);
        break;
    }
  };

  // Keyboard shortcut support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in another input element
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if ((e.key >= "0" && e.key <= "9") || [".", "+", "-", "*", "/", "(", ")", "^", "!"].includes(e.key)) {
        e.preventDefault();
        handleInput(e.key);
      } else if (e.key === "Enter" || e.key === "=") {
        e.preventDefault();
        calculate();
      } else if (e.key === "Backspace") {
        e.preventDefault();
        setDisplay(prev => prev.slice(0, -1));
      } else if (e.key === "Escape") {
        e.preventDefault();
        setDisplay("");
        setResult("");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [calculate, handleInput]);

  const copyResult = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const exportHistory = () => {
    if (history.length === 0) return;
    const content = history.map(h => `[${h.timestamp}] ${h.expr} = ${h.res}`).join("\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "scientific-calculator-history.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Tabs defaultValue="calculator" className="w-full">
      <div className="flex items-center justify-between mb-4">
        <TabsList>
          <TabsTrigger value="calculator">Calculator</TabsTrigger>
          <TabsTrigger value="history">History ({history.length})</TabsTrigger>
        </TabsList>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs font-mono">
            {memory !== 0 ? `M = ${memory}` : "M empty"}
          </Badge>
          <div className="flex bg-muted rounded-md p-0.5">
            <button
              onClick={() => setTrigUnit("deg")}
              className={`px-2.5 py-1 text-xs rounded font-medium transition-all ${
                trigUnit === "deg" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              DEG
            </button>
            <button
              onClick={() => setTrigUnit("rad")}
              className={`px-2.5 py-1 text-xs rounded font-medium transition-all ${
                trigUnit === "rad" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              RAD
            </button>
          </div>
        </div>
      </div>

      <TabsContent value="calculator" className="space-y-3">
        {/* Display Card */}
        <Card className="border-border bg-card/60 backdrop-blur">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
              <span>{trigUnit.toUpperCase()} {isHyp ? "| HYP" : ""}</span>
              <span className="truncate max-w-[80%] text-right">{display || "0"}</span>
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-muted-foreground font-mono">{result && "="}</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-2xl sm:text-3xl font-bold tracking-tight text-right break-all">
                  {result || (display || "0")}
                </span>
                {result && !result.startsWith("Error:") && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground shrink-0"
                    onClick={copyResult}
                    title="Copy Result"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Memory Bar */}
        <div className="grid grid-cols-5 gap-1.5">
          <Button variant="outline" size="sm" className="h-8 text-xs font-mono" onClick={() => handleMemory("MC")}>MC</Button>
          <Button variant="outline" size="sm" className="h-8 text-xs font-mono" onClick={() => handleMemory("MR")}>MR</Button>
          <Button variant="outline" size="sm" className="h-8 text-xs font-mono" onClick={() => handleMemory("M+")}>M+</Button>
          <Button variant="outline" size="sm" className="h-8 text-xs font-mono" onClick={() => handleMemory("M-")}>M-</Button>
          <Button variant="outline" size="sm" className="h-8 text-xs font-mono" onClick={() => handleMemory("MS")}>MS</Button>
        </div>

        {/* Scientific & Main Keypad Grid */}
        <div className="grid grid-cols-5 gap-1.5">
          {/* Row 1: Trig / Mode */}
          <Button
            variant={isHyp ? "default" : "outline"}
            size="sm"
            className="h-10 text-xs font-mono"
            onClick={() => setIsHyp(prev => !prev)}
          >
            {isHyp ? "HYP ON" : "hyp"}
          </Button>
          <Button variant="secondary" size="sm" className="h-10 text-xs font-mono" onClick={() => handleInput(isHyp ? "sinh" : "sin")}>
            {isHyp ? "sinh" : "sin"}
          </Button>
          <Button variant="secondary" size="sm" className="h-10 text-xs font-mono" onClick={() => handleInput(isHyp ? "cosh" : "cos")}>
            {isHyp ? "cosh" : "cos"}
          </Button>
          <Button variant="secondary" size="sm" className="h-10 text-xs font-mono" onClick={() => handleInput(isHyp ? "tanh" : "tan")}>
            {isHyp ? "tanh" : "tan"}
          </Button>
          <Button variant="outline" size="sm" className="h-10 text-xs font-mono" onClick={() => handleInput("log")}>
            log₁₀
          </Button>

          {/* Row 2: Inverse / Exponentials */}
          <Button variant="secondary" size="sm" className="h-10 text-xs font-mono" onClick={() => handleInput("asin")}>asin</Button>
          <Button variant="secondary" size="sm" className="h-10 text-xs font-mono" onClick={() => handleInput("acos")}>acos</Button>
          <Button variant="secondary" size="sm" className="h-10 text-xs font-mono" onClick={() => handleInput("atan")}>atan</Button>
          <Button variant="outline" size="sm" className="h-10 text-xs font-mono" onClick={() => handleInput("ln")}>ln</Button>
          <Button variant="outline" size="sm" className="h-10 text-xs font-mono" onClick={() => handleInput("exp")}>eˣ</Button>

          {/* Row 3: Powers & Roots */}
          <Button variant="outline" size="sm" className="h-10 text-xs font-mono" onClick={() => handleInput("sqrt")}>√x</Button>
          <Button variant="outline" size="sm" className="h-10 text-xs font-mono" onClick={() => handleInput("cbrt")}>∛x</Button>
          <Button variant="outline" size="sm" className="h-10 text-xs font-mono" onClick={() => handleInput("x²")}>x²</Button>
          <Button variant="outline" size="sm" className="h-10 text-xs font-mono" onClick={() => handleInput("x^y")}>xʸ</Button>
          <Button variant="outline" size="sm" className="h-10 text-xs font-mono" onClick={() => handleInput("1/x")}>1/x</Button>

          {/* Row 4: Constants & Symbols */}
          <Button variant="outline" size="sm" className="h-10 text-xs font-mono" onClick={() => handleInput("π")}>π</Button>
          <Button variant="outline" size="sm" className="h-10 text-xs font-mono" onClick={() => handleInput("e")}>e</Button>
          <Button variant="outline" size="sm" className="h-10 text-xs font-mono" onClick={() => handleInput("(")}>(</Button>
          <Button variant="outline" size="sm" className="h-10 text-xs font-mono" onClick={() => handleInput(")")}>)</Button>
          <Button variant="outline" size="sm" className="h-10 text-xs font-mono" onClick={() => handleInput("n!")}>n!</Button>

          {/* Row 5: Numbers 7, 8, 9 & Clear */}
          <Button variant="ghost" size="sm" className="h-10 text-base font-medium" onClick={() => handleInput("7")}>7</Button>
          <Button variant="ghost" size="sm" className="h-10 text-base font-medium" onClick={() => handleInput("8")}>8</Button>
          <Button variant="ghost" size="sm" className="h-10 text-base font-medium" onClick={() => handleInput("9")}>9</Button>
          <Button variant="destructive" size="sm" className="h-10 text-xs font-mono" onClick={() => handleInput("C")}>C</Button>
          <Button variant="secondary" size="sm" className="h-10 text-xs font-mono" onClick={() => handleInput("⌫")}><Delete className="h-4 w-4" /></Button>

          {/* Row 6: Numbers 4, 5, 6 & Ops */}
          <Button variant="ghost" size="sm" className="h-10 text-base font-medium" onClick={() => handleInput("4")}>4</Button>
          <Button variant="ghost" size="sm" className="h-10 text-base font-medium" onClick={() => handleInput("5")}>5</Button>
          <Button variant="ghost" size="sm" className="h-10 text-base font-medium" onClick={() => handleInput("6")}>6</Button>
          <Button variant="secondary" size="sm" className="h-10 font-mono" onClick={() => handleInput("×")}><X className="h-4 w-4" /></Button>
          <Button variant="secondary" size="sm" className="h-10 font-mono" onClick={() => handleInput("÷")}><Divide className="h-4 w-4" /></Button>

          {/* Row 7: Numbers 1, 2, 3 & Ops */}
          <Button variant="ghost" size="sm" className="h-10 text-base font-medium" onClick={() => handleInput("1")}>1</Button>
          <Button variant="ghost" size="sm" className="h-10 text-base font-medium" onClick={() => handleInput("2")}>2</Button>
          <Button variant="ghost" size="sm" className="h-10 text-base font-medium" onClick={() => handleInput("3")}>3</Button>
          <Button variant="secondary" size="sm" className="h-10 font-mono" onClick={() => handleInput("+")}><Plus className="h-4 w-4" /></Button>
          <Button variant="secondary" size="sm" className="h-10 font-mono" onClick={() => handleInput("-")}><Minus className="h-4 w-4" /></Button>

          {/* Row 8: 0, Dot, Sign, Ans, Equal */}
          <Button variant="ghost" size="sm" className="h-10 text-base font-medium" onClick={() => handleInput("0")}>0</Button>
          <Button variant="ghost" size="sm" className="h-10 text-base font-medium" onClick={() => handleInput(".")}>.</Button>
          <Button variant="ghost" size="sm" className="h-10 text-xs font-mono" onClick={() => handleInput("±")}>±</Button>
          <Button variant="outline" size="sm" className="h-10 text-xs font-mono text-primary font-semibold" onClick={() => handleInput("Ans")}>Ans</Button>
          <Button variant="default" size="sm" className="h-10 text-base font-bold shadow-md" onClick={() => handleInput("=")}><Equal className="h-5 w-5" /></Button>
        </div>
      </TabsContent>

      <TabsContent value="history" className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Recent calculations (tap to recall)</span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs gap-1"
              disabled={history.length === 0}
              onClick={exportHistory}
            >
              <Download className="h-3 w-3" /> Export
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs gap-1 text-destructive hover:text-destructive"
              disabled={history.length === 0}
              onClick={() => setHistory([])}
            >
              <Trash2 className="h-3 w-3" /> Clear
            </Button>
          </div>
        </div>

        {history.length === 0 ? (
          <div className="text-center py-10 border border-dashed rounded-lg text-sm text-muted-foreground">
            No calculations recorded yet
          </div>
        ) : (
          <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
            {history.map((item, idx) => (
              <Card
                key={idx}
                className="hover:border-primary/50 cursor-pointer transition-colors"
                onClick={() => {
                  setDisplay(item.expr);
                  setResult(item.res);
                }}
              >
                <CardContent className="p-3 flex items-center justify-between font-mono text-sm">
                  <div className="truncate pr-3">
                    <span className="text-xs text-muted-foreground block">{item.timestamp}</span>
                    <span className="text-muted-foreground">{item.expr} = </span>
                    <span className="font-semibold text-foreground">{item.res}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigator.clipboard.writeText(item.res);
                    }}
                    title="Copy Answer"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}