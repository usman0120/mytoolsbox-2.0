export function cleanText(text: string, options: {
  removeExtraSpaces?: boolean;
  removeLineBreaks?: boolean;
  removeHTML?: boolean;
  trimLines?: boolean;
} = {}): string {
  let result = text;

  if (options.removeHTML) {
    result = result.replace(/<[^>]*>/g, "");
  }

  if (options.removeExtraSpaces) {
    result = result.replace(/\s+/g, " ");
  }

  if (options.trimLines) {
    result = result
      .split("\n")
      .map((line) => line.trim())
      .join("\n");
  }

  if (options.removeLineBreaks) {
    result = result.replace(/\n+/g, " ");
  }

  return result.trim();
}