"use client";

import { useState } from "react";
import { BarChart3, Calculator, DollarSign, Target, ShieldCheck, Layers, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { calculateBreakEven, type BreakEvenResult, type BreakEvenInput } from "@/features/tools/break-even-calculator";

interface Preset {
  name: string;
  data: BreakEvenInput;
}

const PRESETS: Preset[] = [
  {
    name: "Coffee Shop",
    data: { fixedCosts: 6000, variableCostPerUnit: 1.2, sellingPricePerUnit: 4.5, targetProfit: 3000, projectedUnits: 2500 },
  },
  {
    name: "SaaS Subscription",
    data: { fixedCosts: 15000, variableCostPerUnit: 4.0, sellingPricePerUnit: 29.0, targetProfit: 10000, projectedUnits: 1000 },
  },
  {
    name: "Hardware Gadget",
    data: { fixedCosts: 80000, variableCostPerUnit: 45.0, sellingPricePerUnit: 120.0, targetProfit: 40000, projectedUnits: 1500 },
  },
];

export function BreakEvenCalculatorEngine() {
  const [fixedCosts, setFixedCosts] = useState("15000");
  const [variableCostPerUnit, setVariableCostPerUnit] = useState("4.00");
  const [sellingPricePerUnit, setSellingPricePerUnit] = useState("29.00");
  const [targetProfit, setTargetProfit] = useState("10000");
  const [projectedUnits, setProjectedUnits] = useState("1200");

  const [result, setResult] = useState<BreakEvenResult | null>(() =>
    calculateBreakEven({
      fixedCosts: 15000,
      variableCostPerUnit: 4.0,
      sellingPricePerUnit: 29.0,
      targetProfit: 10000,
      projectedUnits: 1200,
    })
  );

  const handleCalculate = () => {
    const fc = parseFloat(fixedCosts) || 0;
    const vc = parseFloat(variableCostPerUnit) || 0;
    const sp = parseFloat(sellingPricePerUnit) || 0;
    const tp = parseFloat(targetProfit) || 0;
    const pu = parseFloat(projectedUnits) || 0;

    const res = calculateBreakEven({
      fixedCosts: fc,
      variableCostPerUnit: vc,
      sellingPricePerUnit: sp,
      targetProfit: tp,
      projectedUnits: pu,
    });
    setResult(res);
  };

  const applyPreset = (preset: Preset) => {
    setFixedCosts(String(preset.data.fixedCosts));
    setVariableCostPerUnit(String(preset.data.variableCostPerUnit));
    setSellingPricePerUnit(String(preset.data.sellingPricePerUnit));
    setTargetProfit(String(preset.data.targetProfit || 0));
    setProjectedUnits(String(preset.data.projectedUnits || 0));
    setResult(calculateBreakEven(preset.data));
  };

  return (
    <div className="space-y-4">
      {/* Presets */}
      <div className="flex flex-wrap items-center gap-1.5 p-3 rounded-xl border bg-card/60">
        <span className="text-xs text-muted-foreground mr-1">Industry Presets:</span>
        {PRESETS.map(p => (
          <Button
            key={p.name}
            variant="outline"
            size="sm"
            className="text-xs h-7"
            onClick={() => applyPreset(p)}
          >
            <Sparkles className="h-3 w-3 mr-1" />
            {p.name}
          </Button>
        ))}
      </div>

      {/* Input Parameters */}
      <div className="p-4 rounded-xl border bg-card/60 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <Label className="text-xs mb-1.5 block font-medium">Total Fixed Costs ($)</Label>
            <Input
              type="number"
              value={fixedCosts}
              onChange={e => setFixedCosts(e.target.value)}
              placeholder="15000"
              className="font-mono text-sm"
            />
            <span className="text-[11px] text-muted-foreground block mt-1">Rent, salaries, software, etc.</span>
          </div>

          <div>
            <Label className="text-xs mb-1.5 block font-medium">Variable Cost / Unit ($)</Label>
            <Input
              type="number"
              value={variableCostPerUnit}
              onChange={e => setVariableCostPerUnit(e.target.value)}
              placeholder="4.00"
              step="0.01"
              className="font-mono text-sm"
            />
            <span className="text-[11px] text-muted-foreground block mt-1">Materials, shipping, fees</span>
          </div>

          <div>
            <Label className="text-xs mb-1.5 block font-medium">Selling Price / Unit ($)</Label>
            <Input
              type="number"
              value={sellingPricePerUnit}
              onChange={e => setSellingPricePerUnit(e.target.value)}
              placeholder="29.00"
              step="0.01"
              className="font-mono text-sm"
            />
            <span className="text-[11px] text-muted-foreground block mt-1">Retail or subscription price</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div>
            <Label className="text-xs mb-1.5 block font-medium">Target Net Profit ($)</Label>
            <Input
              type="number"
              value={targetProfit}
              onChange={e => setTargetProfit(e.target.value)}
              placeholder="10000"
              className="font-mono text-sm"
            />
            <span className="text-[11px] text-muted-foreground block mt-1">Desired profit above break-even</span>
          </div>

          <div>
            <Label className="text-xs mb-1.5 block font-medium">Expected / Projected Sales (Units)</Label>
            <Input
              type="number"
              value={projectedUnits}
              onChange={e => setProjectedUnits(e.target.value)}
              placeholder="1200"
              className="font-mono text-sm"
            />
            <span className="text-[11px] text-muted-foreground block mt-1">Used to calculate Margin of Safety</span>
          </div>
        </div>

        <Button onClick={handleCalculate} className="w-full gap-2">
          <BarChart3 className="h-4 w-4" /> Calculate Break-Even Metrics
        </Button>
      </div>

      {/* Results Dashboard */}
      {result && (
        <div className="space-y-4">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-3">
                <span className="text-xs text-muted-foreground block font-medium">Break-Even Units</span>
                <span className="font-mono text-xl sm:text-2xl font-bold text-foreground">
                  {result.breakEvenUnits === Infinity ? "N/A" : result.breakEvenUnits.toLocaleString()} units
                </span>
                <span className="text-[11px] text-muted-foreground block mt-0.5">Zero profit / loss</span>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-3">
                <span className="text-xs text-muted-foreground block font-medium">Break-Even Revenue</span>
                <span className="font-mono text-xl sm:text-2xl font-bold text-foreground">
                  {result.breakEvenRevenue === Infinity ? "N/A" : `$${result.breakEvenRevenue.toLocaleString()}`}
                </span>
                <span className="text-[11px] text-muted-foreground block mt-0.5">Required sales volume</span>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-3">
                <span className="text-xs text-muted-foreground block font-medium">Contribution Margin</span>
                <span className="font-mono text-xl sm:text-2xl font-bold text-emerald-500">
                  ${result.contributionMargin.toLocaleString()}
                </span>
                <span className="text-[11px] text-muted-foreground block mt-0.5">{result.contributionMarginRatio}% CM Ratio</span>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-3">
                <span className="text-xs text-muted-foreground block font-medium">Target Profit Units</span>
                <span className="font-mono text-xl sm:text-2xl font-bold text-blue-500">
                  {result.unitsForTargetProfit === Infinity ? "N/A" : result.unitsForTargetProfit.toLocaleString()} units
                </span>
                <span className="text-[11px] text-muted-foreground block mt-0.5">For ${result.targetProfit.toLocaleString()} profit</span>
              </CardContent>
            </Card>
          </div>

          {/* Margin of Safety Card */}
          {result.projectedUnits > 0 && result.breakEvenUnits !== Infinity && (
            <Card className={result.marginOfSafetyPercent >= 0 ? "border-emerald-500/30 bg-emerald-500/5" : "border-destructive/30 bg-destructive/5"}>
              <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className={`h-4 w-4 ${result.marginOfSafetyPercent >= 0 ? "text-emerald-500" : "text-destructive"}`} />
                    <span className="font-semibold text-sm">
                      Margin of Safety: {result.marginOfSafetyPercent}% ({result.marginOfSafetyUnits.toLocaleString()} units buffer)
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {result.marginOfSafetyPercent >= 0
                      ? `Sales can decline by up to ${result.marginOfSafetyPercent}% ($${result.marginOfSafetyRevenue.toLocaleString()}) before the business incurs an operational loss.`
                      : `Projected sales (${result.projectedUnits.toLocaleString()}) are BELOW the break-even threshold (${result.breakEvenUnits.toLocaleString()}). Operations will result in a loss.`}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Volume Sensitivity Matrix */}
          <Card>
            <CardHeader className="py-2.5 px-4 border-b">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Layers className="h-4 w-4 text-primary" />
                <span>Production Volume Sensitivity Analysis</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-xs font-mono">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="py-2.5 px-4 text-left font-semibold">Volume (Units)</th>
                    <th className="py-2.5 px-4 text-right font-semibold">Total Revenue</th>
                    <th className="py-2.5 px-4 text-right font-semibold">Variable Costs</th>
                    <th className="py-2.5 px-4 text-right font-semibold">Total Costs</th>
                    <th className="py-2.5 px-4 text-right font-semibold">Net Operating Profit</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {result.volumeSensitivity.map((row, idx) => (
                    <tr
                      key={idx}
                      className={`hover:bg-muted/30 ${Math.abs(row.profit) < 50 ? "bg-primary/10 font-bold" : ""}`}
                    >
                      <td className="py-2.5 px-4 font-semibold text-foreground">
                        {row.units.toLocaleString()} {Math.abs(row.profit) < 50 && <span className="text-[10px] text-primary ml-1">(Break-Even)</span>}
                      </td>
                      <td className="py-2.5 px-4 text-right">${row.revenue.toLocaleString()}</td>
                      <td className="py-2.5 px-4 text-right text-muted-foreground">${row.variableCost.toLocaleString()}</td>
                      <td className="py-2.5 px-4 text-right text-muted-foreground">${row.totalCost.toLocaleString()}</td>
                      <td className={`py-2.5 px-4 text-right font-bold ${row.profit > 0 ? "text-emerald-500" : row.profit < 0 ? "text-destructive" : "text-foreground"}`}>
                        ${row.profit.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}