"use client";

import { CalcTemplate } from "@/components/calc/calc-template";
import { def } from "./engine";

export function BodyFatCalculator() {
  return <CalcTemplate def={def} toolId="calc.body-fat-calculator" title="Body Fat Calculator" />;
}
