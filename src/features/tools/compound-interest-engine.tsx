"use client";

import { useState } from "react";
import { Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function CompoundInterestEngine() {
  const [principal, setPrincipal] = useState("");
  const [rate, setRate] = useState("");
  const [time, setTime] = useState("");
  const [frequency, setFrequency] = useState("12");
  const [result, setResult] = useState<{ total: number; interest: number } | null>(null);

  const calculate = () => {
    const p = Number(principal);
    const r = Number(rate) / 100;
    const t = Number(time);
    const n = Number(frequency);
    if (!p || !r || !t) return;

    const total = p * Math.pow(1 + r / n, n * t);
    setResult({ total: Math.round(total * 100) / 100, interest: Math.round((total - p) * 100) / 100 });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Badge variant="secondary" className="rounded-full">Compound Interest</Badge>
        <span className="text-xs text-muted-foreground">Calculate compound interest growth</span>
      </div>

      <div className="space-y-3">
        <div className="space-y-1.5">
          <label className="text-xs font-medium">Principal Amount ($)</label>
          <input type="number" value={principal} onChange={(e) => setPrincipal(e.target.value)} placeholder="10000" className="w-full px-3 py-2 text-sm rounded-xl border border-border/50 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium">Annual Interest Rate (%)</label>
          <input type="number" value={rate} onChange={(e) => setRate(e.target.value)} placeholder="5" step="0.1" className="w-full px-3 py-2 text-sm rounded-xl border border-border/50 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium">Time (years)</label>
          <input type="number" value={time} onChange={(e) => setTime(e.target.value)} placeholder="10" className="w-full px-3 py-2 text-sm rounded-xl border border-border/50 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium">Compound Frequency</label>
          <select value={frequency} onChange={(e) => setFrequency(e.target.value)} className="w-full px-3 py-2 text-sm rounded-xl border border-border/50 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20">
            <option value="1">Annually</option>
            <option value="2">Semi-annually</option>
            <option value="4">Quarterly</option>
            <option value="12">Monthly</option>
            <option value="365">Daily</option>
          </select>
        </div>
      </div>

      <Button onClick={calculate} disabled={!principal || !rate || !time} className="gap-2 rounded-xl w-full"><Calculator className="h-4 w-4" />Calculate</Button>

      {result && (
        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 bg-muted/30 rounded-xl text-center">
            <div className="text-lg font-bold text-green-600">${result.total.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Total Amount</div>
          </div>
          <div className="p-3 bg-muted/30 rounded-xl text-center">
            <div className="text-lg font-bold text-blue-600">${result.interest.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Interest Earned</div>
          </div>
        </div>
      )}
    </div>
  );
}