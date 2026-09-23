import { diffLines, diffWords, diffChars, createTwoFilesPatch } from "diff";

export type DiffMode = "lines" | "words" | "chars";

export interface DiffResult {
  type: "added" | "removed" | "unchanged";
  value: string;
  count?: number;
}

export interface DiffOptions {
  ignoreWhitespace?: boolean;
  ignoreCase?: boolean;
}

export function computeDiff(
  text1: string,
  text2: string,
  mode: DiffMode = "lines",
  options: DiffOptions = {}
): DiffResult[] {
  let t1 = text1;
  let t2 = text2;

  if (options.ignoreCase) {
    t1 = t1.toLowerCase();
    t2 = t2.toLowerCase();
  }

  let changes: { added?: boolean; removed?: boolean; value: string; count?: number }[];

  switch (mode) {
    case "words":
      changes = diffWords(t1, t2);
      break;
    case "chars":
      changes = diffChars(t1, t2);
      break;
    default:
      changes = diffLines(t1, t2, { ignoreWhitespace: options.ignoreWhitespace });
  }

  return changes.map((c) => ({
    type: c.added ? ("added" as const) : c.removed ? ("removed" as const) : ("unchanged" as const),
    value: c.value,
    count: c.count,
  }));
}

export function generatePatch(filename: string, text1: string, text2: string): string {
  return createTwoFilesPatch(
    `a/${filename}`,
    `b/${filename}`,
    text1,
    text2,
    "original",
    "modified"
  );
}