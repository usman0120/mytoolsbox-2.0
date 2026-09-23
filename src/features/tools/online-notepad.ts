// Online Notepad Core Text Operations & Analytics

export interface TextStatistics {
  characters: number;
  charactersNoSpaces: number;
  words: number;
  sentences: number;
  paragraphs: number;
  readingTimeMinutes: number;
  speakingTimeMinutes: number;
}

export function computeTextStatistics(text: string): TextStatistics {
  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, "").length;
  const trimmed = text.trim();
  const words = trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0;
  const sentences = trimmed ? trimmed.split(/[.!?]+/).filter((s) => s.trim().length > 0).length : 0;
  const paragraphs = trimmed ? trimmed.split(/\n+/).filter((p) => p.trim().length > 0).length : 0;

  // Average reading speed: 200 words per minute
  // Average speaking speed: 130 words per minute
  const readingTimeMinutes = Math.max(1, Math.ceil(words / 200));
  const speakingTimeMinutes = Math.max(1, Math.ceil(words / 130));

  return {
    characters,
    charactersNoSpaces,
    words,
    sentences,
    paragraphs,
    readingTimeMinutes,
    speakingTimeMinutes,
  };
}

export type CaseTransform = "uppercase" | "lowercase" | "titlecase" | "sentencecase";

export function transformCase(text: string, type: CaseTransform): string {
  switch (type) {
    case "uppercase":
      return text.toUpperCase();
    case "lowercase":
      return text.toLowerCase();
    case "titlecase":
      return text.replace(
        /\w\S*/g,
        (w) => w.charAt(0).toUpperCase() + w.substring(1).toLowerCase()
      );
    case "sentencecase":
      return text.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase());
    default:
      return text;
  }
}

export function sortLines(text: string, direction: "asc" | "desc" = "asc"): string {
  const lines = text.split("\n");
  lines.sort((a, b) => (direction === "asc" ? a.localeCompare(b) : b.localeCompare(a)));
  return lines.join("\n");
}

export function removeDuplicateLines(text: string): string {
  const lines = text.split("\n");
  const unique = Array.from(new Set(lines));
  return unique.join("\n");
}

export function findAndReplace(
  text: string,
  find: string,
  replace: string,
  options: { caseSensitive?: boolean; useRegex?: boolean } = {}
): string {
  if (!find) return text;
  try {
    const flags = options.caseSensitive ? "g" : "gi";
    const pattern = options.useRegex ? new RegExp(find, flags) : new RegExp(find.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), flags);
    return text.replace(pattern, replace);
  } catch {
    return text;
  }
}
