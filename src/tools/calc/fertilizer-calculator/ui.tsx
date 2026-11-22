"use client";

import { CalcTemplate } from "@/components/calc/calc-template";
import { def } from "./engine";

export function FertilizerCalculator() {
  return <CalcTemplate def={def} toolId="calc.fertilizer-calculator" title="Fertilizer Calculator" />;
}
