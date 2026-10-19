"use client";

import { useState } from "react";
import { Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CalculatorLayout } from "@/components/common/workload-layouts";

export function EMICalculatorEngine() {
  const [loan, setLoan] = useState("");
  const [rate, setRate] = useState("");
  const [tenure, setTenure] = useState("");
  const [result, setResult] = useState<{ emi: number; total: number; interest: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const clearResult = () => { setResult(null); setError(null); };

  const calculate = () => {
    clearResult();
    const principal = Number(loan);
    const annualRate = Number(rate);
    const months = Number(tenure) * 12;
    if (!loan.trim() || !rate.trim() || !tenure.trim() || !Number.isFinite(principal) || principal <= 0
      || !Number.isFinite(annualRate) || annualRate < 0 || !Number.isSafeInteger(months) || months <= 0) {
      setError("Enter a positive loan amount, a nonnegative rate, and a term in whole months.");
      return;
    }
    const monthlyRate = annualRate / 12 / 100;
    const emi = monthlyRate === 0 ? principal / months
      : principal * monthlyRate / -Math.expm1(-months * Math.log1p(monthlyRate));
    const total = emi * months;
    const nextResult = { emi: Math.round(emi * 100) / 100, total: Math.round(total * 100) / 100, interest: Math.round((total - principal) * 100) / 100 };
    if (!Object.values(nextResult).every(Number.isFinite)) {
      setError("The result is too large. Use smaller values.");
      return;
    }
    setResult(nextResult);
  };

  return (
    <CalculatorLayout inputSection={
      <div className="space-y-3" onChangeCapture={clearResult}>
        <div className="space-y-1.5">
          <label htmlFor="emi-loan" className="text-sm font-medium">Loan Amount ($)</label>
          <input id="emi-loan" type="number" value={loan} onChange={(e) => setLoan(e.target.value)} placeholder="50000" className="w-full min-h-11 px-3 py-2 text-base rounded-md border border-border/50 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="emi-rate" className="text-sm font-medium">Annual Interest Rate (%)</label>
          <input id="emi-rate" type="number" value={rate} onChange={(e) => setRate(e.target.value)} placeholder="7.5" step="0.1" className="w-full min-h-11 px-3 py-2 text-base rounded-md border border-border/50 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="emi-tenure" className="text-sm font-medium">Tenure (years)</label>
          <input id="emi-tenure" type="number" value={tenure} onChange={(e) => setTenure(e.target.value)} placeholder="5" className="w-full min-h-11 px-3 py-2 text-base rounded-md border border-border/50 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
      </div>

      } controlsSection={<Button onClick={calculate} disabled={!loan || !rate || !tenure} className="gap-2 min-h-11 w-full"><Calculator className="h-4 w-4" />Calculate EMI</Button>}
      resultSection={error ? <p role="alert" className="text-sm text-destructive">{error}</p> : result ? (
        <div className="grid gap-3 tabular-nums [&>div]:wrap-break-word">
          <div>
            <div className="text-lg font-bold text-primary">${result.emi.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Monthly EMI</div>
          </div>
          <div>
            <div className="text-lg font-bold">${result.total.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Total Payment</div>
          </div>
          <div>
            <div className="text-lg font-bold text-orange-500">${result.interest.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Total Interest</div>
          </div>
        </div>
      ) : <p className="text-sm text-muted-foreground">Enter loan terms to calculate the monthly payment.</p>} />
  );
}