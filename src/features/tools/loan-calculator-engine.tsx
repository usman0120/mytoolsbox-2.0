"use client";

import { useState } from "react";
import { DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { calculateLoan } from "@/features/tools/loan-calculator";

export function LoanCalculatorEngine() {
  const [principal, setPrincipal] = useState("");
  const [rate, setRate] = useState("");
  const [years, setYears] = useState("");
  const [result, setResult] = useState<ReturnType<typeof calculateLoan> | null>(null);

  const handleCalculate = () => {
    const p = parseFloat(principal);
    const r = parseFloat(rate);
    const y = parseFloat(years);
    if (isNaN(p) || isNaN(r) || isNaN(y) || p <= 0 || r < 0 || y <= 0) return;
    setResult(calculateLoan(p, r, y));
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <Label className="text-sm mb-1.5 block">Loan Amount ($)</Label>
          <Input type="number" placeholder="100000" value={principal} onChange={(e) => setPrincipal(e.target.value)} />
        </div>
        <div>
          <Label className="text-sm mb-1.5 block">Annual Rate (%)</Label>
          <Input type="number" placeholder="5" step="0.1" value={rate} onChange={(e) => setRate(e.target.value)} />
        </div>
        <div>
          <Label className="text-sm mb-1.5 block">Term (years)</Label>
          <Input type="number" placeholder="30" value={years} onChange={(e) => setYears(e.target.value)} />
        </div>
      </div>

      <Button onClick={handleCalculate} className="w-full gap-2" disabled={!principal || !rate || !years}>
        <DollarSign className="h-4 w-4" /> Calculate
      </Button>

      {result && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-xl font-bold">${result.monthlyPayment.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Monthly Payment</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-xl font-bold">${result.totalPayment.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Total Payment</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-xl font-bold">${result.totalInterest.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Total Interest</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}