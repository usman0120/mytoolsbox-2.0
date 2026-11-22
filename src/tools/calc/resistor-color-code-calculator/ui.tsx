"use client";

import { CalcTemplate } from "@/components/calc/calc-template";
import { def } from "./engine";

export function ResistorColorCodeCalculator() {
  return <CalcTemplate def={def} toolId="calc.resistor-color-code-calculator" title="Resistor Color Code Calculator" />;
}
