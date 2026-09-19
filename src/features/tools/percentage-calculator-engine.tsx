"use client";

import { useState } from "react";
import { Percent } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { calculatePercentage, percentageOf, percentageChange } from "@/features/tools/percentage-calculator";

export function PercentageCalculatorEngine() {
  const [mode, setMode] = useState<"percent" | "of" | "change">("percent");
  const [value1, setValue1] = useState("");
  const [value2, setValue2] = useState("");
  const [value3, setValue3] = useState("");
  const [result, setResult] = useState<number | null>(null);

  const handleCalculate = () => {
    const v1 = parseFloat(value1);
    const v2 = parseFloat(value2);
    const v3 = parseFloat(value3);

    if (isNaN(v1)) return;

    switch (mode) {
      case "percent":
        if (!isNaN(v2)) setResult(calculatePercentage(v1, v2));
        break;
      case "of":
        if (!isNaN(v2)) setResult(percentageOf(v1, v2));
        break;
      case "change":
        if (!isNaN(v2)) setResult(percentageChange(v1, v2));
        break;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {(["percent", "of", "change"] as const).map((m) => (
          <Button key={m} variant={mode === m ? "default" : "outline"} size="sm" onClick={() => { setMode(m); setResult(null); }}>
            {m === "percent" ? "What % is X of Y" : m === "of" ? "X% of Y" : "% Change"}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-sm mb-1.5 block">
            {mode === "change" ? "From" : mode === "of" ? "Percent (%)" : "Value"}
          </Label>
          <Input type="number" value={value1} onChange={(e) => setValue1(e.target.value)} />
        </div>
        <div>
          <Label className="text-sm mb-1.5 block">
            {mode === "change" ? "To" : "Total"}
          </Label>
          <Input type="number" value={value2} onChange={(e) => setValue2(e.target.value)} />
        </div>
      </div>

      <Button onClick={handleCalculate} className="w-full gap-2" disabled={!value1 || !value2}>
        <Percent className="h-4 w-4" /> Calculate
      </Button>

      {result !== null && (
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold">{result.toFixed(2)}{mode !== "change" ? "%" : "% change"}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {mode === "percent" && `${value1} is ${result.toFixed(2)}% of ${value2}`}
              {mode === "of" && `${value1}% of ${value2} = ${result.toFixed(2)}`}
              {mode === "change" && `Change from ${value1} to ${value2}`}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}