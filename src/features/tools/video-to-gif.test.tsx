import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { VideoToGifEngine } from "./video-to-gif-engine";
import { VideoToGifMakerEngine } from "./video-to-gif-maker-engine";
import { planGifFrames } from "./video-to-gif-sampling";
import { GifEncoder } from "@/lib/processing/client/gif-encoder";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock("@/components/ui/slider", () => ({
  Slider: ({ value, onValueChange }: { value: number[]; onValueChange: (value: number[]) => void }) =>
    <input aria-label="setting" value={value[0]} onChange={(event) => onValueChange([Number(event.target.value)])} />,
}));

describe("GIF sampling", () => {
  it.each([0.5, 1, 1.5, 2])("clips near-end sampling at %sx speed", (speed) => {
    const { frameTimes, frameDelay } = planGifFrames(10, 9.5, 4, 12, speed);
    expect(frameTimes).toHaveLength(Math.max(1, Math.floor(0.5 * 12 / speed)));
    expect(frameTimes[0]).toBe(9.5);
    expect(frameTimes.every((time) => time >= 9.5 && time < 10)).toBe(true);
    expect(new Set(frameTimes).size).toBe(frameTimes.length);
    expect(frameDelay).toBe(83);
  });

  it.each([0.5, 1, 1.5, 2])("preserves source clip length at %sx speed", (speed) => {
    const { frameTimes } = planGifFrames(20, 3, 4, 12, speed);
    expect(frameTimes).toHaveLength(48 / speed);
    expect(frameTimes[1] - frameTimes[0]).toBeCloseTo(speed / 12);
    expect(frameTimes.at(-1)).toBeLessThan(7);
  });

  it("keeps one frame for a sub-frame clip and excludes rounded endpoints", () => {
    expect(planGifFrames(0.01, 0, 4, 12).frameTimes).toEqual([0]);
    expect(planGifFrames(10, 9.999999999999998, 4, 12, 2).frameTimes).toEqual([9.999999999999998]);
  });

  it.each([
    [10, 10, 4, 12, 1], [10, -1, 4, 12, 1], [Infinity, 0, 4, 12, 1],
    [10, 0, NaN, 12, 1], [10, 0, 4, 0, 1], [10, 0, 4, 12, 0],
  ])("rejects invalid settings %j", (...settings) => {
    expect(() => planGifFrames(...settings as [number, number, number, number, number])).toThrow("Invalid");
  });
});

let seekMode: "success" | "error" | "abort" | "timeout" | "throw" | "undecoded";
let sourceDuration: number;
let seekTimes: number[];
let drawnTimes: number[];
let activeVideo: HTMLVideoElement;
let captions: string[];

beforeEach(() => {
  seekMode = "success";
  sourceDuration = 10;
  seekTimes = [];
  drawnTimes = [];
  captions = [];
  const currentTimes = new WeakMap<HTMLMediaElement, number>();
  vi.spyOn(HTMLMediaElement.prototype, "duration", "get").mockImplementation(() => sourceDuration);
  vi.spyOn(HTMLMediaElement.prototype, "readyState", "get").mockImplementation(() => seekMode === "undecoded" && seekTimes.length > 0 ? 1 : 2);
  vi.spyOn(HTMLVideoElement.prototype, "videoWidth", "get").mockReturnValue(2);
  vi.spyOn(HTMLVideoElement.prototype, "videoHeight", "get").mockReturnValue(2);
  vi.spyOn(HTMLMediaElement.prototype, "currentTime", "get").mockImplementation(function (this: HTMLMediaElement) {
    return currentTimes.get(this) ?? 0;
  });
  vi.spyOn(HTMLMediaElement.prototype, "currentTime", "set").mockImplementation(function (this: HTMLMediaElement, time) {
    activeVideo = this as HTMLVideoElement;
    seekTimes.push(time);
    if (seekMode === "throw") throw new Error("seek failed");
    currentTimes.set(this, time);
    if (seekMode !== "timeout") this.dispatchEvent(new Event(seekMode === "error" || seekMode === "abort" ? seekMode : "seeked"));
  });
  vi.spyOn(HTMLMediaElement.prototype, "load").mockImplementation(function (this: HTMLMediaElement) {
    this.dispatchEvent(new Event("loadedmetadata"));
  });
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
    drawImage: (video: HTMLVideoElement) => { activeVideo = video; drawnTimes.push(video.currentTime); },
    getImageData: () => ({ width: 2, height: 2, data: new Uint8ClampedArray(16).fill(255) }),
    strokeText: (text: string) => captions.push(text),
    fillText: (text: string) => captions.push(text),
  } as unknown as CanvasRenderingContext2D);
  vi.spyOn(GifEncoder.prototype, "addFrame");
  vi.spyOn(GifEncoder.prototype, "render");
  vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:test");
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

function uploadAndConfigure(Engine: typeof VideoToGifEngine, start = 9.5, duration = 4) {
  const { container } = render(<Engine />);
  fireEvent.change(container.querySelector('input[type="file"]')!, {
    target: { files: [new File(["video"], "clip.mp4", { type: "video/mp4" })] },
  });
  const settings = screen.getAllByLabelText("setting");
  fireEvent.change(settings[0], { target: { value: start } });
  fireEvent.change(settings[1], { target: { value: duration } });
  fireEvent.change(settings[3], { target: { value: 2 } });
}

describe.each([
  ["converter", VideoToGifEngine], ["maker", VideoToGifMakerEngine],
] as const)("%s extraction", (_, Engine) => {
  it("captures only remaining source frames and produces a real GIF", async () => {
    uploadAndConfigure(Engine);
    fireEvent.click(screen.getByRole("button", { name: /(?:Create|Generate) Animated GIF/ }));
    await waitFor(() => expect(GifEncoder.prototype.render).toHaveBeenCalledOnce());
    expect(seekTimes).toEqual(planGifFrames(10, 9.5, 4, 12).frameTimes);
    expect(drawnTimes).toEqual(seekTimes);
    expect(GifEncoder.prototype.addFrame).toHaveBeenCalledTimes(6);
    const blob = vi.mocked(GifEncoder.prototype.render).mock.results[0].value as Blob;
    expect(blob.type).toBe("image/gif");
    const bytes = await new Promise<Uint8Array>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(new Uint8Array(reader.result as ArrayBuffer));
      reader.readAsArrayBuffer(blob);
    });
    expect(String.fromCharCode(...bytes.slice(0, 6))).toBe("GIF89a");
    expect(Array.from(bytes.slice(6, 10))).toEqual([2, 0, 2, 0]);
    expect(bytes.at(-1)).toBe(0x3b);
    expect(GifEncoder.prototype.addFrame).toHaveBeenCalledWith(expect.anything(), { delay: 83 });
  });

  it("reuses an already decoded first frame without a redundant seek", async () => {
    uploadAndConfigure(Engine, 0, 0.01);
    fireEvent.click(screen.getByRole("button", { name: /(?:Create|Generate) Animated GIF/ }));
    await waitFor(() => expect(GifEncoder.prototype.render).toHaveBeenCalledOnce());
    expect(seekTimes).toEqual([]);
    expect(drawnTimes).toEqual([0]);
  });

  it.each(["error", "abort", "throw", "undecoded", "timeout"] as const)("rejects %s seeks without encoding stale frames", async (mode) => {
    uploadAndConfigure(Engine);
    seekMode = mode;
    vi.useFakeTimers();
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /(?:Create|Generate) Animated GIF/ }));
    });
    if (mode === "timeout") await act(async () => { await vi.advanceTimersByTimeAsync(5000); });
    expect(screen.getByText(mode === "timeout" ? "Video frame seek timed out." : mode === "undecoded" ? "Unable to decode video frame." : "Unable to seek video frame.")).toBeInTheDocument();
    expect(drawnTimes).toEqual([]);
    expect(GifEncoder.prototype.render).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
    await act(async () => { activeVideo.dispatchEvent(new Event("seeked")); });
    expect(drawnTimes).toEqual([]);
  });
});

it("preserves speed and captions in the converter", async () => {
  uploadAndConfigure(VideoToGifEngine);
  fireEvent.click(screen.getByRole("button", { name: "2x" }));
  fireEvent.change(screen.getByPlaceholderText("Top caption..."), { target: { value: "top" } });
  fireEvent.change(screen.getByPlaceholderText("Bottom caption..."), { target: { value: "bottom" } });
  fireEvent.click(screen.getByRole("button", { name: /(?:Create|Generate) Animated GIF/ }));
  await waitFor(() => expect(GifEncoder.prototype.render).toHaveBeenCalledOnce());
  expect(drawnTimes).toEqual(planGifFrames(10, 9.5, 4, 12, 2).frameTimes);
  expect(captions).toEqual(Array.from({ length: 3 }, () => ["TOP", "TOP", "BOTTOM", "BOTTOM"]).flat());
});

it("preserves bounce without duplicating its turning endpoints", async () => {
  uploadAndConfigure(VideoToGifMakerEngine);
  fireEvent.click(screen.getByRole("checkbox"));
  fireEvent.click(screen.getByRole("button", { name: /(?:Create|Generate) Animated GIF/ }));
  await waitFor(() => expect(GifEncoder.prototype.render).toHaveBeenCalledOnce());
  const frames = vi.mocked(GifEncoder.prototype.addFrame).mock.calls.map(([frame]) => frame);
  expect(frames).toHaveLength(10);
  expect(frames.slice(6)).toEqual(frames.slice(1, 5).reverse());
});