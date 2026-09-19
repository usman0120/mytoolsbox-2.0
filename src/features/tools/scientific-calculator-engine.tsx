"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { evaluateExpression, SCIENTIFIC_BUTTONS, type TrigUnit } from "@/features/tools/scientific-calculator";
import { Delete, Divide, Equal, Minus, Plus, X } from "lucide-react";

export function ScientificCalculatorEngine() {
  const [display, setDisplay] = useState("");
  const [result, setResult] = useState("");
  const [trigUnit, setTrigUnit] = useState<TrigUnit>("deg");
  const [history, setHistory] = useState<string[]>([]);

  const handleButton = useCallback((btn: string) => {
    if (btn === "C") {
      setDisplay("");
      setResult("");
      return;
    }
    if (btn === "⌫") {
      setDisplay(prev => prev.slice(0, -1));
      return;
    }
    if (btn === "=") {
      if (!display) return;
      const res = evaluateExpression(display, trigUnit);
      setResult(res);
      setHistory(prev => [`${display} = ${res}`, ...prev].slice(0, 20));
      return;
    }
    if (btn === "±") {
      if (display.startsWith("-")) {
        setDisplay(prev => prev.slice(1));
      } else if (display) {
        setDisplay(prev => "-" + prev);
      }
      return;
    }

    // Map display symbols to expression symbols
    const mapping: Record<string, string> = {
      "÷": "/",
      "×": "*",
      "x^y": "^",
      "n!": "!",
    };

    const char = mapping[btn] || btn;

    // Handle functions that need parentheses
    const funcs = ["sin", "cos", "tan", "asin", "acos", "atan", "log10", "ln", "sqrt"];
    if (funcs.includes(char)) {
      setDisplay(prev => prev + char + "(");
      return;
    }

    setDisplay(prev => prev + char);
  }, [display, trigUnit]);

  const getButtonClass = (btn: string) => {
    if (btn === "=") return "bg-cyan-600 hover:bg-cyan-700 text-white";
    if (btn === "C") return "bg-red-500/20 hover:bg-red-500/30 text-red-400";
    if (["sin", "cos", "tan", "asin", "acos", "atan", "log10", "ln", "sqrt", "x^y", "n!"].includes(btn))
      return "bg-purple-500/20 hover:bg-purple-500/30 text-purple-400";
    if (["÷", "×", "-", "+"].includes(btn))
      return "bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400";
    return "hover:bg-muted";
  };

  return (
    <Tabs defaultValue="calculator" className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="calculator">Calculator</TabsTrigger>
        <TabsTrigger value="history">History ({history.length})</TabsTrigger>
      </TabsList>

      <TabsContent value="calculator" className="space-y-4">
        {/* Unit toggle */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={trigUnit === "deg" ? "default" : "outline"}
            onClick={() => setTrigUnit("deg")}
            className="text-xs h-7"
          >
            DEG
          </Button>
          <Button
            size="sm"
            variant={trigUnit === "rad" ? "default" : "outline"}
            onClick={() => setTrigUnit("rad")}
            className="text-xs h-7"
          >
            RAD
          </Button>
        </div>

        {/* Display */}
        <Card>
          <CardContent className="p-3">
            <div className="text-right font-mono text-sm text-muted-foreground min-h-[20px] break-all">
              {display || "\u00A0"}
            </div>
            <div className="text-right font-mono text-2xl font-bold break-all mt-1">
              {result || "0"}
            </div>
          </CardContent>
        </Card>

        {/* Buttons grid */}
        <div className="grid grid-cols-5 gap-1.5">
          {SCIENTIFIC_BUTTONS.flat().map((btn) => (
            <Button
              key={btn}
              variant="ghost"
              size="sm"
              className={`h-10 text-sm font-mono ${getButtonClass(btn)}`}
              onClick={() => handleButton(btn)}
            >
              {btn === "÷" ? <Divide className="h-3.5 w-3.5" /> :
               btn === "×" ? <X className="h-3.5 w-3.5" /> :
               btn === "-" ? <Minus className="h-3.5 w-3.5" /> :
               btn === "+" ? <Plus className="h-3.5 w-3.5" /> :
               btn === "⌫" ? <Delete className="h-3.5 w-3.5" /> :
               btn === "=" ? <Equal className="h-3.5 w-3.5" /> :
               btn}
            </Button>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="history">
        {history.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No calculations yet</p>
        ) : (
          <div className="space-y-1">
            {history.map((entry, i) => (
              <div
                key={i}
                className="font-mono text-sm p-2 rounded hover:bg-muted cursor-pointer"
                onClick={() => {
                  const parts = entry.split(" = ");
                  setDisplay(parts[0]);
                  setResult(parts[1] || "");
                }}
              >
                {entry}
              </div>
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}