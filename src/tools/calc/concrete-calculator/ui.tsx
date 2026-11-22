"use client";

import { CalcTemplate } from "@/components/calc/calc-template";
import { def } from "./engine";

export function ConcreteCalculator() {
  return <CalcTemplate def={def} toolId="calc.concrete-calculator" title="Concrete Calculator" />;
}
