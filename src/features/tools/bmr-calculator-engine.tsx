"use client";

import { useState } from "react";
import { Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function BMRCalculatorEngine() {
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [result, setResult] = useState<number | null>(null);

  const calculate = () => {
    const w = Number(weight);
    const h = Number(height);
    const a = Number(age);
    if (!w || !h || !a) return;

    let bmr: number;
    if (unit === "metric") {
      bmr = gender === "male" ? 10 * w + 6.25 * h - 5 * a + 5 : 10 * w + 6.25 * h - 5 * a - 161;
    } else {
      bmr = gender === "male" ? 10 * (w * 0.453592) + 6.25 * (h * 2.54) - 5 * a + 5 : 10 * (w * 0.453592) + 6.25 * (h * 2.54) - 5 * a - 161;
    }
    setResult(Math.round(bmr));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Badge variant="secondary" className="rounded-full">BMR Calculator</Badge>
        <span className="text-xs text-muted-foreground">Basal Metabolic Rate - calories burned at rest</span>
      </div>

      <div className="flex gap-2">
        <Button variant={unit === "metric" ? "default" : "outline"} size="sm" onClick={() => setUnit("metric")} className="rounded-xl text-xs">Metric (kg/cm)</Button>
        <Button variant={unit === "imperial" ? "default" : "outline"} size="sm" onClick={() => setUnit("imperial")} className="rounded-xl text-xs">Imperial (lbs/in)</Button>
      </div>

      <div className="flex gap-2">
        <Button variant={gender === "male" ? "default" : "outline"} size="sm" onClick={() => setGender("male")} className="rounded-xl text-xs flex-1">Male</Button>
        <Button variant={gender === "female" ? "default" : "outline"} size="sm" onClick={() => setGender("female")} className="rounded-xl text-xs flex-1">Female</Button>
      </div>

      <div className="space-y-3">
        <div className="space-y-1.5">
          <label className="text-xs font-medium">Age</label>
          <input type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="25" className="w-full px-3 py-2 text-sm rounded-xl border border-border/50 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium">Weight ({unit === "metric" ? "kg" : "lbs"})</label>
          <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder={unit === "metric" ? "70" : "154"} className="w-full px-3 py-2 text-sm rounded-xl border border-border/50 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium">Height ({unit === "metric" ? "cm" : "inches"})</label>
          <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} placeholder={unit === "metric" ? "170" : "67"} className="w-full px-3 py-2 text-sm rounded-xl border border-border/50 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
      </div>

      <Button onClick={calculate} disabled={!age || !weight || !height} className="gap-2 rounded-xl w-full"><Calculator className="h-4 w-4" />Calculate BMR</Button>

      {result !== null && (
        <div className="p-4 bg-muted/30 rounded-xl text-center">
          <div className="text-2xl font-bold">{result.toLocaleString()}</div>
          <div className="text-sm text-muted-foreground">calories/day at rest</div>
          <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-muted-foreground">
            <div className="p-2 bg-background rounded-lg"><div className="font-bold">{Math.round(result * 1.2).toLocaleString()}</div>Sedentary</div>
            <div className="p-2 bg-background rounded-lg"><div className="font-bold">{Math.round(result * 1.55).toLocaleString()}</div>Moderate</div>
            <div className="p-2 bg-background rounded-lg"><div className="font-bold">{Math.round(result * 1.9).toLocaleString()}</div>Very Active</div>
          </div>
        </div>
      )}
    </div>
  );
}