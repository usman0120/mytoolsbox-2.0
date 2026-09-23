"use client";

import { useState } from "react";
import { TrendingUp, TrendingDown, DollarSign, Calendar, Flame, Table, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { calculateROI, type ROIResult, type ROIInput } from "@/features/tools/roi-calculator";

interface Preset {
  name: string;
  data: ROIInput;
}

const PRESETS: Preset[] = [
  {
    name: "S&P 500 Index (5 Yrs)",
    data: { initialInvestment: 10000, finalValue: 16100, years: 5, annualContribution: 0, inflationRate: 2.8 },
  },
  {
    name: "Real Estate (10 Yrs)",
    data: { initialInvestment: 50000, finalValue: 110000, years: 10, annualContribution: 2000, inflationRate: 2.5 },
  },
  {
    name: "Small Business / Startup",
    data: { initialInvestment: 25000, finalValue: 75000, years: 4, annualContribution: 0, inflationRate: 3.0 },
  },
];

export function ROICalculatorEngine() {
  const [initialInvestment, setInitialInvestment] = useState("10000");
  const [finalValue, setFinalValue] = useState("16100");
  const [years, setYears] = useState("5");
  const [annualContribution, setAnnualContribution] = useState("0");
  const [inflationRate, setInflationRate] = useState("2.8");

  const [result, setResult] = useState<ROIResult | null>(() =>
    calculateROI({
      initialInvestment: 10000,
      finalValue: 16100,
      years: 5,
      annualContribution: 0,
      inflationRate: 2.8,
    })
  );

  const handleCalculate = () => {
    const ii = parseFloat(initialInvestment) || 0;
    const fv = parseFloat(finalValue) || 0;
    const y = parseFloat(years) || 1;
    const ac = parseFloat(annualContribution) || 0;
    const inf = parseFloat(inflationRate) || 0;

    const res = calculateROI({
      initialInvestment: ii,
      finalValue: fv,
      years: y,
      annualContribution: ac,
      inflationRate: inf,
    });
    setResult(res);
  };

  const applyPreset = (preset: Preset) => {
    setInitialInvestment(String(preset.data.initialInvestment));
    setFinalValue(String(preset.data.finalValue));
    setYears(String(preset.data.years || 1));
    setAnnualContribution(String(preset.data.annualContribution || 0));
    setInflationRate(String(preset.data.inflationRate || 0));
    setResult(calculateROI(preset.data));
  };

  return (
    <div className="space-y-4">
      {/* Presets */}
      <div className="flex flex-wrap items-center gap-1.5 p-3 rounded-xl border bg-card/60">
        <span className="text-xs text-muted-foreground mr-1">Example Scenarios:</span>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label className="text-xs mb-1.5 block font-medium">Initial Investment Principal ($)</Label>
            <Input
              type="number"
              value={initialInvestment}
              onChange={e => setInitialInvestment(e.target.value)}
              placeholder="10000"
              className="font-mono text-sm"
            />
          </div>
          <div>
            <Label className="text-xs mb-1.5 block font-medium">Ending Value / Total Return ($)</Label>
            <Input
              type="number"
              value={finalValue}
              onChange={e => setFinalValue(e.target.value)}
              placeholder="16100"
              className="font-mono text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <Label className="text-xs mb-1.5 block font-medium">Holding Period (Years)</Label>
            <Input
              type="number"
              value={years}
              onChange={e => setYears(e.target.value)}
              placeholder="5"
              step="0.5"
              className="font-mono text-sm"
            />
          </div>
          <div>
            <Label className="text-xs mb-1.5 block font-medium">Annual Additions ($/yr)</Label>
            <Input
              type="number"
              value={annualContribution}
              onChange={e => setAnnualContribution(e.target.value)}
              placeholder="0"
              className="font-mono text-sm"
            />
          </div>
          <div>
            <Label className="text-xs mb-1.5 block font-medium">Annual Inflation Rate (%)</Label>
            <Input
              type="number"
              value={inflationRate}
              onChange={e => setInflationRate(e.target.value)}
              placeholder="2.8"
              step="0.1"
              className="font-mono text-sm"
            />
          </div>
        </div>

        <Button onClick={handleCalculate} className="w-full gap-2">
          <TrendingUp className="h-4 w-4" /> Calculate Return on Investment & CAGR
        </Button>
      </div>

      {/* Results Dashboard */}
      {result && (
        <div className="space-y-4">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-3">
                <span className="text-xs text-muted-foreground block font-medium">Total ROI</span>
                <span className={`font-mono text-xl sm:text-2xl font-bold ${result.isProfit ? "text-emerald-500" : "text-destructive"}`}>
                  {result.roiPercent > 0 ? `+${result.roiPercent}%` : `${result.roiPercent}%`}
                </span>
                <span className="text-[11px] text-muted-foreground block mt-0.5">Over {result.years} years</span>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-3">
                <span className="text-xs text-muted-foreground block font-medium">Annualized ROI (CAGR)</span>
                <span className={`font-mono text-xl sm:text-2xl font-bold ${result.annualizedROI >= 0 ? "text-emerald-500" : "text-destructive"}`}>
                  {result.annualizedROI > 0 ? `+${result.annualizedROI}%` : `${result.annualizedROI}%`}
                </span>
                <span className="text-[11px] text-muted-foreground block mt-0.5">Compounded per year</span>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-3">
                <span className="text-xs text-muted-foreground block font-medium">Net Profit / Gain</span>
                <span className={`font-mono text-xl sm:text-2xl font-bold ${result.isProfit ? "text-emerald-500" : "text-destructive"}`}>
                  {result.netReturn >= 0 ? `+$${result.netReturn.toLocaleString()}` : `-$${Math.abs(result.netReturn).toLocaleString()}`}
                </span>
                <span className="text-[11px] text-muted-foreground block mt-0.5">Invested: ${result.totalInvested.toLocaleString()}</span>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-3">
                <span className="text-xs text-muted-foreground block font-medium">Inflation-Adjusted ROI</span>
                <span className="font-mono text-xl sm:text-2xl font-bold text-foreground">
                  {result.realROI > 0 ? `+${result.realROI}%` : `${result.realROI}%`}
                </span>
                <span className="text-[11px] text-muted-foreground block mt-0.5">Real purchasing power</span>
              </CardContent>
            </Card>
          </div>

          {/* Asset Allocation & Gain Bar */}
          <Card>
            <CardHeader className="py-2.5 px-4 border-b">
              <CardTitle className="text-sm font-semibold flex items-center justify-between">
                <span>Principal vs. Capital Gain Allocation</span>
                <span className="font-mono text-xs text-muted-foreground">
                  Total Value: ${result.finalValue.toLocaleString()}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              <div className="h-3 w-full bg-muted rounded-full overflow-hidden flex">
                <div
                  className="bg-primary/80 h-full transition-all"
                  style={{ width: `${result.finalValue > 0 ? (result.totalInvested / result.finalValue) * 100 : 100}%` }}
                  title="Total Invested Principal"
                />
                {result.netReturn > 0 && (
                  <div
                    className="bg-emerald-500 h-full transition-all"
                    style={{ width: `${result.finalValue > 0 ? (result.netReturn / result.finalValue) * 100 : 0}%` }}
                    title="Net Capital Gain"
                  />
                )}
              </div>
              <div className="flex justify-between text-xs font-mono text-muted-foreground pt-1">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-primary/80" />
                  Invested Principal: ${result.totalInvested.toLocaleString()}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Net Profit: ${result.netReturn.toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Yearly Growth Schedule Table */}
          {result.yearlySchedule.length > 0 && (
            <Card>
              <CardHeader className="py-2.5 px-4 border-b">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Table className="h-4 w-4 text-primary" />
                  <span>Estimated Annual Progression</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <table className="w-full text-xs font-mono">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <th className="py-2 px-4 text-left font-semibold">Year</th>
                      <th className="py-2 px-4 text-right font-semibold">Invested Principal</th>
                      <th className="py-2 px-4 text-right font-semibold">Estimated Value</th>
                      <th className="py-2 px-4 text-right font-semibold">Total Gain</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {result.yearlySchedule.map((row, idx) => (
                      <tr key={idx} className="hover:bg-muted/30">
                        <td className="py-2 px-4 font-semibold text-foreground">Year {row.year}</td>
                        <td className="py-2 px-4 text-right text-muted-foreground">${row.investedPrincipal.toLocaleString()}</td>
                        <td className="py-2 px-4 text-right font-semibold">${row.endingValue.toLocaleString()}</td>
                        <td className={`py-2 px-4 text-right ${row.accumulatedGain >= 0 ? "text-emerald-500" : "text-destructive"}`}>
                          ${row.accumulatedGain.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}