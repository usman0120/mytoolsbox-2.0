import { ProcessingResult } from "@/lib/processing/types";

export type CaseType =
  | "upper"
  | "lower"
  | "title"
  | "sentence"
  | "camel"
  | "snake"
  | "kebab"
  | "pascal"
  | "constant"
  | "dot"
  | "path"
  | "alternating";

export function applyCaseConversion(text: string, caseType: CaseType): string {
  if (!text) return "";

  switch (caseType) {
    case "upper":
      return text.toUpperCase();

    case "lower":
      return text.toLowerCase();

    case "title":
      return text.replace(/\b\w+/g, (word) => {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      });

    case "sentence":
      return text
        .toLowerCase()
        .replace(/(^\s*\w|[.!?]\s+\w)/g, (c) => c.toUpperCase());

    case "camel": {
      const words = text.trim().split(/[^a-zA-Z0-9]+/);
      return words
        .map((w, i) =>
          i === 0
            ? w.toLowerCase()
            : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
        )
        .join("");
    }

    case "pascal": {
      const words = text.trim().split(/[^a-zA-Z0-9]+/);
      return words
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join("");
    }

    case "snake":
      return text
        .trim()
        .replace(/\s+/g, "_")
        .replace(/([a-z])([A-Z])/g, "$1_$2")
        .replace(/[^a-zA-Z0-9_]+/g, "_")
        .replace(/_+/g, "_")
        .toLowerCase();

    case "constant":
      return text
        .trim()
        .replace(/\s+/g, "_")
        .replace(/([a-z])([A-Z])/g, "$1_$2")
        .replace(/[^a-zA-Z0-9_]+/g, "_")
        .replace(/_+/g, "_")
        .toUpperCase();

    case "kebab":
      return text
        .trim()
        .replace(/\s+/g, "-")
        .replace(/([a-z])([A-Z])/g, "$1-$2")
        .replace(/[^a-zA-Z0-9-]+/g, "-")
        .replace(/-+/g, "-")
        .toLowerCase();

    case "dot":
      return text
        .trim()
        .replace(/\s+/g, ".")
        .replace(/([a-z])([A-Z])/g, "$1.$2")
        .replace(/[^a-zA-Z0-9.]+/g, ".")
        .replace(/\.+/g, ".")
        .toLowerCase();

    case "path":
      return text
        .trim()
        .replace(/\s+/g, "/")
        .replace(/([a-z])([A-Z])/g, "$1/$2")
        .replace(/[^a-zA-Z0-9/]+/g, "/")
        .replace(/\/+/g, "/")
        .toLowerCase();

    case "alternating": {
      let upper = true;
      return text
        .split("")
        .map((char) => {
          if (/[a-zA-Z]/.test(char)) {
            const c = upper ? char.toUpperCase() : char.toLowerCase();
            upper = !upper;
            return c;
          }
          return char;
        })
        .join("");
    }

    default:
      return text;
  }
}

export function convertCase(text: string, caseType: CaseType): ProcessingResult & { outputText?: string } {
  if (!text.trim()) {
    return { status: "error", error: "Please enter text to convert." };
  }

  const result = applyCaseConversion(text, caseType);

  return {
    status: "success",
    message: `Converted to ${caseType} case`,
    outputText: result,
  };
}