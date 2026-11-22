"use client";

import { CalcTemplate } from "@/components/calc/calc-template";
import { def } from "./engine";

export function IdealWeightCalculator() {
  return <CalcTemplate def={def} toolId="calc.ideal-weight-calculator" title="Ideal Weight Calculator" />;
}
