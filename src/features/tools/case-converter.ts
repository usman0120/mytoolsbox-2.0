import { ProcessingResult } from "@/lib/processing/types";

export type CaseType = "upper" | "lower" | "title" | "sentence" | "camel" | "snake" | "kebab" | "pascal";

export function convertCase(text: string, caseType: CaseType): ProcessingResult {
  if (!text.trim()) {
    return { status: "error", error: "Please enter text to convert." };
  }

  let result: string;

  switch (caseType) {
    case "upper":
      result = text.toUpperCase();
      break;
    case "lower":
      result = text.toLowerCase();
      break;
    case "title":
      result = text.replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
      break;
    case "sentence":
      result = text
        .toLowerCase()
        .replace(/(^\s*\w|[.!?]\s+\w)/g, (c) => c.toUpperCase());
      break;
    case "camel":
      result = text
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase());
      break;
    case "snake":
      result = text
        .replace(/\s+/g, "_")
        .replace(/([a-z])([A-Z])/g, "$1_$2")
        .toLowerCase();
      break;
    case "kebab":
      result = text
        .replace(/\s+/g, "-")
        .replace(/([a-z])([A-Z])/g, "$1-$2")
        .toLowerCase();
      break;
    case "pascal":
      result = text
        .toLowerCase()
        .replace(/(?:^|[^a-zA-Z0-9]+)(.)/g, (_, chr) => chr.toUpperCase());
      break;
    default:
      return { status: "error", error: "Unknown case type." };
  }

  return {
    status: "success",
    message: `Converted to ${caseType} case`,
  };
}