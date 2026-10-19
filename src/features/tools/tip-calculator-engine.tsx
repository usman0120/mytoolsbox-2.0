"use client";

import { useState } from "react";
import { Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CalculatorLayout } from "@/components/common/workload-layouts";

export function TipCalculatorEngine() {
  const [bill, setBill] = useState("");
  const [tipPercent, setTipPercent] = useState("15");
  const [people, setPeople] = useState("1");
  const [result, setResult] = useState<{ tip: number; total: number; perPerson: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const clearResult = () => { setResult(null); setError(null); };

  const calculate = () => {
    clearResult();
    const billAmount = Number(bill);
    const percentage = Number(tipPercent);
    const peopleCount = Number(people);
    if (!bill.trim() || !tipPercent.trim() || !people.trim() || !Number.isFinite(billAmount) || billAmount < 0
      || !Number.isFinite(percentage) || percentage < 0 || !Number.isSafeInteger(peopleCount) || peopleCount < 1) {
      setError("Enter a nonnegative bill and tip, and a positive whole number of people.");
      return;
    }
    const tip = billAmount * (percentage / 100);
    const total = billAmount + tip;
    const nextResult = { tip: Math.round(tip * 100) / 100, total: Math.round(total * 100) / 100, perPerson: Math.round((total / peopleCount) * 100) / 100 };
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
          <label htmlFor="tip-bill" className="text-sm font-medium">Bill Amount ($)</label>
          <input id="tip-bill" type="number" value={bill} onChange={(e) => setBill(e.target.value)} placeholder="50" className="w-full min-h-11 px-3 py-2 text-base rounded-md border border-border/50 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="tip-percent" className="text-sm font-medium">Tip Percentage</label>
          <div className="flex gap-1.5 flex-wrap mb-1">
            {[10, 15, 18, 20, 25].map(t => (
              <Button key={t} variant={tipPercent === String(t) ? "default" : "outline"} size="sm" onClick={() => { setTipPercent(String(t)); clearResult(); }} aria-pressed={tipPercent === String(t)} className="min-h-11 text-sm">{t}%</Button>
            ))}
          </div>
          <input id="tip-percent" type="number" value={tipPercent} onChange={(e) => setTipPercent(e.target.value)} placeholder="15" className="w-full min-h-11 px-3 py-2 text-base rounded-md border border-border/50 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="tip-people" className="text-sm font-medium">Number of People</label>
          <input id="tip-people" type="number" value={people} onChange={(e) => setPeople(e.target.value)} placeholder="1" min="1" className="w-full min-h-11 px-3 py-2 text-base rounded-md border border-border/50 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
      </div>

      } controlsSection={<Button onClick={calculate} disabled={!bill} className="gap-2 min-h-11 w-full"><Calculator className="h-4 w-4" />Calculate</Button>}
      resultSection={error ? <p role="alert" className="text-sm text-destructive">{error}</p> : result ? (
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 tabular-nums [&>div]:min-w-0 [&>div]:wrap-break-word">
          <div>
            <div className="text-lg font-bold">${result.tip.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Tip</div>
          </div>
          <div>
            <div className="text-lg font-bold">${result.total.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
          <div>
            <div className="text-lg font-bold">${result.perPerson.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Per Person</div>
          </div>
        </div>
      ) : <p className="text-sm text-muted-foreground">Enter a bill amount to calculate the split.</p>} />
  );
}