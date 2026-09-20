"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { DollarSign, Calculator, TrendingUp, TrendingDown, PiggyBank, Target } from "lucide-react";
import { calculateCostProfit, getCropList, type CostProfitResult } from "@/lib/farming/engine";

export function CostProfitCalculator() {
  const [crop, setCrop] = useState("");
  const [area, setArea] = useState("");
  const [yieldKg, setYieldKg] = useState("");
  const [price, setPrice] = useState("");
  const [result, setResult] = useState<CostProfitResult | null>(null);
  const [error, setError] = useState("");

  const crops = getCropList();

  const handleCalculate = () => {
    setError("");
    if (!crop) { setError("Please select a crop"); return; }
    const areaNum = parseFloat(area);
    const yieldNum = parseFloat(yieldKg);
    if (!areaNum || areaNum <= 0) { setError("Please enter a valid area"); return; }
    if (!yieldNum || yieldNum <= 0) { setError("Please enter yield amount"); return; }

    const r = calculateCostProfit(crop, areaNum, yieldNum, price ? parseFloat(price) : undefined);
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
          <Label className="text-xs">Total Yield (kg)</Label>
          <Input type="number" placeholder="e.g. 9000" value={yieldKg} onChange={(e) => setYieldKg(e.target.value)} min="1" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Market Price/kg (optional)</Label>
          <Input type="number" placeholder="Auto if empty" value={price} onChange={(e) => setPrice(e.target.value)} min="0.01" step="0.01" />
        </div>
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <Button onClick={handleCalculate} className="w-full gap-2 bg-green-600 hover:bg-green-700">
        <Calculator className="h-4 w-4" /> Calculate Profit
      </Button>

      {result && (
        <div className="space-y-3 animate-fade-in-up">
          <Separator />

          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <TrendingDown className="h-3 w-3" /> Total Cost
              </p>
              <p className="text-lg font-bold text-red-600">₹{result.totalCost.toLocaleString()}</p>
            </div>
            <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-3">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <TrendingUp className="h-3 w-3" /> Total Revenue
              </p>
              <p className="text-lg font-bold text-green-600">₹{result.totalRevenue.toLocaleString()}</p>
            </div>
          </div>

          {/* Net Profit */}
          <div className={`rounded-lg p-4 ${result.netProfit >= 0 ? "bg-green-500/10 border border-green-500/20" : "bg-red-500/10 border border-red-500/20"}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <PiggyBank className="h-3 w-3" /> Net Profit
                </p>
                <p className={`text-2xl font-bold ${result.netProfit >= 0 ? "text-green-700" : "text-red-700"}`}>
                  ₹{result.netProfit.toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">ROI</p>
                <p className={`text-xl font-bold ${result.roi >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {result.roi}%
                </p>
              </div>
            </div>
            <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
              <span>Profit/unit: ₹{result.profitPerUnit}/kg</span>
              <span className="flex items-center gap-1">
                <Target className="h-3 w-3" /> Break-even: {result.breakEvenYield.toLocaleString()} kg
              </span>
            </div>
          </div>

          {/* Cost Breakdown */}
          <div className="rounded-lg bg-muted/30 p-3">
            <p className="text-xs font-medium mb-2">Cost Breakdown</p>
            <div className="space-y-1.5">
              {result.costBreakdown.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{item.category}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: `${item.percentage}%` }} />
                    </div>
                    <span className="font-medium w-16 text-right">₹{item.amount.toLocaleString()}</span>
                    <span className="text-muted-foreground w-8 text-right">{item.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sensitivity Analysis */}
          <div className="rounded-lg bg-amber-500/5 border border-amber-500/20 p-3">
            <p className="text-xs font-medium mb-2 text-amber-700">Sensitivity Analysis</p>
            <div className="space-y-1">
              {result.sensitivityAnalysis.map((s, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{s.scenario}</span>
                  <span className={`font-medium ${s.profit >= 0 ? "text-green-600" : "text-red-600"}`}>
                    ₹{s.profit.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}