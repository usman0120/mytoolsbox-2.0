// Notes App Pure Logic & Markdown Metrics

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  pinned?: boolean;
  createdAt: number;
  updatedAt: number;
}

export function generateNoteId(): string {
  return `note_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

export function calculateNoteStats(text: string): {
  charCount: number;
  wordCount: number;
  lineCount: number;
  readingTimeMinutes: number;
} {
  const charCount = text.length;
  const trimmed = text.trim();
  const wordCount = trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0;
  const lineCount = text ? text.split("\n").length : 0;
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  return { charCount, wordCount, lineCount, readingTimeMinutes };
}

export function filterAndSortNotes(
  notes: Note[],
  query: string,
  selectedTag?: string,
  sortBy: "updated" | "created" | "title" = "updated"
): Note[] {
  let result = [...notes];

  if (selectedTag && selectedTag !== "all") {
    result = result.filter((n) => n.tags && n.tags.includes(selectedTag));
  }

  if (query.trim()) {
    const q = query.toLowerCase().trim();
    result = result.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        n.tags?.some((t) => t.toLowerCase().includes(q))
    );
  }

  result.sort((a, b) => {
    // Pinned notes always on top
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;

    if (sortBy === "title") return a.title.localeCompare(b.title);
    if (sortBy === "created") return b.createdAt - a.createdAt;
    return b.updatedAt - a.updatedAt;
  });

  return result;
}

export function extractAllTags(notes: Note[]): string[] {
  const set = new Set<string>();
  for (const n of notes) {
    if (n.tags) {
      n.tags.forEach((t) => set.add(t));
    }
  }
  return Array.from(set).sort();
}
