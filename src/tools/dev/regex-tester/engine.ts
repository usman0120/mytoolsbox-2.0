import { ProcessingResult } from "@/lib/processing/types";

export interface RegexMatchItem {
  index: number;
  endIndex: number;
  text: string;
  groups: Array<{
    name?: string;
    value: string;
    index: number;
  }>;
}

export interface RegexTestResult extends ProcessingResult {
  data?: {
    matchCount: number;
    matches: RegexMatchItem[];
    replacedText?: string;
    executionTimeMs: number;
  };
}

export function testRegexAdvanced(
  pattern: string,
  text: string,
  flags: string = "g",
  replacement?: string
): RegexTestResult {
  if (!pattern) {
    return { status: "error", error: "Please enter a regular expression pattern." };
  }

  const startTime = performance.now();

  try {
    const isGlobal = flags.includes("g");
    const regex = new RegExp(pattern, flags);
    const matches: RegexMatchItem[] = [];

    if (isGlobal) {
      let match: RegExpExecArray | null;
      let iterations = 0;
      const MAX_ITERATIONS = 5000;

      while ((match = regex.exec(text)) !== null && iterations < MAX_ITERATIONS) {
        iterations++;
        const groups: Array<{ name?: string; value: string; index: number }> = [];

        if (match.length > 1) {
          for (let i = 1; i < match.length; i++) {
            groups.push({
              value: match[i] ?? "",
              index: i,
            });
          }
        }

        if (match.groups) {
          Object.entries(match.groups).forEach(([name, val]) => {
            const existing = groups.find((g) => g.value === val);
            if (existing) {
              existing.name = name;
            } else {
              groups.push({ name, value: val ?? "", index: -1 });
            }
          });
        }

        matches.push({
          index: match.index,
          endIndex: match.index + match[0].length,
          text: match[0],
          groups,
        });

        // Avoid infinite loop on zero-width match
        if (match.index === regex.lastIndex) {
          regex.lastIndex++;
        }
      }
    } else {
      const match = regex.exec(text);
      if (match) {
        const groups: Array<{ name?: string; value: string; index: number }> = [];
        if (match.length > 1) {
          for (let i = 1; i < match.length; i++) {
            groups.push({
              value: match[i] ?? "",
              index: i,
            });
          }
        }
        if (match.groups) {
          Object.entries(match.groups).forEach(([name, val]) => {
            const existing = groups.find((g) => g.value === val);
            if (existing) {
              existing.name = name;
            } else {
              groups.push({ name, value: val ?? "", index: -1 });
            }
          });
        }

        matches.push({
          index: match.index,
          endIndex: match.index + match[0].length,
          text: match[0],
          groups,
        });
      }
    }

    let replacedText: string | undefined;
    if (typeof replacement === "string") {
      const replaceRegex = new RegExp(pattern, flags);
      replacedText = text.replace(replaceRegex, replacement);
    }

    const duration = Math.round((performance.now() - startTime) * 100) / 100;

    return {
      status: "success",
      message: matches.length > 0 ? `Found ${matches.length} match(es)` : "No matches found",
      data: {
        matchCount: matches.length,
        matches,
        replacedText,
        executionTimeMs: duration,
      },
    };
  } catch (err: unknown) {
    return {
      status: "error",
      error: err instanceof Error ? err.message : "Invalid regular expression",
    };
  }
}

// Backward compatible export for existing imports
export function testRegex(pattern: string, text: string, flags: string = ""): ProcessingResult {
  const res = testRegexAdvanced(pattern, text, flags);
  if (res.status === "error") {
    return { status: "error", message: res.error };
  }
  return {
    status: "success",
    message: res.message,
    data: res.data?.matches.map((m) => m.text),
  };
}

export function generateRegexCode(pattern: string, flags: string, lang: "js" | "python" | "go" | "php"): string {
  switch (lang) {
    case "js":
      return `const regex = /${pattern}/${flags};\nconst text = "...";\nconst matches = [...text.matchAll(regex)];\nconsole.log(matches.map(m => m[0]));`;
    case "python":
      return `import re\n\npattern = r"${pattern}"\ntext = "..."\nmatches = re.findall(pattern, text)\nprint(matches)`;
    case "go":
      return `package main\n\nimport (\n\t"fmt"\n\t"regexp"\n)\n\nfunc main() {\n\tre := regexp.MustCompile(\`${pattern}\`)\n\tmatches := re.FindAllString("...", -1)\n\tfmt.Println(matches)\n}`;
    case "php":
      return `<?php\n$pattern = '/${pattern}/${flags}';\n$text = '...';\npreg_match_all($pattern, $text, $matches);\nprint_r($matches[0]);`;
    default:
      return "";
  }
}