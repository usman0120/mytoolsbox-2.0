import { ProcessingResult } from "@/lib/processing/types";

export interface CSSFormatOptions {
  indentSize?: number;
  useTabs?: boolean;
  sortProperties?: boolean;
  preserveComments?: boolean;
}

export interface CSSProcessResult extends ProcessingResult {
  data?: {
    output: string;
    originalBytes: number;
    resultBytes: number;
    diffPct: string;
    ruleCount: number;
    lineCount: number;
  };
}

export function formatCSS(input: string, options: CSSFormatOptions = {}): CSSProcessResult {
  const { indentSize = 2, useTabs = false, sortProperties = false, preserveComments = true } = options;

  if (!input.trim()) {
    return { status: "error", error: "Please enter CSS to format." };
  }

  try {
    let clean = input;
    if (!preserveComments) {
      clean = clean.replace(/\/\*[\s\S]*?\*\//g, "");
    }

    const formatted = beautifyCSSAdvanced(clean, indentSize, useTabs, sortProperties);
    const origBytes = new TextEncoder().encode(input).length;
    const resBytes = new TextEncoder().encode(formatted).length;
    const diff = origBytes > 0 ? (((resBytes - origBytes) / origBytes) * 100).toFixed(1) : "0";
    const ruleCount = (formatted.match(/\{/g) || []).length;

    return {
      status: "success",
      message: "CSS Formatted",
      data: {
        output: formatted,
        originalBytes: origBytes,
        resultBytes: resBytes,
        diffPct: `${Number(diff) > 0 ? "+" : ""}${diff}%`,
        ruleCount,
        lineCount: formatted.split("\n").length,
      },
    };
  } catch (err: unknown) {
    return { status: "error", error: err instanceof Error ? err.message : "Failed to format CSS." };
  }
}

export function minifyCSS(input: string): CSSProcessResult {
  if (!input.trim()) {
    return { status: "error", error: "Please enter CSS to minify." };
  }

  try {
    const minified = input
      .replace(/\/\*[\s\S]*?\*\//g, "") // strip comments
      .replace(/\s+/g, " ")
      .replace(/\s*([{}:;,>+~])\s*/g, "$1")
      .replace(/;}/g, "}") // remove trailing semicolon
      .replace(/#([0-9a-fA-F])\1([0-9a-fA-F])\2([0-9a-fA-F])\3\b/g, "#$1$2$3") // shorten #ffffff to #fff
      .replace(/\b0(px|em|rem|%|pt|in|cm|mm)\b/g, "0") // 0px -> 0
      .trim();

    const origBytes = new TextEncoder().encode(input).length;
    const resBytes = new TextEncoder().encode(minified).length;
    const saved = origBytes > 0 ? (((origBytes - resBytes) / origBytes) * 100).toFixed(1) : "0";
    const ruleCount = (minified.match(/\{/g) || []).length;

    return {
      status: "success",
      message: `Minified (Saved ${saved}%)`,
      data: {
        output: minified,
        originalBytes: origBytes,
        resultBytes: resBytes,
        diffPct: `-${saved}%`,
        ruleCount,
        lineCount: 1,
      },
    };
  } catch (err: unknown) {
    return { status: "error", error: err instanceof Error ? err.message : "Failed to minify CSS." };
  }
}

function beautifyCSSAdvanced(
  css: string,
  indentSize: number,
  useTabs: boolean,
  sortProperties: boolean
): string {
  const indentChar = useTabs ? "\t" : " ".repeat(indentSize);

  // Normalize spaces
  let formatted = css
    .replace(/\s*\{\s*/g, " {\n")
    .replace(/\s*;\s*/g, ";\n")
    .replace(/\s*\}\s*/g, "\n}\n\n");

  const lines = formatted.split("\n");
  const result: string[] = [];
  let depth = 0;
  let currentBlockProps: string[] = [];
  let inBlock = false;

  for (let rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    if (line.endsWith("{")) {
      const pad = indentChar.repeat(depth);
      result.push(pad + line);
      depth++;
      inBlock = true;
      currentBlockProps = [];
    } else if (line.startsWith("}")) {
      if (sortProperties && currentBlockProps.length > 0) {
        currentBlockProps.sort();
        result.push(...currentBlockProps);
        currentBlockProps = [];
      }
      depth = Math.max(0, depth - 1);
      const pad = indentChar.repeat(depth);
      result.push(pad + "}");
      if (depth === 0) {
        result.push(""); // empty line between root selectors
      }
      inBlock = false;
    } else {
      // Inside block or at-rule
      const pad = indentChar.repeat(depth);
      // Format colon with space: "color:red;" -> "color: red;"
      const formattedDecl = line.replace(/:\s*/, ": ");
      if (sortProperties && inBlock && depth === 1) {
        currentBlockProps.push(pad + formattedDecl);
      } else {
        result.push(pad + formattedDecl);
      }
    }
  }

  return result.join("\n").trimEnd();
}