"use client";

import { useState, useMemo } from "react";
import {
  Percent,
  Copy,
  Check,
  RotateCcw,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalculatorLayout } from "@/components/common/workload-layouts";
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
    if (!val1.trim() || !val2.trim()) return null;
    const num1 = Number(val1);
    const num2 = Number(val2);
    if (!Number.isFinite(num1) || !Number.isFinite(num2)) return null;
    if (activeMode === "percentChange" && num1 === 0) return null;
    if (["isWhatPercent", "fractionToPercent"].includes(activeMode) && num2 === 0) return null;
    return calculatePercentageComprehensive(activeMode, num1, num2);
  }, [activeMode, val1, val2]);

  const error = !val1.trim() || !val2.trim() ? null
    : !Number.isFinite(Number(val1)) || !Number.isFinite(Number(val2)) ? "Enter finite numbers."
    : activeMode === "percentChange" && Number(val1) === 0 ? "Percentage change needs a nonzero initial value."
    : ["isWhatPercent", "fractionToPercent"].includes(activeMode) && Number(val2) === 0 ? "The whole or denominator must not be zero."
    : calculation && !Number.isFinite(calculation.value) ? "The result is too large. Use smaller values." : null;

  const handleCopy = async () => {
    if (!calculation || error) return;
    try {
      await navigator.clipboard.writeText(`${calculation.formatted} (${calculation.formula})`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Result copied to clipboard!");
    } catch {
      toast.error("Could not copy the result.");
    }
  };

  const handleReset = () => {
    setVal1("");
    setVal2("");
    setCopied(false);
  };

  return (
    <CalculatorLayout
      inputSection={
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="percentage-mode">Calculation</Label>
            <div className="flex items-center gap-2">
              <select id="percentage-mode" value={activeMode}
                onChange={(event) => { setActiveMode(event.target.value as PercentageMode); setCopied(false); }}
                className="h-11 min-w-0 flex-1 rounded-md border bg-background px-2 text-sm">
                {MODES.map((mode) => <option key={mode.id} value={mode.id}>{mode.label}</option>)}
              </select>
              <Button variant="ghost" size="icon" className="h-11 w-11 shrink-0" onClick={handleReset}
                aria-label="Clear calculation inputs" title="Clear calculation inputs">
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="percentage-first">{activeConfig.label1}</Label>
            <Input id="percentage-first" type="number" step="any" inputMode="decimal"
              placeholder={activeConfig.placeholder1} value={val1} className="h-11 text-base"
              aria-invalid={!!error} aria-describedby={error ? "percentage-error" : undefined}
              onChange={(event) => { setVal1(event.target.value); setCopied(false); }} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="percentage-second">{activeConfig.label2}</Label>
            <Input id="percentage-second" type="number" step="any" inputMode="decimal"
              placeholder={activeConfig.placeholder2} value={val2} className="h-11 text-base"
              aria-invalid={!!error} aria-describedby={error ? "percentage-error" : undefined}
              onChange={(event) => { setVal2(event.target.value); setCopied(false); }} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="percentage-preset">Preset</Label>
            <select id="percentage-preset" value="" className="h-11 w-full min-w-0 rounded-md border bg-background px-2 text-sm"
              onChange={(event) => {
                const presets: Record<string, { first: string; second: string; mode: PercentageMode }> = {
                  tip10: { first: "10", second: "65", mode: "addPercent" },
                  tip15: { first: "15", second: "65", mode: "addPercent" },
                  discount20: { first: "20", second: "120", mode: "subtractPercent" },
                  discount50: { first: "50", second: "90", mode: "subtractPercent" },
                };
                const preset = presets[event.target.value];
                if (!preset) return;
                setActiveMode(preset.mode);
                setVal1(preset.first);
                setVal2(preset.second);
                setCopied(false);
              }}>
              <option value="">Select a preset</option>
              <option value="tip10">10% tip on 65</option>
              <option value="tip15">15% tip on 65</option>
              <option value="discount20">20% off 120</option>
              <option value="discount50">50% off 90</option>
            </select>
          </div>
        </div>
      }
      resultSection={
        <div className="space-y-4">
          <div className="flex min-h-11 items-center justify-between gap-2 border-b pb-2">
            <h2 className="flex items-center gap-2 text-sm font-medium">
              <Percent className="h-4 w-4 text-primary" /> Result
            </h2>
            <Button variant="ghost" size="icon" className="h-11 w-11" onClick={handleCopy} disabled={!calculation || !!error}
              aria-label={copied ? "Result copied" : "Copy result"} title={copied ? "Result copied" : "Copy result"}>
              {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          {error ? <p id="percentage-error" role="alert" className="text-sm text-destructive">{error}</p>
            : calculation ? (
              <div className="space-y-3">
                <div className="flex min-w-0 items-start gap-2">
                  {activeMode === "percentChange" && (calculation.value >= 0
                    ? <TrendingUp className="mt-1 h-6 w-6 shrink-0 text-emerald-500" />
                    : <TrendingDown className="mt-1 h-6 w-6 shrink-0 text-rose-500" />)}
                  <output htmlFor="percentage-first percentage-second percentage-mode" aria-label="Calculated result"
                    className="min-w-0 break-all text-2xl font-semibold tracking-normal">{calculation.formatted}</output>
                </div>
                <p className="wrap-break-word text-sm text-muted-foreground">{calculation.explanation}</p>
              </div>
            ) : <p className="text-sm text-muted-foreground">No result yet</p>}
        </div>
      }
      explanationSection={calculation && !error ? <p className="break-all font-mono text-sm">Formula: {calculation.formula}</p> : undefined}
    />
  );
}