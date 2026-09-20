"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Ruler, Calculator, Grid3X3 } from "lucide-react";
import { calculateLandArea, getCropList, type LandAreaResult } from "@/lib/farming/engine";

const SHAPES = [
  { value: "rectangle", label: "Rectangle" },
  { value: "square", label: "Square" },
  { value: "triangle", label: "Triangle" },
  { value: "circle", label: "Circle" },
  { value: "trapezoid", label: "Trapezoid" },
];

const DIMENSION_LABELS: Record<string, string[]> = {
  rectangle: ["Length (m)", "Width (m)"],
  square: ["Side (m)"],
  triangle: ["Base (m)", "Height (m)"],
  circle: ["Radius (m)"],
  trapezoid: ["Side A (m)", "Side B (m)", "Height (m)"],
};

export function LandAreaCalculator() {
  const [shape, setShape] = useState("rectangle");
  const [dimensions, setDimensions] = useState<string[]>(["", ""]);
  const [crop, setCrop] = useState("");
  const [result, setResult] = useState<LandAreaResult | null>(null);
  const [error, setError] = useState("");

  const crops = getCropList();

  const handleShapeChange = (s: string | null) => {
    const shapeValue = s || "rectangle";
    setShape(shapeValue);
    const count = DIMENSION_LABELS[shapeValue].length;
    setDimensions(Array(count).fill(""));
    setResult(null);
  };

  const handleCalculate = () => {
    setError("");
    const nums = dimensions.map(Number);
    if (nums.some(n => !n || n <= 0)) { setError("Please enter all dimensions"); return; }

    const r = calculateLandArea(shape as "rectangle" | "square" | "triangle" | "circle" | "trapezoid", nums, 0.5, crop || undefined);
    setResult(r);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label className="text-xs">Shape</Label>
        <Select value={shape} onValueChange={handleShapeChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SHAPES.map((s) => (
              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className={`grid gap-2 ${dimensions.length > 2 ? "grid-cols-3" : dimensions.length === 2 ? "grid-cols-2" : "grid-cols-1"}`}>
        {DIMENSION_LABELS[shape].map((label, i) => (
          <div key={i} className="space-y-1">
            <Label className="text-xs">{label}</Label>
            <Input
              type="number"
              placeholder="0"
              value={dimensions[i]}
              onChange={(e) => {
                const next = [...dimensions];
                next[i] = e.target.value;
                setDimensions(next);
              }}
              min="0.01"
              step="0.01"
            />
          </div>
        ))}
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Crop (optional — to estimate plant count)</Label>
        <Select value={crop} onValueChange={(v) => setCrop(v ?? "")}>
          <SelectTrigger>
            <SelectValue placeholder="Select crop..." />
          </SelectTrigger>
          <SelectContent>
            {crops.map((c) => (
              <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <Button onClick={handleCalculate} className="w-full gap-2 bg-green-600 hover:bg-green-700">
        <Calculator className="h-4 w-4" /> Calculate Area
      </Button>

      {result && (
        <div className="space-y-3 animate-fade-in-up">
          <Separator />
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-3">
              <p className="text-xs text-muted-foreground">Square Meters</p>
              <p className="text-lg font-bold">{result.areaInSqMeters.toLocaleString()} m²</p>
            </div>
            <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-3">
              <p className="text-xs text-muted-foreground">Hectares</p>
              <p className="text-lg font-bold">{result.areaInHectares} ha</p>
            </div>
            <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3">
              <p className="text-xs text-muted-foreground">Acres</p>
              <p className="text-lg font-bold">{result.areaInAcres} ac</p>
            </div>
            <div className="rounded-lg bg-purple-500/10 border border-purple-500/20 p-3">
              <p className="text-xs text-muted-foreground">Perimeter</p>
              <p className="text-lg font-bold">{result.perimeter} m</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground">Plantable Area</p>
              <p className="text-base font-semibold">{result.plantableArea} m²</p>
            </div>
            {result.estimatedPlants > 0 && (
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Grid3X3 className="h-3 w-3" /> Est. Plants
                </p>
                <p className="text-base font-semibold">{result.estimatedPlants.toLocaleString()}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}