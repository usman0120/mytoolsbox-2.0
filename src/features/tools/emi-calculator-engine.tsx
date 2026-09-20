"use client";

import { useState } from "react";
import { Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function EMICalculatorEngine() {
  const [loan, setLoan] = useState("");
  const [rate, setRate] = useState("");
  const [tenure, setTenure] = useState("");
  const [result, setResult] = useState<{ emi: number; total: number; interest: number } | null>(null);

  const calculate = () => {
    const p = Number(loan);
    const r = Number(rate) / 12 / 100;
    const n = Number(tenure) * 12;
    if (!p || !r || !n) return;
    const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const total = emi * n;
    setResult({ emi: Math.round(emi * 100) / 100, total: Math.round(total * 100) / 100, interest: Math.round((total - p) * 100) / 100 });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Badge variant="secondary" className="rounded-full">EMI Calculator</Badge>
        <span className="text-xs text-muted-foreground">Monthly loan payment calculator</span>
      </div>

      <div className="space-y-3">
        <div className="space-y-1.5">
          <label className="text-xs font-medium">Loan Amount ($)</label>
          <input type="number" value={loan} onChange={(e) => setLoan(e.target.value)} placeholder="50000" className="w-full px-3 py-2 text-sm rounded-xl border border-border/50 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium">Annual Interest Rate (%)</label>
          <input type="number" value={rate} onChange={(e) => setRate(e.target.value)} placeholder="7.5" step="0.1" className="w-full px-3 py-2 text-sm rounded-xl border border-border/50 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium">Tenure (years)</label>
          <input type="number" value={tenure} onChange={(e) => setTenure(e.target.value)} placeholder="5" className="w-full px-3 py-2 text-sm rounded-xl border border-border/50 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
      </div>

      <Button onClick={calculate} disabled={!loan || !rate || !tenure} className="gap-2 rounded-xl w-full"><Calculator className="h-4 w-4" />Calculate EMI</Button>

      {result && (
        <div className="grid grid-cols-3 gap-2">
          <div className="p-3 bg-muted/30 rounded-xl text-center">
            <div className="text-lg font-bold text-primary">${result.emi.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Monthly EMI</div>
          </div>
          <div className="p-3 bg-muted/30 rounded-xl text-center">
            <div className="text-lg font-bold">${result.total.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Total Payment</div>
          </div>
          <div className="p-3 bg-muted/30 rounded-xl text-center">
            <div className="text-lg font-bold text-orange-500">${result.interest.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Total Interest</div>
          </div>
        </div>
      )}
    </div>
  );
}