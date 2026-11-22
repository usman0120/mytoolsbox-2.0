"use client";

import { CalcTemplate } from "@/components/calc/calc-template";
import { def } from "./engine";

export function MolarMassCalculator() {
  return <CalcTemplate def={def} toolId="calc.molar-mass-calculator" title="Molar Mass Calculator" />;
}
