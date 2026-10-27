import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { createElement } from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { AudioCutterEngine } from "@/features/tools/audio-cutter-engine";
import { GifEncoder, encodeGif } from "@/lib/processing/client/gif-encoder";
import { extractWaveformPeaks, audioBufferToWav } from "@/lib/processing/client/audio-processor";

for (const [name, Engine] of [
  ["Audio cutter", AudioCutterEngine],
] as const) {
describe(`${name} output contracts`, () => {
  let output: Blob | undefined;
  let emptyRecording: boolean;
  let wrongMime: boolean;
  let recordingError: boolean;
  let decodeError: boolean;
  const stopTrack = vi.fn();
  const closeContext = vi.fn();

  beforeEach(() => {
    output = undefined;
    emptyRecording = false;
    wrongMime = false;
    recordingError = false;
    decodeError = false;
    const makeBuffer = (channels: number, length: number, sampleRate: number) => {
      const data = Array.from({ length: channels }, (_, channel) => new Float32Array(length).fill(channel ? -0.5 : 0.5));
      return { numberOfChannels: channels, length, sampleRate, duration: length / sampleRate, getChannelData: (channel: number) => data[channel] };
    };
    vi.stubGlobal("AudioContext", class {
      state = "running";
      decodeAudioData = async () => {
        if (decodeError) throw new Error("Unsupported codec");
        return makeBuffer(2, 1000, 1000);
      };
      createBuffer = makeBuffer;
      createMediaStreamDestination = () => ({ stream: { getTracks: () => [{ stop: stopTrack }] } });
      createBufferSource = () => {
        const source = { buffer: null, connect: vi.fn(), onended: null as (() => void) | null, start: () => queueMicrotask(() => source.onended?.()), stop: vi.fn() };
        return source;
      };
      resume = async () => {};
      close = async () => { this.state = "closed"; closeContext(); };
    });
    vi.stubGlobal("MediaRecorder", class {
      static isTypeSupported = (mime: string) => mime === "audio/webm";
      mimeType: string;
      state = "inactive";
      ondataavailable: ((event: { data: Blob }) => void) | null = null;
      onstop: (() => void) | null = null;
      onerror: (() => void) | null = null;
      constructor(_stream: MediaStream, options: MediaRecorderOptions) {
        this.mimeType = wrongMime ? "audio/ogg" : options.mimeType!;
      }
      start = () => { this.state = "recording"; if (recordingError) queueMicrotask(() => this.onerror?.()); };
      stop = () => {
        this.state = "inactive";
        queueMicrotask(() => {
          if (!emptyRecording) this.ondataavailable?.({ data: new Blob([new Uint8Array([0x1a, 0x45, 0xdf, 0xa3])], { type: this.mimeType }) });
          this.onstop?.();
        });
      };
    });
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
    vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
    vi.stubGlobal("URL", Object.assign(URL, {
      createObjectURL: vi.fn((blob: Blob) => {
        if (!(blob instanceof File)) output = blob;
        return blob instanceof File ? "blob:input" : "blob:output";
      }),
      revokeObjectURL: vi.fn(),
    }));
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    stopTrack.mockClear();
    closeContext.mockClear();
  });

  const upload = async (name = "recording.mp3") => {
    const file = new File(["fixture"], name, { type: "audio/mpeg" });
    Object.defineProperty(file, "arrayBuffer", { value: async () => new ArrayBuffer(1) });
    fireEvent.change(screen.getByLabelText("Audio file"), { target: { files: [file] } });
    await waitFor(() => expect(screen.queryByText("Decoding audio...")).not.toBeInTheDocument());
  };

  it("exports actually trimmed stereo PCM as WAV with matching filename and fades", async () => {
    render(createElement(Engine));
    await upload();
    fireEvent.change(screen.getByLabelText("Start seconds"), { target: { value: "0.2" } });
    fireEvent.change(screen.getByLabelText("End seconds"), { target: { value: "0.4" } });
    fireEvent.click(screen.getByRole("button", { name: "Export WAV" }));
    await screen.findByText("recording_cut.wav");
    expect(output?.type).toBe("audio/wav");
    expect(output?.size).toBe(44 + 200 * 2 * 2);
    let view = new DataView(await output!.arrayBuffer());
    expect(view.getUint16(22, true)).toBe(2);
    expect(view.getUint32(24, true)).toBe(1000);
    expect(view.getInt16(44, true)).toBe(16383);
    expect(view.getInt16(46, true)).toBe(-16384);
    fireEvent.click(screen.getByRole("checkbox", { name: "Fade in (50ms)" }));
    fireEvent.click(screen.getByRole("checkbox", { name: "Fade out (50ms)" }));
    expect(screen.queryByLabelText("Exported audio")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Export WAV" }));
    await screen.findByText("recording_cut.wav");
    view = new DataView(await output!.arrayBuffer());
    expect(view.getInt16(44, true)).toBe(0);
    expect(view.getInt16(44 + 199 * 4, true)).toBe(0);
    expect(view.getInt16(44 + 100 * 4, true)).toBe(16383);
    expect(closeContext).toHaveBeenCalledTimes(3);
  });

  it("exports supported generic WebM with its actual MIME and .webm extension, never .mp3", async () => {
    render(createElement(Engine));
    await upload("recording");
    fireEvent.click(screen.getByRole("button", { name: "WebM" }));
    fireEvent.click(screen.getByRole("button", { name: "Export WebM" }));
    await screen.findByText("recording_cut.webm");
    expect(output?.type).toBe("audio/webm");
    expect(Array.from(new Uint8Array(await output!.arrayBuffer()))).toEqual([0x1a, 0x45, 0xdf, 0xa3]);
    expect(screen.queryByText(/_cut\.mp3/)).not.toBeInTheDocument();
    const download = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (this: HTMLAnchorElement) {
      expect(this.download).toBe("recording_cut.webm");
      expect(this.href).toBe("blob:output");
    });
    fireEvent.click(screen.getByRole("button", { name: /Download Audio/i }));
    expect(download).toHaveBeenCalledOnce();
    expect(stopTrack).toHaveBeenCalledOnce();
  });

  it("disables unavailable WebM while keeping WAV export usable", async () => {
    vi.stubGlobal("MediaRecorder", undefined);
    render(createElement(Engine));
    await upload();
    expect(screen.getByRole("button", { name: "WebM" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Export WAV" })).toBeEnabled();
  });

  for (const failure of ["empty", "wrong MIME", "recorder error"]) {
  it(`reports ${failure} recording without a downloadable success`, async () => {
    emptyRecording = failure === "empty";
    wrongMime = failure === "wrong MIME";
    recordingError = failure === "recorder error";
    render(createElement(Engine));
    await upload();
    fireEvent.click(screen.getByRole("button", { name: "WebM" }));
    fireEvent.click(screen.getByRole("button", { name: "Export WebM" }));
    await screen.findByRole("alert");
    expect(screen.queryByLabelText("Exported audio")).not.toBeInTheDocument();
    expect(output).toBeUndefined();
    expect(stopTrack).toHaveBeenCalledOnce();
  });
  }

  it("does not reuse a previous decoded buffer after a replacement fails", async () => {
    render(createElement(Engine));
    await upload();
    decodeError = true;
    await upload("unsupported.mp3");
    expect(screen.getByRole("alert")).toHaveTextContent("cannot decode");
    expect(screen.getByRole("button", { name: "Export WAV" })).toBeDisabled();
    expect(output).toBeUndefined();
  });
});
}

describe("Multimedia Processor Suite", () => {
  describe("GifEncoder", () => {
    it("encodes multiple ImageData frames into a valid GIF89a Blob", async () => {
      const width = 10;
      const height = 10;
      const encoder = new GifEncoder({ width, height, repeat: 0 });

      // Create two 10x10 test frames
      const frame1Data = new Uint8ClampedArray(width * height * 4);
      for (let i = 0; i < frame1Data.length; i += 4) {
        frame1Data[i] = 255; // Red
        frame1Data[i + 1] = 0;
        frame1Data[i + 2] = 0;
        frame1Data[i + 3] = 255;
      }
      const frame1 = {
        data: frame1Data,
        width,
        height,
        colorSpace: "srgb" as PredefinedColorSpace,
      } as ImageData;

      const frame2Data = new Uint8ClampedArray(width * height * 4);
      for (let i = 0; i < frame2Data.length; i += 4) {
        frame2Data[i] = 0;
        frame2Data[i + 1] = 0;
        frame2Data[i + 2] = 255; // Blue
        frame2Data[i + 3] = 255;
      }
      const frame2 = {
        data: frame2Data,
        width,
        height,
        colorSpace: "srgb" as PredefinedColorSpace,
      } as ImageData;

      encoder.addFrame(frame1, { delay: 100 });
      encoder.addFrame(frame2, { delay: 100 });

      const blob = encoder.render();
      expect(blob).toBeDefined();
      expect(blob.type).toBe("image/gif");
      expect(blob.size).toBeGreaterThan(50);

      // Verify GIF89a header magic bytes
      const arrayBuffer = await blob.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      const header = String.fromCharCode(...bytes.slice(0, 6));
      expect(header).toBe("GIF89a");
    });

    it("convenience encodeGif helper returns valid GIF Blob", async () => {
      const width = 8;
      const height = 8;
      const frame = {
        data: new Uint8ClampedArray(width * height * 4),
        width,
        height,
        colorSpace: "srgb" as PredefinedColorSpace,
      } as ImageData;

      const blob = encodeGif([frame], { width, height, fps: 10 });
      expect(blob.type).toBe("image/gif");
      expect(blob.size).toBeGreaterThan(30);
    });
  });

  describe("Audio Processor", () => {
    it("extractWaveformPeaks extracts normalized peak amplitudes", () => {
      // Mock AudioBuffer
      const sampleCount = 1000;
      const channelData = new Float32Array(sampleCount);
      for (let i = 0; i < sampleCount; i++) {
        channelData[i] = Math.sin(i * 0.1) * 0.8;
      }

      const mockBuffer = {
        numberOfChannels: 1,
        sampleRate: 44100,
        length: sampleCount,
        duration: sampleCount / 44100,
        getChannelData: () => channelData,
      } as unknown as AudioBuffer;

      const peaks = extractWaveformPeaks(mockBuffer, 20);
      expect(peaks.length).toBe(20);
      for (const p of peaks) {
        expect(p).toBeGreaterThanOrEqual(0);
        expect(p).toBeLessThanOrEqual(1);
      }
    });

    it("audioBufferToWav generates valid RIFF WAVE binary Blob", async () => {
      const sampleRate = 44100;
      const length = 441; // 10ms of audio
      const channelData = new Float32Array(length);
      for (let i = 0; i < length; i++) {
        channelData[i] = Math.sin((2 * Math.PI * 440 * i) / sampleRate);
      }

      const mockBuffer = {
        numberOfChannels: 1,
        sampleRate,
        length,
        duration: length / sampleRate,
        getChannelData: () => channelData,
      } as unknown as AudioBuffer;

      const wavBlob = audioBufferToWav(mockBuffer);
      expect(wavBlob.type).toBe("audio/wav");

      const arrayBuffer = await wavBlob.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      const riff = String.fromCharCode(...bytes.slice(0, 4));
      const wave = String.fromCharCode(...bytes.slice(8, 12));
      expect(riff).toBe("RIFF");
      expect(wave).toBe("WAVE");
    });
  });
});
