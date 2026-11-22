// Pure mask helpers for background removal. The model (see src/lib/ml) produces an alpha mask;
// these functions refine it and composite the result. No DOM: runs in workers and Vitest.

export type Rgb = [number, number, number];

export interface MaskRefine {
  /** 0-100. Higher keeps only confident subject pixels (cleaner edges, may eat hair). */
  strength: number;
  /** Edge softening radius in pixels (0 = hard edge). */
  feather: number;
}

/** Contrast-stretch the soft mask around a cut point, then optionally blur its edge. */
export function refineMask(mask: Uint8Array, w: number, h: number, { strength, feather }: MaskRefine): Uint8Array {
  const out = new Uint8Array(mask.length);
  // strength 0 → keep mask as is; 100 → near-binary cut at 50%.
  const s = Math.min(Math.max(strength, 0), 100) / 100;
  const lo = 128 * s * 0.9;
  const hi = 255 - 127 * s * 0.9;
  for (let i = 0; i < mask.length; i++) {
    const v = mask[i];
    out[i] = v <= lo ? 0 : v >= hi ? 255 : Math.round(((v - lo) / (hi - lo)) * 255);
  }
  const r = Math.round(Math.max(0, feather));
  return r > 0 ? boxBlur(out, w, h, r) : out;
}

/** Separable box blur (two passes ≈ smooth enough for edge feathering). */
export function boxBlur(src: Uint8Array, w: number, h: number, r: number): Uint8Array {
  const tmp = new Uint8Array(src.length);
  const out = new Uint8Array(src.length);
  const size = r * 2 + 1;
  for (let y = 0; y < h; y++) {
    let sum = 0;
    const row = y * w;
    for (let x = -r; x <= r; x++) sum += src[row + clamp(x, 0, w - 1)];
    for (let x = 0; x < w; x++) {
      tmp[row + x] = Math.round(sum / size);
      sum += src[row + clamp(x + r + 1, 0, w - 1)] - src[row + clamp(x - r, 0, w - 1)];
    }
  }
  for (let x = 0; x < w; x++) {
    let sum = 0;
    for (let y = -r; y <= r; y++) sum += tmp[clamp(y, 0, h - 1) * w + x];
    for (let y = 0; y < h; y++) {
      out[y * w + x] = Math.round(sum / size);
      sum += tmp[clamp(y + r + 1, 0, h - 1) * w + x] - tmp[clamp(y - r, 0, h - 1) * w + x];
    }
  }
  return out;
}

/** Applies the mask as alpha. With a background colour the result is flattened onto it. */
export function composite(rgba: Uint8ClampedArray, mask: Uint8Array, background: Rgb | null): Uint8ClampedArray {
  const out = new Uint8ClampedArray(rgba.length);
  for (let i = 0, p = 0; i < mask.length; i++, p += 4) {
    const a = (mask[i] * rgba[p + 3]) / 255;
    if (background) {
      const t = a / 255;
      out[p] = rgba[p] * t + background[0] * (1 - t);
      out[p + 1] = rgba[p + 1] * t + background[1] * (1 - t);
      out[p + 2] = rgba[p + 2] * t + background[2] * (1 - t);
      out[p + 3] = 255;
    } else {
      out[p] = rgba[p];
      out[p + 1] = rgba[p + 1];
      out[p + 2] = rgba[p + 2];
      out[p + 3] = a;
    }
  }
  return out;
}

/** Bounding box of mask pixels above `min`, or null when the mask is empty. */
export function maskBounds(mask: Uint8Array, w: number, h: number, min = 128) {
  let x0 = w, y0 = h, x1 = -1, y1 = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (mask[y * w + x] >= min) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
    }
  }
  return x1 < 0 ? null : { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 };
}

export function hexToRgb(hex: string): Rgb {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  const n = m ? parseInt(m[1], 16) : 0xffffff;
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function clamp(v: number, a: number, b: number) {
  return v < a ? a : v > b ? b : v;
}
