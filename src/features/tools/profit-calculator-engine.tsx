"use client";

import { useState } from "react";
import { DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { calculateProfit, ProfitResult } from "@/features/tools/profit-calculator";

export function ProfitCalculatorEngine() {
  const [revenue, setRevenue] = useState("");
  const [fixedCosts, setFixedCosts] = useState("");
  const [variableCosts, setVariableCosts] = useState("");
  const [taxRate, setTaxRate] = useState("0");
  const [result, setResult] = useState<ProfitResult | null>(null);

  const handleCalculate = () => {
    const r = parseFloat(revenue);
    const fc = parseFloat(fixedCosts);
    const vc = parseFloat(variableCosts);
    const tr = parseFloat(taxRate);
    if (isNaN(r) || isNaN(fc) || isNaN(vc) || r < 0 || fc < 0 || vc < 0) return;
    setResult(calculateProfit(r, fc, vc, tr));
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <Label className="text-sm mb-1.5 block">Revenue ($)</Label>
          <Input type="number" placeholder="50000" value={revenue} onChange={e => setRevenue(e.target.value)} />
        </div>
        <div>
          <Label className="text-sm mb-1.5 block">Tax Rate (%)</Label>
          <Input type="number" placeholder="0" step="0.1" value={taxRate} onChange={e => setTaxRate(e.target.value)} />
        </div>
        <div>
          <Label className="text-sm mb-1.5 block">Fixed Costs ($)</Label>
          <Input type="number" placeholder="10000" value={fixedCosts} onChange={e => setFixedCosts(e.target.value)} />
        </div>
        <div>
          <Label className="text-sm mb-1.5 block">Variable Costs ($)</Label>
          <Input type="number" placeholder="15000" value={variableCosts} onChange={e => setVariableCosts(e.target.value)} />
        </div>
      </div>

      <Button onClick={handleCalculate} className="w-full gap-2" disabled={!revenue || !fixedCosts || !variableCosts}>
        <DollarSign className="h-4 w-4" /> Calculate Profit
      </Button>

      {result && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-xl font-bold text-green-600">${result.grossProfit.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Gross Profit</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-xl font-bold text-blue-600">${result.netProfit.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Net Profit</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-xl font-bold">{result.grossMargin}%</p>
              <p className="text-xs text-muted-foreground">Gross Margin</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-xl font-bold">{result.netMargin}%</p>
              <p className="text-xs text-muted-foreground">Net Margin</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-xl font-bold">${result.revenue.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Revenue</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-xl font-bold">${result.costs.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Total Costs</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}