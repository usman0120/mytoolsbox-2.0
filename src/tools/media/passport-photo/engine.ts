// Passport / ID photo geometry. Pure TS: no DOM, so it runs in workers and Vitest.
// Head height is measured from the top of the hair (crown) to the chin, as in ICAO 9303.

export interface PhotoPreset {
  id: string;
  name: string;
  widthMm: number;
  heightMm: number;
  headMinMm: number;
  headMaxMm: number;
  background: string;
  /** Largest file size accepted by the official online form, when one exists. */
  maxKb?: number;
}

export const PRESETS: PhotoPreset[] = [
  { id: "us", name: "United States passport / visa (2×2 in)", widthMm: 50.8, heightMm: 50.8, headMinMm: 25.4, headMaxMm: 34.9, background: "#ffffff", maxKb: 240 },
  { id: "uk", name: "United Kingdom passport (35×45 mm)", widthMm: 35, heightMm: 45, headMinMm: 29, headMaxMm: 34, background: "#eeeeee" },
  { id: "schengen", name: "Schengen visa / EU passport (35×45 mm)", widthMm: 35, heightMm: 45, headMinMm: 32, headMaxMm: 36, background: "#f2f2f2" },
  { id: "canada", name: "Canada passport (50×70 mm)", widthMm: 50, heightMm: 70, headMinMm: 31, headMaxMm: 36, background: "#ffffff" },
  { id: "australia", name: "Australia passport (35×45 mm)", widthMm: 35, heightMm: 45, headMinMm: 32, headMaxMm: 36, background: "#f2f2f2" },
  { id: "india", name: "India passport (35×45 mm)", widthMm: 35, heightMm: 45, headMinMm: 32, headMaxMm: 36, background: "#ffffff" },
  { id: "india-visa", name: "India visa (2×2 in)", widthMm: 50.8, heightMm: 50.8, headMinMm: 25.4, headMaxMm: 34.9, background: "#ffffff", maxKb: 1000 },
  { id: "pakistan", name: "Pakistan passport (35×45 mm)", widthMm: 35, heightMm: 45, headMinMm: 32, headMaxMm: 36, background: "#ffffff" },
  { id: "china", name: "China visa (33×48 mm)", widthMm: 33, heightMm: 48, headMinMm: 28, headMaxMm: 33, background: "#ffffff" },
  { id: "japan", name: "Japan passport (35×45 mm)", widthMm: 35, heightMm: 45, headMinMm: 32, headMaxMm: 36, background: "#ffffff" },
];

export interface Head {
  /** Crown (top of hair) row in source pixels. */
  top: number;
  chin: number;
  centerX: number;
}

export interface Crop {
  x: number;
  y: number;
  w: number;
  h: number;
}

export const mmToPx = (mm: number, dpi: number) => Math.round((mm / 25.4) * dpi);

/**
 * Estimates crown, chin and face centre from a person mask by following the silhouette width:
 * it grows over the head, narrows at the neck and widens again at the shoulders.
 */
export function findHead(mask: Uint8Array, w: number, h: number, min = 128): Head | null {
  const widths: number[] = new Array(h).fill(0);
  const mids: number[] = new Array(h).fill(w / 2);
  let top = -1;
  for (let y = 0; y < h; y++) {
    let x0 = -1, x1 = -1;
    for (let x = 0; x < w; x++) {
      if (mask[y * w + x] >= min) {
        if (x0 < 0) x0 = x;
        x1 = x;
      }
    }
    if (x0 >= 0) {
      widths[y] = x1 - x0 + 1;
      mids[y] = (x0 + x1) / 2;
      if (top < 0 && widths[y] > w * 0.02) top = y;
    }
  }
  if (top < 0) return null;

  // Widest row in the upper part of the head.
  const searchEnd = Math.min(h - 1, top + Math.round(h * 0.45));
  let headRow = top, headW = 0;
  for (let y = top; y <= searchEnd; y++) {
    if (widths[y] > headW) {
      headW = widths[y];
      headRow = y;
    }
    // Stop once the silhouette has clearly widened past the head (shoulders).
    if (headW > 0 && widths[y] > headW * 1.6) break;
  }

  // Narrowest row below the widest head row, before the shoulders.
  let neckRow = -1, neckW = Infinity;
  for (let y = headRow; y < h; y++) {
    if (widths[y] < neckW) {
      neckW = widths[y];
      neckRow = y;
    }
    if (widths[y] > Math.max(neckW * 1.5, headW * 1.15)) break;
  }

  // The first neck-width row is where the jaw outline meets the neck, about 85% of the way to the chin.
  const fromNeck = neckRow > headRow && neckW < headW * 0.9 ? (neckRow - top) / 0.85 : 0;
  // Without a visible neck (tight crop), a head is about 1.3× as tall as it is wide.
  const headH = fromNeck > headW * 0.8 && fromNeck < headW * 2 ? fromNeck : headW * 1.3;
  return { top, chin: Math.min(h, top + headH), centerX: mids[headRow] };
}

/** Source rectangle that places the head at the preset's target size. Zoom 1 = middle of the allowed range. */
export function fitCrop(preset: PhotoPreset, head: Head, adjust: { zoom?: number; dxMm?: number; dyMm?: number } = {}): Crop {
  const headPx = Math.max(1, head.chin - head.top);
  const targetMm = ((preset.headMinMm + preset.headMaxMm) / 2) * (adjust.zoom ?? 1);
  const mmPerPx = targetMm / headPx;
  const w = preset.widthMm / mmPerPx;
  const h = preset.heightMm / mmPerPx;
  // About 40% of the free height above the head keeps the eyes in the ICAO band.
  const topMm = (preset.heightMm - targetMm) * 0.4;
  return {
    x: head.centerX - w / 2 - (adjust.dxMm ?? 0) / mmPerPx,
    y: head.top - topMm / mmPerPx - (adjust.dyMm ?? 0) / mmPerPx,
    w,
    h,
  };
}

/** Head height in mm for a crop, so the UI can show whether it is inside the allowed range. */
export function headHeightMm(preset: PhotoPreset, head: Head, crop: Crop): number {
  return ((head.chin - head.top) / crop.h) * preset.heightMm;
}

export interface Paper {
  id: string;
  name: string;
  widthMm: number;
  heightMm: number;
}

export const PAPERS: Paper[] = [
  { id: "4x6", name: "4×6 in photo paper", widthMm: 101.6, heightMm: 152.4 },
  { id: "a4", name: "A4", widthMm: 210, heightMm: 297 },
  { id: "letter", name: "US Letter", widthMm: 215.9, heightMm: 279.4 },
];

/** Grid of photo positions (mm, top-left) centred on the paper. */
export function sheetLayout(paper: Paper, photo: { widthMm: number; heightMm: number }, gapMm = 2, marginMm = 4) {
  const fit = (avail: number, size: number) => Math.max(0, Math.floor((avail + gapMm) / (size + gapMm)));
  const cols = fit(paper.widthMm - marginMm * 2, photo.widthMm);
  const rows = fit(paper.heightMm - marginMm * 2, photo.heightMm);
  const usedW = cols * photo.widthMm + Math.max(0, cols - 1) * gapMm;
  const usedH = rows * photo.heightMm + Math.max(0, rows - 1) * gapMm;
  const x0 = (paper.widthMm - usedW) / 2;
  const y0 = (paper.heightMm - usedH) / 2;
  const positions: { x: number; y: number }[] = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) positions.push({ x: x0 + c * (photo.widthMm + gapMm), y: y0 + r * (photo.heightMm + gapMm) });
  return { cols, rows, positions };
}

/** Highest JPEG quality whose output fits in maxBytes (binary search, 6 encodes). */
export async function encodeUnder(encode: (quality: number) => Promise<Blob>, maxBytes: number): Promise<{ blob: Blob; quality: number; fits: boolean }> {
  const best = await encode(0.95);
  if (best.size <= maxBytes) return { blob: best, quality: 0.95, fits: true };
  let lo = 0.1, hi = 0.95, found: { blob: Blob; quality: number } | null = null;
  for (let i = 0; i < 6; i++) {
    const q = (lo + hi) / 2;
    const b = await encode(q);
    if (b.size <= maxBytes) {
      found = { blob: b, quality: q };
      lo = q;
    } else hi = q;
  }
  if (found) return { ...found, fits: true };
  const smallest = await encode(0.1);
  return { blob: smallest, quality: 0.1, fits: smallest.size <= maxBytes };
}

/** Writes the print resolution into a JPEG's JFIF header so it prints at the right physical size. */
export function setJpegDpi(bytes: Uint8Array, dpi: number): Uint8Array {
  const out = bytes.slice();
  // SOI (FFD8) then APP0 (FFE0) with "JFIF\0" identifier.
  if (out[0] === 0xff && out[1] === 0xd8 && out[2] === 0xff && out[3] === 0xe0 && out[6] === 0x4a && out[7] === 0x46 && out[8] === 0x49 && out[9] === 0x46) {
    out[13] = 1; // units: dots per inch
    out[14] = (dpi >> 8) & 255;
    out[15] = dpi & 255;
    out[16] = (dpi >> 8) & 255;
    out[17] = dpi & 255;
  }
  return out;
}
