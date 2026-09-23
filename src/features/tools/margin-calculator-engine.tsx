"use client";

import { useState } from "react";
import { Percent, Calculator, ArrowRight, HelpCircle, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  calculateMargin,
  calculateSellingPriceFromMargin,
  calculateSellingPriceFromMarkup,
  calculateCostFromPrice,
  generatePricingTiers,
  type MarginResult,
} from "@/features/tools/margin-calculator";

export function MarginCalculatorEngine() {
  const [activeTab, setActiveTab] = useState("margin");

  // Mode 1: Cost + Price
  const [cost1, setCost1] = useState("50");
  const [price1, setPrice1] = useState("80");
  const [result1, setResult1] = useState<MarginResult | null>(() => calculateMargin(50, 80));

  // Mode 2: Cost + Margin %
  const [cost2, setCost2] = useState("60");
  const [targetMargin, setTargetMargin] = useState("40");
  const [result2, setResult2] = useState<MarginResult | null>(() => calculateSellingPriceFromMargin(60, 40));

  // Mode 3: Cost + Markup %
  const [cost3, setCost3] = useState("45");
  const [targetMarkup, setTargetMarkup] = useState("50");
  const [result3, setResult3] = useState<MarginResult | null>(() => calculateSellingPriceFromMarkup(45, 50));

  // Mode 4: Target Costing (Price + Margin %)
  const [price4, setPrice4] = useState("100");
  const [targetMargin4, setTargetMargin4] = useState("35");
  const [result4, setResult4] = useState<MarginResult | null>(() => calculateCostFromPrice(100, 35));

  const handleCalc1 = () => {
    const c = parseFloat(cost1);
    const p = parseFloat(price1);
    if (!isNaN(c) && !isNaN(p)) setResult1(calculateMargin(c, p));
  };

  const handleCalc2 = () => {
    const c = parseFloat(cost2);
    const m = parseFloat(targetMargin);
    if (!isNaN(c) && !isNaN(m) && m < 100) setResult2(calculateSellingPriceFromMargin(c, m));
  };

  const handleCalc3 = () => {
    const c = parseFloat(cost3);
    const mu = parseFloat(targetMarkup);
    if (!isNaN(c) && !isNaN(mu)) setResult3(calculateSellingPriceFromMarkup(c, mu));
  };

  const handleCalc4 = () => {
    const p = parseFloat(price4);
    const m = parseFloat(targetMargin4);
    if (!isNaN(p) && !isNaN(m) && m <= 100) setResult4(calculateCostFromPrice(p, m));
  };

  const currentResult =
    activeTab === "margin" ? result1 :
    activeTab === "targetMargin" ? result2 :
    activeTab === "targetMarkup" ? result3 : result4;

  const currentCost =
    activeTab === "margin" ? (parseFloat(cost1) || 50) :
    activeTab === "targetMargin" ? (parseFloat(cost2) || 60) :
    activeTab === "targetMarkup" ? (parseFloat(cost3) || 45) : (result4?.cost || 65);

  const tiers = generatePricingTiers(currentCost, [15, 25, 35, 45, 50, 60, 75]);

  return (
    <div className="space-y-4">
      {/* Educational Banner */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-3 text-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4 text-primary shrink-0" />
            <span>
              <strong>Margin vs. Markup:</strong> Margin is profit divided by <em>Selling Price</em> (e.g. 50% margin = 100% markup). Markup is profit divided by <em>Cost</em>.
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Mode Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full h-auto p-1">
          <TabsTrigger value="margin" className="text-xs py-1.5">Cost + Price</TabsTrigger>
          <TabsTrigger value="targetMargin" className="text-xs py-1.5">Cost + Margin %</TabsTrigger>
          <TabsTrigger value="targetMarkup" className="text-xs py-1.5">Cost + Markup %</TabsTrigger>
          <TabsTrigger value="targetCost" className="text-xs py-1.5">Target Costing</TabsTrigger>
        </TabsList>

        {/* Tab 1: Cost + Price */}
        <TabsContent value="margin" className="space-y-3 mt-3">
          <div className="p-4 rounded-xl border bg-card/60">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <div>
                <Label className="text-xs mb-1.5 block font-medium">Cost of Item ($)</Label>
                <Input
                  type="number"
                  value={cost1}
                  onChange={e => setCost1(e.target.value)}
                  placeholder="50"
                  className="font-mono text-sm"
                />
              </div>
              <div>
                <Label className="text-xs mb-1.5 block font-medium">Selling / Retail Price ($)</Label>
                <Input
                  type="number"
                  value={price1}
                  onChange={e => setPrice1(e.target.value)}
                  placeholder="80"
                  className="font-mono text-sm"
                />
              </div>
            </div>
            <Button onClick={handleCalc1} className="w-full gap-2">
              <Percent className="h-4 w-4" /> Calculate Margin & Markup
            </Button>
          </div>
        </TabsContent>

        {/* Tab 2: Cost + Target Margin */}
        <TabsContent value="targetMargin" className="space-y-3 mt-3">
          <div className="p-4 rounded-xl border bg-card/60">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <div>
                <Label className="text-xs mb-1.5 block font-medium">Cost of Item ($)</Label>
                <Input
                  type="number"
                  value={cost2}
                  onChange={e => setCost2(e.target.value)}
                  placeholder="60"
                  className="font-mono text-sm"
                />
              </div>
              <div>
                <Label className="text-xs mb-1.5 block font-medium">Desired Gross Margin (%)</Label>
                <Input
                  type="number"
                  value={targetMargin}
                  onChange={e => setTargetMargin(e.target.value)}
                  placeholder="40"
                  max="99.9"
                  className="font-mono text-sm"
                />
              </div>
            </div>
            <Button onClick={handleCalc2} className="w-full gap-2">
              <Calculator className="h-4 w-4" /> Calculate Required Selling Price
            </Button>
          </div>
        </TabsContent>

        {/* Tab 3: Cost + Target Markup */}
        <TabsContent value="targetMarkup" className="space-y-3 mt-3">
          <div className="p-4 rounded-xl border bg-card/60">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <div>
                <Label className="text-xs mb-1.5 block font-medium">Cost of Item ($)</Label>
                <Input
                  type="number"
                  value={cost3}
                  onChange={e => setCost3(e.target.value)}
                  placeholder="45"
                  className="font-mono text-sm"
                />
              </div>
              <div>
                <Label className="text-xs mb-1.5 block font-medium">Desired Markup (%)</Label>
                <Input
                  type="number"
                  value={targetMarkup}
                  onChange={e => setTargetMarkup(e.target.value)}
                  placeholder="50"
                  className="font-mono text-sm"
                />
              </div>
            </div>
            <Button onClick={handleCalc3} className="w-full gap-2">
              <Calculator className="h-4 w-4" /> Calculate Price from Markup
            </Button>
          </div>
        </TabsContent>

        {/* Tab 4: Target Costing */}
        <TabsContent value="targetCost" className="space-y-3 mt-3">
          <div className="p-4 rounded-xl border bg-card/60">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <div>
                <Label className="text-xs mb-1.5 block font-medium">Target Selling Price ($)</Label>
                <Input
                  type="number"
                  value={price4}
                  onChange={e => setPrice4(e.target.value)}
                  placeholder="100"
                  className="font-mono text-sm"
                />
              </div>
              <div>
                <Label className="text-xs mb-1.5 block font-medium">Target Margin (%)</Label>
                <Input
                  type="number"
                  value={targetMargin4}
                  onChange={e => setTargetMargin4(e.target.value)}
                  placeholder="35"
                  className="font-mono text-sm"
                />
              </div>
            </div>
            <Button onClick={handleCalc4} className="w-full gap-2">
              <Calculator className="h-4 w-4" /> Calculate Maximum Allowable Cost
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* Result Metrics */}
      {currentResult && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-3">
                <span className="text-xs text-muted-foreground block font-medium">Selling Price</span>
                <span className="font-mono text-2xl font-bold text-foreground">
                  ${currentResult.sellingPrice.toLocaleString()}
                </span>
                <span className="text-[11px] text-muted-foreground block mt-0.5">Cost: ${currentResult.cost.toLocaleString()}</span>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-3">
                <span className="text-xs text-muted-foreground block font-medium">Gross Margin</span>
                <span className="font-mono text-2xl font-bold text-emerald-500">
                  {currentResult.grossMarginPercent}%
                </span>
                <span className="text-[11px] text-muted-foreground block mt-0.5">Profit / Price</span>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-3">
                <span className="text-xs text-muted-foreground block font-medium">Markup</span>
                <span className="font-mono text-2xl font-bold text-blue-500">
                  {currentResult.markupPercent}%
                </span>
                <span className="text-[11px] text-muted-foreground block mt-0.5">Profit / Cost</span>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-3">
                <span className="text-xs text-muted-foreground block font-medium">Gross Profit</span>
                <span className="font-mono text-2xl font-bold text-foreground">
                  ${currentResult.grossProfit.toLocaleString()}
                </span>
                <span className="text-[11px] text-muted-foreground block mt-0.5">{currentResult.profitMultiplier}× multiplier</span>
              </CardContent>
            </Card>
          </div>

          {/* Pricing Sensitivity Matrix */}
          <Card>
            <CardHeader className="py-2.5 px-4 border-b flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Layers className="h-4 w-4 text-primary" />
                <span>Pricing Matrix for Cost of ${currentCost.toLocaleString()}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-xs font-mono">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="py-2 px-4 text-left font-semibold">Target Margin</th>
                    <th className="py-2 px-4 text-right font-semibold">Required Selling Price</th>
                    <th className="py-2 px-4 text-right font-semibold">Equivalent Markup</th>
                    <th className="py-2 px-4 text-right font-semibold">Gross Profit</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {tiers.map((t, idx) => (
                    <tr
                      key={idx}
                      className={`hover:bg-muted/30 ${Math.abs(t.marginPercent - currentResult.grossMarginPercent) < 0.1 ? "bg-primary/10 font-bold" : ""}`}
                    >
                      <td className="py-2 px-4">{t.marginPercent}%</td>
                      <td className="py-2 px-4 text-right font-semibold">${t.sellingPrice.toLocaleString()}</td>
                      <td className="py-2 px-4 text-right text-muted-foreground">{t.markupPercent}%</td>
                      <td className="py-2 px-4 text-right text-emerald-500">${t.profit.toLocaleString()}</td>
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