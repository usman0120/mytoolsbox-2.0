"use client";

import { CalcTemplate } from "@/components/calc/calc-template";
import { def } from "./engine";

export function KinematicsCalculator() {
  return <CalcTemplate def={def} toolId="calc.kinematics-calculator" title="Kinematics Calculator (SUVAT)" />;
}
