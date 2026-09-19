"use client";

import { useState } from "react";
import { TrendingUp, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { calculateROI, ROIResult } from "@/features/tools/roi-calculator";

export function ROICalculatorEngine() {
  const [initialInvestment, setInitialInvestment] = useState("");
  const [finalValue, setFinalValue] = useState("");
  const [years, setYears] = useState("1");
  const [result, setResult] = useState<ROIResult | null>(null);

  const handleCalculate = () => {
    const ii = parseFloat(initialInvestment);
    const fv = parseFloat(finalValue);
    const y = parseFloat(years);
    if (isNaN(ii) || isNaN(fv) || isNaN(y) || ii <= 0 || y <= 0) return;
    setResult(calculateROI(ii, fv, y));
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <Label className="text-sm mb-1.5 block">Initial Investment ($)</Label>
          <Input type="number" placeholder="10000" value={initialInvestment} onChange={e => setInitialInvestment(e.target.value)} />
        </div>
        <div>
          <Label className="text-sm mb-1.5 block">Final Value ($)</Label>
          <Input type="number" placeholder="15000" value={finalValue} onChange={e => setFinalValue(e.target.value)} />
        </div>
        <div>
          <Label className="text-sm mb-1.5 block">Years</Label>
          <Input type="number" placeholder="1" step="0.5" value={years} onChange={e => setYears(e.target.value)} />
        </div>
      </div>

      <Button onClick={handleCalculate} className="w-full gap-2" disabled={!initialInvestment || !finalValue || !years}>
        <TrendingUp className="h-4 w-4" /> Calculate ROI
      </Button>

      {result && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-3 text-center">
              <p className={`text-xl font-bold ${result.isProfit ? "text-green-600" : "text-red-600"}`}>
                {result.roiPercent}%
              </p>
              <p className="text-xs text-muted-foreground">Total ROI</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <p className={`text-xl font-bold ${result.isProfit ? "text-green-600" : "text-red-600"}`}>
                {result.annualizedROI}%
              </p>
              <p className="text-xs text-muted-foreground">Annualized ROI</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <p className={`text-xl font-bold ${result.isProfit ? "text-green-600" : "text-red-600"}`}>
                ${result.netReturn.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">Net Return</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-xl font-bold">${result.initialInvestment.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Initial Investment</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-xl font-bold">${result.finalValue.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Final Value</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-xl font-bold">{result.years}</p>
              <p className="text-xs text-muted-foreground">Years</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}