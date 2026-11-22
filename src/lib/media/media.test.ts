import { describe, expect, it } from "vitest";
import { aspectFrame, capShortSide, fitToBitrate, formatTime, parseTime, planBitrates, scaleTo } from "./plan";
import { fromChunks, toParagraphs, toSrt, toVtt } from "./subtitles";

describe("media plan", () => {
  it("splits a size target into video and audio bitrates", () => {
    // 10 MB over 60 s ≈ 1.33 Mbit/s total.
    const b = planBitrates(10 * 1024 * 1024, 60, true, true);
    expect(b.audio).toBeLessThanOrEqual(128_000);
    expect(b.video + b.audio).toBeLessThanOrEqual(((10 * 1024 * 1024 * 8) / 60) * 0.97);
    expect(planBitrates(1_000_000, 60, false, true).audio).toBe(0);
    expect(planBitrates(5_000_000, 60, true, false).video).toBe(0);
  });

  it("keeps even sizes and aspect ratio", () => {
    expect(scaleTo(1920, 1080, 1280, undefined, "contain")).toEqual({ width: 1280, height: 720, fit: "contain" });
    expect(scaleTo(1080, 1920, undefined, 721, "contain").height).toBe(722);
    expect(capShortSide(1920, 1080, 720)).toEqual({ width: 1280, height: 720 });
    expect(capShortSide(640, 360, 720)).toBeNull();
  });

  it("builds aspect frames without upscaling far past the source", () => {
    const f = aspectFrame(1920, 1080, [9, 16]);
    expect(f.width / f.height).toBeCloseTo(9 / 16, 2);
    expect(f.width % 2).toBe(0);
    const sq = aspectFrame(640, 360, [1, 1]);
    expect(sq.width * sq.height).toBeLessThanOrEqual(640 * 360 * 1.06);
  });

  it("scales down when the bitrate is too low for the resolution", () => {
    // 600 kbit/s at 30 fps allows ~286k pixels at 0.07 bpp: 720p (921k px) must shrink.
    const f = fitToBitrate(1280, 720, 600_000)!;
    expect(f.width * f.height).toBeLessThanOrEqual(286_000);
    expect(f.width / f.height).toBeCloseTo(16 / 9, 1);
    expect(fitToBitrate(1280, 720, 5_000_000)).toBeNull();
    expect(Math.min(...Object.values(fitToBitrate(1920, 1080, 10_000)!))).toBe(240);
  });

  it("formats and parses times", () => {
    expect(formatTime(75.25)).toBe("1:15.3");
    expect(parseTime("1:15.5")).toBe(75.5);
    expect(parseTime("90")).toBe(90);
    expect(parseTime("a:1")).toBeNull();
  });
});

describe("subtitles", () => {
  const segs = fromChunks(
    [
      { timestamp: [0, 2.5], text: " Hello there." },
      { timestamp: [5, null], text: " Second line." },
    ],
    7,
  );

  it("fills a missing end time", () => {
    expect(segs[1].end).toBe(7);
  });

  it("writes SRT and VTT", () => {
    expect(toSrt(segs)).toBe("1\n00:00:00,000 --> 00:00:02,500\nHello there.\n\n2\n00:00:05,000 --> 00:00:07,000\nSecond line.\n");
    expect(toVtt(segs).startsWith("WEBVTT\n\n00:00:00.000 --> 00:00:02.500\nHello there.")).toBe(true);
  });

  it("breaks paragraphs at long pauses", () => {
    expect(toParagraphs(segs)).toBe("Hello there.\n\nSecond line.");
  });
});
