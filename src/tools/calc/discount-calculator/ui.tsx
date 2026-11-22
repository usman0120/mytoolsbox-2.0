"use client";

import { CalcTemplate } from "@/components/calc/calc-template";
import { def } from "./engine";

export function DiscountCalculator() {
  return <CalcTemplate def={def} toolId="calc.discount-calculator" title="Discount Calculator" />;
}
