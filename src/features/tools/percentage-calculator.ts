export type PercentageMode =
  | "percentOf"
  | "isWhatPercent"
  | "percentChange"
  | "addPercent"
  | "subtractPercent"
  | "fractionToPercent";

export interface PercentageResult {
  value: number;
  formatted: string;
  formula: string;
  explanation: string;
  difference?: number;
}

export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return (value / total) * 100;
}

export function percentageOf(percent: number, total: number): number {
  return (percent / 100) * total;
}

export function percentageChange(from: number, to: number): number {
  if (from === 0) return 0;
  return ((to - from) / from) * 100;
}

export function calculatePercentageComprehensive(
  mode: PercentageMode,
  val1: number,
  val2: number
): PercentageResult {
  switch (mode) {
    case "percentOf": {
      // What is val1% of val2?
      const res = (val1 / 100) * val2;
      return {
        value: res,
        formatted: `${res.toLocaleString(undefined, { maximumFractionDigits: 4 })}`,
        formula: `(${val1} ÷ 100) × ${val2} = ${res}`,
        explanation: `${val1}% of ${val2} is ${res}`,
      };
    }

    case "isWhatPercent": {
      // val1 is what % of val2?
      if (val2 === 0) {
        return {
          value: 0,
          formatted: "0%",
          formula: `(${val1} ÷ 0) × 100 (Undefined)`,
          explanation: "Division by zero is undefined.",
        };
      }
      const pct = (val1 / val2) * 100;
      return {
        value: pct,
        formatted: `${pct.toLocaleString(undefined, { maximumFractionDigits: 4 })}%`,
        formula: `(${val1} ÷ ${val2}) × 100 = ${pct.toFixed(2)}%`,
        explanation: `${val1} is ${pct.toFixed(2)}% of ${val2}`,
      };
    }

    case "percentChange": {
      // % change from val1 to val2
      if (val1 === 0) {
        return {
          value: 0,
          formatted: "0%",
          formula: `((${val2} - 0) ÷ 0) × 100 (Undefined)`,
          explanation: "Cannot compute percentage change from zero baseline.",
        };
      }
      const diff = val2 - val1;
      const pct = (diff / Math.abs(val1)) * 100;
      const direction = pct >= 0 ? "increase" : "decrease";
      return {
        value: pct,
        difference: diff,
        formatted: `${pct >= 0 ? "+" : ""}${pct.toLocaleString(undefined, { maximumFractionDigits: 4 })}%`,
        formula: `((${val2} - ${val1}) ÷ |${val1}|) × 100 = ${pct.toFixed(2)}%`,
        explanation: `From ${val1} to ${val2} represents a ${Math.abs(pct).toFixed(2)}% ${direction} (${diff >= 0 ? `+${diff}` : diff}).`,
      };
    }

    case "addPercent": {
      // Add val1% to val2 (e.g. Tax/Tip/Markup)
      const increaseAmount = (val1 / 100) * val2;
      const total = val2 + increaseAmount;
      return {
        value: total,
        difference: increaseAmount,
        formatted: `${total.toLocaleString(undefined, { maximumFractionDigits: 4 })}`,
        formula: `${val2} + (${val1}% of ${val2}) = ${total}`,
        explanation: `Adding ${val1}% (+${increaseAmount.toFixed(2)}) to ${val2} equals ${total.toFixed(2)}`,
      };
    }

    case "subtractPercent": {
      // Subtract val1% from val2 (e.g. Discount/Sale)
      const discountAmount = (val1 / 100) * val2;
      const finalPrice = val2 - discountAmount;
      return {
        value: finalPrice,
        difference: discountAmount,
        formatted: `${finalPrice.toLocaleString(undefined, { maximumFractionDigits: 4 })}`,
        formula: `${val2} - (${val1}% of ${val2}) = ${finalPrice}`,
        explanation: `Subtracting ${val1}% (-${discountAmount.toFixed(2)}) from ${val2} leaves ${finalPrice.toFixed(2)}`,
      };
    }

    case "fractionToPercent": {
      // Fraction val1 / val2 to %
      if (val2 === 0) {
        return {
          value: 0,
          formatted: "0%",
          formula: `${val1} / 0 = undefined`,
          explanation: "Denominator cannot be zero.",
        };
      }
      const pct = (val1 / val2) * 100;
      return {
        value: pct,
        formatted: `${pct.toLocaleString(undefined, { maximumFractionDigits: 4 })}%`,
        formula: `(${val1} ÷ ${val2}) × 100 = ${pct.toFixed(2)}%`,
        explanation: `${val1}/${val2} converts to ${pct.toFixed(2)}% (decimal: ${(val1 / val2).toFixed(4)})`,
      };
    }
  }
}