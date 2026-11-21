// PDF Highlighter & Notes Core Engine

export type HighlightColor = "yellow" | "green" | "blue" | "pink" | "orange" | "purple";
export type NoteTag = "concept" | "question" | "summary" | "action" | "important" | "review";

export interface Highlight {
  id: string;
  text: string;
  color: HighlightColor;
  note: string;
  tag: NoteTag;
  page: number;
  startIndex: number;
  endIndex: number;
  createdAt: string;
}

export const HIGHLIGHT_COLORS: Record<HighlightColor, string> = {
  yellow:  "#fef08a",
  green:   "#bbf7d0",
  blue:    "#bfdbfe",
  pink:    "#fecaca",
  orange:  "#fed7aa",
  purple:  "#e9d5ff",
};

export const NOTE_TAGS: Record<NoteTag, { label: string; emoji: string }> = {
  concept:   { label: "Key Concept", emoji: "💡" },
  question:  { label: "Question",    emoji: "❓" },
  summary:   { label: "Summary",     emoji: "📋" },
  action:    { label: "Action Item", emoji: "✅" },
  important: { label: "Important",   emoji: "⚠️" },
  review:    { label: "Review",      emoji: "🔄" },
};

/**
 * Extract readable text from a PDF Uint8Array using BT/ET markers
 */
export function extractTextFromPDF(data: Uint8Array): { text: string; pageCount: number; method: "structured" | "fallback" } {
  const raw = new TextDecoder("latin1").decode(data);

  // Count pages using /Type /Page markers
  const pageMatches = raw.match(/\/Type\s*\/Page[^s]/g);
  const pageCount = pageMatches ? pageMatches.length : 1;

  // Extract from BT...ET text blocks
  const textBlocks: string[] = [];
  const btRegex = /BT\s*([\s\S]*?)\s*ET/g;
  let match;

  while ((match = btRegex.exec(raw)) !== null) {
    const block = match[1];

    // Tj: single string
    const tjRegex = /\(([^)\\]*(?:\\.[^)\\]*)*)\)\s*Tj/g;
    let tj;
    while ((tj = tjRegex.exec(block)) !== null) {
      const decoded = tj[1]
        .replace(/\\n/g, " ")
        .replace(/\\r/g, " ")
        .replace(/\\t/g, " ")
        .replace(/\\\\/g, "\\")
        .replace(/\\(\(|\))/g, "$1")
        .trim();
      if (decoded.length > 0) textBlocks.push(decoded);
    }

    // TJ: array of strings and spacings
    const tjArrRegex = /\[([\s\S]*?)\]\s*TJ/g;
    let tjArr;
    while ((tjArr = tjArrRegex.exec(block)) !== null) {
      const strRegex = /\(([^)\\]*(?:\\.[^)\\]*)*)\)/g;
      let str;
      while ((str = strRegex.exec(tjArr[1])) !== null) {
        const decoded = str[1]
          .replace(/\\n/g, " ")
          .replace(/\\r/g, " ")
          .replace(/\\\\/g, "\\")
          .replace(/\\(\(|\))/g, "$1")
          .trim();
        if (decoded.length > 0) textBlocks.push(decoded);
      }
    }
  }

  if (textBlocks.length > 0) {
    // Clean up the extracted text
    const joined = textBlocks
      .join(" ")
      .replace(/\s{3,}/g, "\n\n")
      .replace(/\s{2}/g, " ")
      .trim();
    return { text: joined.substring(0, 100_000), pageCount, method: "structured" };
  }

  // Fallback: strip PDF binary data, keep printable ASCII
  const readable = raw
    .replace(/[^\x20-\x7E\n\r\t]/g, " ")
    .replace(/obj|endobj|stream|endstream|xref|trailer|startxref/g, "")
    .replace(/\s{3,}/g, "\n\n")
    .replace(/\s{2}/g, " ")
    .trim();

  if (readable.length > 200) {
    return { text: readable.substring(0, 100_000), pageCount, method: "fallback" };
  }

  return {
    text: "Could not extract text from this PDF. The file may be scanned/image-based or use unsupported encoding.",
    pageCount,
    method: "fallback",
  };
}

/**
 * Export all highlights as a Markdown study guide
 */
export function exportToMarkdown(title: string, highlights: Highlight[]): string {
  if (highlights.length === 0) return `# ${title}\n\nNo highlights yet.`;

  const lines: string[] = [`# Study Notes: ${title}`, "", `*Generated ${new Date().toLocaleDateString()}*`, ""];

  // Group by tag
  const groups: Partial<Record<NoteTag, Highlight[]>> = {};
  for (const h of highlights) {
    if (!groups[h.tag]) groups[h.tag] = [];
    groups[h.tag]!.push(h);
  }

  const tagOrder: NoteTag[] = ["summary", "concept", "important", "question", "action", "review"];

  for (const tag of tagOrder) {
    const items = groups[tag];
    if (!items || items.length === 0) continue;

    const meta = NOTE_TAGS[tag];
    lines.push(`## ${meta.emoji} ${meta.label}s`, "");

    for (const h of items) {
      lines.push(`> "${h.text}"`);
      if (h.note) lines.push(`> `, `> 📝 ${h.note}`);
      lines.push("");
    }
  }

  return lines.join("\n");
}

/**
 * Search highlights by query string (matches text and notes)
 */
export function searchHighlights(highlights: Highlight[], query: string): Highlight[] {
  const q = query.toLowerCase().trim();
  if (!q) return highlights;
  return highlights.filter(
    (h) =>
      h.text.toLowerCase().includes(q) ||
      h.note.toLowerCase().includes(q) ||
      h.tag.includes(q)
  );
}

/**
 * Sort highlights by page then character index
 */
export function sortHighlightsByPosition(highlights: Highlight[]): Highlight[] {
  return [...highlights].sort((a, b) => a.page - b.page || a.startIndex - b.startIndex);
}
