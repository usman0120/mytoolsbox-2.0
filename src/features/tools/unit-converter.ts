export type UnitCategory = "length" | "weight" | "temperature" | "volume" | "area" | "speed";

const conversions: Record<string, Record<string, (v: number) => number>> = {
  length: {
    "m-ft": (v) => v * 3.28084,
    "ft-m": (v) => v / 3.28084,
    "km-mi": (v) => v * 0.621371,
    "mi-km": (v) => v / 0.621371,
    "cm-in": (v) => v / 2.54,
    "in-cm": (v) => v * 2.54,
  },
  weight: {
    "kg-lb": (v) => v * 2.20462,
    "lb-kg": (v) => v / 2.20462,
    "g-oz": (v) => v / 28.3495,
    "oz-g": (v) => v * 28.3495,
  },
  temperature: {
    "c-f": (v) => (v * 9) / 5 + 32,
    "f-c": (v) => ((v - 32) * 5) / 9,
    "c-k": (v) => v + 273.15,
    "k-c": (v) => v - 273.15,
  },
  volume: {
    "l-gal": (v) => v * 0.264172,
    "gal-l": (v) => v / 0.264172,
    "ml-floz": (v) => v / 29.5735,
    "floz-ml": (v) => v * 29.5735,
  },
  area: {
    "sqm-sqft": (v) => v * 10.7639,
    "sqft-sqm": (v) => v / 10.7639,
    "ha-acre": (v) => v * 2.47105,
    "acre-ha": (v) => v / 2.47105,
  },
  speed: {
    "kmh-mph": (v) => v * 0.621371,
    "mph-kmh": (v) => v / 0.621371,
  },
};

export function convertUnit(value: number, from: string, to: string, category: UnitCategory): number | null {
  const key = `${from}-${to}`;
  const fn = conversions[category]?.[key];
  return fn ? fn(value) : null;
}

export function getUnits(category: UnitCategory): string[] {
  const keys = Object.keys(conversions[category] || {});
  const units = new Set<string>();
  keys.forEach((k) => {
    const [a, b] = k.split("-");
    units.add(a);
    units.add(b);
  });
  return Array.from(units);
}