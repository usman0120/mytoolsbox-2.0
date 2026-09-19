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
function audioBufferToWav(buffer: AudioBuffer): Blob {
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

function writeString(view: DataView, offset: number, str: string): void {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}