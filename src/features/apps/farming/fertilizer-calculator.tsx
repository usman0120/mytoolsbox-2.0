"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { FlaskConical, Calculator, Leaf, Beaker } from "lucide-react";
import { calculateFertilizer, getCropList, type FertilizerResult } from "@/lib/farming/engine";

export function FertilizerCalculator() {
  const [crop, setCrop] = useState("");
  const [area, setArea] = useState("");
  const [soilN, setSoilN] = useState("");
  const [soilP, setSoilP] = useState("");
  const [soilK, setSoilK] = useState("");
  const [showSoilTest, setShowSoilTest] = useState(false);
  const [result, setResult] = useState<FertilizerResult | null>(null);
  const [error, setError] = useState("");

  const crops = getCropList();

  const handleCalculate = () => {
    setError("");
    if (!crop) { setError("Please select a crop"); return; }
    const areaNum = parseFloat(area);
    if (!areaNum || areaNum <= 0) { setError("Please enter a valid area"); return; }

    const r = calculateFertilizer(
      crop,
      areaNum,
      soilN ? parseFloat(soilN) : undefined,
      soilP ? parseFloat(soilP) : undefined,
      soilK ? parseFloat(soilK) : undefined,
    );
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
          <Input type="number" placeholder="e.g. 1.5" value={area} onChange={(e) => setArea(e.target.value)} min="0.01" step="0.01" />
        </div>
      </div>

      <button
        type="button"
        className="text-xs text-green-600 dark:text-green-400 hover:underline flex items-center gap-1"
        onClick={() => setShowSoilTest(!showSoilTest)}
      >
        <Beaker className="h-3 w-3" />
        {showSoilTest ? "Hide soil test results" : "I have soil test results"}
      </button>

      {showSoilTest && (
        <div className="grid grid-cols-3 gap-2 p-3 rounded-lg bg-muted/30">
          <div className="space-y-1">
            <Label className="text-[10px]">Nitrogen (N) kg/ha</Label>
            <Input type="number" placeholder="N" value={soilN} onChange={(e) => setSoilN(e.target.value)} className="h-8 text-xs" />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px]">Phosphorus (P) kg/ha</Label>
            <Input type="number" placeholder="P" value={soilP} onChange={(e) => setSoilP(e.target.value)} className="h-8 text-xs" />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px]">Potassium (K) kg/ha</Label>
            <Input type="number" placeholder="K" value={soilK} onChange={(e) => setSoilK(e.target.value)} className="h-8 text-xs" />
          </div>
        </div>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}

      <Button onClick={handleCalculate} className="w-full gap-2 bg-green-600 hover:bg-green-700">
        <Calculator className="h-4 w-4" /> Calculate Fertilizer
      </Button>

      {result && (
        <div className="space-y-3 animate-fade-in-up">
          <Separator />

          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-2 text-center">
              <p className="text-[10px] text-muted-foreground">Nitrogen (N)</p>
              <p className="text-lg font-bold text-green-700">{result.nutrientNeeds.n} kg</p>
            </div>
            <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-2 text-center">
              <p className="text-[10px] text-muted-foreground">Phosphorus (P)</p>
              <p className="text-lg font-bold text-blue-700">{result.nutrientNeeds.p} kg</p>
            </div>
            <div className="rounded-lg bg-purple-500/10 border border-purple-500/20 p-2 text-center">
              <p className="text-[10px] text-muted-foreground">Potassium (K)</p>
              <p className="text-lg font-bold text-purple-700">{result.nutrientNeeds.k} kg</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground">Total Fertilizer</p>
              <p className="text-lg font-bold">{result.fertilizerAmount} kg</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground">Estimated Cost</p>
              <p className="text-lg font-bold">₹{result.costEstimate.toLocaleString()}</p>
            </div>
          </div>

          {result.applicationSchedule.length > 0 && (
            <div className="rounded-lg bg-muted/30 p-3">
              <p className="text-xs font-medium mb-2 flex items-center gap-1">
                <FlaskConical className="h-3 w-3 text-green-500" /> Application Schedule
              </p>
              <ul className="space-y-1">
                {result.applicationSchedule.map((s, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex gap-1.5">
                    <span className="text-green-500 shrink-0">•</span> {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="rounded-lg bg-amber-500/5 border border-amber-500/20 p-3">
            <p className="text-xs font-medium mb-2 flex items-center gap-1 text-amber-700">
              <Leaf className="h-3 w-3" /> Organic Alternatives
            </p>
            <ul className="space-y-1">
              {result.organicAlternatives.map((alt, i) => (
                <li key={i} className="text-xs text-muted-foreground flex gap-1.5">
                  <span className="text-amber-500 shrink-0">•</span> {alt}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}