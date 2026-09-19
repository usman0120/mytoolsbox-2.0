import { ProcessingResult } from "@/lib/processing/types";

export function encodeURL(text: string): ProcessingResult {
  try {
    return {
      status: "success",
      message: encodeURIComponent(text),
    };
  } catch {
    return { status: "error", message: "Failed to encode URL" };
  }
}

export function decodeURL(text: string): ProcessingResult {
  try {
    return {
      status: "success",
      message: decodeURIComponent(text),
    };
  } catch {
    return { status: "error", message: "Failed to decode URL" };
  }
}