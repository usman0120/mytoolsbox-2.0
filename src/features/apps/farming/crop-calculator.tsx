"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Sprout, Calculator, TrendingUp, Calendar, Lightbulb } from "lucide-react";
import { calculateCrop, getCropList, type CropResult } from "@/lib/farming/engine";

const SOIL_QUALITIES = [
  { value: "poor", label: "Poor" },
  { value: "average", label: "Average" },
  { value: "good", label: "Good" },
  { value: "excellent", label: "Excellent" },
];

export function CropCalculator() {
  const [crop, setCrop] = useState("");
  const [area, setArea] = useState("");
  const [soilQuality, setSoilQuality] = useState("average");
  const [result, setResult] = useState<CropResult | null>(null);
  const [error, setError] = useState("");

  const crops = getCropList();

  const handleCalculate = () => {
    setError("");
    if (!crop) { setError("Please select a crop"); return; }
    const areaNum = parseFloat(area);
    if (!areaNum || areaNum <= 0) { setError("Please enter a valid area"); return; }

    const r = calculateCrop(crop, areaNum, soilQuality as "poor" | "average" | "good" | "excellent");
    setResult(r);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
          <Input
            type="number"
            placeholder="e.g. 2.5"
            value={area}
            onChange={(e) => setArea(e.target.value)}
            min="0.01"
            step="0.01"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Soil Quality</Label>
          <Select value={soilQuality} onValueChange={setSoilQuality}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SOIL_QUALITIES.map((sq) => (
                <SelectItem key={sq.value} value={sq.value}>{sq.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <Button onClick={handleCalculate} className="w-full gap-2 bg-green-600 hover:bg-green-700">
        <Calculator className="h-4 w-4" /> Calculate
      </Button>

      {result && (
        <div className="space-y-3 animate-fade-in-up">
          <Separator />
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-3">
              <p className="text-xs text-muted-foreground">Estimated Yield</p>
              <p className="text-lg font-bold text-green-700 dark:text-green-300">
                {(result.estimatedYield / 1000).toFixed(1)} tons
              </p>
              <p className="text-xs text-muted-foreground">{result.yieldPerUnit} kg/ha</p>
            </div>
            <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-3">
              <p className="text-xs text-muted-foreground">Revenue</p>
              <p className="text-lg font-bold text-blue-700 dark:text-blue-300">
                ₹{result.totalRevenue.toLocaleString()}
              </p>
            </div>
            <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" /> Harvest Date
              </p>
              <p className="text-sm font-semibold">{result.harvestDate}</p>
              <p className="text-xs text-muted-foreground">{result.growingDays} days</p>
            </div>
            <div className="rounded-lg bg-purple-500/10 border border-purple-500/20 p-3">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <TrendingUp className="h-3 w-3" /> Yield per Ha
              </p>
              <p className="text-lg font-bold">{(result.yieldPerUnit / 1000).toFixed(2)} tons</p>
            </div>
          </div>

          {result.recommendations.length > 0 && (
            <div className="rounded-lg bg-muted/30 p-3">
              <p className="text-xs font-medium mb-2 flex items-center gap-1">
                <Lightbulb className="h-3 w-3 text-amber-500" /> Recommendations
              </p>
              <ul className="space-y-1">
                {result.recommendations.map((rec, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex gap-1.5">
                    <span className="text-green-500 shrink-0">•</span> {rec}
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