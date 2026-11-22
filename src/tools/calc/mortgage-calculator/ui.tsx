"use client";

import { CalcTemplate } from "@/components/calc/calc-template";
import { def } from "./engine";

export function MortgageCalculator() {
  return <CalcTemplate def={def} toolId="calc.mortgage-calculator" title="Mortgage Calculator" />;
}
