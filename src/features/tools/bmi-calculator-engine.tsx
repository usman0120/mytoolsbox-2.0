"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { calculateBMI } from "@/features/tools/bmi-calculator";

export function BMICalculatorEngine() {
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [result, setResult] = useState<ReturnType<typeof calculateBMI> | null>(null);

  const handleCalculate = () => {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    if (isNaN(w) || isNaN(h) || w <= 0 || h <= 0) return;
    setResult(calculateBMI(w, h));
  };

  const categoryColors: Record<string, string> = {
    "Underweight": "text-blue-500",
    "Normal weight": "text-green-500",
    "Overweight": "text-yellow-500",
    "Obese": "text-red-500",
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-sm mb-1.5 block">Weight (kg)</Label>
          <Input type="number" placeholder="70" value={weight} onChange={(e) => setWeight(e.target.value)} />
        </div>
        <div>
          <Label className="text-sm mb-1.5 block">Height (cm)</Label>
          <Input type="number" placeholder="170" value={height} onChange={(e) => setHeight(e.target.value)} />
        </div>
      </div>

      <Button onClick={handleCalculate} className="w-full gap-2" disabled={!weight || !height}>
        <Heart className="h-4 w-4" /> Calculate BMI
      </Button>

      {result && (
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-4xl font-bold">{result.bmi}</p>
            <p className={`text-lg font-medium mt-1 ${categoryColors[result.category] || ""}`}>{result.category}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}