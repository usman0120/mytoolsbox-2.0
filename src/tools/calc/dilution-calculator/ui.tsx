"use client";

import { CalcTemplate } from "@/components/calc/calc-template";
import { def } from "./engine";

export function DilutionCalculator() {
  return <CalcTemplate def={def} toolId="calc.dilution-calculator" title="Dilution Calculator" />;
}
