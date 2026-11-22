"use client";

import { CalcTemplate } from "@/components/calc/calc-template";
import { def } from "./engine";

export function DueDateCalculator() {
  return <CalcTemplate def={def} toolId="calc.due-date-calculator" title="Pregnancy Due Date Calculator" />;
}
