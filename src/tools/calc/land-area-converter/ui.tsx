"use client";

import { CalcTemplate } from "@/components/calc/calc-template";
import { def } from "./engine";

export function LandAreaConverter() {
  return <CalcTemplate def={def} toolId="calc.land-area-converter" title="Land Area Converter" />;
}
