"use client";

import { CalcTemplate } from "@/components/calc/calc-template";
import { def } from "./engine";

export function SipCalculator() {
  return <CalcTemplate def={def} toolId="calc.sip-calculator" title="SIP Calculator" />;
}
