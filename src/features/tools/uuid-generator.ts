import { ProcessingResult } from "@/lib/processing/types";

export function generateUUID(): ProcessingResult {
  const uuid = crypto.randomUUID();
  return { status: "success", message: uuid };
}

export function generateUUIDBulk(count: number): ProcessingResult {
  if (count < 1 || count > 100) {
    return { status: "error", error: "Count must be between 1 and 100." };
  }
  const uuids = Array.from({ length: count }, () => crypto.randomUUID());
  return { status: "success", message: uuids.join("\n") };
}