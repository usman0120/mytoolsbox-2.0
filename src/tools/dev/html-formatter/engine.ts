import { ProcessingResult } from "@/lib/processing/types";

export interface HTMLFormatOptions {
  indentSize?: number;
  useTabs?: boolean;
  wrapLineLength?: number;
}

export interface HTMLProcessResult extends ProcessingResult {
  data?: {
    output: string;
    originalBytes: number;
    resultBytes: number;
    diffPct: string;
    lineCount: number;
  };
}

export function formatHTML(input: string, options: HTMLFormatOptions = {}): HTMLProcessResult {
  const { indentSize = 2, useTabs = false } = options;

  if (!input.trim()) {
    return { status: "error", error: "Please enter HTML to format." };
  }

  try {
    const formatted = beautifyHTMLAdvanced(input, indentSize, useTabs);
    const origBytes = new TextEncoder().encode(input).length;
    const resBytes = new TextEncoder().encode(formatted).length;
    const diff = origBytes > 0 ? (((resBytes - origBytes) / origBytes) * 100).toFixed(1) : "0";

    return {
      status: "success",
      message: "HTML Formatted",
      data: {
        output: formatted,
        originalBytes: origBytes,
        resultBytes: resBytes,
        diffPct: `${Number(diff) > 0 ? "+" : ""}${diff}%`,
        lineCount: formatted.split("\n").length,
      },
    };
  } catch (err: unknown) {
    return { status: "error", error: err instanceof Error ? err.message : "Failed to format HTML." };
  }
}

export function minifyHTML(input: string): HTMLProcessResult {
  if (!input.trim()) {
    return { status: "error", error: "Please enter HTML to minify." };
  }

  try {
    const minified = input
      .replace(/<!--(?!\[if)[\s\S]*?-->/g, "") // strip comments except conditional comments
      .replace(/>\s+/g, ">")
      .replace(/\s+</g, "<")
      .replace(/\s{2,}/g, " ")
      .trim();

    const origBytes = new TextEncoder().encode(input).length;
    const resBytes = new TextEncoder().encode(minified).length;
    const saved = origBytes > 0 ? (((origBytes - resBytes) / origBytes) * 100).toFixed(1) : "0";

    return {
      status: "success",
      message: `Minified (Saved ${saved}%)`,
      data: {
        output: minified,
        originalBytes: origBytes,
        resultBytes: resBytes,
        diffPct: `-${saved}%`,
        lineCount: 1,
      },
    };
  } catch (err: unknown) {
    return { status: "error", error: err instanceof Error ? err.message : "Failed to minify HTML." };
  }
}

function beautifyHTMLAdvanced(html: string, indentSize: number, useTabs: boolean): string {
  const indentChar = useTabs ? "\t" : " ".repeat(indentSize);
  const voidElements = new Set([
    "area", "base", "br", "col", "embed", "hr", "img", "input",
    "link", "meta", "param", "source", "track", "wbr", "!doctype",
  ]);

  let clean = html.trim().replace(/>\s*</g, "><");
  const tokens = clean.split(/(<[^>]*>)/g).filter(Boolean);

  let result = "";
  let level = 0;

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i].trim();
    if (!token) continue;

    if (token.startsWith("<")) {
      const isClosing = token.startsWith("</");
      const isSelfClosing = token.endsWith("/>");
      const tagMatch = token.match(/<\/?([a-zA-Z0-9!_-]+)/);
      const tagName = tagMatch ? tagMatch[1].toLowerCase() : "";

      if (isClosing) {
        level = Math.max(0, level - 1);
        result += indentChar.repeat(level) + token + "\n";
      } else if (isSelfClosing || voidElements.has(tagName)) {
        result += indentChar.repeat(level) + token + "\n";
      } else {
        result += indentChar.repeat(level) + token + "\n";
        level++;
      }
    } else {
      result += indentChar.repeat(level) + token + "\n";
    }
  }

  return result.trimEnd();
}