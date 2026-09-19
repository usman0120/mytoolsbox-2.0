import { diffLines, diffWords, diffChars } from "diff";

export type DiffMode = "lines" | "words" | "chars";

export interface DiffResult {
  type: "added" | "removed" | "unchanged";
  value: string;
  count?: number;
}

export function computeDiff(text1: string, text2: string, mode: DiffMode = "lines"): DiffResult[] {
  let changes: { added?: boolean; removed?: boolean; value: string; count?: number }[];

  switch (mode) {
    case "words":
      changes = diffWords(text1, text2);
      break;
    case "chars":
      changes = diffChars(text1, text2);
      break;
    default:
      changes = diffLines(text1, text2);
  }

  return changes.map((c) => ({
    type: c.added ? "added" as const : c.removed ? "removed" as const : "unchanged" as const,
    value: c.value,
    count: c.count,
  }));
}