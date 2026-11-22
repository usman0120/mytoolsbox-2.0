"use client";

import { CalcTemplate } from "@/components/calc/calc-template";
import { def } from "./engine";

export function ZakatCalculator() {
  return <CalcTemplate def={def} toolId="calc.zakat-calculator" title="Zakat Calculator" />;
}
