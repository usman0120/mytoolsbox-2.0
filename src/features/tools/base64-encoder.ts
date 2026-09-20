import { Base64 } from "js-base64";
import { ProcessingResult } from "@/lib/processing/types";

export function encodeBase64(text: string): ProcessingResult {
  if (!text.trim()) {
    return { status: "error", error: "Please enter text to encode." };
  }

  try {
    const encoded = Base64.encode(text);
    return {
      status: "success",
      message: `Encoded (${encoded.length} characters)`,
    };
  } catch (err: unknown) {
    return { status: "error", error: err instanceof Error ? err.message : "Encoding failed." };
  }
}

export function decodeBase64(text: string): ProcessingResult {
  if (!text.trim()) {
    return { status: "error", error: "Please enter Base64 text to decode." };
  }

  try {
    const decoded = Base64.decode(text);
    return {
      status: "success",
      message: `Decoded (${decoded.length} characters)`,
    };
  } catch {
    return { status: "error", error: "Invalid Base64 string. Please check your input." };
  }
}