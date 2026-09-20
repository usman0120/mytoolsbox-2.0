"use client";

import { useState } from "react";
import { Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function MortgageCalculatorEngine() {
  const [homePrice, setHomePrice] = useState("");
  const [downPayment, setDownPayment] = useState("");
  const [rate, setRate] = useState("");
  const [years, setYears] = useState("30");
  const [result, setResult] = useState<{ monthly: number; total: number; interest: number } | null>(null);

  const calculate = () => {
    const price = Number(homePrice);
    const down = Number(downPayment) || 0;
    const p = price - down;
    const r = Number(rate) / 12 / 100;
    const n = Number(years) * 12;
    if (!p || !r || !n) return;
    const monthly = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const total = monthly * n;
    setResult({ monthly: Math.round(monthly * 100) / 100, total: Math.round(total * 100) / 100, interest: Math.round((total - p) * 100) / 100 });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Badge variant="secondary" className="rounded-full">Mortgage Calculator</Badge>
        <span className="text-xs text-muted-foreground">Estimate your monthly mortgage payment</span>
      </div>

      <div className="space-y-3">
        <div className="space-y-1.5">
          <label className="text-xs font-medium">Home Price ($)</label>
          <input type="number" value={homePrice} onChange={(e) => setHomePrice(e.target.value)} placeholder="300000" className="w-full px-3 py-2 text-sm rounded-xl border border-border/50 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium">Down Payment ($)</label>
          <input type="number" value={downPayment} onChange={(e) => setDownPayment(e.target.value)} placeholder="60000" className="w-full px-3 py-2 text-sm rounded-xl border border-border/50 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium">Interest Rate (%)</label>
          <input type="number" value={rate} onChange={(e) => setRate(e.target.value)} placeholder="6.5" step="0.1" className="w-full px-3 py-2 text-sm rounded-xl border border-border/50 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium">Loan Term</label>
          <select value={years} onChange={(e) => setYears(e.target.value)} className="w-full px-3 py-2 text-sm rounded-xl border border-border/50 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20">
            <option value="10">10 years</option>
            <option value="15">15 years</option>
            <option value="20">20 years</option>
            <option value="30">30 years</option>
          </select>
        </div>
      </div>

      <Button onClick={calculate} disabled={!homePrice || !rate} className="gap-2 rounded-xl w-full"><Calculator className="h-4 w-4" />Calculate</Button>

      {result && (
        <div className="grid grid-cols-3 gap-2">
          <div className="p-3 bg-muted/30 rounded-xl text-center">
            <div className="text-lg font-bold text-primary">${result.monthly.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Monthly</div>
          </div>
          <div className="p-3 bg-muted/30 rounded-xl text-center">
            <div className="text-lg font-bold">${result.total.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
          <div className="p-3 bg-muted/30 rounded-xl text-center">
            <div className="text-lg font-bold text-orange-500">${result.interest.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Interest</div>
          </div>
        </div>
      )}
    </div>
  );
}