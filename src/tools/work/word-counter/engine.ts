import { ProcessingResult } from "@/lib/processing/types";

interface WordCountResult {
  words: number;
  characters: number;
  charactersNoSpaces: number;
  sentences: number;
  paragraphs: number;
  lines: number;
  readingTimeMinutes: number;
  speakingTimeMinutes: number;
  avgWordLength: number;
}

export function countWords(text: string): ProcessingResult & { stats?: WordCountResult } {
  if (!text.trim()) {
    return { status: "error", error: "Please enter some text to count." };
  }

  const trimmed = text.trim();
  const words = trimmed.split(/\s+/).filter((w) => w.length > 0);
  const wordCount = words.length;
  const characters = trimmed.length;
  const charactersNoSpaces = trimmed.replace(/\s/g, "").length;
  const sentences = trimmed.split(/[.!?]+/).filter((s) => s.trim().length > 0).length;
  const paragraphs = trimmed.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length;
  const lines = trimmed.split(/\n/).length;
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200)); // 200 wpm
  const speakingTimeMinutes = Math.max(1, Math.ceil(wordCount / 130)); // 130 wpm
  const avgWordLength = wordCount > 0 ? charactersNoSpaces / wordCount : 0;

  const stats: WordCountResult = {
    words: wordCount,
    characters,
    charactersNoSpaces,
    sentences,
    paragraphs,
    lines,
    readingTimeMinutes,
    speakingTimeMinutes,
    avgWordLength,
  };

  return {
    status: "success",
    message: `${wordCount} words, ${characters} characters`,
    stats,
  };
}