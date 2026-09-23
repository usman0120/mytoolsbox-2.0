"use client";

import { useState, useMemo } from "react";
import {
  ArrowLeftRight,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Layers,
  Table as TableIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import {
  CATEGORY_DEFINITIONS,
  UnitCategory,
  convertUnit,
} from "@/features/tools/unit-converter";
import { toast } from "sonner";

export function UnitConverterEngine() {
  const [category, setCategory] = useState<UnitCategory>("length");
  const [val, setVal] = useState("10");
  const [fromUnit, setFromUnit] = useState("m");
  const [toUnit, setToUnit] = useState("ft");
  const [copied, setCopied] = useState(false);

  const activeCategory = CATEGORY_DEFINITIONS[category];

  // Set default units when category changes
  const handleCategoryChange = (cat: UnitCategory) => {
    setCategory(cat);
    const def = CATEGORY_DEFINITIONS[cat];
    if (def && def.units.length >= 2) {
      setFromUnit(def.units[0].id);
      setToUnit(def.units[1].id);
    }
  };

  const handleSwap = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
  };

  const convertedValue = useMemo(() => {
    const num = parseFloat(val);
    if (isNaN(num)) return null;
    return convertUnit(num, fromUnit, toUnit, category);
  }, [val, fromUnit, toUnit, category]);

  // Convert entered value to all units in this category simultaneously
  const allConversions = useMemo(() => {
    const num = parseFloat(val);
    if (isNaN(num)) return [];
    return activeCategory.units.map((u) => {
      const res = convertUnit(num, fromUnit, u.id, category);
      return {
        unit: u,
        value: res !== null ? res : 0,
      };
    });
  }, [val, fromUnit, category, activeCategory]);

  const handleCopy = async () => {
    if (convertedValue === null) return;
    const fromObj = activeCategory.units.find((u) => u.id === fromUnit);
    const toObj = activeCategory.units.find((u) => u.id === toUnit);
    const text = `${val} ${fromObj?.symbol} = ${convertedValue.toLocaleString(undefined, { maximumFractionDigits: 6 })} ${toObj?.symbol}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Conversion copied to clipboard!");
  };

  const fromObj = activeCategory.units.find((u) => u.id === fromUnit);
  const toObj = activeCategory.units.find((u) => u.id === toUnit);

  return (
    <div className="space-y-6">
      {/* Category Pills */}
      <div className="rounded-xl border bg-card p-3 shadow-xs">
        <div className="flex flex-wrap gap-1.5">
          {(Object.keys(CATEGORY_DEFINITIONS) as UnitCategory[]).map((catKey) => {
            const def = CATEGORY_DEFINITIONS[catKey];
            const isActive = category === catKey;
            return (
              <Button
                key={catKey}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => handleCategoryChange(catKey)}
                className="text-xs h-8"
              >
                {def.name}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Main Interactive Converter Box */}
      <div className="rounded-xl border bg-card p-5 shadow-xs space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center">
          {/* From Input */}
          <div className="md:col-span-2 space-y-2">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              From
            </Label>
            <div className="space-y-2">
              <Input
                type="number"
                step="any"
                value={val}
                onChange={(e) => setVal(e.target.value)}
                placeholder="Enter value..."
                className="h-11 text-base font-mono font-semibold"
              />
              <Select value={fromUnit} onValueChange={(v) => setFromUnit(v || "")}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {activeCategory.units.map((u) => (
                    <SelectItem key={u.id} value={u.id} className="text-xs">
                      {u.name} ({u.symbol})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center items-center pt-5">
            <Button
              variant="outline"
              size="icon"
              onClick={handleSwap}
              className="rounded-full h-10 w-10 shrink-0 hover:bg-primary hover:text-primary-foreground shadow-xs transition-transform active:scale-95"
              title="Swap units"
            >
              <ArrowLeftRight className="h-4 w-4" />
            </Button>
          </div>

          {/* To Output */}
          <div className="md:col-span-2 space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                To (Converted)
              </Label>
              {convertedValue !== null && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  className="h-5 text-xs gap-1 p-0 text-muted-foreground hover:text-foreground"
                >
                  {copied ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-500" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" /> Copy
                    </>
                  )}
                </Button>
              )}
            </div>
            <div className="space-y-2">
              <div className="h-11 px-3 py-2 bg-muted/30 border rounded-md font-mono text-base font-bold text-foreground flex items-center overflow-x-auto">
                {convertedValue !== null
                  ? convertedValue.toLocaleString(undefined, {
                      maximumFractionDigits: 6,
                    })
                  : "—"}
              </div>
              <Select value={toUnit} onValueChange={(v) => setToUnit(v || "")}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {activeCategory.units.map((u) => (
                    <SelectItem key={u.id} value={u.id} className="text-xs">
                      {u.name} ({u.symbol})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Conversion Equation Banner */}
        {convertedValue !== null && fromObj && toObj && (
          <div className="p-3 bg-muted/40 rounded-xl border text-center text-xs font-mono text-muted-foreground">
            <span className="font-semibold text-foreground">
              {val} {fromObj.symbol}
            </span>{" "}
            ={" "}
            <span className="font-bold text-primary text-sm">
              {convertedValue.toLocaleString(undefined, { maximumFractionDigits: 6 })}{" "}
              {toObj.symbol}
            </span>
          </div>
        )}
      </div>

      {/* Multi-Unit Cross Conversion Grid */}
      {allConversions.length > 0 && (
        <Card className="shadow-xs">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <TableIcon className="h-3.5 w-3.5 text-primary" /> Instant Cross-Conversion ({activeCategory.name})
              </span>
              <span className="text-xs text-muted-foreground font-mono">
                Base: {val} {fromObj?.symbol}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {allConversions.map(({ unit, value }) => {
                const isCurrent = unit.id === toUnit;
                return (
                  <div
                    key={unit.id}
                    onClick={() => setToUnit(unit.id)}
                    className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                      isCurrent
                        ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                        : "bg-card hover:bg-muted/40"
                    }`}
                  >
                    <span className="text-muted-foreground block text-[11px]">
                      {unit.name} ({unit.symbol})
                    </span>
                    <span className="font-mono font-bold text-sm block mt-0.5 truncate">
                      {value.toLocaleString(undefined, { maximumFractionDigits: 6 })}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}