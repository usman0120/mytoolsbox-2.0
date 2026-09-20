"use client";

import { useState } from "react";
import { Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function DiscountCalculatorEngine() {
  const [price, setPrice] = useState("");
  const [discount, setDiscount] = useState("");
  const [result, setResult] = useState<{ saved: number; final: number } | null>(null);

  const calculate = () => {
    const p = Number(price);
    const d = Number(discount);
    if (!p || isNaN(d)) return;
    const saved = (p * d) / 100;
    setResult({ saved: Math.round(saved * 100) / 100, final: Math.round((p - saved) * 100) / 100 });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Badge variant="secondary" className="rounded-full">Discount Calculator</Badge>
        <span className="text-xs text-muted-foreground">Calculate final price after discount</span>
      </div>

      <div className="space-y-3">
        <div className="space-y-1.5">
          <label className="text-xs font-medium">Original Price ($)</label>
          <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="100" className="w-full px-3 py-2 text-sm rounded-xl border border-border/50 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium">Discount (%)</label>
          <div className="flex gap-2 flex-wrap mb-1">
            {[5, 10, 15, 20, 25, 30, 40, 50].map(d => (
              <Button key={d} variant="outline" size="sm" onClick={() => setDiscount(String(d))} className="rounded-xl text-xs">{d}%</Button>
            ))}
          </div>
          <input type="number" value={discount} onChange={(e) => setDiscount(e.target.value)} placeholder="20" className="w-full px-3 py-2 text-sm rounded-xl border border-border/50 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
      </div>

      <Button onClick={calculate} disabled={!price || !discount} className="gap-2 rounded-xl w-full"><Calculator className="h-4 w-4" />Calculate</Button>

      {result && (
        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 bg-muted/30 rounded-xl text-center">
            <div className="text-lg font-bold text-green-600">${result.final.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Final Price</div>
          </div>
          <div className="p-3 bg-muted/30 rounded-xl text-center">
            <div className="text-lg font-bold text-red-500">-${result.saved.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">You Save</div>
          </div>
        </div>
      )}
    </div>
  );
}