"use client";

import { CalcTemplate } from "@/components/calc/calc-template";
import { def } from "./engine";

export function BmrCalculator() {
  return <CalcTemplate def={def} toolId="calc.bmr-calculator" title="BMR and Calorie Calculator" />;
}
