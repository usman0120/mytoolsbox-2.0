import { ProcessingResult } from "@/lib/processing/types";

export interface ColorData {
  hex: string;
  hexAlpha: string;
  rgb: string;
  rgba: string;
  hsl: string;
  hsla: string;
  hsv: string;
  cmyk: string;
  raw: {
    r: number;
    g: number;
    b: number;
    a: number;
    h: number;
    s: number;
    l: number;
  };
  codeSnippets: {
    cssVar: string;
    tailwind: string;
    flutter: string;
    swiftUI: string;
    android: string;
  };
  harmonies: {
    complementary: string;
    analogous: [string, string];
    triadic: [string, string];
    tints: string[];
    shades: string[];
  };
}

export function convertColor(input: string): ProcessingResult & { data?: ColorData } {
  if (!input.trim()) {
    return { status: "error", error: "Please enter a color value." };
  }

  const trimmed = input.trim();
  let r = 0, g = 0, b = 0, a = 1;

  // Hex (#rgb, #rrggbb, #rrggbbaa)
  if (trimmed.startsWith("#")) {
    const hex = trimmed.slice(1);
    if (hex.length === 3) {
      r = parseInt(hex[0] + hex[0], 16);
      g = parseInt(hex[1] + hex[1], 16);
      b = parseInt(hex[2] + hex[2], 16);
    } else if (hex.length === 4) {
      r = parseInt(hex[0] + hex[0], 16);
      g = parseInt(hex[1] + hex[1], 16);
      b = parseInt(hex[2] + hex[2], 16);
      a = Math.round((parseInt(hex[3] + hex[3], 16) / 255) * 100) / 100;
    } else if (hex.length === 6) {
      r = parseInt(hex.slice(0, 2), 16);
      g = parseInt(hex.slice(2, 4), 16);
      b = parseInt(hex.slice(4, 6), 16);
    } else if (hex.length === 8) {
      r = parseInt(hex.slice(0, 2), 16);
      g = parseInt(hex.slice(2, 4), 16);
      b = parseInt(hex.slice(4, 6), 16);
      a = Math.round((parseInt(hex.slice(6, 8), 16) / 255) * 100) / 100;
    } else {
      return { status: "error", error: "Invalid hex color format." };
    }
  }
  // RGB / RGBA
  else if (trimmed.startsWith("rgb")) {
    const match = trimmed.match(/rgba?\((\d+)[,\s]+(\d+)[,\s]+(\d+)(?:[,\s/]+([\d.]+))?\)/);
    if (!match) {
      return { status: "error", error: "Invalid RGB format. Use rgb(r, g, b) or rgba(r, g, b, a)." };
    }
    r = Math.min(255, parseInt(match[1]));
    g = Math.min(255, parseInt(match[2]));
    b = Math.min(255, parseInt(match[3]));
    a = match[4] ? Math.min(1, Math.max(0, parseFloat(match[4]))) : 1;
  }
  // HSL / HSLA
  else if (trimmed.startsWith("hsl")) {
    const match = trimmed.match(/hsla?\((\d+)[,\s]+(\d+)%?[,\s]+(\d+)%?(?:[,\s/]+([\d.]+))?\)/);
    if (!match) {
      return { status: "error", error: "Invalid HSL format. Use hsl(h, s%, l%)." };
    }
    const h = parseInt(match[1]) / 360;
    const s = parseInt(match[2]) / 100;
    const l = parseInt(match[3]) / 100;
    a = match[4] ? Math.min(1, Math.max(0, parseFloat(match[4]))) : 1;
    const rgb = hslToRgb(h, s, l);
    r = rgb[0];
    g = rgb[1];
    b = rgb[2];
  }
  // Named CSS colors
  else {
    const named = NAMED_COLORS[trimmed.toLowerCase()];
    if (!named) {
      return { status: "error", error: `Unrecognized color "${trimmed}". Try hex (#3b82f6) or named color.` };
    }
    r = named[0];
    g = named[1];
    b = named[2];
  }

  if (isNaN(r) || isNaN(g) || isNaN(b)) {
    return { status: "error", error: "Invalid numeric color channels." };
  }

  const hex = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  const hexAlpha = a < 1 ? `${hex}${toHex(Math.round(a * 255))}` : hex;
  const hsl = rgbToHsl(r, g, b);
  const hsv = rgbToHsv(r, g, b);
  const cmyk = rgbToCmyk(r, g, b);

  // Harmonies
  const complementary = hslToHex((hsl[0] + 180) % 360, hsl[1], hsl[2]);
  const analogous: [string, string] = [
    hslToHex((hsl[0] + 330) % 360, hsl[1], hsl[2]),
    hslToHex((hsl[0] + 30) % 360, hsl[1], hsl[2]),
  ];
  const triadic: [string, string] = [
    hslToHex((hsl[0] + 120) % 360, hsl[1], hsl[2]),
    hslToHex((hsl[0] + 240) % 360, hsl[1], hsl[2]),
  ];

  // Tints (lighter) & Shades (darker)
  const tints = [85, 70, 55].map((l) => hslToHex(hsl[0], hsl[1], l));
  const shades = [40, 25, 10].map((l) => hslToHex(hsl[0], hsl[1], l));

  // Code snippets
  const hexUpperNoHash = hex.slice(1).toUpperCase();
  const codeSnippets = {
    cssVar: `--color-primary: ${hex};`,
    tailwind: `bg-[${hex}] text-[${hex}] border-[${hex}]`,
    flutter: `Color(0xFF${hexUpperNoHash})`,
    swiftUI: `Color(red: ${(r / 255).toFixed(2)}, green: ${(g / 255).toFixed(2)}, blue: ${(b / 255).toFixed(2)})`,
    android: `Color.parseColor("${hex.toUpperCase()}")`,
  };

  return {
    status: "success",
    message: hex,
    data: {
      hex,
      hexAlpha,
      rgb: `rgb(${r}, ${g}, ${b})`,
      rgba: `rgba(${r}, ${g}, ${b}, ${a})`,
      hsl: `hsl(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%)`,
      hsla: `hsla(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%, ${a})`,
      hsv: `hsv(${hsv[0]}, ${hsv[1]}%, ${hsv[2]}%)`,
      cmyk: `cmyk(${cmyk[0]}%, ${cmyk[1]}%, ${cmyk[2]}%, ${cmyk[3]}%)`,
      raw: { r, g, b, a, h: hsl[0], s: hsl[1], l: hsl[2] },
      codeSnippets,
      harmonies: {
        complementary,
        analogous,
        triadic,
        tints,
        shades,
      },
    },
  };
}

function toHex(n: number): string {
  return Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function hslToHex(h: number, s: number, l: number): string {
  const rgb = hslToRgb(h / 360, s / 100, l / 100);
  return `#${toHex(rgb[0])}${toHex(rgb[1])}${toHex(rgb[2])}`;
}

function rgbToHsv(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;

  if (max !== min) {
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return [Math.round(h * 360), Math.round(s * 100), Math.round(v * 100)];
}

function rgbToCmyk(r: number, g: number, b: number): [number, number, number, number] {
  let c = 1 - (r / 255);
  let m = 1 - (g / 255);
  let y = 1 - (b / 255);
  let k = Math.min(c, m, y);

  if (k === 1) return [0, 0, 0, 100];

  c = Math.round(((c - k) / (1 - k)) * 100);
  m = Math.round(((m - k) / (1 - k)) * 100);
  y = Math.round(((y - k) / (1 - k)) * 100);
  k = Math.round(k * 100);

  return [c, m, y, k];
}

const NAMED_COLORS: Record<string, [number, number, number]> = {
  black: [0, 0, 0], white: [255, 255, 255], red: [255, 0, 0], green: [0, 128, 0],
  blue: [0, 0, 255], yellow: [255, 255, 0], cyan: [0, 255, 255], magenta: [255, 0, 255],
  gray: [128, 128, 128], purple: [128, 0, 128], orange: [255, 165, 0], pink: [255, 192, 203],
  teal: [0, 128, 128], indigo: [75, 0, 130], violet: [238, 130, 238], brown: [165, 42, 42],
  gold: [255, 215, 0], silver: [192, 192, 192], navy: [0, 0, 128], lime: [0, 255, 0],
  coral: [255, 127, 80], salmon: [250, 128, 114], crimson: [220, 20, 60], khaki: [240, 230, 140],
  plum: [221, 160, 221], orchid: [218, 112, 214], turquoise: [64, 224, 208], skyblue: [135, 206, 235],
  royalblue: [65, 105, 225], steelblue: [70, 130, 180], slateblue: [106, 90, 205],
  darkred: [139, 0, 0], darkgreen: [0, 100, 0], darkblue: [0, 0, 139], darkcyan: [0, 139, 139],
  darkgray: [169, 169, 169], lightgray: [211, 211, 211], ivory: [255, 255, 240], beige: [245, 245, 220],
};