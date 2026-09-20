"use client";

import { useState } from "react";
import { Calculator, Copy, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export function BasicCalculatorEngine() {
  const [display, setDisplay] = useState("0");
  const [expression, setExpression] = useState("");
  const [memory, setMemory] = useState(0);

  const handleDigit = (d: string) => {
    setDisplay(prev => prev === "0" || prev === "Error" ? d : prev + d);
  };

  const handleOperator = (op: string) => {
    setExpression(prev => prev + display + " " + op + " ");
    setDisplay("0");
  };

  const handleEquals = () => {
    try {
      const fullExpr = expression + display;
      const result = Function('"use strict"; return (' + fullExpr.replace(/×/g, "*").replace(/÷/g, "/") + ")")();
      setDisplay(Number.isFinite(result) ? String(Number(result.toFixed(10))) : "Error");
      setExpression("");
    } catch { setDisplay("Error"); setExpression(""); }
  };

  const handleClear = () => { setDisplay("0"); setExpression(""); };
  const handleBackspace = () => { setDisplay(prev => prev.length > 1 ? prev.slice(0, -1) : "0"); };
  const handlePercent = () => { setDisplay(prev => String(Number(prev) / 100)); };
  const handleDecimal = () => { if (!display.includes(".")) setDisplay(prev => prev + "."); };
  const handleSign = () => { setDisplay(prev => String(-Number(prev))); };
  const handleSqrt = () => { setDisplay(prev => String(Math.sqrt(Number(prev)))); };
  const handleSquare = () => { setDisplay(prev => String(Number(prev) ** 2)); };
  const handleInverse = () => { setDisplay(prev => String(1 / Number(prev))); };

  const btnClass = "h-12 rounded-xl text-sm font-medium transition-colors hover:bg-muted/50";
  const opClass = `${btnClass} bg-muted/30`;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <Badge variant="secondary" className="rounded-full">Basic Calculator</Badge>
        <span className="text-xs text-muted-foreground">Simple arithmetic calculations</span>
      </div>

      <div className="p-4 bg-muted/30 rounded-xl">
        <div className="text-xs text-muted-foreground text-right min-h-[1.5em] truncate">{expression}</div>
        <div className="text-2xl font-mono font-bold text-right truncate">{display}</div>
      </div>

      <div className="grid grid-cols-4 gap-1.5">
        <Button variant="ghost" onClick={handleClear} className={`${opClass} text-destructive`}>AC</Button>
        <Button variant="ghost" onClick={handleBackspace} className={opClass}>⌫</Button>
        <Button variant="ghost" onClick={handlePercent} className={opClass}>%</Button>
        <Button variant="ghost" onClick={() => handleOperator("÷")} className={opClass}>÷</Button>

        <Button variant="ghost" onClick={handleSqrt} className={opClass}>√</Button>
        <Button variant="ghost" onClick={handleSquare} className={opClass}>x²</Button>
        <Button variant="ghost" onClick={handleInverse} className={opClass}>1/x</Button>
        <Button variant="ghost" onClick={() => handleOperator("×")} className={opClass}>×</Button>

        <Button variant="ghost" onClick={() => handleDigit("7")} className={btnClass}>7</Button>
        <Button variant="ghost" onClick={() => handleDigit("8")} className={btnClass}>8</Button>
        <Button variant="ghost" onClick={() => handleDigit("9")} className={btnClass}>9</Button>
        <Button variant="ghost" onClick={() => handleOperator("-")} className={opClass}>−</Button>

        <Button variant="ghost" onClick={() => handleDigit("4")} className={btnClass}>4</Button>
        <Button variant="ghost" onClick={() => handleDigit("5")} className={btnClass}>5</Button>
        <Button variant="ghost" onClick={() => handleDigit("6")} className={btnClass}>6</Button>
        <Button variant="ghost" onClick={() => handleOperator("+")} className={opClass}>+</Button>

        <Button variant="ghost" onClick={() => handleDigit("1")} className={btnClass}>1</Button>
        <Button variant="ghost" onClick={() => handleDigit("2")} className={btnClass}>2</Button>
        <Button variant="ghost" onClick={() => handleDigit("3")} className={btnClass}>3</Button>
        <Button variant="ghost" onClick={handleEquals} className="h-12 rounded-xl text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 row-span-2">=</Button>

        <Button variant="ghost" onClick={handleSign} className={btnClass}>±</Button>
        <Button variant="ghost" onClick={() => handleDigit("0")} className={btnClass}>0</Button>
        <Button variant="ghost" onClick={handleDecimal} className={btnClass}>.</Button>
      </div>
    </div>
  );
}