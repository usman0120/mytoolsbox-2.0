"use client";

import { CalcTemplate } from "@/components/calc/calc-template";
import { def } from "./engine";

export function EgfrCalculator() {
  return <CalcTemplate def={def} toolId="calc.egfr-calculator" title="eGFR Calculator" />;
}
