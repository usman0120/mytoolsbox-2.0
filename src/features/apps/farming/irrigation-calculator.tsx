"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Droplets, Calculator, Clock, Waves } from "lucide-react";
import { calculateIrrigation, getCropList, type IrrigationResult } from "@/lib/farming/engine";

const SOIL_TYPES = [
  { value: "sandy", label: "Sandy" },
  { value: "loamy", label: "Loamy" },
  { value: "clay", label: "Clay" },
];

const SEASONS = [
  { value: "summer", label: "Summer" },
  { value: "winter", label: "Winter" },
  { value: "monsoon", label: "Monsoon" },
];

export function IrrigationCalculator() {
  const [crop, setCrop] = useState("");
  const [area, setArea] = useState("");
  const [soilType, setSoilType] = useState("loamy");
  const [season, setSeason] = useState("summer");
  const [result, setResult] = useState<IrrigationResult | null>(null);
  const [error, setError] = useState("");

  const crops = getCropList();

  const handleCalculate = () => {
    setError("");
    if (!crop) { setError("Please select a crop"); return; }
    const areaNum = parseFloat(area);
    if (!areaNum || areaNum <= 0) { setError("Please enter a valid area"); return; }

    const r = calculateIrrigation(crop, areaNum, soilType as "sandy" | "loamy" | "clay", season as "summer" | "winter" | "monsoon");
    setResult(r);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Crop</Label>
          <Select value={crop} onValueChange={setCrop}>
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
        <div className="space-y-1.5">
          <Label className="text-xs">Area (hectares)</Label>
          <Input type="number" placeholder="e.g. 1" value={area} onChange={(e) => setArea(e.target.value)} min="0.01" step="0.01" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Soil Type</Label>
          <Select value={soilType} onValueChange={setSoilType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SOIL_TYPES.map((s) => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Season</Label>
          <Select value={season} onValueChange={setSeason}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SEASONS.map((s) => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <Button onClick={handleCalculate} className="w-full gap-2 bg-green-600 hover:bg-green-700">
        <Calculator className="h-4 w-4" /> Calculate Water Needs
      </Button>

      {result && (
        <div className="space-y-3 animate-fade-in-up">
          <Separator />

          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-3">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Droplets className="h-3 w-3" /> Daily Water Need
              </p>
              <p className="text-lg font-bold text-blue-700">{(result.dailyWaterNeed / 1000).toFixed(1)} m³</p>
              <p className="text-xs text-muted-foreground">{result.dailyWaterNeed.toLocaleString()} liters</p>
            </div>
            <div className="rounded-lg bg-cyan-500/10 border border-cyan-500/20 p-3">
              <p className="text-xs text-muted-foreground">Weekly Water Need</p>
              <p className="text-lg font-bold text-cyan-700">{(result.weeklyWaterNeed / 1000).toFixed(1)} m³</p>
              <p className="text-xs text-muted-foreground">{result.weeklyWaterNeed.toLocaleString()} liters</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Waves className="h-3 w-3" /> Flow Rate
              </p>
              <p className="text-base font-semibold">{result.flowRateRequired.toLocaleString()} L/hr</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" /> Duration
              </p>
              <p className="text-base font-semibold">{result.irrigationDuration} hrs/session</p>
            </div>
          </div>

          <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-3">
            <p className="text-xs text-muted-foreground">Recommended Frequency</p>
            <p className="text-base font-bold text-green-700">{result.frequency}</p>
          </div>

          {result.waterSourceAdvice.length > 0 && (
            <div className="rounded-lg bg-muted/30 p-3">
              <p className="text-xs font-medium mb-2">Water Source Advice</p>
              <ul className="space-y-1">
                {result.waterSourceAdvice.map((advice, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex gap-1.5">
                    <span className="text-blue-500 shrink-0">•</span> {advice}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}