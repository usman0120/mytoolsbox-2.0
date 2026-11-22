"use client";

import { CalcTemplate } from "@/components/calc/calc-template";
import { def } from "./engine";

export function ProjectileMotionCalculator() {
  return <CalcTemplate def={def} toolId="calc.projectile-motion-calculator" title="Projectile Motion Calculator" />;
}
