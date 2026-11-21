export type UnitCategory =
  | "length"
  | "weight"
  | "temperature"
  | "volume"
  | "area"
  | "speed"
  | "time"
  | "storage"
  | "pressure"
  | "energy";

export interface UnitDefinition {
  id: string;
  name: string;
  symbol: string;
  toBase: (v: number) => number;
  fromBase: (v: number) => number;
}

export const CATEGORY_DEFINITIONS: Record<
  UnitCategory,
  { name: string; units: UnitDefinition[] }
> = {
  length: {
    name: "Length & Distance",
    units: [
      { id: "m", name: "Meter", symbol: "m", toBase: (v) => v, fromBase: (v) => v },
      { id: "km", name: "Kilometer", symbol: "km", toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
      { id: "cm", name: "Centimeter", symbol: "cm", toBase: (v) => v / 100, fromBase: (v) => v * 100 },
      { id: "mm", name: "Millimeter", symbol: "mm", toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
      { id: "mi", name: "Mile", symbol: "mi", toBase: (v) => v * 1609.344, fromBase: (v) => v / 1609.344 },
      { id: "yd", name: "Yard", symbol: "yd", toBase: (v) => v * 0.9144, fromBase: (v) => v / 0.9144 },
      { id: "ft", name: "Foot", symbol: "ft", toBase: (v) => v * 0.3048, fromBase: (v) => v / 0.3048 },
      { id: "in", name: "Inch", symbol: "in", toBase: (v) => v * 0.0254, fromBase: (v) => v / 0.0254 },
      { id: "nmi", name: "Nautical Mile", symbol: "nmi", toBase: (v) => v * 1852, fromBase: (v) => v / 1852 },
    ],
  },
  weight: {
    name: "Mass & Weight",
    units: [
      { id: "kg", name: "Kilogram", symbol: "kg", toBase: (v) => v, fromBase: (v) => v },
      { id: "g", name: "Gram", symbol: "g", toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
      { id: "mg", name: "Milligram", symbol: "mg", toBase: (v) => v / 1000000, fromBase: (v) => v * 1000000 },
      { id: "t", name: "Metric Ton", symbol: "t", toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
      { id: "lb", name: "Pound", symbol: "lb", toBase: (v) => v * 0.45359237, fromBase: (v) => v / 0.45359237 },
      { id: "oz", name: "Ounce", symbol: "oz", toBase: (v) => v * 0.028349523125, fromBase: (v) => v / 0.028349523125 },
      { id: "st", name: "Stone", symbol: "st", toBase: (v) => v * 6.35029318, fromBase: (v) => v / 6.35029318 },
      { id: "ct", name: "Carat", symbol: "ct", toBase: (v) => v * 0.0002, fromBase: (v) => v / 0.0002 },
    ],
  },
  temperature: {
    name: "Temperature",
    units: [
      { id: "c", name: "Celsius", symbol: "°C", toBase: (v) => v, fromBase: (v) => v },
      { id: "f", name: "Fahrenheit", symbol: "°F", toBase: (v) => ((v - 32) * 5) / 9, fromBase: (v) => (v * 9) / 5 + 32 },
      { id: "k", name: "Kelvin", symbol: "K", toBase: (v) => v - 273.15, fromBase: (v) => v + 273.15 },
      { id: "r", name: "Rankine", symbol: "°R", toBase: (v) => ((v - 491.67) * 5) / 9, fromBase: (v) => ((v + 273.15) * 9) / 5 },
    ],
  },
  volume: {
    name: "Volume & Capacity",
    units: [
      { id: "l", name: "Liter", symbol: "L", toBase: (v) => v, fromBase: (v) => v },
      { id: "ml", name: "Milliliter", symbol: "mL", toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
      { id: "m3", name: "Cubic Meter", symbol: "m³", toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
      { id: "gal", name: "US Gallon", symbol: "gal", toBase: (v) => v * 3.785411784, fromBase: (v) => v / 3.785411784 },
      { id: "qt", name: "US Quart", symbol: "qt", toBase: (v) => v * 0.946352946, fromBase: (v) => v / 0.946352946 },
      { id: "pt", name: "US Pint", symbol: "pt", toBase: (v) => v * 0.473176473, fromBase: (v) => v / 0.473176473 },
      { id: "cup", name: "US Cup", symbol: "cup", toBase: (v) => v * 0.2365882365, fromBase: (v) => v / 0.2365882365 },
      { id: "floz", name: "Fluid Ounce", symbol: "fl oz", toBase: (v) => v * 0.0295735295625, fromBase: (v) => v / 0.0295735295625 },
      { id: "tbsp", name: "Tablespoon", symbol: "tbsp", toBase: (v) => v * 0.01478676478125, fromBase: (v) => v / 0.01478676478125 },
      { id: "tsp", name: "Teaspoon", symbol: "tsp", toBase: (v) => v * 0.00492892159375, fromBase: (v) => v / 0.00492892159375 },
    ],
  },
  area: {
    name: "Area & Land",
    units: [
      { id: "sqm", name: "Square Meter", symbol: "m²", toBase: (v) => v, fromBase: (v) => v },
      { id: "sqkm", name: "Square Kilometer", symbol: "km²", toBase: (v) => v * 1000000, fromBase: (v) => v / 1000000 },
      { id: "sqft", name: "Square Foot", symbol: "ft²", toBase: (v) => v * 0.09290304, fromBase: (v) => v / 0.09290304 },
      { id: "sqin", name: "Square Inch", symbol: "in²", toBase: (v) => v * 0.00064516, fromBase: (v) => v / 0.00064516 },
      { id: "sqyd", name: "Square Yard", symbol: "yd²", toBase: (v) => v * 0.83612736, fromBase: (v) => v / 0.83612736 },
      { id: "acre", name: "Acre", symbol: "ac", toBase: (v) => v * 4046.8564224, fromBase: (v) => v / 4046.8564224 },
      { id: "ha", name: "Hectare", symbol: "ha", toBase: (v) => v * 10000, fromBase: (v) => v / 10000 },
    ],
  },
  speed: {
    name: "Speed & Velocity",
    units: [
      { id: "mps", name: "Meter per Second", symbol: "m/s", toBase: (v) => v, fromBase: (v) => v },
      { id: "kmh", name: "Kilometer per Hour", symbol: "km/h", toBase: (v) => v / 3.6, fromBase: (v) => v * 3.6 },
      { id: "mph", name: "Mile per Hour", symbol: "mph", toBase: (v) => v * 0.44704, fromBase: (v) => v / 0.44704 },
      { id: "knot", name: "Knot", symbol: "kn", toBase: (v) => v * 0.514444, fromBase: (v) => v / 0.514444 },
      { id: "fps", name: "Foot per Second", symbol: "ft/s", toBase: (v) => v * 0.3048, fromBase: (v) => v / 0.3048 },
    ],
  },
  time: {
    name: "Time",
    units: [
      { id: "s", name: "Second", symbol: "s", toBase: (v) => v, fromBase: (v) => v },
      { id: "ms", name: "Millisecond", symbol: "ms", toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
      { id: "min", name: "Minute", symbol: "min", toBase: (v) => v * 60, fromBase: (v) => v / 60 },
      { id: "h", name: "Hour", symbol: "h", toBase: (v) => v * 3600, fromBase: (v) => v / 3600 },
      { id: "d", name: "Day", symbol: "d", toBase: (v) => v * 86400, fromBase: (v) => v / 86400 },
      { id: "wk", name: "Week", symbol: "wk", toBase: (v) => v * 604800, fromBase: (v) => v / 604800 },
      { id: "yr", name: "Year (365d)", symbol: "yr", toBase: (v) => v * 31536000, fromBase: (v) => v / 31536000 },
    ],
  },
  storage: {
    name: "Digital Data Storage",
    units: [
      { id: "b", name: "Byte", symbol: "B", toBase: (v) => v, fromBase: (v) => v },
      { id: "kb", name: "Kilobyte (KB)", symbol: "KB", toBase: (v) => v * 1024, fromBase: (v) => v / 1024 },
      { id: "mb", name: "Megabyte (MB)", symbol: "MB", toBase: (v) => v * 1048576, fromBase: (v) => v / 1048576 },
      { id: "gb", name: "Gigabyte (GB)", symbol: "GB", toBase: (v) => v * 1073741824, fromBase: (v) => v / 1073741824 },
      { id: "tb", name: "Terabyte (TB)", symbol: "TB", toBase: (v) => v * 1099511627776, fromBase: (v) => v / 1099511627776 },
      { id: "bit", name: "Bit", symbol: "bit", toBase: (v) => v / 8, fromBase: (v) => v * 8 },
    ],
  },
  pressure: {
    name: "Pressure",
    units: [
      { id: "pa", name: "Pascal", symbol: "Pa", toBase: (v) => v, fromBase: (v) => v },
      { id: "kpa", name: "Kilopascal", symbol: "kPa", toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
      { id: "bar", name: "Bar", symbol: "bar", toBase: (v) => v * 100000, fromBase: (v) => v / 100000 },
      { id: "psi", name: "Pounds per Square Inch", symbol: "psi", toBase: (v) => v * 6894.757, fromBase: (v) => v / 6894.757 },
      { id: "atm", name: "Standard Atmosphere", symbol: "atm", toBase: (v) => v * 101325, fromBase: (v) => v / 101325 },
      { id: "mmhg", name: "Millimeter of Mercury (Torr)", symbol: "mmHg", toBase: (v) => v * 133.322, fromBase: (v) => v / 133.322 },
    ],
  },
  energy: {
    name: "Energy & Work",
    units: [
      { id: "j", name: "Joule", symbol: "J", toBase: (v) => v, fromBase: (v) => v },
      { id: "kj", name: "Kilojoule", symbol: "kJ", toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
      { id: "cal", name: "Calorie", symbol: "cal", toBase: (v) => v * 4.184, fromBase: (v) => v / 4.184 },
      { id: "kcal", name: "Kilocalorie (Food Calorie)", symbol: "kcal", toBase: (v) => v * 4184, fromBase: (v) => v / 4184 },
      { id: "wh", name: "Watt-hour", symbol: "Wh", toBase: (v) => v * 3600, fromBase: (v) => v / 3600 },
      { id: "kwh", name: "Kilowatt-hour", symbol: "kWh", toBase: (v) => v * 3600000, fromBase: (v) => v / 3600000 },
      { id: "btu", name: "British Thermal Unit", symbol: "BTU", toBase: (v) => v * 1055.056, fromBase: (v) => v / 1055.056 },
    ],
  },
};

export function convertUnit(
  value: number,
  fromId: string,
  toId: string,
  category: UnitCategory
): number | null {
  const cat = CATEGORY_DEFINITIONS[category];
  if (!cat) return null;

  const fromUnit = cat.units.find((u) => u.id === fromId);
  const toUnit = cat.units.find((u) => u.id === toId);

  if (!fromUnit || !toUnit) return null;

  const baseVal = fromUnit.toBase(value);
  return toUnit.fromBase(baseVal);
}

export function getUnits(category: UnitCategory): string[] {
  const cat = CATEGORY_DEFINITIONS[category];
  return cat ? cat.units.map((u) => u.id) : [];
}