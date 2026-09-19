import { ProcessingResult } from "@/lib/processing/types";

export function testRegex(pattern: string, text: string, flags: string = ""): ProcessingResult {
  try {
    const regex = new RegExp(pattern, flags);
    const matches = text.match(regex);
    return {
      status: "success",
      message: matches ? `Found ${matches.length} match(es)` : "No matches found",
      data: matches,
    };
  } catch (e: any) {
    return { status: "error", message: e.message || "Invalid regex" };
  }
}