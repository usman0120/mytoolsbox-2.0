"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  ListTodo, Plus, Trash2, Check, Circle, GripVertical,
  Download, Copy, Edit3, X, Calendar, Clock, Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
  priority: "low" | "medium" | "high";
  dueDate?: string;
}

const STORAGE_KEY = "mytoolsbox-todo-list";

function loadTodos(): TodoItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveTodos(todos: TodoItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

export function TodoListEngine() {
  const [todos, setTodos] = useState<TodoItem[]>(() => loadTodos());
  const [newTodo, setNewTodo] = useState("");
  const [priority, setPriority] = useState<TodoItem["priority"]>("medium");
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [dragId, setDragId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    saveTodos(todos);
  }, [todos]);

  const handleAdd = useCallback(() => {
    const text = newTodo.trim();
    if (!text) return;
    const todo: TodoItem = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      text,
      completed: false,
      createdAt: Date.now(),
      priority,
    };
    setTodos((prev) => [todo, ...prev]);
    setNewTodo("");
    setPriority("medium");
    inputRef.current?.focus();
    toast.success("Task added!");
  }, [newTodo, priority]);

  const handleToggle = useCallback((id: string) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  }, []);

  const handleDelete = useCallback((id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
    toast.success("Task deleted.");
  }, []);

  const handleEdit = useCallback((id: string, text: string) => {
    setEditingId(id);
    setEditText(text);
  }, []);

  const handleSaveEdit = useCallback(() => {
    if (!editingId) return;
    const text = editText.trim();
    if (!text) {
      handleDelete(editingId);
    } else {
      setTodos((prev) =>
        prev.map((t) => (t.id === editingId ? { ...t, text } : t))
      );
    }
    setEditingId(null);
    setEditText("");
  }, [editingId, editText, handleDelete]);

  const handleClearCompleted = useCallback(() => {
    setTodos((prev) => prev.filter((t) => !t.completed));
    toast.success("Cleared completed tasks.");
  }, []);

  const handleExport = useCallback(() => {
    const text = todos
      .map((t) => `${t.completed ? "[x]" : "[ ]"} ${t.text} ${t.priority !== "medium" ? `[${t.priority}]` : ""}`)
      .join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `todo-list-${new Date().toISOString().split("T")[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded!");
  }, [todos]);

  const handleDragStart = (id: string) => setDragId(id);
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (targetId: string) => {
    if (!dragId || dragId === targetId) return;
    setTodos((prev) => {
      const items = [...prev];
      const dragIdx = items.findIndex((t) => t.id === dragId);
      const targetIdx = items.findIndex((t) => t.id === targetId);
      if (dragIdx === -1 || targetIdx === -1) return prev;
      const [removed] = items.splice(dragIdx, 1);
      items.splice(targetIdx, 0, removed);
      return items;
    });
    setDragId(null);
  };

  const filteredTodos = todos.filter((t) => {
    if (filter === "active") return !t.completed;
    if (filter === "completed") return t.completed;
    return true;
  });

  const completedCount = todos.filter((t) => t.completed).length;
  const activeCount = todos.filter((t) => !t.completed).length;

  const priorityColor = (p: TodoItem["priority"]) => {
    switch (p) {
      case "high": return "text-red-500 bg-red-500/10";
      case "medium": return "text-amber-500 bg-amber-500/10";
      case "low": return "text-green-500 bg-green-500/10";
    }
  };

  return (
    <div className="space-y-4">
      {/* Add new todo */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              placeholder="Add a new task..."
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              className="flex-1"
            />
            <Button onClick={handleAdd} size="sm" className="gap-1.5" disabled={!newTodo.trim()}>
              <Plus className="h-4 w-4" /> Add
            </Button>
          </div>
          <div className="flex gap-2">
            {(["low", "medium", "high"] as const).map((p) => (
              <Button
                key={p}
                variant={priority === p ? "default" : "outline"}
                size="sm"
                onClick={() => setPriority(p)}
                className="text-xs h-7 capitalize"
              >
                {p}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stats & filters */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-2">
          <Badge variant="secondary">{activeCount} active</Badge>
          <Badge variant="secondary">{completedCount} done</Badge>
        </div>
        <div className="flex gap-1">
          {(["all", "active", "completed"] as const).map((f) => (
            <Button
              key={f}
              variant={filter === f ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilter(f)}
              className="text-xs h-7 capitalize"
            >
              {f}
            </Button>
          ))}
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={handleExport} className="gap-1 h-7">
            <Download className="h-3.5 w-3.5" /> Export
          </Button>
          {completedCount > 0 && (
            <Button variant="ghost" size="sm" onClick={handleClearCompleted} className="gap-1 h-7 text-destructive">
              <Trash2 className="h-3.5 w-3.5" /> Clear Done
            </Button>
          )}
        </div>
      </div>

      {/* Todo list */}
      <div className="space-y-1">
        {filteredTodos.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <ListTodo className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">
              {filter === "all" ? "No tasks yet. Add one above!" : filter === "active" ? "No active tasks." : "No completed tasks."}
            </p>
          </div>
        ) : (
          filteredTodos.map((todo) => (
            <div
              key={todo.id}
              draggable
              onDragStart={() => handleDragStart(todo.id)}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(todo.id)}
              className={`flex items-center gap-2 p-3 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors group ${
                todo.completed ? "opacity-60" : ""
              } ${dragId === todo.id ? "opacity-50" : ""}`}
            >
              <GripVertical className="h-4 w-4 text-muted-foreground/40 cursor-grab shrink-0" />
              <button
                onClick={() => handleToggle(todo.id)}
                className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                  todo.completed
                    ? "bg-primary border-primary text-primary-foreground"
                    : "border-muted-foreground/30 hover:border-primary/50"
                }`}
              >
                {todo.completed && <Check className="h-3 w-3" />}
              </button>

              {editingId === todo.id ? (
                <div className="flex-1 flex gap-2">
                  <Input
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveEdit();
                      if (e.key === "Escape") { setEditingId(null); setEditText(""); }
                    }}
                    className="h-8 text-sm"
                    autoFocus
                  />
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleSaveEdit}>
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => { setEditingId(null); setEditText(""); }}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <span
                    className={`flex-1 text-sm ${todo.completed ? "line-through text-muted-foreground" : ""}`}
                    onDoubleClick={() => handleEdit(todo.id, todo.text)}
                  >
                    {todo.text}
                  </span>
                  <Badge className={`text-[10px] h-5 px-1.5 ${priorityColor(todo.priority)}`}>
                    {todo.priority}
                  </Badge>
                  <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleEdit(todo.id, todo.text)}
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive"
                      onClick={() => handleDelete(todo.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}