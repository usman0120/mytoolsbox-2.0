"use client";

import { useState } from "react";
import { Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CalculatorLayout } from "@/components/common/workload-layouts";

export function MortgageCalculatorEngine() {
  const [homePrice, setHomePrice] = useState("");
  const [downPayment, setDownPayment] = useState("");
  const [rate, setRate] = useState("");
  const [years, setYears] = useState("30");
  const [result, setResult] = useState<{ monthly: number; total: number; interest: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const clearResult = () => { setResult(null); setError(null); };

  const calculate = () => {
    clearResult();
    const price = Number(homePrice);
    const down = Number(downPayment);
    const annualRate = Number(rate);
    const months = Number(years) * 12;
    if (!homePrice.trim() || !rate.trim() || !Number.isFinite(price) || price <= 0 || !Number.isFinite(down)
      || down < 0 || down >= price || !Number.isFinite(annualRate) || annualRate < 0
      || !Number.isSafeInteger(months) || months <= 0) {
      setError("Enter a positive home price, a down payment below the price, and a nonnegative rate.");
      return;
    }
    const principal = price - down;
    const monthlyRate = annualRate / 12 / 100;
    const monthly = monthlyRate === 0 ? principal / months
      : principal * monthlyRate / -Math.expm1(-months * Math.log1p(monthlyRate));
    const total = monthly * months;
    const nextResult = { monthly: Math.round(monthly * 100) / 100, total: Math.round(total * 100) / 100, interest: Math.round((total - principal) * 100) / 100 };
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
          <label htmlFor="mortgage-price" className="text-sm font-medium">Home Price ($)</label>
          <input id="mortgage-price" type="number" value={homePrice} onChange={(e) => setHomePrice(e.target.value)} placeholder="300000" className="w-full min-h-11 px-3 py-2 text-base rounded-md border border-border/50 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="mortgage-down" className="text-sm font-medium">Down Payment ($)</label>
          <input id="mortgage-down" type="number" value={downPayment} onChange={(e) => setDownPayment(e.target.value)} placeholder="60000" className="w-full min-h-11 px-3 py-2 text-base rounded-md border border-border/50 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="mortgage-rate" className="text-sm font-medium">Interest Rate (%)</label>
          <input id="mortgage-rate" type="number" value={rate} onChange={(e) => setRate(e.target.value)} placeholder="6.5" step="0.1" className="w-full min-h-11 px-3 py-2 text-base rounded-md border border-border/50 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="mortgage-years" className="text-sm font-medium">Loan Term</label>
          <select id="mortgage-years" value={years} onChange={(e) => setYears(e.target.value)} className="w-full min-h-11 px-3 py-2 text-base rounded-md border border-border/50 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20">
            <option value="10">10 years</option>
            <option value="15">15 years</option>
            <option value="20">20 years</option>
            <option value="30">30 years</option>
          </select>
        </div>
      </div>

      } controlsSection={<Button onClick={calculate} disabled={!homePrice || !rate} className="gap-2 min-h-11 w-full"><Calculator className="h-4 w-4" />Calculate</Button>}
      resultSection={error ? <p role="alert" className="text-sm text-destructive">{error}</p> : result ? (
        <div className="grid gap-3 tabular-nums [&>div]:wrap-break-word">
          <div>
            <div className="text-lg font-bold text-primary">${result.monthly.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Monthly</div>
          </div>
          <div>
            <div className="text-lg font-bold">${result.total.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
          <div>
            <div className="text-lg font-bold text-orange-500">${result.interest.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Interest</div>
          </div>
        </div>
      ) : <p className="text-sm text-muted-foreground">Enter mortgage terms to calculate payments.</p>} />
  );
}