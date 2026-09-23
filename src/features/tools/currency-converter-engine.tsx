"use client";

import { useState, useCallback, useMemo } from "react";
import {
  DollarSign, Copy, Check, ArrowRightLeft, TrendingUp, TrendingDown,
  Globe, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  convertCurrency,
  formatCurrencyValue,
  generateComparisonMatrix,
  CURRENCY_REGISTRY,
  POPULAR_CURRENCIES,
  type CurrencyInfo,
} from "@/features/tools/currency-converter";

const QUICK_AMOUNTS = [10, 50, 100, 500, 1000, 5000];

export function CurrencyConverterEngine() {
  const [amountStr, setAmountStr] = useState("100");
  const [fromCode, setFromCode] = useState("USD");
  const [toCode, setToCode] = useState("EUR");
  const [copied, setCopied] = useState(false);

  const amount = parseFloat(amountStr) || 0;

  const conversion = useMemo(() => {
    return convertCurrency(amount, fromCode, toCode);
  }, [amount, fromCode, toCode]);

  const matrix = useMemo(() => {
    const targets = POPULAR_CURRENCIES.filter((c) => c !== fromCode).slice(0, 6);
    return generateComparisonMatrix(amount, fromCode, targets);
  }, [amount, fromCode]);

  const handleSwap = () => {
    setFromCode(toCode);
    setToCode(fromCode);
  };

  const handleCopy = async () => {
    const text = `${conversion.amount} ${fromCode} = ${conversion.result.toFixed(4)} ${toCode}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Conversion copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const currenciesList = Object.values(CURRENCY_REGISTRY);

  return (
    <div className="space-y-6">
      {/* Main Conversion Panel */}
      <Card className="border shadow-xs bg-card">
        <CardContent className="p-4 sm:p-6 space-y-4">
          {/* Amount input & Quick Chips */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold">Enter Amount</Label>
              <div className="flex gap-1 overflow-x-auto">
                {QUICK_AMOUNTS.map((val) => (
                  <Button
                    key={val}
                    variant={amount === val ? "default" : "outline"}
                    size="sm"
                    className="h-6 text-[10px] px-2"
                    onClick={() => setAmountStr(val.toString())}
                  >
                    ${val.toLocaleString()}
                  </Button>
                ))}
              </div>
            </div>
            <Input
              type="number"
              value={amountStr}
              onChange={(e) => setAmountStr(e.target.value)}
              placeholder="0.00"
              className="text-lg font-mono font-bold h-11"
            />
          </div>

          {/* Currency Selectors & Swap Button */}
          <div className="grid grid-cols-1 sm:grid-cols-11 items-center gap-2">
            {/* From */}
            <div className="sm:col-span-5 space-y-1">
              <Label className="text-xs text-muted-foreground">From Currency</Label>
              <select
                value={fromCode}
                onChange={(e) => setFromCode(e.target.value)}
                className="w-full h-10 rounded-lg border bg-background px-3 text-sm font-medium"
              >
                {currenciesList.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.code} — {c.name} ({c.symbol})
                  </option>
                ))}
              </select>
            </div>

            {/* Swap Button */}
            <div className="sm:col-span-1 flex justify-center pt-3 sm:pt-4">
              <Button
                variant="outline"
                size="icon"
                onClick={handleSwap}
                className="h-9 w-9 rounded-full shadow-xs hover:rotate-180 transition-transform duration-300"
              >
                <ArrowRightLeft className="h-4 w-4" />
              </Button>
            </div>

            {/* To */}
            <div className="sm:col-span-5 space-y-1">
              <Label className="text-xs text-muted-foreground">To Currency</Label>
              <select
                value={toCode}
                onChange={(e) => setToCode(e.target.value)}
                className="w-full h-10 rounded-lg border bg-background px-3 text-sm font-medium"
              >
                {currenciesList.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.code} — {c.name} ({c.symbol})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Result Display Banner */}
      <Card className="border border-primary/30 bg-primary/5 shadow-xs">
        <CardContent className="p-6 text-center space-y-2">
          <p className="text-xs text-muted-foreground font-medium">
            {conversion.amount.toLocaleString()} {conversion.from.name} =
          </p>
          <p className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground font-mono">
            {formatCurrencyValue(conversion.result, conversion.to)}{" "}
            <span className="text-lg font-normal text-muted-foreground">{toCode}</span>
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <Badge variant="secondary" className="gap-1 text-xs">
              <TrendingUp className="h-3 w-3 text-emerald-600" />
              1 {fromCode} = {conversion.exchangeRate.toFixed(4)} {toCode}
            </Badge>
            <Badge variant="outline" className="gap-1 text-xs">
              <TrendingDown className="h-3 w-3 text-blue-600" />
              1 {toCode} = {conversion.inverseRate.toFixed(4)} {fromCode}
            </Badge>
          </div>

          <div className="pt-2">
            <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1 text-xs">
              {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied" : "Copy Result"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Comparison Matrix Table */}
      <div className="space-y-2.5">
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Popular Rates for {amount.toLocaleString()} {fromCode}
        </Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {matrix.map((item) => (
            <Card
              key={item.code}
              onClick={() => setToCode(item.code)}
              className="border shadow-xs hover:border-primary/50 cursor-pointer transition-colors"
            >
              <CardContent className="p-3">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold flex items-center gap-1.5">
                    <span>{item.flag}</span>
                    <span>{item.code}</span>
                  </span>
                  <span className="text-[10px] text-muted-foreground">{item.name}</span>
                </div>
                <p className="text-base font-bold font-mono text-foreground truncate">
                  {item.symbol}{item.converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Rate: {item.rate.toFixed(4)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}