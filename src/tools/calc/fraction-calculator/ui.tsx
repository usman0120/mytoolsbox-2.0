"use client";

import { CalcTemplate } from "@/components/calc/calc-template";
import { def } from "./engine";

export function FractionCalculator() {
  return <CalcTemplate def={def} toolId="calc.fraction-calculator" title="Fraction Calculator" />;
}
