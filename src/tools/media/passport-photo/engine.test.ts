import { describe, expect, it } from "vitest";
import { PRESETS, encodeUnder, findHead, fitCrop, headHeightMm, mmToPx, setJpegDpi, sheetLayout, PAPERS } from "./engine";
import { composite, maskBounds, refineMask } from "../remove-background/engine";

/** Synthetic portrait mask: ellipse head (crown y=40, chin y=160), neck, then wide shoulders. */
function portrait(w = 200, h = 300) {
  const m = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const head = ((x - 100) / 45) ** 2 + ((y - 100) / 60) ** 2 <= 1;
      const neck = y > 150 && y < 185 && Math.abs(x - 100) < 22;
      const shoulders = y >= 185 && Math.abs(x - 100) < 22 + (y - 185) * 2;
      if (head || neck || shoulders) m[y * w + x] = 255;
    }
  }
  return m;
}

describe("passport photo engine", () => {
  it("finds crown, chin and centre from a person silhouette", () => {
    const head = findHead(portrait(), 200, 300)!;
    expect(head.top).toBeGreaterThanOrEqual(40);
    expect(head.top).toBeLessThanOrEqual(43);
    expect(head.centerX).toBeCloseTo(100, 0);
    expect(head.chin).toBeGreaterThan(150);
    expect(head.chin).toBeLessThan(180);
  });

  it("returns null for an empty mask", () => {
    expect(findHead(new Uint8Array(100), 10, 10)).toBeNull();
  });

  it("fits the head inside the preset's allowed range", () => {
    const preset = PRESETS.find((p) => p.id === "schengen")!;
    const head = { top: 40, chin: 160, centerX: 100 };
    const crop = fitCrop(preset, head);
    expect(crop.w / crop.h).toBeCloseTo(35 / 45, 5);
    const mm = headHeightMm(preset, head, crop);
    expect(mm).toBeGreaterThanOrEqual(preset.headMinMm);
    expect(mm).toBeLessThanOrEqual(preset.headMaxMm);
    expect(crop.x + crop.w / 2).toBeCloseTo(100, 5);
    expect(crop.y).toBeLessThan(40);
  });

  it("zoom changes the head size proportionally", () => {
    const preset = PRESETS[0];
    const head = { top: 0, chin: 100, centerX: 50 };
    expect(headHeightMm(preset, head, fitCrop(preset, head, { zoom: 1.1 }))).toBeCloseTo(((25.4 + 34.9) / 2) * 1.1, 5);
  });

  it("lays out 35×45 mm photos on 4×6 paper", () => {
    const { cols, rows, positions } = sheetLayout(PAPERS[0], { widthMm: 35, heightMm: 45 });
    expect(cols).toBe(2);
    expect(rows).toBe(3);
    expect(positions).toHaveLength(6);
    expect(positions[0].x).toBeGreaterThan(0);
  });

  it("converts mm to pixels at print resolution", () => {
    expect(mmToPx(25.4, 300)).toBe(300);
    expect(mmToPx(35, 300)).toBe(413);
  });

  it("finds the highest quality under a size limit", async () => {
    const encode = async (q: number) => new Blob([new Uint8Array(Math.round(q * 100_000))]);
    const r = await encodeUnder(encode, 50_000);
    expect(r.fits).toBe(true);
    expect(r.blob.size).toBeLessThanOrEqual(50_000);
    expect(r.quality).toBeGreaterThan(0.45);
  });

  it("writes DPI into the JFIF header", () => {
    const jpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 16, 0x4a, 0x46, 0x49, 0x46, 0, 1, 1, 0, 0, 1, 0, 1, 0, 0]);
    const out = setJpegDpi(jpeg, 300);
    expect([...out.slice(13, 18)]).toEqual([1, 1, 44, 1, 44]);
    expect(jpeg[13]).toBe(0);
  });
});

describe("background mask helpers", () => {
  it("hardens a soft mask with strength", () => {
    const soft = new Uint8Array([20, 100, 128, 160, 240]);
    const hard = refineMask(soft, 5, 1, { strength: 100, feather: 0 });
    expect(hard[0]).toBe(0);
    expect(hard[4]).toBe(255);
    expect(refineMask(soft, 5, 1, { strength: 0, feather: 0 })).toEqual(soft);
  });

  it("flattens onto a colour or keeps alpha", () => {
    const px = new Uint8ClampedArray([200, 0, 0, 255, 200, 0, 0, 255]);
    const mask = new Uint8Array([255, 0]);
    expect([...composite(px, mask, null)]).toEqual([200, 0, 0, 255, 200, 0, 0, 0]);
    expect([...composite(px, mask, [0, 0, 255])]).toEqual([200, 0, 0, 255, 0, 0, 255, 255]);
  });

  it("finds subject bounds", () => {
    expect(maskBounds(portrait(), 200, 300)).toMatchObject({ y: 40 });
    expect(maskBounds(new Uint8Array(4), 2, 2)).toBeNull();
  });
});
