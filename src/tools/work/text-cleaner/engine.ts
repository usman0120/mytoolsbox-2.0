export interface CleanTextOptions {
  removeExtraSpaces?: boolean;
  removeLineBreaks?: boolean;
  removeHTML?: boolean;
  trimLines?: boolean;
  removeEmptyLines?: boolean;
  removeDuplicateLines?: boolean;
  stripEmojis?: boolean;
  stripNonAscii?: boolean;
  sortLines?: "none" | "asc" | "desc";
  numberLines?: boolean;
  removePunctuation?: boolean;
  findText?: string;
  replaceText?: string;
  useRegex?: boolean;
}

export function cleanText(text: string, options: CleanTextOptions = {}): string {
  if (!text) return "";
  let result = text;

  // Custom find & replace
  if (options.findText) {
    try {
      if (options.useRegex) {
        const regex = new RegExp(options.findText, "g");
        result = result.replace(regex, options.replaceText || "");
      } else {
        result = result.split(options.findText).join(options.replaceText || "");
      }
    } catch {
      // Ignore invalid regex
    }
  }

  // Strip HTML & entities
  if (options.removeHTML) {
    result = result.replace(/<[^>]*>/g, "");
    result = result
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, " ");
  }

  // Strip emojis
  if (options.stripEmojis) {
    result = result.replace(
      /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g,
      ""
    );
  }

  // Strip non-ASCII
  if (options.stripNonAscii) {
    // eslint-disable-next-line no-control-regex
    result = result.replace(/[^\x00-\x7F]/g, "");
  }

  // Remove punctuation
  if (options.removePunctuation) {
    result = result.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'’“”]/g, "");
  }

  // Line-based processing
  let lines = result.split(/\r?\n/);

  if (options.trimLines) {
    lines = lines.map((l) => l.trim());
  }

  if (options.removeEmptyLines) {
    lines = lines.filter((l) => l.length > 0);
  }

  if (options.removeDuplicateLines) {
    const seen = new Set<string>();
    lines = lines.filter((l) => {
      if (seen.has(l)) return false;
      seen.add(l);
      return true;
    });
  }

  if (options.sortLines === "asc") {
    lines.sort((a, b) => a.localeCompare(b));
  } else if (options.sortLines === "desc") {
    lines.sort((a, b) => b.localeCompare(a));
  }

  if (options.numberLines) {
    lines = lines.map((l, idx) => `${idx + 1}. ${l}`);
  }

  result = lines.join("\n");

  if (options.removeExtraSpaces) {
    result = result.replace(/[ \t]+/g, " ");
  }

  if (options.removeLineBreaks) {
    result = result.replace(/\n+/g, " ");
  }

  return result.trim();
}