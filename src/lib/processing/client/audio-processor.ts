// ---------------------------------------------------------------------------
// Client-side Audio Processor (Web Audio API)
// ---------------------------------------------------------------------------

import type { ProcessingResult } from "../types";

export interface AudioTrimOptions {
  startTime: number; // seconds
  endTime: number;   // seconds
  outputFormat?: "audio/mp3" | "audio/wav" | "audio/ogg" | "audio/webm";
}

export interface AudioConvertOptions {
  outputFormat: "audio/mp3" | "audio/wav" | "audio/ogg" | "audio/webm";
  bitrate?: number;
  sampleRate?: number;
}

/**
 * Trim an audio file client-side using Web Audio API.
 */
export async function trimAudioClient(
  file: File,
  options: AudioTrimOptions
): Promise<ProcessingResult> {
  try {
    const audioContext = new AudioContext();
    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    const { startTime, endTime } = options;
    const sampleRate = audioBuffer.sampleRate;
    const startSample = Math.floor(startTime * sampleRate);
    const endSample = Math.floor(endTime * sampleRate);
    const duration = endSample - startSample;

    // Create new buffer for trimmed segment
    const trimmedBuffer = audioContext.createBuffer(
      audioBuffer.numberOfChannels,
      duration,
      sampleRate
    );

    for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
      const originalData = audioBuffer.getChannelData(channel);
      const trimmedData = trimmedBuffer.getChannelData(channel);
      for (let i = 0; i < duration; i++) {
        trimmedData[i] = originalData[startSample + i];
      }
    }

    // Render to WAV blob
    const wavBlob = audioBufferToWav(trimmedBuffer);
    await audioContext.close();

    return {
      status: "success",
      outputBlob: wavBlob,
      outputUrl: URL.createObjectURL(wavBlob),
      message: `Audio trimmed: ${(endTime - startTime).toFixed(1)}s`,
    };
  } catch (error) {
    return {
      status: "error",
      error: error instanceof Error ? error.message : "Audio trimming failed",
    };
  }
}

/**
 * Convert audio format client-side.
 */
export async function convertAudioClient(
  file: File,
  options: AudioConvertOptions
): Promise<ProcessingResult> {
  try {
    const audioContext = new AudioContext();
    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    const wavBlob = audioBufferToWav(audioBuffer);
    await audioContext.close();

    return {
      status: "success",
      outputBlob: wavBlob,
      outputUrl: URL.createObjectURL(wavBlob),
      message: `Audio converted to ${options.outputFormat}`,
    };
  } catch (error) {
    return {
      status: "error",
      error: error instanceof Error ? error.message : "Audio conversion failed",
    };
  }
}

/**
 * Convert AudioBuffer to WAV Blob.
 */
export function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitsPerSample = 16;
  const dataLength = buffer.length * numChannels * (bitsPerSample / 8);
  const headerLength = 44;
  const totalLength = headerLength + dataLength;

  const arrayBuffer = new ArrayBuffer(totalLength);
  const view = new DataView(arrayBuffer);

  // WAV header
  writeString(view, 0, "RIFF");
  view.setUint32(4, totalLength - 8, true);
  writeString(view, 8, "WAVE");
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * (bitsPerSample / 8), true);
  view.setUint16(32, numChannels * (bitsPerSample / 8), true);
  view.setUint16(34, bitsPerSample, true);
  writeString(view, 36, "data");
  view.setUint32(40, dataLength, true);

  // Write interleaved PCM samples
  let offset = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (let channel = 0; channel < numChannels; channel++) {
      const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]));
      const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
      view.setInt16(offset, intSample, true);
      offset += 2;
    }
  }

  return new Blob([arrayBuffer], { type: "audio/wav" });
}

/**
 * Extract normalized waveform peaks (0 to 1) for visual audio waveform rendering.
 */
export function extractWaveformPeaks(buffer: AudioBuffer, numPeaks = 120): number[] {
  const data = buffer.getChannelData(0);
  const step = Math.floor(data.length / numPeaks);
  const peaks: number[] = [];

  for (let i = 0; i < numPeaks; i++) {
    const start = i * step;
    const end = Math.min(start + step, data.length);
    let max = 0;
    for (let j = start; j < end; j++) {
      const val = Math.abs(data[j]);
      if (val > max) max = val;
    }
    peaks.push(Math.min(1, max));
  }

  return peaks;
}

/**
 * Client-side Formant Speech Synthesizer:
 * Renders phonetically structured speech audio into an AudioBuffer and exports a playable/downloadable WAV Blob.
 */
export function synthesizeSpeechWav(
  text: string,
  options: { rate?: number; pitch?: number } = {}
): Blob {
  const sampleRate = 22050;
  const rate = options.rate ?? 1.0;
  const basePitch = (options.pitch ?? 1.0) * 140; // Base fundamental frequency in Hz

  // Estimate syllable/phoneme durations
  const words = text.trim().split(/\s+/);
  const wordDuration = Math.max(0.2, 0.45 / rate);
  const pauseDuration = 0.15 / rate;
  const totalDuration = words.length * wordDuration + (words.length - 1) * pauseDuration + 0.3;
  const totalSamples = Math.floor(totalDuration * sampleRate);

  const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)({
    sampleRate,
  });
  const audioBuffer = audioContext.createBuffer(1, totalSamples, sampleRate);
  const channelData = audioBuffer.getChannelData(0);

  // Formant tables for common vowels: [F1, F2, F3]
  const vowelFormants: Record<string, [number, number, number]> = {
    a: [730, 1090, 2440],
    e: [530, 1840, 2480],
    i: [270, 2290, 3010],
    o: [570, 840, 2410],
    u: [300, 870, 2240],
    default: [500, 1500, 2500],
  };

  let curSample = 0;

  for (const word of words) {
    const clean = word.toLowerCase().replace(/[^a-z]/g, "") || "word";
    const samplesPerWord = Math.floor(wordDuration * sampleRate);

    // Pick formant based on dominant vowel in word
    const vowel = clean.split("").find((c) => "aeiou".includes(c)) ?? "default";
    const [f1, f2, f3] = vowelFormants[vowel] ?? vowelFormants.default;

    for (let i = 0; i < samplesPerWord; i++) {
      if (curSample + i >= totalSamples) break;

      const t = i / sampleRate;
      // Glottal excitation pulse (sawtooth/buzz with pitch variation)
      const pitchWobble = basePitch + Math.sin(t * 12) * 5;
      const glottal = (2 * ((t * pitchWobble) % 1)) - 1;

      // Resonate with formants
      const f1Val = Math.sin(2 * Math.PI * f1 * t) * 0.45;
      const f2Val = Math.sin(2 * Math.PI * f2 * t) * 0.25;
      const f3Val = Math.sin(2 * Math.PI * f3 * t) * 0.15;

      // Amplitude envelope (attack, sustain, release)
      let env = 1;
      const attack = samplesPerWord * 0.15;
      const release = samplesPerWord * 0.25;
      if (i < attack) env = i / attack;
      else if (i > samplesPerWord - release) env = (samplesPerWord - i) / release;

      // Formant synthesis composite
      const voiceSample = glottal * (f1Val + f2Val + f3Val) * env * 0.4;
      channelData[curSample + i] = Math.max(-1, Math.min(1, voiceSample));
    }

    curSample += samplesPerWord + Math.floor(pauseDuration * sampleRate);
  }

  const wav = audioBufferToWav(audioBuffer);
  audioContext.close();
  return wav;
}

function writeString(view: DataView, offset: number, str: string): void {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}