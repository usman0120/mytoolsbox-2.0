"use client";

import { CalcTemplate } from "@/components/calc/calc-template";
import { def } from "./engine";

export function IdealGasLawCalculator() {
  return <CalcTemplate def={def} toolId="calc.ideal-gas-law-calculator" title="Ideal Gas Law Calculator" />;
}
