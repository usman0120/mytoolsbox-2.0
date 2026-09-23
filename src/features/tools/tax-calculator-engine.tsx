"use client";

import { useState } from "react";
import { Receipt, DollarSign, Wallet, ShieldCheck, PieChart, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  calculateTax,
  STANDARD_DEDUCTIONS_2024,
  type FilingStatus,
  type TaxResult,
} from "@/features/tools/tax-calculator";

export function TaxCalculatorEngine() {
  const [grossIncome, setGrossIncome] = useState("85000");
  const [filingStatus, setFilingStatus] = useState<FilingStatus>("single");
  const [deductionType, setDeductionType] = useState<"standard" | "itemized">("standard");
  const [customDeduction, setCustomDeduction] = useState("");
  const [stateTaxRate, setStateTaxRate] = useState("4.5");
  const [includeFica, setIncludeFica] = useState(true);

  const [result, setResult] = useState<TaxResult | null>(() =>
    calculateTax({
      grossIncome: 85000,
      filingStatus: "single",
      useStandardDeduction: true,
      stateTaxRate: 4.5,
      includeFica: true,
    })
  );

  const handleCalculate = () => {
    const income = parseFloat(grossIncome) || 0;
    const res = calculateTax({
      grossIncome: income,
      filingStatus,
      useStandardDeduction: deductionType === "standard",
      customDeductions: parseFloat(customDeduction) || 0,
      stateTaxRate: parseFloat(stateTaxRate) || 0,
      includeFica,
    });
    setResult(res);
  };

  const setPresetState = (rate: string) => {
    setStateTaxRate(rate);
  };

  return (
    <div className="space-y-4">
      {/* Configuration Form */}
      <div className="p-4 rounded-xl border bg-card/60 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label className="text-xs mb-1.5 block font-medium">Gross Annual Income ($)</Label>
            <Input
              type="number"
              value={grossIncome}
              onChange={e => setGrossIncome(e.target.value)}
              placeholder="85000"
              className="font-mono text-sm"
            />
          </div>

          <div>
            <Label className="text-xs mb-1.5 block font-medium">Filing Status</Label>
            <Select value={filingStatus} onValueChange={(v) => setFilingStatus(v as FilingStatus)}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Single Filer</SelectItem>
                <SelectItem value="married_joint">Married Filing Jointly</SelectItem>
                <SelectItem value="head_of_household">Head of Household</SelectItem>
                <SelectItem value="married_separate">Married Filing Separately</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Deduction options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label className="text-xs mb-1.5 block font-medium">Deduction Method</Label>
            <Select value={deductionType} onValueChange={(v) => setDeductionType(v as "standard" | "itemized")}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">
                  Standard Deduction (${STANDARD_DEDUCTIONS_2024[filingStatus].toLocaleString()})
                </SelectItem>
                <SelectItem value="itemized">Custom / Itemized Deductions</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {deductionType === "itemized" ? (
            <div>
              <Label className="text-xs mb-1.5 block font-medium">Itemized Deductions ($)</Label>
              <Input
                type="number"
                value={customDeduction}
                onChange={e => setCustomDeduction(e.target.value)}
                placeholder="15000"
                className="font-mono text-sm"
              />
            </div>
          ) : (
            <div>
              <Label className="text-xs mb-1.5 block font-medium">State Income Tax Rate (%)</Label>
              <div className="flex gap-1.5">
                <Input
                  type="number"
                  value={stateTaxRate}
                  onChange={e => setStateTaxRate(e.target.value)}
                  placeholder="4.5"
                  step="0.1"
                  className="font-mono text-sm"
                />
                <Button variant="outline" size="sm" className="h-9 text-xs" onClick={() => setPresetState("0")}>0% (TX/FL)</Button>
                <Button variant="outline" size="sm" className="h-9 text-xs" onClick={() => setPresetState("5")}>5%</Button>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
            <input
              type="checkbox"
              checked={includeFica}
              onChange={e => setIncludeFica(e.target.checked)}
              className="rounded border-border"
            />
            <span>Include FICA Taxes (Social Security 6.2% + Medicare 1.45%)</span>
          </label>
        </div>

        <Button onClick={handleCalculate} className="w-full gap-2">
          <Receipt className="h-4 w-4" /> Calculate Estimated Taxes
        </Button>
      </div>

      {/* Results Dashboard */}
      {result && (
        <div className="space-y-4">
          {/* Key Metric Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-3">
                <span className="text-xs text-muted-foreground block font-medium">Annual Take-Home</span>
                <span className="font-mono text-xl sm:text-2xl font-bold text-emerald-500">
                  ${result.takeHomeAnnual.toLocaleString()}
                </span>
                <span className="text-[11px] text-muted-foreground block mt-0.5">${result.takeHomeMonthly.toLocaleString()}/mo</span>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-3">
                <span className="text-xs text-muted-foreground block font-medium">Total Tax Liability</span>
                <span className="font-mono text-xl sm:text-2xl font-bold text-destructive">
                  ${result.totalTax.toLocaleString()}
                </span>
                <span className="text-[11px] text-muted-foreground block mt-0.5">{result.effectiveTotalRate}% Total Effective</span>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-3">
                <span className="text-xs text-muted-foreground block font-medium">Federal Income Tax</span>
                <span className="font-mono text-xl sm:text-2xl font-bold text-foreground">
                  ${result.federalTax.toLocaleString()}
                </span>
                <span className="text-[11px] text-muted-foreground block mt-0.5">{result.effectiveFederalRate}% Effective Fed</span>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-3">
                <span className="text-xs text-muted-foreground block font-medium">Marginal Tax Bracket</span>
                <span className="font-mono text-xl sm:text-2xl font-bold text-foreground">
                  {result.marginalRate}%
                </span>
                <span className="text-[11px] text-muted-foreground block mt-0.5">Top Dollar Rate</span>
              </CardContent>
            </Card>
          </div>

          {/* Paycheck Conversion Cards */}
          <Card>
            <CardHeader className="py-2.5 px-4 border-b">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Wallet className="h-4 w-4 text-primary" />
                <span>Estimated Take-Home Pay Frequency</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-lg border bg-muted/30">
                <span className="text-xs text-muted-foreground block">Monthly Pay</span>
                <span className="font-mono text-lg font-bold text-emerald-500">${result.takeHomeMonthly.toLocaleString()}</span>
              </div>
              <div className="p-3 rounded-lg border bg-muted/30">
                <span className="text-xs text-muted-foreground block">Bi-Weekly Pay (26/yr)</span>
                <span className="font-mono text-lg font-bold text-emerald-500">${result.takeHomeBiweekly.toLocaleString()}</span>
              </div>
              <div className="p-3 rounded-lg border bg-muted/30">
                <span className="text-xs text-muted-foreground block">Weekly Pay (52/yr)</span>
                <span className="font-mono text-lg font-bold text-emerald-500">
                  ${Math.round(result.takeHomeAnnual / 52).toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Tax Breakdown Summary Table */}
          <Card>
            <CardHeader className="py-2.5 px-4 border-b">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <PieChart className="h-4 w-4 text-primary" />
                <span>Taxes & Deductions Breakdown</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-xs font-mono">
                <tbody className="divide-y">
                  <tr className="hover:bg-muted/30">
                    <td className="py-2.5 px-4 font-semibold text-foreground">Gross Annual Income</td>
                    <td className="py-2.5 px-4 text-right font-bold">${result.grossIncome.toLocaleString()}</td>
                  </tr>
                  <tr className="hover:bg-muted/30 text-muted-foreground">
                    <td className="py-2 px-4 pl-8">Less: Deductions ({result.filingStatus})</td>
                    <td className="py-2 px-4 text-right text-emerald-500">-${result.totalDeductions.toLocaleString()}</td>
                  </tr>
                  <tr className="hover:bg-muted/30 bg-muted/20 font-semibold">
                    <td className="py-2 px-4 text-foreground">Taxable Income</td>
                    <td className="py-2 px-4 text-right">${result.taxableIncome.toLocaleString()}</td>
                  </tr>
                  <tr className="hover:bg-muted/30 text-muted-foreground">
                    <td className="py-2 px-4 pl-8">Federal Income Tax</td>
                    <td className="py-2 px-4 text-right text-destructive">-${result.federalTax.toLocaleString()}</td>
                  </tr>
                  {result.ficaTotal > 0 && (
                    <>
                      <tr className="hover:bg-muted/30 text-muted-foreground">
                        <td className="py-2 px-4 pl-8">Social Security Tax (6.2%)</td>
                        <td className="py-2 px-4 text-right text-destructive">-${result.socialSecurityTax.toLocaleString()}</td>
                      </tr>
                      <tr className="hover:bg-muted/30 text-muted-foreground">
                        <td className="py-2 px-4 pl-8">Medicare Tax (1.45%+)</td>
                        <td className="py-2 px-4 text-right text-destructive">-${result.medicareTax.toLocaleString()}</td>
                      </tr>
                    </>
                  )}
                  {result.stateTax > 0 && (
                    <tr className="hover:bg-muted/30 text-muted-foreground">
                      <td className="py-2 px-4 pl-8">State Income Tax ({stateTaxRate}%)</td>
                      <td className="py-2 px-4 text-right text-destructive">-${result.stateTax.toLocaleString()}</td>
                    </tr>
                  )}
                  <tr className="bg-primary/10 font-bold text-sm">
                    <td className="py-3 px-4 text-foreground">Net Take-Home Pay</td>
                    <td className="py-3 px-4 text-right text-emerald-500">${result.takeHomeAnnual.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Federal Bracket-by-Bracket Breakdown */}
          {result.bracketBreakdown.length > 0 && (
            <Card>
              <CardHeader className="py-2.5 px-4 border-b">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Layers className="h-4 w-4 text-primary" />
                  <span>Federal Progressive Bracket Breakdown</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-2">
                {result.bracketBreakdown.map((b, i) => (
                  <div key={i} className="flex items-center justify-between text-xs py-1.5 border-b last:border-0">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono text-[11px] w-12 justify-center">
                        {b.rate}%
                      </Badge>
                      <span className="text-muted-foreground">
                        ${b.bracketMin.toLocaleString()} to {b.bracketMax ? `$${b.bracketMax.toLocaleString()}` : "Above"}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 font-mono">
                      <span className="text-muted-foreground text-[11px]">
                        (${b.taxableInBracket.toLocaleString()} taxed)
                      </span>
                      <span className="font-semibold text-foreground w-20 text-right">
                        ${b.taxAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}