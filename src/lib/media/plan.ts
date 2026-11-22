// Pure planning helpers for media conversion (no DOM, testable in Vitest).

export type OutFormat = "mp4" | "webm" | "mp3" | "m4a" | "wav" | "ogg";
export type Fit = "contain" | "cover" | "fill";

/** Splits a size budget into video and audio bitrates (bits/s), leaving ~4% for container overhead. */
export function planBitrates(targetBytes: number, durationS: number, withAudio: boolean, withVideo: boolean) {
  const total = Math.max(32_000, ((targetBytes * 8) / Math.max(0.1, durationS)) * 0.96);
  if (!withVideo) return { video: 0, audio: Math.round(Math.min(320_000, Math.max(32_000, total))), total };
  const audio = withAudio ? Math.round(Math.min(128_000, Math.max(32_000, total * 0.12))) : 0;
  return { video: Math.round(Math.max(50_000, total - audio)), audio, total };
}

/**
 * Largest size (same aspect) that gives at least `bpp` bits per pixel per frame at `fps`; null if no change needed.
 * Never goes below 240 px on the short side.
 */
export function fitToBitrate(w: number, h: number, videoBitrate: number, fps = 30, bpp = 0.07) {
  if (!w || !h) return null;
  const maxPixels = videoBitrate / (fps * bpp);
  if (w * h <= maxPixels) return null;
  let k = Math.sqrt(maxPixels / (w * h));
  k = Math.max(k, 240 / Math.min(w, h));
  if (k >= 1) return null;
  return { width: Math.max(2, Math.round((w * k) / 2) * 2), height: Math.max(2, Math.round((h * k) / 2) * 2) };
}

/** Even output dimensions (codecs require them). One side may be omitted to keep the aspect ratio. */
export function scaleTo(srcW: number, srcH: number, w: number | undefined, h: number | undefined, fit: Fit) {
  const even = (n: number) => Math.max(2, Math.round(n / 2) * 2);
  if (w && h) return { width: even(w), height: even(h), fit };
  if (!srcW || !srcH) return { width: even(w ?? h ?? 640), height: even(h ?? w ?? 360), fit };
  if (w) return { width: even(w), height: even((w * srcH) / srcW), fit };
  return { width: even(((h ?? srcH) * srcW) / srcH), height: even(h ?? srcH), fit };
}

/** Size that keeps aspect ratio and caps the shorter side (e.g. 720 for "720p"), never upscaling. */
export function capShortSide(srcW: number, srcH: number, short: number) {
  const s = Math.min(srcW, srcH);
  if (!s || s <= short) return null;
  const k = short / s;
  return { width: Math.round((srcW * k) / 2) * 2, height: Math.round((srcH * k) / 2) * 2 };
}

/** Frame for an aspect preset (e.g. 9:16) that fits the source's resolution class without upscaling. */
export function aspectFrame(srcW: number, srcH: number, ratio: [number, number]) {
  const [rw, rh] = ratio;
  const long = Math.min(1920, Math.max(srcW, srcH));
  let w = rw >= rh ? long : (long * rw) / rh;
  let h = rw >= rh ? (long * rh) / rw : long;
  // Don't exceed the source's pixel count by much (no pointless upscaling).
  const k = Math.min(1, Math.sqrt((srcW * srcH * 1.05) / (w * h)) || 1);
  w *= k;
  h *= k;
  return { width: Math.round(w / 2) * 2, height: Math.round(h / 2) * 2 };
}

export function formatTime(s: number): string {
  if (!Number.isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = s - m * 60;
  return `${m}:${sec.toFixed(1).padStart(4, "0")}`;
}

export function parseTime(v: string): number | null {
  const parts = v.trim().split(":").map(Number);
  if (!parts.length || parts.some((n) => !Number.isFinite(n) || n < 0)) return null;
  return parts.reduce((acc, n) => acc * 60 + n, 0);
}
