// ---------------------------------------------------------------------------
// Video Processing Service – routes to client or cloud
// ---------------------------------------------------------------------------

import type { ProcessingResult } from "../types";
import { decideProcessingLocation, checkBrowserSupport } from "../engine";
import {
  trimVideoClient,
  videoToGIFClient,
  convertVideoClient,
  extractAudioClient,
  checkVideoLimits,
  getVideoMetadata,
  type VideoTrimOptions,
  type VideoToGIFOptions,
  type FFmpegConvertOptions,
} from "../client/video-processor";
import { processVideoCloud } from "../cloud/processors";

export interface VideoServiceOptions {
  forceCloud?: boolean;
  apiKey?: string;
}

/**
 * Trim a video – auto-decides client vs cloud.
 * Videos are almost always large, so cloud is the default.
 */
export async function trimVideo(
  file: File,
  options: VideoTrimOptions & VideoServiceOptions
): Promise<ProcessingResult> {
  if (!file.type.startsWith("video/")) {
    return { status: "error", error: "File is not a video" };
  }

  const browserSupport = checkBrowserSupport(file.type);
  const decision = decideProcessingLocation({
    fileSize: file.size,
    mimeType: file.type,
    browserSupport,
    estimatedTime: 15000, // Video processing is slow
  });

  if (options.forceCloud || decision.location === "cloud") {
    return processVideoCloud(file, {
      startTime: options.startTime,
      endTime: options.endTime,
      format: options.outputFormat,
      apiKey: options.apiKey,
    });
  }

  return trimVideoClient(file, options);
}

/**
 * Convert video to GIF – auto-decides client vs cloud.
 */
export async function convertVideoToGIF(
  file: File,
  options: VideoToGIFOptions & VideoServiceOptions = {}
): Promise<ProcessingResult> {
  if (!file.type.startsWith("video/")) {
    return { status: "error", error: "File is not a video" };
  }

  const browserSupport = checkBrowserSupport(file.type);
  const decision = decideProcessingLocation({
    fileSize: file.size,
    mimeType: file.type,
    browserSupport,
    estimatedTime: 20000,
  });

  if (options.forceCloud || decision.location === "cloud") {
    return processVideoCloud(file, {
      startTime: options.startTime,
      format: "gif",
      apiKey: options.apiKey,
    });
  }

  return videoToGIFClient(file, options);
}

/**
 * Convert/compress a video using ffmpeg.wasm (client) or cloud.
 * Checks video limits before processing.
 */
export async function convertVideo(
  file: File,
  options: FFmpegConvertOptions & VideoServiceOptions
): Promise<ProcessingResult> {
  if (!file.type.startsWith("video/")) {
    return { status: "error", error: "File is not a video" };
  }

  // Check limits first
  try {
    const metadata = await getVideoMetadata(file);
    const limits = checkVideoLimits(file, metadata.duration, {
      width: metadata.width,
      height: metadata.height,
    });

    if (!limits.withinLimits) {
      // Route to cloud if over limits
      if (options.apiKey) {
        return processVideoCloud(file, {
          format: options.outputFormat,
          apiKey: options.apiKey,
        });
      }
      return { status: "error", error: limits.reason };
    }
  } catch {
    // If we can't get metadata, try anyway
  }

  if (options.forceCloud) {
    return processVideoCloud(file, {
      format: options.outputFormat,
      apiKey: options.apiKey,
    });
  }

  return convertVideoClient(file, options);
}

/**
 * Extract audio from a video file.
 */
export async function extractAudio(
  file: File,
  outputFormat: "audio/mp3" | "audio/aac" | "audio/wav" = "audio/mp3",
  options: VideoServiceOptions = {}
): Promise<ProcessingResult> {
  if (!file.type.startsWith("video/")) {
    return { status: "error", error: "File is not a video" };
  }

  if (options.forceCloud) {
    return processVideoCloud(file, {
      format: outputFormat,
      apiKey: options.apiKey,
    });
  }

  return extractAudioClient(file, outputFormat);
}