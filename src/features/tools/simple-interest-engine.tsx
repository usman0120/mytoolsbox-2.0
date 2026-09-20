"use client";

import { useState } from "react";
import { Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function SimpleInterestEngine() {
  const [principal, setPrincipal] = useState("");
  const [rate, setRate] = useState("");
  const [time, setTime] = useState("");
  const [result, setResult] = useState<{ interest: number; total: number } | null>(null);

  const calculate = () => {
    const p = Number(principal);
    const r = Number(rate) / 100;
    const t = Number(time);
    if (!p || !r || !t) return;
    const interest = p * r * t;
    setResult({ interest: Math.round(interest * 100) / 100, total: Math.round((p + interest) * 100) / 100 });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Badge variant="secondary" className="rounded-full">Simple Interest</Badge>
        <span className="text-xs text-muted-foreground">Calculate simple interest on a principal</span>
      </div>

      <div className="space-y-3">
        <div className="space-y-1.5">
          <label className="text-xs font-medium">Principal ($)</label>
          <input type="number" value={principal} onChange={(e) => setPrincipal(e.target.value)} placeholder="1000" className="w-full px-3 py-2 text-sm rounded-xl border border-border/50 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium">Annual Rate (%)</label>
          <input type="number" value={rate} onChange={(e) => setRate(e.target.value)} placeholder="5" step="0.1" className="w-full px-3 py-2 text-sm rounded-xl border border-border/50 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium">Time (years)</label>
          <input type="number" value={time} onChange={(e) => setTime(e.target.value)} placeholder="3" className="w-full px-3 py-2 text-sm rounded-xl border border-border/50 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
      </div>

      <Button onClick={calculate} disabled={!principal || !rate || !time} className="gap-2 rounded-xl w-full"><Calculator className="h-4 w-4" />Calculate</Button>

      {result && (
        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 bg-muted/30 rounded-xl text-center">
            <div className="text-lg font-bold text-blue-600">${result.interest.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Interest</div>
          </div>
          <div className="p-3 bg-muted/30 rounded-xl text-center">
            <div className="text-lg font-bold text-green-600">${result.total.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Total Amount</div>
          </div>
        </div>
      )}
    </div>
  );
}