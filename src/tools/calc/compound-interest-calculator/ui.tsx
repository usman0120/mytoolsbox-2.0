"use client";

import { CalcTemplate } from "@/components/calc/calc-template";
import { def } from "./engine";

export function CompoundInterestCalculator() {
  return <CalcTemplate def={def} toolId="calc.compound-interest-calculator" title="Compound Interest Calculator" />;
}
