// ---------------------------------------------------------------------------
// Cloud Processing – API-based processing for large/complex files
// ---------------------------------------------------------------------------

import type { ProcessingResult } from "../types";

export interface CloudProcessOptions {
  endpoint: string;
  apiKey?: string;
  timeout?: number;
}

/**
 * Generic cloud processing function.
 * Sends a file to a cloud endpoint for processing.
 */
export async function processInCloud(
  file: File,
  options: CloudProcessOptions
): Promise<ProcessingResult> {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), options.timeout ?? 60000);

    const headers: Record<string, string> = {};
    if (options.apiKey) {
      headers["Authorization"] = `Bearer ${options.apiKey}`;
    }

    const response = await fetch(options.endpoint, {
      method: "POST",
      headers,
      body: formData,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Cloud processing failed: ${response.status} - ${errorText}`);
    }

    const blob = await response.blob();

    return {
      status: "success",
      outputBlob: blob,
      outputUrl: URL.createObjectURL(blob),
      message: "File processed in cloud",
    };
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return { status: "error", error: "Cloud processing timed out" };
    }
    return {
      status: "error",
      error: error instanceof Error ? error.message : "Cloud processing failed",
    };
  }
}

/**
 * Cloud-based image processing (compression, format conversion, filters, background removal).
 */
export async function processImageCloud(
  file: File,
  options: {
    quality?: number;
    format?: string;
    apiKey?: string;
    operation?: "compress" | "convert" | "filter" | "remove-background";
  }
): Promise<ProcessingResult> {
  // Route to the appropriate cloud endpoint based on operation
  const baseEndpoint = process.env.NEXT_PUBLIC_IMAGE_PROCESSING_API ?? "/api/process/image";
  const endpoint = options.operation
    ? `${baseEndpoint}?operation=${options.operation}`
    : baseEndpoint;

  return processInCloud(file, {
    endpoint,
    apiKey: options.apiKey,
    timeout: options.operation === "remove-background" ? 60000 : 30000,
  });
}

/**
 * Cloud-based video processing (trim, convert, GIF).
 */
export async function processVideoCloud(
  file: File,
  options: { startTime?: number; endTime?: number; format?: string; apiKey?: string }
): Promise<ProcessingResult> {
  const endpoint = process.env.NEXT_PUBLIC_VIDEO_PROCESSING_API ?? "/api/process/video";

  return processInCloud(file, {
    endpoint,
    apiKey: options.apiKey,
    timeout: 120000,
  });
}

/**
 * Cloud-based audio processing.
 */
export async function processAudioCloud(
  file: File,
  options: { startTime?: number; endTime?: number; format?: string; apiKey?: string }
): Promise<ProcessingResult> {
  const endpoint = process.env.NEXT_PUBLIC_AUDIO_PROCESSING_API ?? "/api/process/audio";

  return processInCloud(file, {
    endpoint,
    apiKey: options.apiKey,
    timeout: 60000,
  });
}

/**
 * Cloud-based PDF processing.
 */
export async function processPDFCloud(
  file: File,
  options: { operation?: string; apiKey?: string }
): Promise<ProcessingResult> {
  const endpoint = process.env.NEXT_PUBLIC_PDF_PROCESSING_API ?? "/api/process/pdf";

  return processInCloud(file, {
    endpoint,
    apiKey: options.apiKey,
    timeout: 60000,
  });
}