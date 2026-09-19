"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Calendar, Calculator, Flower2, Ban, CheckCircle, ChevronRight } from "lucide-react";
import { planPlanting, getCropList, type PlantingPlan } from "@/lib/farming/engine";

export function PlantingPlanner() {
  const [crop, setCrop] = useState("");
  const [plantingDate, setPlantingDate] = useState("");
  const [result, setResult] = useState<PlantingPlan | null>(null);
  const [error, setError] = useState("");

  const crops = getCropList();

  const handlePlan = () => {
    setError("");
    if (!crop) { setError("Please select a crop"); return; }
    const r = planPlanting(crop, plantingDate || undefined);
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
          <Label className="text-xs">Planting Date (optional)</Label>
          <Input type="date" value={plantingDate} onChange={(e) => setPlantingDate(e.target.value)} />
        </div>
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <Button onClick={handlePlan} className="w-full gap-2 bg-green-600 hover:bg-green-700">
        <Calculator className="h-4 w-4" /> Generate Plan
      </Button>

      {result && (
        <div className="space-y-3 animate-fade-in-up">
          <Separator />

          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-3">
              <p className="text-xs text-muted-foreground">Sowing Date</p>
              <p className="text-sm font-bold text-green-700">{result.sowingDate}</p>
            </div>
            <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-3">
              <p className="text-xs text-muted-foreground">First Harvest</p>
              <p className="text-sm font-bold text-blue-700">{result.firstHarvestDate}</p>
            </div>
            <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3">
              <p className="text-xs text-muted-foreground">Transplant By</p>
              <p className="text-sm font-semibold">{result.transplantDate}</p>
            </div>
            <div className="rounded-lg bg-purple-500/10 border border-purple-500/20 p-3">
              <p className="text-xs text-muted-foreground">Growing Season</p>
              <p className="text-sm font-semibold">{result.growingSeason}</p>
            </div>
          </div>

          {/* Companion & Avoid */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-green-500/5 border border-green-500/20 p-3">
              <p className="text-xs font-medium mb-1.5 flex items-center gap-1 text-green-700">
                <Flower2 className="h-3 w-3" /> Companion Plants
              </p>
              <div className="flex flex-wrap gap-1">
                {result.companionPlants.map((p, i) => (
                  <span key={i} className="text-xs bg-green-500/10 text-green-700 px-2 py-0.5 rounded-full">{p}</span>
                ))}
              </div>
            </div>
            <div className="rounded-lg bg-red-500/5 border border-red-500/20 p-3">
              <p className="text-xs font-medium mb-1.5 flex items-center gap-1 text-red-700">
                <Ban className="h-3 w-3" /> Avoid Planting Near
              </p>
              <div className="flex flex-wrap gap-1">
                {result.avoidPlants.map((p, i) => (
                  <span key={i} className="text-xs bg-red-500/10 text-red-700 px-2 py-0.5 rounded-full">{p}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Care Schedule */}
          <div className="rounded-lg bg-muted/30 p-3">
            <p className="text-xs font-medium mb-2 flex items-center gap-1">
              <Calendar className="h-3 w-3 text-green-500" /> Care Schedule
            </p>
            <div className="space-y-1.5 max-h-64 overflow-y-auto">
              {result.careSchedule.map((item, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <span className="bg-green-500/10 text-green-700 font-medium px-1.5 py-0.5 rounded shrink-0">
                    Wk {item.week}
                  </span>
                  <span className="text-muted-foreground">{item.task}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}