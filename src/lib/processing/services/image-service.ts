// ---------------------------------------------------------------------------
// Image Processing Service – routes to client or cloud based on file size
// ---------------------------------------------------------------------------

import type { ProcessingResult } from "../types";
import { decideProcessingLocation, checkBrowserSupport } from "../engine";
import {
  processImageClient,
  cropImageClient,
  rotateImageClient,
  watermarkImageClient,
  removeImageMetadataClient,
  type ImageProcessOptions,
  type CropOptions,
  type WatermarkOptions,
} from "../client/image-processor";
import { processImageCloud } from "../cloud/processors";

export interface ImageServiceOptions extends ImageProcessOptions {
  /** Force cloud processing even for small files */
  forceCloud?: boolean;
  /** API key for cloud processing */
  apiKey?: string;
}

/**
 * Process an image – automatically decides client vs cloud.
 *
 * Decision flow:
 * - File < 10MB AND browser supports Canvas → client
 * - File ≥ 10MB OR forceCloud → cloud
 */
export async function processImage(
  file: File,
  options: ImageServiceOptions = {}
): Promise<ProcessingResult> {
  // Validate file type
  if (!file.type.startsWith("image/")) {
    return { status: "error", error: "File is not an image" };
  }

  const browserSupport = checkBrowserSupport(file.type);
  const decision = decideProcessingLocation({
    fileSize: file.size,
    mimeType: file.type,
    browserSupport,
    estimatedTime: 2000, // Image processing is usually fast
  });

  if (options.forceCloud || decision.location === "cloud") {
    return processImageCloud(file, {
      quality: options.quality,
      format: options.outputFormat,
      apiKey: options.apiKey,
    });
  }

  return processImageClient(file, options);
}

/**
 * Compress an image (convenience wrapper).
 */
export async function compressImage(
  file: File,
  quality: number = 0.6,
  format: "image/jpeg" | "image/webp" = "image/webp"
): Promise<ProcessingResult> {
  return processImage(file, {
    quality,
    outputFormat: format,
    maintainAspectRatio: true,
  });
}

/**
 * Resize an image (convenience wrapper).
 */
export async function resizeImage(
  file: File,
  width: number,
  height: number
): Promise<ProcessingResult> {
  return processImage(file, {
    width,
    height,
    maintainAspectRatio: true,
  });
}

/**
 * Apply filters to an image (convenience wrapper).
 */
export async function filterImage(
  file: File,
  filters: ImageProcessOptions["filters"]
): Promise<ProcessingResult> {
  return processImage(file, { filters });
}

/**
 * Crop an image (client-only, always fast enough).
 */
export async function cropImage(
  file: File,
  options: CropOptions
): Promise<ProcessingResult> {
  if (!file.type.startsWith("image/")) {
    return { status: "error", error: "File is not an image" };
  }
  return cropImageClient(file, options);
}

/**
 * Rotate an image (client-only).
 */
export async function rotateImage(
  file: File,
  degrees: number,
  outputFormat?: "image/jpeg" | "image/png" | "image/webp"
): Promise<ProcessingResult> {
  if (!file.type.startsWith("image/")) {
    return { status: "error", error: "File is not an image" };
  }
  return rotateImageClient(file, degrees, outputFormat);
}

/**
 * Add a text watermark to an image (client-only).
 */
export async function watermarkImage(
  file: File,
  options: WatermarkOptions
): Promise<ProcessingResult> {
  if (!file.type.startsWith("image/")) {
    return { status: "error", error: "File is not an image" };
  }
  return watermarkImageClient(file, options);
}

/**
 * Strip EXIF/metadata from an image (client-only).
 */
export async function removeImageMetadata(
  file: File,
  outputFormat?: "image/jpeg" | "image/png" | "image/webp"
): Promise<ProcessingResult> {
  if (!file.type.startsWith("image/")) {
    return { status: "error", error: "File is not an image" };
  }
  return removeImageMetadataClient(file, outputFormat);
}

/**
 * Add a text overlay (label/caption) to an image.
 * Uses the watermark engine but with a caption-friendly default position.
 */
export async function addTextOverlay(
  file: File,
  text: string,
  options?: Partial<WatermarkOptions>
): Promise<ProcessingResult> {
  return watermarkImage(file, {
    text,
    position: "bottom-left",
    fontSize: options?.fontSize ?? 24,
    color: options?.color ?? "rgba(255, 255, 255, 0.9)",
    opacity: options?.opacity ?? 0.85,
    ...options,
  });
}

/**
 * Remove background from an image.
 * NOTE: True background removal requires AI (cloud). This client-side
 * stub returns an error directing to cloud processing.
 */
export async function removeBackground(
  file: File,
  apiKey?: string
): Promise<ProcessingResult> {
  if (!file.type.startsWith("image/")) {
    return { status: "error", error: "File is not an image" };
  }

  // Background removal requires AI — route to cloud
  if (!apiKey) {
    return {
      status: "error",
      error: "Background removal requires cloud processing. Please provide an API key.",
    };
  }

  return processImageCloud(file, {
    operation: "remove-background",
    apiKey,
  });
}