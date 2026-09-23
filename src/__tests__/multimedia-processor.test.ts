import { describe, it, expect } from "vitest";
import { GifEncoder, encodeGif } from "@/lib/processing/client/gif-encoder";
import { extractWaveformPeaks, audioBufferToWav } from "@/lib/processing/client/audio-processor";

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
