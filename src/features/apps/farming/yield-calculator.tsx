"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { TrendingUp, Calculator, AlertTriangle, CheckCircle, Target } from "lucide-react";
import { calculateYield, getCropList, type YieldResult } from "@/lib/farming/engine";

const IRRIGATION_TYPES = [
  { value: "rainfed", label: "Rainfed" },
  { value: "partial", label: "Partial Irrigation" },
  { value: "full", label: "Full Irrigation" },
];

const PEST_LEVELS = [
  { value: "none", label: "None" },
  { value: "minor", label: "Minor" },
  { value: "moderate", label: "Moderate" },
  { value: "severe", label: "Severe" },
];

export function YieldCalculator() {
  const [crop, setCrop] = useState("");
  const [area, setArea] = useState("");
  const [harvest, setHarvest] = useState("");
  const [irrigation, setIrrigation] = useState("full");
  const [pestDamage, setPestDamage] = useState("none");
  const [result, setResult] = useState<YieldResult | null>(null);
  const [error, setError] = useState("");

  const crops = getCropList();

  const handleCalculate = () => {
    setError("");
    if (!crop) { setError("Please select a crop"); return; }
    const areaNum = parseFloat(area);
    const harvestNum = parseFloat(harvest);
    if (!areaNum || areaNum <= 0) { setError("Please enter a valid area"); return; }
    if (!harvestNum || harvestNum <= 0) { setError("Please enter actual harvest weight"); return; }

    const r = calculateYield(crop, areaNum, harvestNum, irrigation as "rainfed" | "partial" | "full", pestDamage as "none" | "minor" | "moderate" | "severe");
    setResult(r);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Crop</Label>
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
        <div className="space-y-1.5">
          <Label className="text-xs">Area (hectares)</Label>
          <Input type="number" placeholder="e.g. 2" value={area} onChange={(e) => setArea(e.target.value)} min="0.01" step="0.01" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Actual Harvest (kg)</Label>
          <Input type="number" placeholder="e.g. 8000" value={harvest} onChange={(e) => setHarvest(e.target.value)} min="1" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Irrigation Type</Label>
          <Select value={irrigation} onValueChange={(v) => setIrrigation(v ?? "")}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {IRRIGATION_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Pest/Disease Damage</Label>
        <Select value={pestDamage} onValueChange={(v) => setPestDamage(v ?? "")}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PEST_LEVELS.map((p) => (
              <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <Button onClick={handleCalculate} className="w-full gap-2 bg-green-600 hover:bg-green-700">
        <Calculator className="h-4 w-4" /> Analyze Yield
      </Button>

      {result && (
        <div className="space-y-3 animate-fade-in-up">
          <Separator />

          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-3">
              <p className="text-xs text-muted-foreground">Yield per Hectare</p>
              <p className="text-lg font-bold text-green-700">{result.yieldPerHectare.toLocaleString()} kg/ha</p>
            </div>
            <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-3">
              <p className="text-xs text-muted-foreground">Yield per Acre</p>
              <p className="text-lg font-bold text-blue-700">{result.yieldPerAcre.toLocaleString()} kg/ac</p>
            </div>
          </div>

          <div className="rounded-lg bg-muted/50 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Expected Optimal Yield</p>
                <p className="text-lg font-bold">{result.expectedYield.toLocaleString()} kg</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                  <Target className="h-3 w-3" /> Efficiency
                </p>
                <p className={`text-lg font-bold ${result.efficiency >= 80 ? "text-green-600" : result.efficiency >= 60 ? "text-amber-600" : "text-red-600"}`}>
                  {result.efficiency}%
                </p>
              </div>
            </div>
          </div>

          {result.improvementTips.length > 0 && (
            <div className="rounded-lg bg-amber-500/5 border border-amber-500/20 p-3">
              <p className="text-xs font-medium mb-2 flex items-center gap-1 text-amber-700">
                <AlertTriangle className="h-3 w-3" /> Improvement Tips
              </p>
              <ul className="space-y-1">
                {result.improvementTips.map((tip, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex gap-1.5">
                    <span className="text-amber-500 shrink-0">•</span> {tip}
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