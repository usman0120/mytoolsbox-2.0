// Color Palette Generation, Harmonies, Conversions & WCAG Contrast Metrics

export type HarmonyRule =
  | "complementary"
  | "analogous"
  | "triadic"
  | "tetradic"
  | "monochromatic"
  | "split-complementary";

export interface HSLColor {
  h: number; // 0-360
  s: number; // 0-100
  l: number; // 0-100
}

export interface RGBColor {
  r: number; // 0-255
  g: number; // 0-255
  b: number; // 0-255
}

export interface CMYKColor {
  c: number; // 0-100
  m: number; // 0-100
  y: number; // 0-100
  k: number; // 0-100
}

export function hslToHex(h: number, s: number, l: number): string {
  const normS = s / 100;
  const normL = l / 100;
  const a = normS * Math.min(normL, 1 - normL);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = normL - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`.toLowerCase();
}

export function hexToRgb(hex: string): RGBColor {
  let clean = hex.replace("#", "");
  if (clean.length === 3) {
    clean = clean.split("").map((c) => c + c).join("");
  }
  const num = parseInt(clean, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

export function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (val: number) => Math.max(0, Math.min(255, Math.round(val)));
  return `#${clamp(r).toString(16).padStart(2, "0")}${clamp(g).toString(16).padStart(2, "0")}${clamp(b).toString(16).padStart(2, "0")}`.toLowerCase();
}

export function rgbToHsl(r: number, g: number, b: number): HSLColor {
  const normR = r / 255;
  const normG = g / 255;
  const normB = b / 255;

  const max = Math.max(normR, normG, normB);
  const min = Math.min(normR, normG, normB);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case normR:
        h = ((normG - normB) / d + (normG < normB ? 6 : 0)) / 6;
        break;
      case normG:
        h = ((normB - normR) / d + 2) / 6;
        break;
      case normB:
        h = ((normR - normG) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

export function hexToHsl(hex: string): HSLColor {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHsl(r, g, b);
}

export function rgbToCmyk(r: number, g: number, b: number): CMYKColor {
  const normR = r / 255;
  const normG = g / 255;
  const normB = b / 255;

  const k = 1 - Math.max(normR, normG, normB);
  if (k === 1) {
    return { c: 0, m: 0, y: 0, k: 100 };
  }

  const c = Math.round(((1 - normR - k) / (1 - k)) * 100);
  const m = Math.round(((1 - normG - k) / (1 - k)) * 100);
  const y = Math.round(((1 - normB - k) / (1 - k)) * 100);

  return { c, m, y, k: Math.round(k * 100) };
}

export interface PaletteColor {
  hex: string;
  rgb: RGBColor;
  hsl: HSLColor;
}

export function generateHarmonies(baseHex: string, rule: HarmonyRule): string[] {
  const { h, s, l } = hexToHsl(baseHex);

  switch (rule) {
    case "complementary":
      return [
        baseHex,
        hslToHex((h + 180) % 360, s, l),
        hslToHex(h, Math.max(10, s - 30), Math.min(95, l + 20)),
        hslToHex((h + 180) % 360, Math.max(10, s - 30), Math.max(10, l - 20)),
        hslToHex(h, s, Math.max(10, l - 30)),
      ];
    case "analogous":
      return [
        hslToHex((h - 40 + 360) % 360, s, l),
        hslToHex((h - 20 + 360) % 360, s, l),
        baseHex,
        hslToHex((h + 20) % 360, s, l),
        hslToHex((h + 40) % 360, s, l),
      ];
    case "triadic":
      return [
        baseHex,
        hslToHex((h + 120) % 360, s, l),
        hslToHex((h + 240) % 360, s, l),
        hslToHex((h + 120) % 360, s, Math.min(90, l + 20)),
        hslToHex((h + 240) % 360, s, Math.max(15, l - 20)),
      ];
    case "tetradic":
      return [
        baseHex,
        hslToHex((h + 90) % 360, s, l),
        hslToHex((h + 180) % 360, s, l),
        hslToHex((h + 270) % 360, s, l),
        hslToHex((h + 180) % 360, s, Math.min(90, l + 25)),
      ];
    case "monochromatic":
      return [
        hslToHex(h, s, 15),
        hslToHex(h, s, 35),
        baseHex,
        hslToHex(h, Math.max(20, s - 15), 70),
        hslToHex(h, Math.max(10, s - 25), 90),
      ];
    case "split-complementary":
      return [
        baseHex,
        hslToHex((h + 150) % 360, s, l),
        hslToHex((h + 210) % 360, s, l),
        hslToHex((h + 150) % 360, Math.max(20, s - 20), Math.min(90, l + 20)),
        hslToHex((h + 210) % 360, Math.max(20, s - 20), Math.max(15, l - 20)),
      ];
    default:
      return [baseHex];
  }
}

export function generatePalette(baseHex: string, rule: HarmonyRule, count = 5): PaletteColor[] {
  const hexes = generateHarmonies(baseHex, rule).slice(0, count);
  return hexes.map((hex) => {
    const rgb = hexToRgb(hex);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    return { hex, rgb, hsl };
  });
}

/**
 * Calculates WCAG 2.1 relative luminance for an sRGB color.
 */
export function getLuminance(color: string | RGBColor): number {
  const { r, g, b } = typeof color === "string" ? hexToRgb(color) : color;
  const transform = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * transform(r) + 0.7152 * transform(g) + 0.0722 * transform(b);
}

export const getRelativeLuminance = getLuminance;

/**
 * Calculates contrast ratio between two colors according to WCAG specifications (1 to 21).
 */
export function getContrastRatio(hex1: string, hex2: string): number {
  const lum1 = getLuminance(hex1);
  const lum2 = getLuminance(hex2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return Math.round(((lighter + 0.05) / (darker + 0.05)) * 100) / 100;
}

export function generateShadesAndTints(baseHex: string): Record<string, string> {
  const { h, s } = hexToHsl(baseHex);
  return {
    "50": hslToHex(h, Math.min(100, s * 0.4), 97),
    "100": hslToHex(h, Math.min(100, s * 0.6), 92),
    "200": hslToHex(h, Math.min(100, s * 0.75), 82),
    "300": hslToHex(h, Math.min(100, s * 0.9), 70),
    "400": hslToHex(h, s, 58),
    "500": baseHex.toLowerCase(),
    "600": hslToHex(h, Math.min(100, s * 1.05), 42),
    "700": hslToHex(h, Math.min(100, s * 1.1), 32),
    "800": hslToHex(h, Math.min(100, s * 1.15), 22),
    "900": hslToHex(h, Math.min(100, s * 1.2), 14),
  };
}

export function generateShades(baseHex: string): { shade: number; hex: string }[] {
  const record = generateShadesAndTints(baseHex);
  return Object.entries(record).map(([k, hex]) => ({
    shade: parseInt(k, 10),
    hex,
  }));
}

export function exportCssVariables(colors: (string | PaletteColor)[]): string {
  const lines = [":root {"];
  colors.forEach((c, idx) => {
    const hex = typeof c === "string" ? c : c.hex;
    lines.push(`  --color-primary-${idx + 1}: ${hex};`);
  });
  lines.push("}");
  return lines.join("\n");
}

export const exportPaletteCSS = exportCssVariables;

export function exportTailwindConfig(colors: (string | PaletteColor)[]): string {
  const lines = ["colors: {", "  brand: {"];
  colors.forEach((c, idx) => {
    const hex = typeof c === "string" ? c : c.hex;
    lines.push(`    '${(idx + 1) * 100}': '${hex}',`);
  });
  lines.push("  }", "}");
  return lines.join("\n");
}
