import { ProcessingResult } from "@/lib/processing/types";

export function formatHTML(input: string, indentSize: number = 2): ProcessingResult {
  if (!input.trim()) {
    return { status: "error", error: "Please enter HTML to format." };
  }

  try {
    const formatted = beautifyHTML(input, indentSize);
    return { status: "success", message: formatted };
  } catch (err: any) {
    return { status: "error", error: err.message || "Failed to format HTML." };
  }
}

export function minifyHTML(input: string): ProcessingResult {
  if (!input.trim()) {
    return { status: "error", error: "Please enter HTML to minify." };
  }

  try {
    const minified = input
      .replace(/<!--[\s\S]*?-->/g, "")
      .replace(/>\s+</g, "><")
      .replace(/\s{2,}/g, " ")
      .trim();
    return { status: "success", message: minified };
  } catch (err: any) {
    return { status: "error", error: err.message || "Failed to minify HTML." };
  }
}

function beautifyHTML(html: string, indentSize: number): string {
  const indent = " ".repeat(indentSize);
  let result = "";
  let level = 0;
  const voidElements = new Set([
    "area", "base", "br", "col", "embed", "hr", "img", "input",
    "link", "meta", "param", "source", "track", "wbr",
  ]);

  // Simple tokenizer
  const tokens = html.split(/(<[^>]*>)/g).filter(Boolean);

  for (const token of tokens) {
    if (token.startsWith("<")) {
      const isClosing = token.startsWith("</");
      const isSelfClosing = token.endsWith("/>");
      const tagName = token.match(/<\/?(\w+)/)?.[1]?.toLowerCase() || "";

      if (isClosing) {
        level = Math.max(0, level - 1);
        result += indent.repeat(level) + token + "\n";
      } else if (isSelfClosing || voidElements.has(tagName)) {
        result += indent.repeat(level) + token + "\n";
      } else {
        result += indent.repeat(level) + token + "\n";
        level++;
      }
    } else {
      const trimmed = token.trim();
      if (trimmed) {
        result += indent.repeat(level) + trimmed + "\n";
      }
    }
  }

  return result.trimEnd();
}