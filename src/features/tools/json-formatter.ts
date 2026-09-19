import { ProcessingResult } from "@/lib/processing/types";

export function formatJSON(input: string): ProcessingResult {
  if (!input.trim()) {
    return { status: "error", error: "Please enter JSON to format." };
  }

  try {
    const parsed = JSON.parse(input);
    const formatted = JSON.stringify(parsed, null, 2);
    return {
      status: "success",
      message: `Valid JSON (${formatted.length} characters formatted)`,
      outputUrl: undefined,
    };
  } catch (err: any) {
    // Extract line/column info from error
    const match = err.message.match(/at position (\d+)/);
    let detail = err.message;
    if (match) {
      const pos = parseInt(match[1]);
      const lines = input.substring(0, pos).split("\n");
      detail = `Syntax error at line ${lines.length}, column ${lines[lines.length - 1].length + 1}: ${err.message}`;
    }
    return { status: "error", error: detail };
  }
}

export function validateJSON(input: string): ProcessingResult {
  if (!input.trim()) {
    return { status: "error", error: "Please enter JSON to validate." };
  }

  try {
    JSON.parse(input);
    return { status: "success", message: "✓ Valid JSON syntax" };
  } catch (err: any) {
    const match = err.message.match(/at position (\d+)/);
    let detail = err.message;
    if (match) {
      const pos = parseInt(match[1]);
      const lines = input.substring(0, pos).split("\n");
      detail = `Error at line ${lines.length}, column ${lines[lines.length - 1].length + 1}: ${err.message}`;
    }
    return { status: "error", error: detail };
  }
}

export function minifyJSON(input: string): ProcessingResult {
  if (!input.trim()) {
    return { status: "error", error: "Please enter JSON to minify." };
  }

  try {
    const parsed = JSON.parse(input);
    const minified = JSON.stringify(parsed);
    return {
      status: "success",
      message: `Minified (${minified.length} characters)`,
    };
  } catch (err: any) {
    return { status: "error", error: err.message };
  }
}