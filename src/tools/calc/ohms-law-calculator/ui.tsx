"use client";

import { CalcTemplate } from "@/components/calc/calc-template";
import { def } from "./engine";

export function OhmsLawCalculator() {
  return <CalcTemplate def={def} toolId="calc.ohms-law-calculator" title="Ohm's Law Calculator" />;
}
