// Todo List Pure Logic & Task Filtering

export type TodoPriority = "low" | "medium" | "high";

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  priority: TodoPriority;
  dueDate?: string; // YYYY-MM-DD
  category?: string;
  createdAt: number;
}

export function generateTodoId(): string {
  return `todo_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

export function isTodoOverdue(todo: TodoItem): boolean {
  if (todo.completed || !todo.dueDate) return false;
  const today = new Date().toISOString().split("T")[0];
  return todo.dueDate < today;
}

export function getTodoMetrics(todos: TodoItem[]): {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  percent: number;
} {
  const total = todos.length;
  const completed = todos.filter((t) => t.completed).length;
  const pending = total - completed;
  const overdue = todos.filter(isTodoOverdue).length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return { total, completed, pending, overdue, percent };
}

export function filterAndSortTodos(
  todos: TodoItem[],
  filter: "all" | "active" | "completed" | "overdue",
  priorityFilter?: TodoPriority | "all",
  sortBy: "date" | "priority" | "dueDate" = "date"
): TodoItem[] {
  let result = [...todos];

  if (filter === "active") result = result.filter((t) => !t.completed);
  if (filter === "completed") result = result.filter((t) => t.completed);
  if (filter === "overdue") result = result.filter(isTodoOverdue);

  if (priorityFilter && priorityFilter !== "all") {
    result = result.filter((t) => t.priority === priorityFilter);
  }

  const priorityWeight: Record<TodoPriority, number> = { high: 3, medium: 2, low: 1 };

  result.sort((a, b) => {
    if (sortBy === "priority") {
      return priorityWeight[b.priority] - priorityWeight[a.priority];
    }
    if (sortBy === "dueDate") {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.localeCompare(b.dueDate);
    }
    return b.createdAt - a.createdAt;
  });

  return result;
}

export function exportTodosCSV(todos: TodoItem[]): string {
  const rows = [
    `"Task","Status","Priority","Due Date","Created"`,
    ...todos.map(
      (t) =>
        `"${t.text.replace(/"/g, '""')}","${t.completed ? "Completed" : "Pending"}","${t.priority}","${t.dueDate || ""}","${new Date(t.createdAt).toISOString()}"`
    ),
  ];
  return rows.join("\n");
}
