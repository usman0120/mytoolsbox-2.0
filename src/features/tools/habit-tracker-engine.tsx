"use client";

import { useState, useCallback, useEffect } from "react";
import {
  CheckCircle2, Plus, Trash2, Download, Flame, TrendingUp,
  Calendar, ChevronLeft, ChevronRight, BarChart3, Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

interface Habit {
  id: string;
  name: string;
  emoji: string;
  color: string;
  createdAt: number;
}

interface HabitEntry {
  date: string; // YYYY-MM-DD
  habitId: string;
  done: boolean;
}

const HABITS_KEY = "mytoolsbox-habits";
const ENTRIES_KEY = "mytoolsbox-habit-entries";

const HABIT_COLORS = [
  "#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4",
  "#3b82f6", "#8b5cf6", "#ec4899", "#78716c",
];

const HABIT_EMOJIS = ["💪", "📚", "🏃", "💧", "🧘", "🎯", "✍️", "💤", "🥗", "🚶", "🎨", "💻"];

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage(key: string, data: unknown) {
  localStorage.setItem(key, JSON.stringify(data));
}

function getDateString(date: Date): string {
  return date.toISOString().split("T")[0];
}

function getWeekDates(date: Date): string[] {
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Monday start
  const monday = new Date(date.setDate(diff));
  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates.push(getDateString(d));
  }
  return dates;
}

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function HabitTrackerEngine() {
  const [habits, setHabits] = useState<Habit[]>(() => loadFromStorage(HABITS_KEY, []));
  const [entries, setEntries] = useState<HabitEntry[]>(() => loadFromStorage(ENTRIES_KEY, []));
  const [newHabitName, setNewHabitName] = useState("");
  const [weekOffset, setWeekOffset] = useState(0);
  const [showAdd, setShowAdd] = useState(false);

  const today = new Date();
  today.setDate(today.getDate() + weekOffset * 7);
  const weekDates = getWeekDates(new Date(today));
  const todayStr = getDateString(new Date());

  useEffect(() => {
    saveToStorage(HABITS_KEY, habits);
  }, [habits]);

  useEffect(() => {
    saveToStorage(ENTRIES_KEY, entries);
  }, [entries]);

  const handleAddHabit = useCallback(() => {
    const name = newHabitName.trim();
    if (!name) return;
    if (habits.length >= 20) {
      toast.error("Maximum 20 habits allowed.");
      return;
    }
    const habit: Habit = {
      id: Date.now().toString(36),
      name,
      emoji: HABIT_EMOJIS[habits.length % HABIT_EMOJIS.length],
      color: HABIT_COLORS[habits.length % HABIT_COLORS.length],
      createdAt: Date.now(),
    };
    setHabits((prev) => [...prev, habit]);
    setNewHabitName("");
    setShowAdd(false);
    toast.success("Habit added!");
  }, [newHabitName, habits.length]);

  const handleToggle = useCallback((habitId: string, date: string) => {
    setEntries((prev) => {
      const existing = prev.find((e) => e.habitId === habitId && e.date === date);
      if (existing) {
        return prev.map((e) =>
          e.habitId === habitId && e.date === date ? { ...e, done: !e.done } : e
        );
      }
      return [...prev, { date, habitId, done: true }];
    });
  }, []);

  const handleDeleteHabit = useCallback((habitId: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== habitId));
    setEntries((prev) => prev.filter((e) => e.habitId !== habitId));
    toast.success("Habit removed.");
  }, []);

  const handleExport = () => {
    const rows = [["Habit", ...DAY_LABELS]];
    for (const habit of habits) {
      const row = [habit.name];
      for (const date of weekDates) {
        const entry = entries.find((e) => e.habitId === habit.id && e.date === date);
        row.push(entry?.done ? "✓" : "✗");
      }
      rows.push(row);
    }
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `habit-tracker-${weekDates[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported as CSV!");
  };

  const getStreak = (habitId: string): number => {
    let streak = 0;
    const d = new Date(today);
    while (true) {
      const dateStr = getDateString(d);
      const entry = entries.find((e) => e.habitId === habitId && e.date === dateStr);
      if (entry?.done) {
        streak++;
        d.setDate(d.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  };

  const getCompletionRate = (habitId: string): number => {
    const habitEntries = entries.filter((e) => e.habitId === habitId && e.done);
    if (habitEntries.length === 0) return 0;
    const firstEntry = habits.find((h) => h.id === habitId);
    if (!firstEntry) return 0;
    const daysSinceCreation = Math.max(
      1,
      Math.ceil((today.getTime() - firstEntry.createdAt) / (1000 * 60 * 60 * 24))
    );
    return Math.round((habitEntries.length / Math.min(daysSinceCreation, 30)) * 100);
  };

  const isCurrentWeek = weekOffset === 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setWeekOffset((w) => w - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium min-w-[140px] text-center">
            {weekDates[0]} – {weekDates[6]}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setWeekOffset((w) => Math.min(w + 1, 0))}
            disabled={isCurrentWeek}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          {!isCurrentWeek && (
            <Button variant="ghost" size="sm" onClick={() => setWeekOffset(0)}>
              Today
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExport} className="gap-1.5">
            <Download className="h-3.5 w-3.5" /> Export
          </Button>
          <Button size="sm" onClick={() => setShowAdd(!showAdd)} className="gap-1.5">
            <Plus className="h-3.5 w-3.5" /> Add Habit
          </Button>
        </div>
      </div>

      {/* Add habit form */}
      {showAdd && (
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-2">
              <Input
                placeholder="New habit name..."
                value={newHabitName}
                onChange={(e) => setNewHabitName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddHabit()}
                className="flex-1"
                autoFocus
              />
              <Button onClick={handleAddHabit} disabled={!newHabitName.trim()}>
                Add
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Habit grid */}
      {habits.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <CheckCircle2 className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No habits yet. Start tracking your daily habits!</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left text-xs font-medium text-muted-foreground pb-2 pr-4 min-w-30">
                  Habit
                </th>
                {DAY_LABELS.map((day, i) => (
                  <th
                    key={day}
                    className={`text-center text-xs font-medium pb-2 px-1 w-10 ${
                      weekDates[i] === todayStr ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    <div>{day}</div>
                    <div className="text-[10px]">{weekDates[i].slice(5)}</div>
                  </th>
                ))}
                <th className="text-center text-xs font-medium text-muted-foreground pb-2 pl-4 w-16">
                  Streak
                </th>
                <th className="w-8"></th>
              </tr>
            </thead>
            <tbody>
              {habits.map((habit) => {
                const streak = getStreak(habit.id);
                return (
                  <tr key={habit.id} className="group">
                    <td className="py-2 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{habit.emoji}</span>
                        <span className="text-sm font-medium truncate max-w-25">
                          {habit.name}
                        </span>
                      </div>
                    </td>
                    {weekDates.map((date) => {
                      const entry = entries.find(
                        (e) => e.habitId === habit.id && e.date === date
                      );
                      const isToday = date === todayStr;
                      return (
                        <td key={date} className="text-center px-1 py-2">
                          <button
                            onClick={() => handleToggle(habit.id, date)}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all text-xs ${
                              entry?.done
                                ? "text-white shadow-sm"
                                : "bg-muted/50 hover:bg-muted text-muted-foreground"
                            } ${isToday ? "ring-2 ring-primary/30" : ""}`}
                            style={
                              entry?.done
                                ? { backgroundColor: habit.color }
                                : undefined
                            }
                          >
                            {entry?.done ? "✓" : ""}
                          </button>
                        </td>
                      );
                    })}
                    <td className="text-center pl-4 py-2">
                      <Badge
                        variant="secondary"
                        className={`gap-1 text-xs ${
                          streak >= 7 ? "text-orange-500" : ""
                        }`}
                      >
                        {streak >= 7 && <Flame className="h-3 w-3" />}
                        {streak}
                      </Badge>
                    </td>
                    <td className="py-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 opacity-0 group-hover:opacity-100"
                        onClick={() => handleDeleteHabit(habit.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Stats */}
      {habits.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold">{habits.length}</p>
              <p className="text-xs text-muted-foreground">Habits</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold">
                {habits.reduce((max, h) => Math.max(max, getStreak(h.id)), 0)}
              </p>
              <p className="text-xs text-muted-foreground">Best Streak</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold">
                {entries.filter((e) => e.done && weekDates.includes(e.date)).length}
              </p>
              <p className="text-xs text-muted-foreground">This Week</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold">
                {habits.length > 0
                  ? Math.round(
                      (habits.reduce((sum, h) => sum + getCompletionRate(h.id), 0) /
                        habits.length)
                    )
                  : 0}
                %
              </p>
              <p className="text-xs text-muted-foreground">Avg Rate</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}