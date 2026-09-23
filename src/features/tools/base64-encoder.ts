import { Base64 } from "js-base64";
import { ProcessingResult } from "@/lib/processing/types";

export interface Base64Options {
  urlSafe?: boolean;
  splitLines?: boolean;
  stripPadding?: boolean;
}

export interface Base64ProcessResult extends ProcessingResult {
  data?: {
    output: string;
    inputBytes: number;
    outputBytes: number;
    sizeDifference: string;
    isDataUri?: boolean;
    mimeType?: string;
  };
}

export function encodeBase64(text: string, options: Base64Options = {}): Base64ProcessResult {
  if (!text) {
    return { status: "error", error: "Please enter text to encode." };
  }

  try {
    let encoded = Base64.encode(text, options.urlSafe);
    
    if (options.stripPadding && options.urlSafe) {
      encoded = encoded.replace(/=+$/, "");
    }

    if (options.splitLines) {
      encoded = encoded.match(/.{1,76}/g)?.join("\n") || encoded;
    }

    const inputBytes = new TextEncoder().encode(text).length;
    const outputBytes = new TextEncoder().encode(encoded).length;
    const diffPct = inputBytes > 0 ? (((outputBytes - inputBytes) / inputBytes) * 100).toFixed(1) : "0";

    return {
      status: "success",
      message: `Encoded (${outputBytes.toLocaleString()} characters)`,
      data: {
        output: encoded,
        inputBytes,
        outputBytes,
        sizeDifference: `+${diffPct}%`,
      },
    };
  } catch (err: unknown) {
    return { status: "error", error: err instanceof Error ? err.message : "Encoding failed." };
  }
}

export function decodeBase64(base64Text: string, options: Base64Options = {}): Base64ProcessResult {
  const cleanInput = base64Text.trim();
  if (!cleanInput) {
    return { status: "error", error: "Please enter Base64 text to decode." };
  }

  try {
    // Check if input is a Data URI
    let contentToDecode = cleanInput.replace(/\s+/g, "");
    let mimeType: string | undefined;
    let isDataUri = false;

    const dataUriMatch = cleanInput.match(/^data:([^;]+);base64,([\s\S]+)$/);
    if (dataUriMatch) {
      isDataUri = true;
      mimeType = dataUriMatch[1];
      contentToDecode = dataUriMatch[2].replace(/\s+/g, "");
    }

    // Handle URL-safe and missing padding
    let normalized = contentToDecode.replace(/-/g, "+").replace(/_/g, "/");
    while (normalized.length % 4 !== 0) {
      normalized += "=";
    }

    const decoded = Base64.decode(normalized);
    const inputBytes = new TextEncoder().encode(cleanInput).length;
    const outputBytes = new TextEncoder().encode(decoded).length;
    const diffPct = inputBytes > 0 ? (((outputBytes - inputBytes) / inputBytes) * 100).toFixed(1) : "0";

    return {
      status: "success",
      message: `Decoded (${outputBytes.toLocaleString()} characters)`,
      data: {
        output: decoded,
        inputBytes,
        outputBytes,
        sizeDifference: `${diffPct}%`,
        isDataUri,
        mimeType,
      },
    };
  } catch {
    return { status: "error", error: "Invalid Base64 string. Please check formatting and characters." };
  }
}