"use client";

import { useState } from "react";
import { Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CalculatorLayout } from "@/components/common/workload-layouts";

export function DiscountCalculatorEngine() {
  const [price, setPrice] = useState("");
  const [discount, setDiscount] = useState("");
  const [result, setResult] = useState<{ saved: number; final: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const clearResult = () => { setResult(null); setError(null); };

  const calculate = () => {
    clearResult();
    const originalPrice = Number(price);
    const discountPercent = Number(discount);
    if (!price.trim() || !discount.trim() || !Number.isFinite(originalPrice) || !Number.isFinite(discountPercent)
      || originalPrice < 0 || discountPercent < 0 || discountPercent > 100) {
      setError("Enter a nonnegative price and a discount from 0 to 100%.");
      return;
    }
    const saved = originalPrice * (discountPercent / 100);
    const nextResult = { saved: Math.round(saved * 100) / 100, final: Math.round((originalPrice - saved) * 100) / 100 };
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
          <label htmlFor="discount-price" className="text-sm font-medium">Original Price ($)</label>
          <input id="discount-price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="100" className="w-full min-h-11 px-3 py-2 text-base rounded-md border border-border/50 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="discount-percent" className="text-sm font-medium">Discount (%)</label>
          <div className="flex gap-2 flex-wrap mb-1">
            {[5, 10, 15, 20, 25, 30, 40, 50].map(d => (
              <Button key={d} variant={discount === String(d) ? "default" : "outline"} size="sm" onClick={() => { setDiscount(String(d)); clearResult(); }} aria-pressed={discount === String(d)} className="min-h-11 text-sm">{d}%</Button>
            ))}
          </div>
          <input id="discount-percent" type="number" value={discount} onChange={(e) => setDiscount(e.target.value)} placeholder="20" className="w-full min-h-11 px-3 py-2 text-base rounded-md border border-border/50 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
      </div>

      } controlsSection={<Button onClick={calculate} disabled={!price || !discount} className="gap-2 min-h-11 w-full"><Calculator className="h-4 w-4" />Calculate</Button>}
      resultSection={error ? <p role="alert" className="text-sm text-destructive">{error}</p> : result ? (
        <div className="grid gap-3 tabular-nums [&>div]:wrap-break-word">
          <div>
            <div className="text-lg font-bold text-green-600">${result.final.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Final Price</div>
          </div>
          <div>
            <div className="text-lg font-bold text-red-500">-${result.saved.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">You Save</div>
          </div>
        </div>
      ) : <p className="text-sm text-muted-foreground">Enter a price and discount to calculate the final price.</p>} />
  );
}