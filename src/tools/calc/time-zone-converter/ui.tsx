"use client";

import { CalcTemplate } from "@/components/calc/calc-template";
import { def } from "./engine";

export function TimeZoneConverter() {
  return <CalcTemplate def={def} toolId="calc.time-zone-converter" title="Time Zone Converter" />;
}
