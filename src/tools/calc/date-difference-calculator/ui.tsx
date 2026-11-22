"use client";

import { CalcTemplate } from "@/components/calc/calc-template";
import { def } from "./engine";

export function DateDifferenceCalculator() {
  return <CalcTemplate def={def} toolId="calc.date-difference-calculator" title="Date Difference Calculator" />;
}
