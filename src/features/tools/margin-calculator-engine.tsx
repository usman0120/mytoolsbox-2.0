"use client";

import { useState } from "react";
import { Percent, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { calculateMargin, calculateSellingPrice, MarginResult } from "@/features/tools/margin-calculator";

export function MarginCalculatorEngine() {
  const [cost, setCost] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [result, setResult] = useState<MarginResult | null>(null);

  // Target margin mode
  const [targetCost, setTargetCost] = useState("");
  const [targetMargin, setTargetMargin] = useState("");
  const [targetResult, setTargetResult] = useState<number | null>(null);

  const handleCalculate = () => {
    const c = parseFloat(cost);
    const sp = parseFloat(sellingPrice);
    if (isNaN(c) || isNaN(sp) || c < 0 || sp < 0) return;
    setResult(calculateMargin(c, sp));
  };

  const handleTargetCalc = () => {
    const c = parseFloat(targetCost);
    const m = parseFloat(targetMargin);
    if (isNaN(c) || isNaN(m) || c < 0 || m < 0 || m >= 100) return;
    setTargetResult(calculateSellingPrice(c, m));
  };

  return (
    <Tabs defaultValue="margin" className="w-full">
      <TabsList className="w-full">
        <TabsTrigger value="margin" className="flex-1">Margin Calculator</TabsTrigger>
        <TabsTrigger value="target" className="flex-1">Target Price</TabsTrigger>
      </TabsList>

      <TabsContent value="margin" className="space-y-4 mt-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label className="text-sm mb-1.5 block">Cost ($)</Label>
            <Input type="number" placeholder="50" step="0.01" value={cost} onChange={e => setCost(e.target.value)} />
          </div>
          <div>
            <Label className="text-sm mb-1.5 block">Selling Price ($)</Label>
            <Input type="number" placeholder="80" step="0.01" value={sellingPrice} onChange={e => setSellingPrice(e.target.value)} />
          </div>
        </div>

        <Button onClick={handleCalculate} className="w-full gap-2" disabled={!cost || !sellingPrice}>
          <Percent className="h-4 w-4" /> Calculate Margin
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
                <p className="text-xl font-bold">{result.grossMarginPercent}%</p>
                <p className="text-xs text-muted-foreground">Gross Margin</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-xl font-bold">{result.markupPercent}%</p>
                <p className="text-xs text-muted-foreground">Markup %</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-xl font-bold">${result.markup.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Markup Amount</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-xl font-bold">${result.cost.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Cost</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-xl font-bold">${result.sellingPrice.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Selling Price</p>
              </CardContent>
            </Card>
          </div>
        )}
      </TabsContent>

      <TabsContent value="target" className="space-y-4 mt-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label className="text-sm mb-1.5 block">Cost ($)</Label>
            <Input type="number" placeholder="50" step="0.01" value={targetCost} onChange={e => setTargetCost(e.target.value)} />
          </div>
          <div>
            <Label className="text-sm mb-1.5 block">Target Margin (%)</Label>
            <Input type="number" placeholder="40" step="0.1" value={targetMargin} onChange={e => setTargetMargin(e.target.value)} />
          </div>
        </div>

        <Button onClick={handleTargetCalc} className="w-full gap-2" disabled={!targetCost || !targetMargin}>
          <Calculator className="h-4 w-4" /> Calculate Selling Price
        </Button>

        {targetResult !== null && (
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-muted-foreground mb-1">Required Selling Price</p>
              <p className="text-3xl font-bold text-green-600">${targetResult.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-1">To achieve {targetMargin}% margin on ${parseFloat(targetCost).toLocaleString()} cost</p>
            </CardContent>
          </Card>
        )}
      </TabsContent>
    </Tabs>
  );
}