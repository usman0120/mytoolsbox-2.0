"use client";

import { useState } from "react";
import { DollarSign, TrendingUp, TrendingDown, Download, BarChart2, Briefcase, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { calculateProfit, type ProfitResult, type ProfitInput } from "@/features/tools/profit-calculator";

interface Preset {
  name: string;
  data: ProfitInput;
}

const PRESETS: Preset[] = [
  {
    name: "SaaS Startup",
    data: {
      currency: "$",
      revenue: 65000,
      cogs: 8000, // Hosting, API costs
      salaries: 28000,
      marketing: 12000,
      rentUtilities: 4000,
      otherOpex: 3000,
      interestExpense: 0,
      taxRate: 20,
    },
  },
  {
    name: "E-Commerce Store",
    data: {
      currency: "$",
      revenue: 120000,
      cogs: 60000, // Manufacturing/Wholesale
      salaries: 15000,
      marketing: 22000,
      rentUtilities: 5000,
      otherOpex: 4000,
      interestExpense: 500,
      taxRate: 21,
    },
  },
  {
    name: "Freelance Agency",
    data: {
      currency: "$",
      revenue: 25000,
      cogs: 2000, // Subcontractors
      salaries: 8000,
      marketing: 1500,
      rentUtilities: 1000,
      otherOpex: 1200,
      interestExpense: 0,
      taxRate: 15,
    },
  },
];

export function ProfitCalculatorEngine() {
  const [currency, setCurrency] = useState("$");
  const [revenue, setRevenue] = useState("65000");
  const [cogs, setCogs] = useState("8000");
  const [salaries, setSalaries] = useState("28000");
  const [marketing, setMarketing] = useState("12000");
  const [rentUtilities, setRentUtilities] = useState("4000");
  const [otherOpex, setOtherOpex] = useState("3000");
  const [interestExpense, setInterestExpense] = useState("0");
  const [taxRate, setTaxRate] = useState("20");

  const [result, setResult] = useState<ProfitResult | null>(() =>
    calculateProfit({
      currency: "$",
      revenue: 65000,
      cogs: 8000,
      salaries: 28000,
      marketing: 12000,
      rentUtilities: 4000,
      otherOpex: 3000,
      interestExpense: 0,
      taxRate: 20,
    })
  );

  const handleCalculate = () => {
    const rev = parseFloat(revenue) || 0;
    const res = calculateProfit({
      currency,
      revenue: rev,
      cogs: parseFloat(cogs) || 0,
      salaries: parseFloat(salaries) || 0,
      marketing: parseFloat(marketing) || 0,
      rentUtilities: parseFloat(rentUtilities) || 0,
      otherOpex: parseFloat(otherOpex) || 0,
      interestExpense: parseFloat(interestExpense) || 0,
      taxRate: parseFloat(taxRate) || 0,
    });
    setResult(res);
  };

  const applyPreset = (preset: Preset) => {
    setCurrency(preset.data.currency || "$");
    setRevenue(String(preset.data.revenue));
    setCogs(String(preset.data.cogs || 0));
    setSalaries(String(preset.data.salaries || 0));
    setMarketing(String(preset.data.marketing || 0));
    setRentUtilities(String(preset.data.rentUtilities || 0));
    setOtherOpex(String(preset.data.otherOpex || 0));
    setInterestExpense(String(preset.data.interestExpense || 0));
    setTaxRate(String(preset.data.taxRate || 0));
    setResult(calculateProfit(preset.data));
  };

  const exportStatement = () => {
    if (!result) return;
    const lines = [
      `Profit & Loss (P&L) Statement`,
      `Generated on: ${new Date().toLocaleDateString()}`,
      `=========================================`,
      `Gross Revenue:             ${result.currency}${result.revenue.toLocaleString()}`,
      `Cost of Goods Sold (COGS): -${result.currency}${result.cogs.toLocaleString()}`,
      `-----------------------------------------`,
      `Gross Profit:              ${result.currency}${result.grossProfit.toLocaleString()} (${result.grossMargin}%)`,
      ``,
      `Operating Expenses (OpEx):`,
      `  Salaries & Contractors:  -${result.currency}${(parseFloat(salaries) || 0).toLocaleString()}`,
      `  Marketing & Advertising: -${result.currency}${(parseFloat(marketing) || 0).toLocaleString()}`,
      `  Rent & Utilities:        -${result.currency}${(parseFloat(rentUtilities) || 0).toLocaleString()}`,
      `  Other OpEx:              -${result.currency}${(parseFloat(otherOpex) || 0).toLocaleString()}`,
      `Total Operating Expenses:  -${result.currency}${result.operatingExpenses.toLocaleString()}`,
      `-----------------------------------------`,
      `Operating Profit (EBITDA): ${result.currency}${result.operatingProfit.toLocaleString()} (${result.operatingMargin}%)`,
      `Interest Expense:          -${result.currency}${result.interestExpense.toLocaleString()}`,
      `Earnings Before Tax (EBT): ${result.currency}${result.preTaxProfit.toLocaleString()}`,
      `Income Tax (${result.taxRate}%):         -${result.currency}${result.taxAmount.toLocaleString()}`,
      `=========================================`,
      `Net Profit (Bottom Line):  ${result.currency}${result.netProfit.toLocaleString()} (${result.netMargin}%)`,
      `Break-even Revenue:        ${result.currency}${result.breakEvenRevenue.toLocaleString()}`,
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "profit-and-loss-statement.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Top Presets & Currency */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl border bg-card/60">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-muted-foreground mr-1">Presets:</span>
          {PRESETS.map(p => (
            <Button
              key={p.name}
              variant="outline"
              size="sm"
              className="text-xs h-7"
              onClick={() => applyPreset(p)}
            >
              <Briefcase className="h-3 w-3 mr-1" />
              {p.name}
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <Label className="text-xs text-muted-foreground">Currency:</Label>
          <Select value={currency} onValueChange={(v) => setCurrency(v || "$")}>
            <SelectTrigger className="h-7 w-20 text-xs font-mono">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="$">$ USD</SelectItem>
              <SelectItem value="€">€ EUR</SelectItem>
              <SelectItem value="£">£ GBP</SelectItem>
              <SelectItem value="¥">¥ JPY</SelectItem>
              <SelectItem value="₨">₨ PKR/INR</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Input Grid */}
      <div className="p-4 rounded-xl border bg-card/60 space-y-4">
        {/* Revenue & COGS */}
        <div>
          <h4 className="text-xs uppercase font-semibold text-muted-foreground tracking-wider mb-2">1. Revenue & Direct Production</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs mb-1 block font-medium">Total Gross Revenue ({currency})</Label>
              <Input
                type="number"
                value={revenue}
                onChange={e => setRevenue(e.target.value)}
                placeholder="65000"
                className="font-mono text-sm"
              />
            </div>
            <div>
              <Label className="text-xs mb-1 block font-medium">Cost of Goods Sold (COGS) ({currency})</Label>
              <Input
                type="number"
                value={cogs}
                onChange={e => setCogs(e.target.value)}
                placeholder="8000"
                className="font-mono text-sm"
              />
            </div>
          </div>
        </div>

        {/* Operating Expenses */}
        <div>
          <h4 className="text-xs uppercase font-semibold text-muted-foreground tracking-wider mb-2">2. Operating Expenses (OpEx)</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <Label className="text-xs mb-1 block font-medium">Salaries & Payroll ({currency})</Label>
              <Input
                type="number"
                value={salaries}
                onChange={e => setSalaries(e.target.value)}
                placeholder="28000"
                className="font-mono text-sm"
              />
            </div>
            <div>
              <Label className="text-xs mb-1 block font-medium">Marketing & Ads ({currency})</Label>
              <Input
                type="number"
                value={marketing}
                onChange={e => setMarketing(e.target.value)}
                placeholder="12000"
                className="font-mono text-sm"
              />
            </div>
            <div>
              <Label className="text-xs mb-1 block font-medium">Rent & Utilities ({currency})</Label>
              <Input
                type="number"
                value={rentUtilities}
                onChange={e => setRentUtilities(e.target.value)}
                placeholder="4000"
                className="font-mono text-sm"
              />
            </div>
            <div>
              <Label className="text-xs mb-1 block font-medium">Other Overhead ({currency})</Label>
              <Input
                type="number"
                value={otherOpex}
                onChange={e => setOtherOpex(e.target.value)}
                placeholder="3000"
                className="font-mono text-sm"
              />
            </div>
          </div>
        </div>

        {/* Taxes & Interest */}
        <div>
          <h4 className="text-xs uppercase font-semibold text-muted-foreground tracking-wider mb-2">3. Interest & Taxes</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs mb-1 block font-medium">Interest Expense ({currency})</Label>
              <Input
                type="number"
                value={interestExpense}
                onChange={e => setInterestExpense(e.target.value)}
                placeholder="0"
                className="font-mono text-sm"
              />
            </div>
            <div>
              <Label className="text-xs mb-1 block font-medium">Effective Income Tax Rate (%)</Label>
              <Input
                type="number"
                value={taxRate}
                onChange={e => setTaxRate(e.target.value)}
                placeholder="20"
                step="0.5"
                className="font-mono text-sm"
              />
            </div>
          </div>
        </div>

        <Button onClick={handleCalculate} className="w-full gap-2">
          <DollarSign className="h-4 w-4" /> Calculate P&L Profit Metrics
        </Button>
      </div>

      {/* Results Dashboard */}
      {result && (
        <div className="space-y-4">
          {/* Key Metric Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-3">
                <span className="text-xs text-muted-foreground block font-medium">Net Profit (Bottom Line)</span>
                <span className={`font-mono text-xl font-bold ${result.netProfit >= 0 ? "text-emerald-500" : "text-destructive"}`}>
                  {result.currency}{result.netProfit.toLocaleString()}
                </span>
                <span className="text-[11px] text-muted-foreground block mt-0.5">{result.netMargin}% Net Margin</span>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-3">
                <span className="text-xs text-muted-foreground block font-medium">Gross Profit</span>
                <span className="font-mono text-xl font-bold text-foreground">
                  {result.currency}{result.grossProfit.toLocaleString()}
                </span>
                <span className="text-[11px] text-muted-foreground block mt-0.5">{result.grossMargin}% Gross Margin</span>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-3">
                <span className="text-xs text-muted-foreground block font-medium">Operating Profit (EBITDA)</span>
                <span className="font-mono text-xl font-bold text-foreground">
                  {result.currency}{result.operatingProfit.toLocaleString()}
                </span>
                <span className="text-[11px] text-muted-foreground block mt-0.5">{result.operatingMargin}% Operating Margin</span>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-3">
                <span className="text-xs text-muted-foreground block font-medium">Break-even Revenue</span>
                <span className="font-mono text-xl font-bold text-foreground">
                  {result.currency}{result.breakEvenRevenue.toLocaleString()}
                </span>
                <span className="text-[11px] text-muted-foreground block mt-0.5">Required for $0 profit</span>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Statement Table */}
          <Card>
            <CardHeader className="py-3 px-4 border-b flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <BarChart2 className="h-4 w-4 text-primary" />
                <span>Full P&L Breakdown</span>
              </CardTitle>
              <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={exportStatement}>
                <Download className="h-3 w-3" /> Export Statement
              </Button>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-xs font-mono">
                <tbody className="divide-y">
                  <tr className="hover:bg-muted/30">
                    <td className="py-2.5 px-4 font-semibold text-foreground">Gross Revenue</td>
                    <td className="py-2.5 px-4 text-right font-bold">{result.currency}{result.revenue.toLocaleString()}</td>
                    <td className="py-2.5 px-4 text-right text-muted-foreground">100.0%</td>
                  </tr>
                  <tr className="hover:bg-muted/30 text-muted-foreground">
                    <td className="py-2 px-4 pl-8">Cost of Goods Sold (COGS)</td>
                    <td className="py-2 px-4 text-right text-destructive">-{result.currency}{result.cogs.toLocaleString()}</td>
                    <td className="py-2 px-4 text-right">{result.revenue > 0 ? ((result.cogs / result.revenue) * 100).toFixed(1) : 0}%</td>
                  </tr>
                  <tr className="hover:bg-muted/30 bg-muted/20 font-semibold">
                    <td className="py-2.5 px-4 text-foreground">Gross Profit</td>
                    <td className="py-2.5 px-4 text-right text-emerald-500">{result.currency}{result.grossProfit.toLocaleString()}</td>
                    <td className="py-2.5 px-4 text-right text-emerald-500">{result.grossMargin}%</td>
                  </tr>
                  <tr className="hover:bg-muted/30 text-muted-foreground">
                    <td className="py-2 px-4 pl-8">Operating Expenses (OpEx)</td>
                    <td className="py-2 px-4 text-right text-destructive">-{result.currency}{result.operatingExpenses.toLocaleString()}</td>
                    <td className="py-2 px-4 text-right">{result.revenue > 0 ? ((result.operatingExpenses / result.revenue) * 100).toFixed(1) : 0}%</td>
                  </tr>
                  <tr className="hover:bg-muted/30 bg-muted/20 font-semibold">
                    <td className="py-2.5 px-4 text-foreground">Operating Profit (EBITDA)</td>
                    <td className="py-2.5 px-4 text-right">{result.currency}{result.operatingProfit.toLocaleString()}</td>
                    <td className="py-2.5 px-4 text-right">{result.operatingMargin}%</td>
                  </tr>
                  <tr className="hover:bg-muted/30 text-muted-foreground">
                    <td className="py-2 px-4 pl-8">Interest Expense</td>
                    <td className="py-2 px-4 text-right text-destructive">-{result.currency}{result.interestExpense.toLocaleString()}</td>
                    <td className="py-2 px-4 text-right">{result.revenue > 0 ? ((result.interestExpense / result.revenue) * 100).toFixed(1) : 0}%</td>
                  </tr>
                  <tr className="hover:bg-muted/30 text-muted-foreground">
                    <td className="py-2 px-4 pl-8">Taxes ({result.taxRate}%)</td>
                    <td className="py-2 px-4 text-right text-destructive">-{result.currency}{result.taxAmount.toLocaleString()}</td>
                    <td className="py-2 px-4 text-right">{result.revenue > 0 ? ((result.taxAmount / result.revenue) * 100).toFixed(1) : 0}%</td>
                  </tr>
                  <tr className="bg-primary/10 font-bold text-sm">
                    <td className="py-3 px-4 text-foreground">Net Income / Profit</td>
                    <td className={`py-3 px-4 text-right ${result.netProfit >= 0 ? "text-emerald-500" : "text-destructive"}`}>
                      {result.currency}{result.netProfit.toLocaleString()}
                    </td>
                    <td className={`py-3 px-4 text-right ${result.netProfit >= 0 ? "text-emerald-500" : "text-destructive"}`}>
                      {result.netMargin}%
                    </td>
                  </tr>
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}