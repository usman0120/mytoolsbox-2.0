import { ProcessingResult } from "@/lib/processing/types";

export function convertTimestamp(
  input: string,
  targetFormat: "iso" | "unix" | "relative" | "utc" | "local"
): ProcessingResult {
  if (!input.trim()) {
    return { status: "error", error: "Please enter a timestamp or date." };
  }

  let date: Date;

  // Try Unix timestamp (seconds or milliseconds)
  if (/^\d+$/.test(input.trim())) {
    const num = parseInt(input.trim());
    date = new Date(num > 9999999999 ? num : num * 1000);
  } else {
    date = new Date(input.trim());
  }

  if (isNaN(date.getTime())) {
    return { status: "error", error: "Invalid date/timestamp. Try ISO format (2024-01-01T00:00:00Z) or Unix timestamp." };
  }

  const result: Record<string, string> = {
    iso: date.toISOString(),
    unix: String(Math.floor(date.getTime() / 1000)),
    unixMs: String(date.getTime()),
    utc: date.toUTCString(),
    local: date.toString(),
    relative: getRelativeTime(date),
  };

  return {
    status: "success",
    message: result[targetFormat] || result.iso,
    data: result,
  };
}

function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffSec = Math.abs(Math.round(diffMs / 1000));
  const prefix = diffMs >= 0 ? "in " : "";

  if (diffSec < 60) return prefix + "just now";
  if (diffSec < 3600) return prefix + `${Math.floor(diffSec / 60)} minutes`;
  if (diffSec < 86400) return prefix + `${Math.floor(diffSec / 3600)} hours`;
  if (diffSec < 2592000) return prefix + `${Math.floor(diffSec / 86400)} days`;
  if (diffSec < 31536000) return prefix + `${Math.floor(diffSec / 2592000)} months`;
  return prefix + `${Math.floor(diffSec / 31536000)} years`;
}