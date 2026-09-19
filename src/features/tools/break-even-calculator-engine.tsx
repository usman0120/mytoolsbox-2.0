"use client";

import { useState } from "react";
import { BarChart3, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { calculateBreakEven, BreakEvenResult } from "@/features/tools/break-even-calculator";

export function BreakEvenCalculatorEngine() {
  const [fixedCosts, setFixedCosts] = useState("");
  const [variableCostPerUnit, setVariableCostPerUnit] = useState("");
  const [sellingPricePerUnit, setSellingPricePerUnit] = useState("");
  const [targetProfit, setTargetProfit] = useState("0");
  const [result, setResult] = useState<BreakEvenResult | null>(null);

  const handleCalculate = () => {
    const fc = parseFloat(fixedCosts);
    const vc = parseFloat(variableCostPerUnit);
    const sp = parseFloat(sellingPricePerUnit);
    const tp = parseFloat(targetProfit);
    if (isNaN(fc) || isNaN(vc) || isNaN(sp) || fc < 0 || vc < 0 || sp <= 0) return;
    setResult(calculateBreakEven(fc, vc, sp, tp));
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <Label className="text-sm mb-1.5 block">Fixed Costs ($)</Label>
          <Input type="number" placeholder="50000" value={fixedCosts} onChange={e => setFixedCosts(e.target.value)} />
        </div>
        <div>
          <Label className="text-sm mb-1.5 block">Variable Cost per Unit ($)</Label>
          <Input type="number" placeholder="20" step="0.01" value={variableCostPerUnit} onChange={e => setVariableCostPerUnit(e.target.value)} />
        </div>
        <div>
          <Label className="text-sm mb-1.5 block">Selling Price per Unit ($)</Label>
          <Input type="number" placeholder="50" step="0.01" value={sellingPricePerUnit} onChange={e => setSellingPricePerUnit(e.target.value)} />
        </div>
        <div>
          <Label className="text-sm mb-1.5 block">Target Profit ($)</Label>
          <Input type="number" placeholder="0" value={targetProfit} onChange={e => setTargetProfit(e.target.value)} />
        </div>
      </div>

      <Button onClick={handleCalculate} className="w-full gap-2" disabled={!fixedCosts || !variableCostPerUnit || !sellingPricePerUnit}>
        <BarChart3 className="h-4 w-4" /> Calculate Break-Even
      </Button>

      {result && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-xl font-bold text-blue-600">{result.breakEvenUnits === Infinity ? "N/A" : result.breakEvenUnits.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Break-Even Units</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-xl font-bold text-blue-600">{result.breakEvenRevenue === Infinity ? "N/A" : `$${result.breakEvenRevenue.toLocaleString()}`}</p>
              <p className="text-xs text-muted-foreground">Break-Even Revenue</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-xl font-bold">${result.contributionMargin.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Contribution Margin</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-xl font-bold">{result.contributionMarginRatio}%</p>
              <p className="text-xs text-muted-foreground">CM Ratio</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-xl font-bold">{result.unitsForTargetProfit === Infinity ? "N/A" : result.unitsForTargetProfit.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Units for Target Profit</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-xl font-bold">${result.fixedCosts.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Fixed Costs</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}