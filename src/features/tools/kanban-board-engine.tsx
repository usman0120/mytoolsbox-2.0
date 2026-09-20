"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Plus,
  Trash2,
  GripVertical,
  Download,
  Upload,
  MoreHorizontal,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface KanbanCard {
  id: string;
  title: string;
  description: string;
  createdAt: number;
}

interface KanbanColumn {
  id: string;
  title: string;
  cards: KanbanCard[];
}

interface KanbanBoard {
  columns: KanbanColumn[];
}

const STORAGE_KEY = "mytoolsbox-kanban";
const DEFAULT_COLUMNS: KanbanColumn[] = [
  { id: "todo", title: "To Do", cards: [] },
  { id: "in-progress", title: "In Progress", cards: [] },
  { id: "done", title: "Done", cards: [] },
];

function loadBoard(): KanbanBoard {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { columns: DEFAULT_COLUMNS };
}

function saveBoard(board: KanbanBoard) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(board));
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

export function KanbanBoardEngine() {
  const [board, setBoard] = useState<KanbanBoard>(() => loadBoard());
  const [addingToColumn, setAddingToColumn] = useState<string | null>(null);
  const [newCardTitle, setNewCardTitle] = useState("");
  const [editingColumn, setEditingColumn] = useState<string | null>(null);
  const [editColumnTitle, setEditColumnTitle] = useState("");
  const [dragState, setDragState] = useState<{
    cardId: string;
    sourceColumnId: string;
  } | null>(null);
  const [dragOverColumnId, setDragOverColumnId] = useState<string | null>(null);

  const persist = useCallback((newBoard: KanbanBoard) => {
    setBoard(newBoard);
    saveBoard(newBoard);
  }, []);

  // Column operations
  const handleAddColumn = () => {
    const newColumn: KanbanColumn = {
      id: generateId(),
      title: "New Column",
      cards: [],
    };
    persist({ ...board, columns: [...board.columns, newColumn] });
  };

  const handleDeleteColumn = (columnId: string) => {
    persist({
      ...board,
      columns: board.columns.filter((c) => c.id !== columnId),
    });
  };

  const handleRenameColumn = (columnId: string) => {
    if (!editColumnTitle.trim()) return;
    persist({
      ...board,
      columns: board.columns.map((c) =>
        c.id === columnId ? { ...c, title: editColumnTitle.trim() } : c
      ),
    });
    setEditingColumn(null);
  };

  // Card operations
  const handleAddCard = (columnId: string) => {
    if (!newCardTitle.trim()) return;
    const newCard: KanbanCard = {
      id: generateId(),
      title: newCardTitle.trim(),
      description: "",
      createdAt: Date.now(),
    };
    persist({
      ...board,
      columns: board.columns.map((c) =>
        c.id === columnId ? { ...c, cards: [...c.cards, newCard] } : c
      ),
    });
    setNewCardTitle("");
    setAddingToColumn(null);
  };

  const handleDeleteCard = (columnId: string, cardId: string) => {
    persist({
      ...board,
      columns: board.columns.map((c) =>
        c.id === columnId
          ? { ...c, cards: c.cards.filter((card) => card.id !== cardId) }
          : c
      ),
    });
  };

  const handleUpdateCard = (
    columnId: string,
    cardId: string,
    field: "title" | "description",
    value: string
  ) => {
    persist({
      ...board,
      columns: board.columns.map((c) =>
        c.id === columnId
          ? {
              ...c,
              cards: c.cards.map((card) =>
                card.id === cardId ? { ...card, [field]: value } : card
              ),
            }
          : c
      ),
    });
  };

  // Drag and drop
  const handleDragStart = (cardId: string, sourceColumnId: string) => {
    setDragState({ cardId, sourceColumnId });
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    setDragOverColumnId(columnId);
  };

  const handleDragLeave = () => {
    setDragOverColumnId(null);
  };

  const handleDrop = (targetColumnId: string) => {
    if (!dragState) return;
    const { cardId, sourceColumnId } = dragState;

    if (sourceColumnId === targetColumnId) {
      setDragState(null);
      setDragOverColumnId(null);
      return;
    }

    const sourceColumn = board.columns.find((c) => c.id === sourceColumnId);
    const card = sourceColumn?.cards.find((c) => c.id === cardId);
    if (!card) return;

    persist({
      ...board,
      columns: board.columns.map((c) => {
        if (c.id === sourceColumnId) {
          return { ...c, cards: c.cards.filter((card) => card.id !== cardId) };
        }
        if (c.id === targetColumnId) {
          return { ...c, cards: [...c.cards, card] };
        }
        return c;
      }),
    });

    setDragState(null);
    setDragOverColumnId(null);
  };

  // Export / Import
  const handleExport = () => {
    const blob = new Blob([JSON.stringify(board, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kanban-board-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const imported = JSON.parse(reader.result as string);
          if (imported.columns && Array.isArray(imported.columns)) {
            persist(imported);
          }
        } catch {
          alert("Invalid board file");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleClearBoard = () => {
    if (confirm("Clear all columns and cards? This cannot be undone.")) {
      persist({ columns: DEFAULT_COLUMNS.map((c) => ({ ...c, cards: [] })) });
    }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{board.columns.reduce((sum, c) => sum + c.cards.length, 0)} cards</Badge>
          <Badge variant="secondary">{board.columns.length} columns</Badge>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExport} variant="outline" size="sm" className="gap-1.5">
            <Download className="h-3.5 w-3.5" /> Export
          </Button>
          <Button onClick={handleImport} variant="outline" size="sm" className="gap-1.5">
            <Upload className="h-3.5 w-3.5" /> Import
          </Button>
          <Button onClick={handleClearBoard} variant="outline" size="sm" className="gap-1.5 text-red-500 hover:text-red-600">
            <Trash2 className="h-3.5 w-3.5" /> Clear
          </Button>
        </div>
      </div>

      {/* Board */}
      <div className="flex gap-4 overflow-x-auto pb-4 min-h-100">
        {board.columns.map((column) => (
          <div
            key={column.id}
            className="shrink-0 w-72 flex flex-col"
            onDragOver={(e) => handleDragOver(e, column.id)}
            onDragLeave={handleDragLeave}
            onDrop={() => handleDrop(column.id)}
          >
            {/* Column Header */}
            <div
              className={`p-3 rounded-t-xl border border-border/50 bg-muted/30 ${
                dragOverColumnId === column.id ? "ring-2 ring-primary/50" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                {editingColumn === column.id ? (
                  <div className="flex items-center gap-1 flex-1">
                    <Input
                      value={editColumnTitle}
                      onChange={(e) => setEditColumnTitle(e.target.value)}
                      className="h-7 text-sm font-semibold"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleRenameColumn(column.id);
                        if (e.key === "Escape") setEditingColumn(null);
                      }}
                      onBlur={() => handleRenameColumn(column.id)}
                    />
                  </div>
                ) : (
                  <h3
                    className="font-semibold text-sm cursor-pointer hover:text-primary transition-colors flex-1"
                    onClick={() => {
                      setEditingColumn(column.id);
                      setEditColumnTitle(column.title);
                    }}
                  >
                    {column.title}
                  </h3>
                )}
                <div className="flex items-center gap-1">
                  <Badge variant="secondary" className="text-[10px] px-1.5">
                    {column.cards.length}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-6 w-6">
                      <MoreHorizontal className="h-3.5 w-3.5" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          setEditingColumn(column.id);
                          setEditColumnTitle(column.title);
                        }}
                      >
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-500"
                        onClick={() => handleDeleteColumn(column.id)}
                      >
                        Delete Column
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>

            {/* Cards */}
            <div className="flex-1 p-2 space-y-2 rounded-b-xl border-x border-b border-border/50 bg-muted/10 min-h-25">
              {column.cards.map((card) => (
                <Card
                  key={card.id}
                  className="cursor-grab active:cursor-grabbing border-border/50 hover:border-primary/30 transition-colors group/card"
                  draggable
                  onDragStart={() => handleDragStart(card.id, column.id)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <input
                          className="font-medium text-sm w-full bg-transparent border-none outline-none truncate"
                          value={card.title}
                          onChange={(e) =>
                            handleUpdateCard(column.id, card.id, "title", e.target.value)
                          }
                          placeholder="Card title"
                        />
                        {card.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {card.description}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover/card:opacity-100 shrink-0"
                        onClick={() => handleDeleteCard(column.id, card.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Add Card */}
              {addingToColumn === column.id ? (
                <div className="space-y-2 p-2">
                  <Input
                    placeholder="Card title..."
                    value={newCardTitle}
                    onChange={(e) => setNewCardTitle(e.target.value)}
                    className="h-8 text-sm"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAddCard(column.id);
                      if (e.key === "Escape") {
                        setAddingToColumn(null);
                        setNewCardTitle("");
                      }
                    }}
                  />
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => handleAddCard(column.id)}
                    >
                      Add
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs"
                      onClick={() => {
                        setAddingToColumn(null);
                        setNewCardTitle("");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start gap-1.5 text-muted-foreground hover:text-foreground h-8"
                  onClick={() => setAddingToColumn(column.id)}
                >
                  <Plus className="h-3.5 w-3.5" /> Add Card
                </Button>
              )}
            </div>
          </div>
        ))}

        {/* Add Column */}
        <div className="shrink-0 w-72">
          <Button
            variant="outline"
            className="w-full h-full min-h-25 border-dashed gap-2 text-muted-foreground hover:text-foreground"
            onClick={handleAddColumn}
          >
            <Plus className="h-4 w-4" /> Add Column
          </Button>
        </div>
      </div>
    </div>
  );
}