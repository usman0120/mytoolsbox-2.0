"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus, Trash2, GripVertical, Download, Upload, Search, Filter,
  ArrowRight, ArrowLeft, Tag, Calendar, AlertCircle, LayoutGrid
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  KanbanBoard,
  KanbanColumn,
  KanbanCard,
  CardPriority,
  DEFAULT_COLUMNS,
  generateCardId,
  generateColumnId,
  moveCard,
  isWipLimitExceeded,
  filterCards,
  exportBoardToCSV,
} from "@/features/tools/kanban-board";

const STORAGE_KEY = "mytoolsbox-kanban-board";

const PRIORITY_COLORS: Record<CardPriority, string> = {
  low: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  high: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  urgent: "bg-red-500/10 text-red-500 border-red-500/20",
};

export function KanbanBoardEngine() {
  const [board, setBoard] = useState<KanbanBoard>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : { columns: DEFAULT_COLUMNS };
    } catch {
      return { columns: DEFAULT_COLUMNS };
    }
  });

  const [addingToCol, setAddingToCol] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPriority, setNewPriority] = useState<CardPriority>("medium");
  const [newDueDate, setNewDueDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<CardPriority | "all">("all");
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null);
  const [draggedSourceCol, setDraggedSourceCol] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(board));
  }, [board]);

  const handleCreateCard = (colId: string) => {
    if (!newTitle.trim()) {
      toast.error("Card title is required.");
      return;
    }

    const newCard: KanbanCard = {
      id: generateCardId(),
      title: newTitle.trim(),
      description: newDesc.trim(),
      priority: newPriority,
      dueDate: newDueDate || undefined,
      createdAt: Date.now(),
    };

    setBoard((prev) => ({
      columns: prev.columns.map((col) =>
        col.id === colId ? { ...col, cards: [...col.cards, newCard] } : col
      ),
    }));

    setNewTitle("");
    setNewDesc("");
    setNewDueDate("");
    setAddingToCol(null);
    toast.success("Card added!");
  };

  const handleDeleteCard = (colId: string, cardId: string) => {
    setBoard((prev) => ({
      columns: prev.columns.map((col) =>
        col.id === colId ? { ...col, cards: col.cards.filter((c) => c.id !== cardId) } : col
      ),
    }));
    toast.success("Card deleted.");
  };

  const handleMoveCard = (cardId: string, sourceColId: string, targetColId: string) => {
    setBoard((prev) => moveCard(prev, cardId, sourceColId, targetColId));
  };

  const handleAddColumn = () => {
    const title = prompt("Enter column title:");
    if (!title?.trim()) return;
    const newCol: KanbanColumn = {
      id: generateColumnId(title),
      title: title.trim(),
      wipLimit: 6,
      cards: [],
    };
    setBoard((prev) => ({ columns: [...prev.columns, newCol] }));
    toast.success(`Column "${title}" created!`);
  };

  const handleDeleteColumn = (colId: string) => {
    if (board.columns.length <= 1) {
      toast.error("You must have at least one column.");
      return;
    }
    if (confirm("Delete this column and all its cards?")) {
      setBoard((prev) => ({ columns: prev.columns.filter((c) => c.id !== colId) }));
    }
  };

  const handleExportCSV = () => {
    const csv = exportBoardToCSV(board);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kanban-board-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Board exported as CSV!");
  };

  const handleExportJSON = () => {
    const json = JSON.stringify(board, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kanban-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Board JSON backup downloaded!");
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        if (parsed.columns && Array.isArray(parsed.columns)) {
          setBoard(parsed);
          toast.success("Board imported successfully!");
        } else {
          toast.error("Invalid board format.");
        }
      } catch {
        toast.error("Failed to parse JSON file.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <LayoutGrid className="h-5 w-5 text-primary" /> Kanban Board
          </h2>
          <p className="text-sm text-muted-foreground">Manage tasks visually with custom columns, priorities, and WIP limits</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleAddColumn} className="text-xs">
            <Plus className="h-3.5 w-3.5 mr-1" /> Add Column
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportCSV} className="text-xs">
            <Download className="h-3.5 w-3.5 mr-1" /> CSV
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportJSON} className="text-xs">
            <Download className="h-3.5 w-3.5 mr-1" /> Backup
          </Button>
          <label className="cursor-pointer inline-flex items-center gap-1 h-8 px-3 text-xs rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground">
            <Upload className="h-3 w-3" /> Restore
            <input type="file" accept=".json" className="hidden" onChange={handleImportJSON} />
          </label>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search cards by title, description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-xs"
          />
        </div>
        <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v as CardPriority | "all")}>
          <SelectTrigger className="w-36 h-8 text-xs">
            <SelectValue placeholder="Priority Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-xs">All Priorities</SelectItem>
            <SelectItem value="urgent" className="text-xs">Urgent Only</SelectItem>
            <SelectItem value="high" className="text-xs">High Only</SelectItem>
            <SelectItem value="medium" className="text-xs">Medium Only</SelectItem>
            <SelectItem value="low" className="text-xs">Low Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Kanban Columns Grid */}
      <div className="flex gap-4 overflow-x-auto pb-4 items-start">
        {board.columns.map((column, colIdx) => {
          const visibleCards = filterCards(
            column.cards,
            searchQuery,
            priorityFilter === "all" ? undefined : priorityFilter
          );
          const isOverWip = isWipLimitExceeded(column);

          return (
            <div
              key={column.id}
              className={`w-72 shrink-0 bg-muted/40 rounded-xl p-3 border ${
                isOverWip ? "border-red-500/50 bg-red-500/5" : "border-border"
              }`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (draggedCardId && draggedSourceCol && draggedSourceCol !== column.id) {
                  handleMoveCard(draggedCardId, draggedSourceCol, column.id);
                  setDraggedCardId(null);
                  setDraggedSourceCol(null);
                }
              }}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-semibold text-xs text-foreground uppercase tracking-wider">{column.title}</h3>
                  <Badge variant="secondary" className="text-[10px] h-4 px-1.5 font-mono">
                    {column.cards.length}
                    {column.wipLimit ? `/${column.wipLimit}` : ""}
                  </Badge>
                  {isOverWip && (
                    <span title="WIP Limit Exceeded">
                      <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-primary"
                    onClick={() => setAddingToCol(column.id)}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDeleteColumn(column.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Add Card Form inline */}
              {addingToCol === column.id && (
                <Card className="mb-3 border-primary/50 shadow-sm">
                  <CardContent className="p-3 space-y-2 text-xs">
                    <Input
                      placeholder="Card Title..."
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="h-7 text-xs"
                      autoFocus
                    />
                    <Textarea
                      placeholder="Optional notes / details..."
                      rows={2}
                      value={newDesc}
                      onChange={(e) => setNewDesc(e.target.value)}
                      className="text-xs resize-none"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <Select value={newPriority} onValueChange={(v) => setNewPriority(v as CardPriority)}>
                        <SelectTrigger className="h-7 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low" className="text-xs">Low</SelectItem>
                          <SelectItem value="medium" className="text-xs">Medium</SelectItem>
                          <SelectItem value="high" className="text-xs">High</SelectItem>
                          <SelectItem value="urgent" className="text-xs">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        type="date"
                        value={newDueDate}
                        onChange={(e) => setNewDueDate(e.target.value)}
                        className="h-7 text-xs"
                      />
                    </div>
                    <div className="flex gap-2 justify-end pt-1">
                      <Button variant="ghost" size="sm" onClick={() => setAddingToCol(null)} className="h-6 text-[10px]">
                        Cancel
                      </Button>
                      <Button size="sm" onClick={() => handleCreateCard(column.id)} className="h-6 text-[10px]">
                        Save Card
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Cards List */}
              <div className="space-y-2 min-h-24">
                {visibleCards.map((card) => (
                  <Card
                    key={card.id}
                    draggable
                    onDragStart={() => {
                      setDraggedCardId(card.id);
                      setDraggedSourceCol(column.id);
                    }}
                    className="p-3 bg-card hover:border-primary/50 transition-colors shadow-xs cursor-grab active:cursor-grabbing text-xs space-y-2"
                  >
                    <div className="flex items-start justify-between gap-1">
                      <p className="font-medium text-xs leading-snug">{card.title}</p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 text-muted-foreground hover:text-destructive shrink-0"
                        onClick={() => handleDeleteCard(column.id, card.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>

                    {card.description && (
                      <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                        {card.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-1 pt-1 border-t border-border/40">
                      <div className="flex items-center gap-1">
                        {card.priority && (
                          <Badge variant="outline" className={`text-[9px] uppercase px-1 py-0 ${PRIORITY_COLORS[card.priority]}`}>
                            {card.priority}
                          </Badge>
                        )}
                        {card.dueDate && (
                          <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                            <Calendar className="h-2.5 w-2.5" /> {card.dueDate}
                          </span>
                        )}
                      </div>

                      {/* Quick Move Buttons */}
                      <div className="flex gap-0.5">
                        {colIdx > 0 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 text-muted-foreground"
                            title="Move Left"
                            onClick={() => handleMoveCard(card.id, column.id, board.columns[colIdx - 1].id)}
                          >
                            <ArrowLeft className="h-2.5 w-2.5" />
                          </Button>
                        )}
                        {colIdx < board.columns.length - 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 text-muted-foreground"
                            title="Move Right"
                            onClick={() => handleMoveCard(card.id, column.id, board.columns[colIdx + 1].id)}
                          >
                            <ArrowRight className="h-2.5 w-2.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}