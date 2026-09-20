"use client";

import { useState, useCallback } from "react";
import { DollarSign, Copy, Check, RefreshCw, ArrowRightLeft, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Common currency rates (approximate, relative to USD)
const EXCHANGE_RATES: Record<string, { name: string; symbol: string; rate: number }> = {
  USD: { name: "US Dollar", symbol: "$", rate: 1 },
  EUR: { name: "Euro", symbol: "€", rate: 0.92 },
  GBP: { name: "British Pound", symbol: "£", rate: 0.79 },
  JPY: { name: "Japanese Yen", symbol: "¥", rate: 149.5 },
  CNY: { name: "Chinese Yuan", symbol: "¥", rate: 7.24 },
  INR: { name: "Indian Rupee", symbol: "₹", rate: 83.1 },
  AUD: { name: "Australian Dollar", symbol: "A$", rate: 1.54 },
  CAD: { name: "Canadian Dollar", symbol: "C$", rate: 1.36 },
  CHF: { name: "Swiss Franc", symbol: "CHF", rate: 0.88 },
  SGD: { name: "Singapore Dollar", symbol: "S$", rate: 1.34 },
  KRW: { name: "South Korean Won", symbol: "₩", rate: 1325 },
  BRL: { name: "Brazilian Real", symbol: "R$", rate: 5.05 },
  MXN: { name: "Mexican Peso", symbol: "MX$", rate: 17.1 },
  RUB: { name: "Russian Ruble", symbol: "₽", rate: 91.5 },
  ZAR: { name: "South African Rand", symbol: "R", rate: 18.7 },
  AED: { name: "UAE Dirham", symbol: "د.إ", rate: 3.67 },
  HKD: { name: "Hong Kong Dollar", symbol: "HK$", rate: 7.82 },
  SEK: { name: "Swedish Krona", symbol: "kr", rate: 10.5 },
  NOK: { name: "Norwegian Krone", symbol: "kr", rate: 10.7 },
  DKK: { name: "Danish Krone", symbol: "kr", rate: 6.87 },
  NZD: { name: "New Zealand Dollar", symbol: "NZ$", rate: 1.64 },
  THB: { name: "Thai Baht", symbol: "฿", rate: 35.8 },
  MYR: { name: "Malaysian Ringgit", symbol: "RM", rate: 4.68 },
  PHP: { name: "Philippine Peso", symbol: "₱", rate: 56.2 },
  IDR: { name: "Indonesian Rupiah", symbol: "Rp", rate: 15700 },
  VND: { name: "Vietnamese Dong", symbol: "₫", rate: 24500 },
  TRY: { name: "Turkish Lira", symbol: "₺", rate: 30.2 },
  SAR: { name: "Saudi Riyal", symbol: "﷼", rate: 3.75 },
  NGN: { name: "Nigerian Naira", symbol: "₦", rate: 1520 },
  EGP: { name: "Egyptian Pound", symbol: "E£", rate: 48.5 },
  PKR: { name: "Pakistani Rupee", symbol: "₨", rate: 279 },
  BDT: { name: "Bangladeshi Taka", symbol: "৳", rate: 110 },
};

const CURRENCIES = Object.entries(EXCHANGE_RATES).map(([code, info]) => ({
  code,
  ...info,
}));

export function CurrencyConverterEngine() {
  const [amount, setAmount] = useState("1");
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("EUR");
  const [result, setResult] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [favorites, setFavorites] = useState<string[]>(["USD-EUR", "USD-GBP", "USD-JPY"]);

  const handleConvert = useCallback(() => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) return;

    const fromRate = EXCHANGE_RATES[fromCurrency]?.rate || 1;
    const toRate = EXCHANGE_RATES[toCurrency]?.rate || 1;
    const usdAmount = numAmount / fromRate;
    const converted = usdAmount * toRate;
    setResult(converted);
  }, [amount, fromCurrency, toCurrency]);

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setResult(null);
  };

  const handleCopy = async () => {
    if (result === null) return;
    const fromInfo = EXCHANGE_RATES[fromCurrency];
    const toInfo = EXCHANGE_RATES[toCurrency];
    await navigator.clipboard.writeText(
      `${amount} ${fromCurrency} = ${result.toFixed(4)} ${toCurrency}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleFavorite = (pair: string) => {
    setFavorites(prev =>
      prev.includes(pair) ? prev.filter(p => p !== pair) : [...prev, pair]
    );
  };

  const fromInfo = EXCHANGE_RATES[fromCurrency];
  const toInfo = EXCHANGE_RATES[toCurrency];
  const rate = result !== null && parseFloat(amount) > 0
    ? result / parseFloat(amount)
    : null;

  return (
    <div className="space-y-6">
      {/* Converter */}
      <Card>
        <CardContent className="p-6 space-y-4">
          {/* Amount */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Amount</Label>
            <Input
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => { setAmount(e.target.value); setResult(null); }}
              className="text-lg font-semibold"
            />
          </div>

          {/* From currency */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">From</Label>
            <select
              value={fromCurrency}
              onChange={(e) => { setFromCurrency(e.target.value); setResult(null); }}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.symbol} {c.code} - {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Swap button */}
          <div className="flex justify-center">
            <Button variant="ghost" size="icon" onClick={handleSwap} className="rounded-full">
              <ArrowRightLeft className="h-5 w-5" />
            </Button>
          </div>

          {/* To currency */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">To</Label>
            <select
              value={toCurrency}
              onChange={(e) => { setToCurrency(e.target.value); setResult(null); }}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.symbol} {c.code} - {c.name}
                </option>
              ))}
            </select>
          </div>

          <Button onClick={handleConvert} className="gap-2 w-full" size="lg">
            <DollarSign className="h-4 w-4" /> Convert
          </Button>
        </CardContent>
      </Card>

      {/* Result */}
      {result !== null && (
        <Card className="border-primary/30 bg-primary/5 animate-fade-in-up">
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground mb-1">
              {parseFloat(amount).toLocaleString()} {fromInfo?.name} =
            </p>
            <p className="text-3xl font-bold tracking-tight">
              {toInfo?.symbol}{result.toFixed(4)} <span className="text-lg font-normal text-muted-foreground">{toCurrency}</span>
            </p>
            {rate !== null && (
              <div className="flex items-center justify-center gap-2 mt-2">
                <Badge variant="secondary" className="gap-1">
                  <TrendingUp className="h-3 w-3" />
                  1 {fromCurrency} = {rate.toFixed(6)} {toCurrency}
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <TrendingDown className="h-3 w-3" />
                  1 {toCurrency} = {(1 / rate).toFixed(6)} {fromCurrency}
                </Badge>
              </div>
            )}
            <Button variant="outline" size="sm" className="gap-1 mt-3" onClick={handleCopy}>
              {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied" : "Copy Result"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Quick conversions */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Quick Conversions</Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {favorites.map((pair) => {
            const [from, to] = pair.split("-");
            const fromInfo = EXCHANGE_RATES[from];
            const toInfo = EXCHANGE_RATES[to];
            if (!fromInfo || !toInfo) return null;
            const convRate = toInfo.rate / fromInfo.rate;
            return (
              <button
                key={pair}
                onClick={() => { setFromCurrency(from); setToCurrency(to); setAmount("1"); setResult(null); }}
                className="p-3 rounded-lg border border-border/50 hover:border-border hover:bg-muted/50 text-left transition-all"
              >
                <p className="text-xs font-semibold">{from} → {to}</p>
                <p className="text-lg font-bold">
                  {toInfo.symbol}{convRate.toFixed(4)}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}