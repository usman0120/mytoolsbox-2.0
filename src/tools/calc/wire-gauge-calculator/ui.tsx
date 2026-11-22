"use client";

import { CalcTemplate } from "@/components/calc/calc-template";
import { def } from "./engine";

export function WireGaugeCalculator() {
  return <CalcTemplate def={def} toolId="calc.wire-gauge-calculator" title="Wire Gauge Calculator (AWG)" />;
}
