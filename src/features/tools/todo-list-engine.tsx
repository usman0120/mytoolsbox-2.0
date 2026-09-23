"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  ListTodo, Plus, Trash2, Check, Circle, Download, Upload,
  Calendar, AlertCircle, Filter, ArrowUpDown, CheckCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  TodoItem,
  TodoPriority,
  generateTodoId,
  isTodoOverdue,
  getTodoMetrics,
  filterAndSortTodos,
  exportTodosCSV,
} from "@/features/tools/todo-list";

const STORAGE_KEY = "mytoolsbox-todo-list-v2";

const PRIORITY_BADGES: Record<TodoPriority, string> = {
  high: "bg-red-500/10 text-red-500 border-red-500/20",
  medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  low: "bg-blue-500/10 text-blue-500 border-blue-500/20",
};

export function TodoListEngine() {
  const [todos, setTodos] = useState<TodoItem[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [
        { id: "t1", text: "Complete project deliverables", completed: false, priority: "high", dueDate: new Date().toISOString().split("T")[0], createdAt: Date.now() },
        { id: "t2", text: "Team alignment meeting", completed: true, priority: "medium", createdAt: Date.now() - 3600000 },
        { id: "t3", text: "Read industry research paper", completed: false, priority: "low", createdAt: Date.now() - 7200000 },
      ];
    } catch {
      return [];
    }
  });

  const [newText, setNewText] = useState("");
  const [newPriority, setNewPriority] = useState<TodoPriority>("medium");
  const [newDueDate, setNewDueDate] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "completed" | "overdue">("all");
  const [sortBy, setSortBy] = useState<"date" | "priority" | "dueDate">("date");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }, [todos]);

  const handleAdd = () => {
    if (!newText.trim()) return;
    const item: TodoItem = {
      id: generateTodoId(),
      text: newText.trim(),
      completed: false,
      priority: newPriority,
      dueDate: newDueDate || undefined,
      createdAt: Date.now(),
    };
    setTodos((prev) => [item, ...prev]);
    setNewText("");
    setNewDueDate("");
    toast.success("Task added!");
  };

  const handleToggle = (id: string) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleDelete = (id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
    toast.success("Task deleted.");
  };

  const handleClearCompleted = () => {
    setTodos((prev) => prev.filter((t) => !t.completed));
    toast.success("Completed tasks cleared.");
  };

  const handleExportCSV = () => {
    const csv = exportTodosCSV(todos);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `todo-list-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Tasks exported as CSV!");
  };

  const metrics = getTodoMetrics(todos);
  const visibleTodos = filterAndSortTodos(todos, filter, "all", sortBy);

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ListTodo className="h-5 w-5 text-primary" /> Task & Todo Manager
          </h2>
          <p className="text-sm text-muted-foreground">Stay organized with priority sorting, due dates, and progress tracking</p>
        </div>
        <div className="flex items-center gap-2">
          {metrics.completed > 0 && (
            <Button variant="ghost" size="sm" onClick={handleClearCompleted} className="text-xs text-muted-foreground hover:text-destructive">
              Clear Completed
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={handleExportCSV} className="text-xs gap-1.5">
            <Download className="h-3.5 w-3.5" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Progress & Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <Card className="p-3 text-center">
          <p className="text-xl font-bold">{metrics.total}</p>
          <p className="text-[10px] text-muted-foreground">Total Tasks</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-xl font-bold text-green-500">{metrics.completed}</p>
          <p className="text-[10px] text-muted-foreground">Completed</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-xl font-bold text-blue-500">{metrics.pending}</p>
          <p className="text-[10px] text-muted-foreground">Pending</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-xl font-bold text-red-500">{metrics.overdue}</p>
          <p className="text-[10px] text-muted-foreground">Overdue</p>
        </Card>
      </div>

      {/* Completion Progress Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Overall Completion</span>
          <span className="font-mono font-medium">{metrics.percent}%</span>
        </div>
        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300 rounded-full"
            style={{ width: `${metrics.percent}%` }}
          />
        </div>
      </div>

      {/* Add Task Input Row */}
      <Card className="p-3">
        <div className="flex flex-wrap items-center gap-2">
          <Input
            placeholder="Add a new task or action item..."
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            className="h-9 text-xs flex-1 min-w-48"
          />
          <Select value={newPriority} onValueChange={(v) => setNewPriority(v as TodoPriority)}>
            <SelectTrigger className="w-28 h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low" className="text-xs">Low Priority</SelectItem>
              <SelectItem value="medium" className="text-xs">Medium</SelectItem>
              <SelectItem value="high" className="text-xs">High Priority</SelectItem>
            </SelectContent>
          </Select>
          <Input
            type="date"
            value={newDueDate}
            onChange={(e) => setNewDueDate(e.target.value)}
            className="w-36 h-9 text-xs"
            title="Due Date"
          />
          <Button onClick={handleAdd} size="sm" className="h-9 text-xs gap-1.5 px-4">
            <Plus className="h-4 w-4" /> Add Task
          </Button>
        </div>
      </Card>

      {/* Filter and Sort Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <div className="flex gap-1">
          {(["all", "active", "completed", "overdue"] as const).map((tab) => (
            <Button
              key={tab}
              variant={filter === tab ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(tab)}
              className="text-xs h-7 capitalize px-2.5"
            >
              {tab}
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
          <span className="text-muted-foreground text-[10px]">Sort:</span>
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as "date" | "priority" | "dueDate")}>
            <SelectTrigger className="w-28 h-7 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date" className="text-xs">Created Date</SelectItem>
              <SelectItem value="priority" className="text-xs">Priority</SelectItem>
              <SelectItem value="dueDate" className="text-xs">Due Date</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-1.5">
        {visibleTodos.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground border rounded-xl text-xs">
            No tasks found in this view.
          </div>
        ) : (
          visibleTodos.map((todo) => {
            const overdue = isTodoOverdue(todo);

            return (
              <div
                key={todo.id}
                className={`flex items-center justify-between p-3 rounded-lg border transition-colors text-xs ${
                  todo.completed
                    ? "bg-muted/30 border-border opacity-70"
                    : overdue
                    ? "bg-red-500/5 border-red-500/30"
                    : "bg-card border-border hover:border-primary/40"
                }`}
              >
                <div className="flex items-center gap-2.5 flex-1 min-w-0 pr-2">
                  <button
                    onClick={() => handleToggle(todo.id)}
                    className="text-muted-foreground hover:text-primary shrink-0 transition-colors"
                  >
                    {todo.completed ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Circle className="h-4 w-4" />
                    )}
                  </button>
                  <span
                    className={`truncate font-medium ${
                      todo.completed ? "line-through text-muted-foreground" : "text-foreground"
                    }`}
                  >
                    {todo.text}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {overdue && (
                    <Badge variant="destructive" className="text-[9px] gap-0.5 px-1 py-0">
                      <AlertCircle className="h-2.5 w-2.5" /> Overdue
                    </Badge>
                  )}
                  {todo.dueDate && (
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-mono">
                      <Calendar className="h-2.5 w-2.5" /> {todo.dueDate}
                    </span>
                  )}
                  <Badge variant="outline" className={`text-[9px] uppercase px-1.5 py-0 ${PRIORITY_BADGES[todo.priority]}`}>
                    {todo.priority}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(todo.id)}
                    className="h-6 w-6 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}