"use client";

import { useState } from "react";
import { Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { calculateTax, TaxResult } from "@/features/tools/tax-calculator";

export function TaxCalculatorEngine() {
  const [grossIncome, setGrossIncome] = useState("");
  const [deductions, setDeductions] = useState("0");
  const [result, setResult] = useState<TaxResult | null>(null);

  const handleCalculate = () => {
    const income = parseFloat(grossIncome);
    const ded = parseFloat(deductions);
    if (isNaN(income) || isNaN(ded) || income < 0 || ded < 0) return;
    setResult(calculateTax(income, ded));
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <Label className="text-sm mb-1.5 block">Gross Annual Income ($)</Label>
          <Input type="number" placeholder="75000" value={grossIncome} onChange={e => setGrossIncome(e.target.value)} />
        </div>
        <div>
          <Label className="text-sm mb-1.5 block">Deductions ($)</Label>
          <Input type="number" placeholder="13850" value={deductions} onChange={e => setDeductions(e.target.value)} />
        </div>
      </div>

      <Button onClick={handleCalculate} className="w-full gap-2" disabled={!grossIncome}>
        <Receipt className="h-4 w-4" /> Calculate Tax
      </Button>

      {result && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-xl font-bold">${result.taxableIncome.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Taxable Income</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-xl font-bold text-red-600">${result.totalTax.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Total Tax</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-xl font-bold text-green-600">${result.netIncome.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Net Income</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-xl font-bold">{result.effectiveRate}%</p>
                <p className="text-xs text-muted-foreground">Effective Rate</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-xl font-bold">{result.marginalRate}%</p>
                <p className="text-xs text-muted-foreground">Marginal Rate</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-xl font-bold">${result.deductions.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Deductions</p>
              </CardContent>
            </Card>
          </div>

          {/* Bracket breakdown */}
          <Card>
            <CardContent className="p-4">
              <h4 className="text-sm font-medium mb-2">Tax Bracket Breakdown</h4>
              <div className="space-y-1">
                {result.bracketBreakdown.map((bb, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {bb.bracket.rate}% bracket ({bb.bracket.min.toLocaleString()}-{bb.bracket.max?.toLocaleString() || "∞"})
                    </span>
                    <span className="font-medium">${bb.taxInBracket.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}