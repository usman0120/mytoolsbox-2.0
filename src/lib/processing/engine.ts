// ---------------------------------------------------------------------------
// Processing Engine – determines WHERE to process (client vs cloud)
// ---------------------------------------------------------------------------

export type ProcessingLocation = "client" | "cloud";

export interface ProcessingDecision {
  location: ProcessingLocation;
  reason: string;
}

export interface ProcessingEngineOptions {
  /** File size in bytes */
  fileSize: number;
  /** MIME type of the file */
  mimeType: string;
  /** Whether the browser supports the required APIs */
  browserSupport: boolean;
  /** Estimated processing time in ms (if known) */
  estimatedTime?: number;
  /** Whether the user has a premium subscription */
  isPremium?: boolean;
}

const CLIENT_SIZE_THRESHOLD = 10 * 1024 * 1024; // 10 MB
const CLIENT_TIME_THRESHOLD = 5000; // 5 seconds

/**
 * Decides whether to process on the client (browser) or in the cloud.
 *
 * Rules (in priority order):
 * 1. If browser doesn't support the required APIs → cloud
 * 2. If file is small (< 10MB) AND estimated time < 5s → client
 * 3. If file is large (≥ 10MB) → cloud
 * 4. If estimated time > 5s → cloud
 * 5. Default → client
 */
export function decideProcessingLocation(
  options: ProcessingEngineOptions
): ProcessingDecision {
  const { fileSize, mimeType, browserSupport, estimatedTime, isPremium } = options;

  // Rule 1: No browser support → cloud
  if (!browserSupport) {
    return {
      location: "cloud",
      reason: `Browser does not support the required APIs for ${mimeType} processing.`,
    };
  }

  // Rule 2: Small file + quick processing → client
  if (
    fileSize <= CLIENT_SIZE_THRESHOLD &&
    (!estimatedTime || estimatedTime <= CLIENT_TIME_THRESHOLD)
  ) {
    return {
      location: "client",
      reason: `File is small (${(fileSize / 1024 / 1024).toFixed(1)}MB) and can be processed locally.`,
    };
  }

  // Rule 3: Large file → cloud
  if (fileSize > CLIENT_SIZE_THRESHOLD) {
    return {
      location: "cloud",
      reason: `File is large (${(fileSize / 1024 / 1024).toFixed(1)}MB). Cloud processing recommended.`,
    };
  }

  // Rule 4: Slow processing → cloud
  if (estimatedTime && estimatedTime > CLIENT_TIME_THRESHOLD) {
    return {
      location: "cloud",
      reason: `Estimated processing time (${(estimatedTime / 1000).toFixed(1)}s) exceeds client threshold.`,
    };
  }

  // Rule 5: Default → client
  return {
    location: "client",
    reason: "Defaulting to client-side processing.",
  };
}

/**
 * Checks if a given MIME type can be processed in the browser.
 */
export function checkBrowserSupport(mimeType: string): boolean {
  // Image processing: Canvas API
  if (mimeType.startsWith("image/")) {
    return typeof HTMLCanvasElement !== "undefined";
  }

  // Audio processing: Web Audio API
  if (mimeType.startsWith("audio/")) {
    return typeof AudioContext !== "undefined" || typeof window !== "undefined" && "AudioContext" in window;
  }

  // Video processing: limited browser support
  if (mimeType.startsWith("video/")) {
    // Basic video processing via canvas is possible
    return typeof HTMLVideoElement !== "undefined" && typeof HTMLCanvasElement !== "undefined";
  }

  // PDF processing: limited browser support
  if (mimeType === "application/pdf") {
    // PDF.js can be loaded dynamically
    return true; // We'll handle this with dynamic imports
  }

  // Text/code: always supported
  if (mimeType.startsWith("text/") || mimeType === "application/json") {
    return true;
  }

  return false;
}