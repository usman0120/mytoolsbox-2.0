"use client";

import { useState } from "react";
import { Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function TipCalculatorEngine() {
  const [bill, setBill] = useState("");
  const [tipPercent, setTipPercent] = useState("15");
  const [people, setPeople] = useState("1");
  const [result, setResult] = useState<{ tip: number; total: number; perPerson: number } | null>(null);

  const calculate = () => {
    const b = Number(bill);
    const t = Number(tipPercent);
    const p = Number(people) || 1;
    if (!b) return;
    const tip = (b * t) / 100;
    const total = b + tip;
    setResult({ tip: Math.round(tip * 100) / 100, total: Math.round(total * 100) / 100, perPerson: Math.round((total / p) * 100) / 100 });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Badge variant="secondary" className="rounded-full">Tip Calculator</Badge>
        <span className="text-xs text-muted-foreground">Split bills & calculate tips easily</span>
      </div>

      <div className="space-y-3">
        <div className="space-y-1.5">
          <label className="text-xs font-medium">Bill Amount ($)</label>
          <input type="number" value={bill} onChange={(e) => setBill(e.target.value)} placeholder="50" className="w-full px-3 py-2 text-sm rounded-xl border border-border/50 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium">Tip Percentage</label>
          <div className="flex gap-1.5 flex-wrap mb-1">
            {[10, 15, 18, 20, 25].map(t => (
              <Button key={t} variant={tipPercent === String(t) ? "default" : "outline"} size="sm" onClick={() => setTipPercent(String(t))} className="rounded-xl text-xs">{t}%</Button>
            ))}
          </div>
          <input type="number" value={tipPercent} onChange={(e) => setTipPercent(e.target.value)} placeholder="15" className="w-full px-3 py-2 text-sm rounded-xl border border-border/50 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium">Number of People</label>
          <input type="number" value={people} onChange={(e) => setPeople(e.target.value)} placeholder="1" min="1" className="w-full px-3 py-2 text-sm rounded-xl border border-border/50 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
      </div>

      <Button onClick={calculate} disabled={!bill} className="gap-2 rounded-xl w-full"><Calculator className="h-4 w-4" />Calculate</Button>

      {result && (
        <div className="grid grid-cols-3 gap-2">
          <div className="p-3 bg-muted/30 rounded-xl text-center">
            <div className="text-lg font-bold">${result.tip.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Tip</div>
          </div>
          <div className="p-3 bg-muted/30 rounded-xl text-center">
            <div className="text-lg font-bold">${result.total.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
          <div className="p-3 bg-muted/30 rounded-xl text-center">
            <div className="text-lg font-bold">${result.perPerson.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Per Person</div>
          </div>
        </div>
      )}
    </div>
  );
}