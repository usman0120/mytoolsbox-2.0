"use client";

import { useState, useMemo } from "react";
import {
  Percent,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  calculatePercentageComprehensive,
  PercentageMode,
} from "@/features/tools/percentage-calculator";
import { toast } from "sonner";

interface ModeConfig {
  id: PercentageMode;
  label: string;
  label1: string;
  placeholder1: string;
  label2: string;
  placeholder2: string;
  subtitle: string;
}

const MODES: ModeConfig[] = [
  {
    id: "percentOf",
    label: "What is X% of Y?",
    label1: "Percentage (X%)",
    placeholder1: "15",
    label2: "Total Base Number (Y)",
    placeholder2: "200",
    subtitle: "Calculate a specific percentage cut of any number",
  },
  {
    id: "isWhatPercent",
    label: "X is what % of Y?",
    label1: "Part / Value (X)",
    placeholder1: "45",
    label2: "Whole / Total (Y)",
    placeholder2: "150",
    subtitle: "Find the percentage proportion of a part out of a whole",
  },
  {
    id: "percentChange",
    label: "% Change from X to Y",
    label1: "Initial Value (From X)",
    placeholder1: "80",
    label2: "New Value (To Y)",
    placeholder2: "120",
    subtitle: "Measure percentage growth, increase, or decline between two values",
  },
  {
    id: "addPercent",
    label: "Add X% to Y (Markup / Tax)",
    label1: "Percentage to Add (%)",
    placeholder1: "20",
    label2: "Original Amount ($ / Qty)",
    placeholder2: "100",
    subtitle: "Add tax, tips, profit markups, or inflation to a number",
  },
  {
    id: "subtractPercent",
    label: "Subtract X% from Y (Discount)",
    label1: "Discount Percentage (%)",
    placeholder1: "25",
    label2: "Original Price / Amount",
    placeholder2: "80",
    subtitle: "Calculate sale prices, clearances, and discounted costs",
  },
  {
    id: "fractionToPercent",
    label: "Convert Fraction X / Y to %",
    label1: "Numerator (X)",
    placeholder1: "3",
    label2: "Denominator (Y)",
    placeholder2: "8",
    subtitle: "Convert ratios, test scores, or fractions directly to percentages",
  },
];

export function PercentageCalculatorEngine() {
  const [activeMode, setActiveMode] = useState<PercentageMode>("percentOf");
  const [val1, setVal1] = useState("15");
  const [val2, setVal2] = useState("200");
  const [copied, setCopied] = useState(false);

  const activeConfig = useMemo(
    () => MODES.find((m) => m.id === activeMode) || MODES[0],
    [activeMode]
  );

  const calculation = useMemo(() => {
    const num1 = parseFloat(val1);
    const num2 = parseFloat(val2);
    if (isNaN(num1) || isNaN(num2)) return null;
    return calculatePercentageComprehensive(activeMode, num1, num2);
  }, [activeMode, val1, val2]);

  const handleCopy = async () => {
    if (!calculation) return;
    await navigator.clipboard.writeText(
      `${calculation.formatted} (${calculation.formula})`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Result copied to clipboard!");
  };

  const handleReset = () => {
    setVal1("");
    setVal2("");
  };

  return (
    <div className="space-y-6">
      {/* Mode Navigation Buttons */}
      <div className="rounded-xl border bg-card p-3 shadow-xs">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1.5">
          {MODES.map((m) => (
            <Button
              key={m.id}
              variant={activeMode === m.id ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setActiveMode(m.id);
                setCopied(false);
              }}
              className="text-xs h-auto py-2.5 px-2 flex flex-col text-center justify-center"
            >
              <span className="font-semibold">{m.label.split("(")[0]}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Inputs & Calculation Box */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Input Panel */}
        <div className="rounded-xl border bg-card p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b">
            <div>
              <h3 className="font-semibold text-sm">{activeConfig.label}</h3>
              <p className="text-xs text-muted-foreground">{activeConfig.subtitle}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="h-7 text-xs text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="h-3 w-3 mr-1" /> Clear
            </Button>
          </div>

          <div className="space-y-3">
            <div>
              <Label className="text-xs font-semibold mb-1.5 block">
                {activeConfig.label1}
              </Label>
              <Input
                type="number"
                step="any"
                placeholder={activeConfig.placeholder1}
                value={val1}
                onChange={(e) => setVal1(e.target.value)}
                className="h-10 text-sm font-mono"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold mb-1.5 block">
                {activeConfig.label2}
              </Label>
              <Input
                type="number"
                step="any"
                placeholder={activeConfig.placeholder2}
                value={val2}
                onChange={(e) => setVal2(e.target.value)}
                className="h-10 text-sm font-mono"
              />
            </div>
          </div>
        </div>

        {/* Output Panel */}
        <div className="rounded-xl border bg-card p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between pb-2 border-b">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Percent className="h-3.5 w-3.5 text-primary" /> Computed Result
            </span>
            {calculation && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="h-7 text-xs gap-1"
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

          {calculation ? (
            <div className="my-auto space-y-3 text-center py-2">
              <div className="flex items-center justify-center gap-2">
                {activeMode === "percentChange" && (
                  calculation.value >= 0 ? (
                    <TrendingUp className="h-6 w-6 text-emerald-500 shrink-0" />
                  ) : (
                    <TrendingDown className="h-6 w-6 text-rose-500 shrink-0" />
                  )
                )}
                <span className="text-4xl font-extrabold tracking-tight text-foreground font-mono">
                  {calculation.formatted}
                </span>
              </div>

              <div className="p-3 bg-muted/40 rounded-xl border text-left space-y-1.5">
                <p className="text-xs font-medium text-foreground">
                  {calculation.explanation}
                </p>
                <p className="text-[11px] font-mono text-muted-foreground border-t pt-1.5">
                  Formula: {calculation.formula}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground my-auto">
              <Percent className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-xs">Enter numbers above to view the calculation.</p>
            </div>
          )}

          {/* Quick Common Presets */}
          <div className="pt-2 border-t flex flex-wrap gap-1.5 items-center">
            <span className="text-[11px] text-muted-foreground mr-1">Quick Presets:</span>
            {[
              { l: "10% Tip", v1: "10", v2: "65", m: "addPercent" },
              { l: "15% Tip", v1: "15", v2: "65", m: "addPercent" },
              { l: "20% Off", v1: "20", v2: "120", m: "subtractPercent" },
              { l: "50% Off", v1: "50", v2: "90", m: "subtractPercent" },
            ].map((p, idx) => (
              <Button
                key={idx}
                variant="outline"
                size="sm"
                onClick={() => {
                  setActiveMode(p.m as PercentageMode);
                  setVal1(p.v1);
                  setVal2(p.v2);
                }}
                className="h-6 text-[10px] px-2"
              >
                {p.l}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}