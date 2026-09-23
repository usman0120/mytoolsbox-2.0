// JSON Formatter, Validator & Transformer Engine

export interface JSONFormatOptions {
  indent: 2 | 4 | "\t";
  sortKeys?: boolean;
}

export interface JSONProcessResult {
  success: boolean;
  output: string;
  error?: string;
  errorLocation?: { line: number; column: number; position: number };
  stats?: {
    originalSize: number;
    formattedSize: number;
    keyCount: number;
    depth: number;
    compressionPercent: number;
  };
}

export function formatJSON(
  input: string,
  options: JSONFormatOptions = { indent: 2, sortKeys: false }
): JSONProcessResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return { success: false, output: "", error: "Please enter JSON to format." };
  }

  try {
    let parsed = JSON.parse(trimmed);
    if (options.sortKeys) {
      parsed = sortObjectKeys(parsed);
    }
    const formatted = JSON.stringify(parsed, null, options.indent);

    const stats = computeJSONStats(trimmed, formatted, parsed);
    return {
      success: true,
      output: formatted,
      stats,
    };
  } catch (err: unknown) {
    const errorInfo = parseJSONError(err, trimmed);
    return {
      success: false,
      output: "",
      error: errorInfo.message,
      errorLocation: errorInfo.location,
    };
  }
}

export function minifyJSON(input: string): JSONProcessResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return { success: false, output: "", error: "Please enter JSON to minify." };
  }

  try {
    const parsed = JSON.parse(trimmed);
    const minified = JSON.stringify(parsed);
    const stats = computeJSONStats(trimmed, minified, parsed);
    return {
      success: true,
      output: minified,
      stats,
    };
  } catch (err: unknown) {
    const errorInfo = parseJSONError(err, trimmed);
    return {
      success: false,
      output: "",
      error: errorInfo.message,
      errorLocation: errorInfo.location,
    };
  }
}

export function validateJSON(input: string): JSONProcessResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return { success: false, output: "", error: "Please enter JSON to validate." };
  }

  try {
    const parsed = JSON.parse(trimmed);
    const stats = computeJSONStats(trimmed, trimmed, parsed);
    return {
      success: true,
      output: "✓ Valid JSON syntax",
      stats,
    };
  } catch (err: unknown) {
    const errorInfo = parseJSONError(err, trimmed);
    return {
      success: false,
      output: "",
      error: errorInfo.message,
      errorLocation: errorInfo.location,
    };
  }
}

/**
 * Intelligent JSON Repair:
 * Fixes single quotes, unquoted keys, trailing commas, JavaScript comments (//, /*), and unescaped newlines.
 */
export function repairJSON(input: string): JSONProcessResult {
  let text = input.trim();
  if (!text) {
    return { success: false, output: "", error: "Please enter JSON to repair." };
  }

  // 1. Remove JavaScript comments // ... and /* ... */
  text = text.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");

  // 2. Replace single quotes around strings with double quotes
  // Handles strings like 'value' -> "value"
  text = text.replace(/'([^'\\]*(?:\\.[^'\\]*)*)'/g, '"$1"');

  // 3. Quote unquoted object keys like { name: "John" } -> { "name": "John" }
  text = text.replace(/([{,]\s*)([a-zA-Z0-9_$]+)\s*:/g, '$1"$2":');

  // 4. Remove trailing commas before closing braces/brackets like [1, 2,] -> [1, 2]
  text = text.replace(/,\s*([}\]])/g, "$1");

  // 5. Replace undefined / NaN with null
  text = text.replace(/\b(undefined|NaN)\b/g, "null");

  try {
    const parsed = JSON.parse(text);
    const formatted = JSON.stringify(parsed, null, 2);
    return {
      success: true,
      output: formatted,
      stats: computeJSONStats(input, formatted, parsed),
    };
  } catch (err) {
    const errorInfo = parseJSONError(err, text);
    return {
      success: false,
      output: text,
      error: `Could not fully auto-repair: ${errorInfo.message}`,
      errorLocation: errorInfo.location,
    };
  }
}

/**
 * Simple JSONPath / Object Traversal
 * Query path like `users[0].name` or `$.data.items.length`
 */
export function queryJSON(input: string, queryPath: string): JSONProcessResult {
  try {
    const obj = JSON.parse(input);
    let path = queryPath.trim();
    if (path.startsWith("$.")) path = path.slice(2);
    else if (path.startsWith("$")) path = path.slice(1);

    if (!path) {
      return { success: true, output: JSON.stringify(obj, null, 2) };
    }

    // Normalize array indexes: items[0] -> items.0
    const normalized = path.replace(/\[(\d+)\]/g, ".$1");
    const segments = normalized.split(".").filter(Boolean);

    let curr: unknown = obj;
    for (const seg of segments) {
      if (curr === null || curr === undefined || typeof curr !== "object") {
        return { success: false, output: "", error: `Key "${seg}" does not exist in path.` };
      }
      curr = (curr as Record<string, unknown>)[seg];
    }

    return {
      success: true,
      output: typeof curr === "object" ? JSON.stringify(curr, null, 2) : String(curr),
    };
  } catch (err) {
    return { success: false, output: "", error: err instanceof Error ? err.message : "Invalid JSON input." };
  }
}

/**
 * Convert JSON array of objects to CSV
 */
export function jsonToCSV(input: string): JSONProcessResult {
  try {
    let parsed = JSON.parse(input);
    if (!Array.isArray(parsed)) {
      if (typeof parsed === "object" && parsed !== null) {
        // Wrap single object
        parsed = [parsed];
      } else {
        return { success: false, output: "", error: "CSV conversion requires a JSON array or object." };
      }
    }

    if (parsed.length === 0) return { success: true, output: "" };

    const headers: string[] = Array.from(
      new Set(parsed.flatMap((item: unknown) => (typeof item === "object" && item !== null ? Object.keys(item) : [])))
    );

    const rows = parsed.map((item: unknown) => {
      const obj = (item && typeof item === "object" ? item : {}) as Record<string, unknown>;
      return headers
        .map((header) => {
          const val = obj[header];
          if (val === undefined || val === null) return "";
          const str = typeof val === "object" ? JSON.stringify(val) : String(val);
          if (str.includes(",") || str.includes('"') || str.includes("\n")) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        })
        .join(",");
    });

    const csv = [headers.join(","), ...rows].join("\n");
    return { success: true, output: csv };
  } catch (err) {
    return { success: false, output: "", error: err instanceof Error ? err.message : "Invalid JSON" };
  }
}

/**
 * Convert JSON to YAML format
 */
export function jsonToYAML(input: string): JSONProcessResult {
  try {
    const parsed = JSON.parse(input);
    const yaml = objectToYaml(parsed, 0);
    return { success: true, output: yaml };
  } catch (err) {
    return { success: false, output: "", error: err instanceof Error ? err.message : "Invalid JSON" };
  }
}

function objectToYaml(obj: unknown, indent = 0): string {
  const spaces = " ".repeat(indent);
  if (obj === null || obj === undefined) return "null";
  if (typeof obj === "boolean" || typeof obj === "number") return String(obj);
  if (typeof obj === "string") {
    if (obj.includes("\n") || obj.includes(":") || obj.includes("#") || obj.startsWith("- ")) {
      return `"${obj.replace(/"/g, '\\"')}"`;
    }
    return obj;
  }

  if (Array.isArray(obj)) {
    if (obj.length === 0) return "[]";
    return obj
      .map((item) => {
        if (typeof item === "object" && item !== null) {
          const inner = objectToYaml(item, indent + 2).trimStart();
          return `${spaces}- ${inner}`;
        }
        return `${spaces}- ${objectToYaml(item, indent + 2)}`;
      })
      .join("\n");
  }

  if (typeof obj === "object") {
    const entries = Object.entries(obj as Record<string, unknown>);
    if (entries.length === 0) return "{}";
    return entries
      .map(([k, v]) => {
        if (typeof v === "object" && v !== null && !Array.isArray(v) && Object.keys(v).length > 0) {
          return `${spaces}${k}:\n${objectToYaml(v, indent + 2)}`;
        }
        if (Array.isArray(v)) {
          return `${spaces}${k}:\n${objectToYaml(v, indent + 2)}`;
        }
        return `${spaces}${k}: ${objectToYaml(v, indent + 2)}`;
      })
      .join("\n");
  }

  return String(obj);
}

function sortObjectKeys(obj: unknown): unknown {
  if (Array.isArray(obj)) {
    return obj.map(sortObjectKeys);
  }
  if (obj !== null && typeof obj === "object") {
    const sortedObj: Record<string, unknown> = {};
    const keys = Object.keys(obj as Record<string, unknown>).sort();
    for (const key of keys) {
      sortedObj[key] = sortObjectKeys((obj as Record<string, unknown>)[key]);
    }
    return sortedObj;
  }
  return obj;
}

function computeJSONStats(
  original: string,
  formatted: string,
  parsed: unknown
): { originalSize: number; formattedSize: number; keyCount: number; depth: number; compressionPercent: number } {
  const origSize = new Blob([original]).size;
  const formSize = new Blob([formatted]).size;

  const countKeys = (o: unknown): number => {
    if (Array.isArray(o)) return o.reduce((acc, item) => acc + countKeys(item), 0);
    if (o && typeof o === "object") {
      const keys = Object.keys(o as object);
      return keys.length + Object.values(o as object).reduce((acc, v) => acc + countKeys(v), 0);
    }
    return 0;
  };

  const getDepth = (o: unknown): number => {
    if (Array.isArray(o)) return o.length === 0 ? 1 : 1 + Math.max(0, ...o.map(getDepth));
    if (o && typeof o === "object") {
      const vals = Object.values(o as object);
      return vals.length === 0 ? 1 : 1 + Math.max(0, ...vals.map(getDepth));
    }
    return 0;
  };

  const compression = origSize > 0 ? Math.round(((origSize - formSize) / origSize) * 100) : 0;

  return {
    originalSize: origSize,
    formattedSize: formSize,
    keyCount: countKeys(parsed),
    depth: getDepth(parsed),
    compressionPercent: compression,
  };
}

function parseJSONError(
  err: unknown,
  input: string
): { message: string; location?: { line: number; column: number; position: number } } {
  const rawMsg = err instanceof Error ? err.message : String(err);
  const match = rawMsg.match(/at position (\d+)/i);

  if (match) {
    const position = parseInt(match[1], 10);
    const upToError = input.substring(0, position);
    const lines = upToError.split("\n");
    const line = lines.length;
    const column = lines[lines.length - 1].length + 1;
    return {
      message: `Syntax error at Line ${line}, Column ${column}: ${rawMsg}`,
      location: { line, column, position },
    };
  }

  return { message: rawMsg };
}