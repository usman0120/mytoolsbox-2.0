"use client";

import { useState, useMemo } from "react";
import {
  Heart,
  Scale,
  Sparkles,
  Info,
  ArrowRight,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  calculateDetailedBMI,
  DetailedBMI,
} from "@/features/tools/bmi-calculator";

export function BMICalculatorEngine() {
  const [unitSystem, setUnitSystem] = useState<"metric" | "imperial">("metric");

  // Metric state
  const [weightKg, setWeightKg] = useState("70");
  const [heightCm, setHeightCm] = useState("175");

  // Imperial state
  const [weightLbs, setWeightLbs] = useState("154");
  const [heightFeet, setHeightFeet] = useState("5");
  const [heightInches, setHeightInches] = useState("9");

  const detailedResult: DetailedBMI | null = useMemo(() => {
    let w = 0;
    let h = 0;

    if (unitSystem === "metric") {
      w = parseFloat(weightKg);
      h = parseFloat(heightCm);
    } else {
      const lbs = parseFloat(weightLbs);
      const ft = parseFloat(heightFeet) || 0;
      const inch = parseFloat(heightInches) || 0;
      const totalInches = ft * 12 + inch;
      w = lbs * 0.45359237;
      h = totalInches * 2.54;
    }

    if (isNaN(w) || isNaN(h) || w <= 0 || h <= 0) return null;
    return calculateDetailedBMI(w, h);
  }, [unitSystem, weightKg, heightCm, weightLbs, heightFeet, heightInches]);

  // Position on BMI visual bar (range 15 to 40)
  const needlePosition = useMemo(() => {
    if (!detailedResult) return 50;
    const clamped = Math.min(40, Math.max(15, detailedResult.bmi));
    return ((clamped - 15) / (40 - 15)) * 100;
  }, [detailedResult]);

  return (
    <div className="space-y-6">
      {/* Unit System Switcher */}
      <div className="flex items-center gap-2 p-1.5 bg-muted/50 rounded-xl border w-fit">
        <Button
          variant={unitSystem === "metric" ? "default" : "ghost"}
          size="sm"
          onClick={() => setUnitSystem("metric")}
          className="text-xs h-8"
        >
          Metric (kg / cm)
        </Button>
        <Button
          variant={unitSystem === "imperial" ? "default" : "ghost"}
          size="sm"
          onClick={() => setUnitSystem("imperial")}
          className="text-xs h-8"
        >
          Imperial (lbs / ft &amp; in)
        </Button>
      </div>

      {/* Inputs & Output Split */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Input Card */}
        <div className="rounded-xl border bg-card p-5 shadow-xs space-y-4">
          <div className="pb-2 border-b">
            <h3 className="font-semibold text-sm">Enter Your Measurements</h3>
            <p className="text-xs text-muted-foreground">
              Provide height and body weight for body mass indexing
            </p>
          </div>

          {unitSystem === "metric" ? (
            <div className="space-y-3">
              <div>
                <Label className="text-xs font-semibold mb-1.5 block">
                  Weight (Kilograms)
                </Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="70"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  className="h-10 text-sm font-mono"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold mb-1.5 block">
                  Height (Centimeters)
                </Label>
                <Input
                  type="number"
                  step="0.5"
                  placeholder="175"
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value)}
                  className="h-10 text-sm font-mono"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <Label className="text-xs font-semibold mb-1.5 block">
                  Weight (Pounds / lbs)
                </Label>
                <Input
                  type="number"
                  step="0.5"
                  placeholder="154"
                  value={weightLbs}
                  onChange={(e) => setWeightLbs(e.target.value)}
                  className="h-10 text-sm font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs font-semibold mb-1.5 block">Feet</Label>
                  <Input
                    type="number"
                    placeholder="5"
                    value={heightFeet}
                    onChange={(e) => setHeightFeet(e.target.value)}
                    className="h-10 text-sm font-mono"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold mb-1.5 block">Inches</Label>
                  <Input
                    type="number"
                    placeholder="9"
                    value={heightInches}
                    onChange={(e) => setHeightInches(e.target.value)}
                    className="h-10 text-sm font-mono"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Output & Classification Card */}
        {detailedResult ? (
          <div className="rounded-xl border bg-card p-5 shadow-xs flex flex-col justify-between space-y-4">
            <div className="pb-2 border-b flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Body Mass Index (BMI)
              </span>
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: `${detailedResult.categoryColor}20`,
                  color: detailedResult.categoryColor,
                }}
              >
                {detailedResult.category}
              </span>
            </div>

            <div className="text-center py-2">
              <span className="text-5xl font-extrabold font-mono tracking-tight text-foreground">
                {detailedResult.bmi}
              </span>
              <span className="text-xs text-muted-foreground block mt-1">
                kg/m²
              </span>
            </div>

            {/* Visual Color Spectrum Bar */}
            <div className="space-y-1.5">
              <div className="relative h-3 w-full rounded-full overflow-hidden flex">
                <div className="w-[20%] bg-blue-400" title="Underweight (<18.5)" />
                <div className="w-[30%] bg-emerald-500" title="Normal (18.5-24.9)" />
                <div className="w-[25%] bg-amber-400" title="Overweight (25-29.9)" />
                <div className="w-[25%] bg-rose-500" title="Obese (≥30)" />
              </div>
              <div className="relative w-full h-3">
                <div
                  className="absolute -top-1 w-2.5 h-2.5 bg-foreground border-2 border-background rounded-full -translate-x-1/2 shadow-xs transition-all duration-300"
                  style={{ left: `${needlePosition}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                <span>15 (Under)</span>
                <span>18.5</span>
                <span>25.0</span>
                <span>30.0</span>
                <span>40+ (Obese)</span>
              </div>
            </div>

            {/* Healthy Range & Advice */}
            <div className="p-3 bg-muted/40 rounded-xl border text-xs space-y-1">
              <p className="font-semibold text-foreground flex items-center gap-1.5">
                <Heart className="h-3.5 w-3.5 text-primary" /> Healthy Weight Target Range:
              </p>
              <p className="text-muted-foreground">
                For your height, healthy normal weight is{" "}
                <strong className="text-foreground">
                  {unitSystem === "metric"
                    ? `${detailedResult.healthyWeightRange.minKg} kg – ${detailedResult.healthyWeightRange.maxKg} kg`
                    : `${detailedResult.healthyWeightRange.minLbs} lbs – ${detailedResult.healthyWeightRange.maxLbs} lbs`}
                </strong>
                .
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border bg-card p-5 shadow-xs flex items-center justify-center text-center text-muted-foreground">
            <p className="text-xs">Enter your height and weight to calculate BMI.</p>
          </div>
        )}
      </div>
    </div>
  );
}