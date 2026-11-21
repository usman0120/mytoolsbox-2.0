// Kanban Board Core Logic & Data Structures

export type CardPriority = "low" | "medium" | "high" | "urgent";

export interface KanbanCard {
  id: string;
  title: string;
  description: string;
  priority?: CardPriority;
  labels?: string[];
  dueDate?: string; // YYYY-MM-DD
  createdAt: number;
}

export interface KanbanColumn {
  id: string;
  title: string;
  wipLimit?: number;
  cards: KanbanCard[];
}

export interface KanbanBoard {
  columns: KanbanColumn[];
}

export const DEFAULT_COLUMNS: KanbanColumn[] = [
  { id: "todo", title: "To Do", wipLimit: 10, cards: [] },
  { id: "in-progress", title: "In Progress", wipLimit: 4, cards: [] },
  { id: "review", title: "Review", wipLimit: 4, cards: [] },
  { id: "done", title: "Done", cards: [] },
];

export function generateCardId(): string {
  return `card_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

export function generateColumnId(title: string): string {
  return `col_${title.toLowerCase().replace(/[^a-z0-9]/g, "_")}_${Math.random().toString(36).slice(2, 6)}`;
}

export function moveCard(
  board: KanbanBoard,
  cardId: string,
  sourceColId: string,
  targetColId: string,
  targetIndex?: number
): KanbanBoard {
  const sourceCol = board.columns.find((c) => c.id === sourceColId);
  const targetCol = board.columns.find((c) => c.id === targetColId);
  if (!sourceCol || !targetCol) return board;

  const card = sourceCol.cards.find((c) => c.id === cardId);
  if (!card) return board;

  // New columns
  const newColumns = board.columns.map((col) => {
    if (col.id === sourceColId && col.id === targetColId) {
      // Reorder within the same column
      const remaining = col.cards.filter((c) => c.id !== cardId);
      const insertAt = targetIndex !== undefined ? Math.max(0, Math.min(targetIndex, remaining.length)) : remaining.length;
      remaining.splice(insertAt, 0, card);
      return { ...col, cards: remaining };
    }
    if (col.id === sourceColId) {
      return { ...col, cards: col.cards.filter((c) => c.id !== cardId) };
    }
    if (col.id === targetColId) {
      const remaining = [...col.cards];
      const insertAt = targetIndex !== undefined ? Math.max(0, Math.min(targetIndex, remaining.length)) : remaining.length;
      remaining.splice(insertAt, 0, card);
      return { ...col, cards: remaining };
    }
    return col;
  });

  return { columns: newColumns };
}

export function isWipLimitExceeded(column: KanbanColumn): boolean {
  if (!column.wipLimit || column.wipLimit <= 0) return false;
  return column.cards.length > column.wipLimit;
}

export function filterCards(cards: KanbanCard[], searchQuery: string, priorityFilter?: CardPriority): KanbanCard[] {
  let result = cards;
  if (priorityFilter) {
    result = result.filter((c) => c.priority === priorityFilter);
  }
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    result = result.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.labels?.some((l) => l.toLowerCase().includes(q))
    );
  }
  return result;
}

export function exportBoardToCSV(board: KanbanBoard): string {
  const rows: string[] = [`"Column","Card Title","Priority","Due Date","Labels","Description"`];
  for (const col of board.columns) {
    for (const card of col.cards) {
      rows.push(
        `"${col.title.replace(/"/g, '""')}","${card.title.replace(/"/g, '""')}","${card.priority || "none"}","${card.dueDate || ""}","${(card.labels || []).join(';')}","${card.description.replace(/"/g, '""').replace(/\n/g, ' ')}"`
      );
    }
  }
  return rows.join("\n");
}
