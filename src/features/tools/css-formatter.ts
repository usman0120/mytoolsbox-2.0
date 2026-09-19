import { ProcessingResult } from "@/lib/processing/types";

export function formatCSS(input: string, indentSize: number = 2): ProcessingResult {
  if (!input.trim()) {
    return { status: "error", error: "Please enter CSS to format." };
  }

  try {
    const formatted = beautifyCSS(input, indentSize);
    return { status: "success", message: formatted };
  } catch (err: any) {
    return { status: "error", error: err.message || "Failed to format CSS." };
  }
}

export function minifyCSS(input: string): ProcessingResult {
  if (!input.trim()) {
    return { status: "error", error: "Please enter CSS to minify." };
  }

  try {
    const minified = input
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/\s+/g, " ")
      .replace(/\s*([{}:;,])\s*/g, "$1")
      .replace(/;}/g, "}")
      .trim();
    return { status: "success", message: minified };
  } catch (err: any) {
    return { status: "error", error: err.message || "Failed to minify CSS." };
  }
}

function beautifyCSS(css: string, indentSize: number): string {
  const indent = " ".repeat(indentSize);
  let result = "";
  let level = 0;

  // Remove comments first
  css = css.replace(/\/\*[\s\S]*?\*\//g, "");

  // Split by meaningful boundaries
  const tokens = css.split(/([{};])/g).filter(Boolean);

  for (let i = 0; i < tokens.length; i++) {
    let token = tokens[i].trim();
    if (!token) continue;

    if (token === "{") {
      result = result.trimEnd() + " {\n";
      level++;
    } else if (token === "}") {
      level = Math.max(0, level - 1);
      result += indent.repeat(level) + "}\n";
    } else if (token === ";") {
      result = result.trimEnd() + ";\n";
    } else {
      // Property or selector
      const nextToken = tokens[i + 1]?.trim();
      if (nextToken === "{") {
        result += indent.repeat(level) + token + " ";
      } else if (nextToken === ";" || nextToken === "}") {
        result += indent.repeat(level) + token;
      } else {
        result += indent.repeat(level) + token + "\n";
      }
    }
  }

  return result.trimEnd();
}