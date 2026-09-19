// ---------------------------------------------------------------------------
// Audio Processing Service – routes to client or cloud
// ---------------------------------------------------------------------------

import type { ProcessingResult } from "../types";
import { decideProcessingLocation, checkBrowserSupport } from "../engine";
import { trimAudioClient, convertAudioClient, type AudioTrimOptions, type AudioConvertOptions } from "../client/audio-processor";
import { processAudioCloud } from "../cloud/processors";

export interface AudioServiceOptions {
  forceCloud?: boolean;
  apiKey?: string;
}

/**
 * Trim audio – auto-decides client vs cloud.
 */
export async function trimAudio(
  file: File,
  options: AudioTrimOptions & AudioServiceOptions
): Promise<ProcessingResult> {
  if (!file.type.startsWith("audio/")) {
    return { status: "error", error: "File is not an audio file" };
  }

  const browserSupport = checkBrowserSupport(file.type);
  const decision = decideProcessingLocation({
    fileSize: file.size,
    mimeType: file.type,
    browserSupport,
    estimatedTime: 3000,
  });

  if (options.forceCloud || decision.location === "cloud") {
    return processAudioCloud(file, {
      startTime: options.startTime,
      endTime: options.endTime,
      format: options.outputFormat,
      apiKey: options.apiKey,
    });
  }

  return trimAudioClient(file, options);
}

/**
 * Convert audio format – auto-decides client vs cloud.
 */
export async function convertAudio(
  file: File,
  options: AudioConvertOptions & AudioServiceOptions
): Promise<ProcessingResult> {
  if (!file.type.startsWith("audio/")) {
    return { status: "error", error: "File is not an audio file" };
  }

  const browserSupport = checkBrowserSupport(file.type);
  const decision = decideProcessingLocation({
    fileSize: file.size,
    mimeType: file.type,
    browserSupport,
    estimatedTime: 5000,
  });

  if (options.forceCloud || decision.location === "cloud") {
    return processAudioCloud(file, {
      format: options.outputFormat,
      apiKey: options.apiKey,
    });
  }

  return convertAudioClient(file, options);
}