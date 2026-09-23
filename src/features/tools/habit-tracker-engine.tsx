"use client";

import { useState, useEffect, useCallback } from "react";
import {
  CheckCircle2, Plus, Trash2, Download, Flame, TrendingUp,
  Calendar, ChevronLeft, ChevronRight, BarChart3, Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import {
  Habit,
  HabitEntry,
  generateHabitId,
  calculateHabitStreak,
  getDaysOfWeek,
} from "@/features/tools/habit-tracker";

const HABITS_KEY = "mytoolsbox-habits-v2";
const ENTRIES_KEY = "mytoolsbox-habit-entries-v2";

const HABIT_COLORS = [
  "#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4",
  "#3b82f6", "#8b5cf6", "#ec4899",
];

const HABIT_EMOJIS = ["💪", "📚", "🏃", "💧", "🧘", "🎯", "✍️", "💤", "🥗", "💻"];

export function HabitTrackerEngine() {
  const [habits, setHabits] = useState<Habit[]>(() => {
    try {
      const raw = localStorage.getItem(HABITS_KEY);
      return raw ? JSON.parse(raw) : [
        { id: "h1", name: "Drink 2L Water", emoji: "💧", color: "#06b6d4", createdAt: Date.now() },
        { id: "h2", name: "Read 20 Pages", emoji: "📚", color: "#3b82f6", createdAt: Date.now() },
        { id: "h3", name: "Exercise 30 Mins", emoji: "🏃", color: "#22c55e", createdAt: Date.now() },
      ];
    } catch {
      return [];
    }
  });

  const [entries, setEntries] = useState<HabitEntry[]>(() => {
    try {
      const raw = localStorage.getItem(ENTRIES_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const [newHabitName, setNewHabitName] = useState("");
  const [newHabitEmoji, setNewHabitEmoji] = useState("🎯");
  const [newHabitColor, setNewHabitColor] = useState("#3b82f6");
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    localStorage.setItem(HABITS_KEY, JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
  }, [entries]);

  const referenceDate = new Date();
  referenceDate.setDate(referenceDate.getDate() + currentWeekOffset * 7);
  const weekDays = getDaysOfWeek(referenceDate);

  const isHabitDoneOn = (habitId: string, dateStr: string): boolean => {
    return entries.some((e) => e.habitId === habitId && e.date === dateStr && e.done);
  };

  const toggleHabit = (habitId: string, dateStr: string) => {
    setEntries((prev) => {
      const exists = prev.find((e) => e.habitId === habitId && e.date === dateStr);
      if (exists) {
        return prev.map((e) => (e.habitId === habitId && e.date === dateStr ? { ...e, done: !e.done } : e));
      }
      return [...prev, { habitId, date: dateStr, done: true }];
    });
  };

  const handleCreateHabit = () => {
    if (!newHabitName.trim()) {
      toast.error("Habit name is required.");
      return;
    }
    const newHabit: Habit = {
      id: generateHabitId(),
      name: newHabitName.trim(),
      emoji: newHabitEmoji,
      color: newHabitColor,
      createdAt: Date.now(),
    };
    setHabits((prev) => [...prev, newHabit]);
    setNewHabitName("");
    setShowAddForm(false);
    toast.success("New habit created!");
  };

  const handleDeleteHabit = (id: string) => {
    if (confirm("Delete this habit and all its history?")) {
      setHabits((prev) => prev.filter((h) => h.id !== id));
      setEntries((prev) => prev.filter((e) => e.habitId !== id));
      toast.success("Habit deleted.");
    }
  };

  const handleExportJSON = () => {
    const backup = { habits, entries, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `habits-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Habits backup exported!");
  };

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" /> Habit Tracker
          </h2>
          <p className="text-sm text-muted-foreground">Build consistency with visual weekly streaks and completion analytics</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setShowAddForm(!showAddForm)} size="sm" className="gap-1.5 text-xs">
            <Plus className="h-3.5 w-3.5" /> New Habit
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportJSON} className="gap-1.5 text-xs">
            <Download className="h-3.5 w-3.5" /> Export Data
          </Button>
        </div>
      </div>

      {/* New Habit Form */}
      {showAddForm && (
        <Card className="p-4 border-primary/40 bg-muted/20">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xl p-1 bg-background border rounded">{newHabitEmoji}</span>
              <Input
                placeholder="Habit title (e.g. Meditate for 10 minutes)..."
                value={newHabitName}
                onChange={(e) => setNewHabitName(e.target.value)}
                className="h-8 text-xs flex-1"
                autoFocus
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t">
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-muted-foreground mr-1">Icon:</span>
                {HABIT_EMOJIS.map((em) => (
                  <button
                    key={em}
                    onClick={() => setNewHabitEmoji(em)}
                    className={`h-7 w-7 text-sm rounded hover:bg-muted ${newHabitEmoji === em ? "bg-muted border border-primary" : ""}`}
                  >
                    {em}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-muted-foreground mr-1">Color:</span>
                {HABIT_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setNewHabitColor(c)}
                    className={`w-5 h-5 rounded-full border-2 transition-transform ${newHabitColor === c ? "scale-125 border-foreground" : "border-transparent"}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>

              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => setShowAddForm(false)} className="h-7 text-xs">
                  Cancel
                </Button>
                <Button size="sm" onClick={handleCreateHabit} className="h-7 text-xs">
                  Save Habit
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Week Navigation */}
      <div className="flex items-center justify-between text-xs px-1">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setCurrentWeekOffset((p) => p - 1)}>
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <span className="font-semibold text-muted-foreground">
            {weekDays[0].name} {weekDays[0].dateStr} — {weekDays[6].name} {weekDays[6].dateStr}
          </span>
          <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setCurrentWeekOffset((p) => p + 1)}>
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
        {currentWeekOffset !== 0 && (
          <Button variant="ghost" size="sm" onClick={() => setCurrentWeekOffset(0)} className="h-7 text-[10px]">
            Return to Today
          </Button>
        )}
      </div>

      {/* Weekly Grid */}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-xs text-left min-w-[560px]">
            <thead className="bg-muted/40 text-muted-foreground border-b">
              <tr>
                <th className="py-2.5 px-4 w-52">Habit</th>
                {weekDays.map((day) => (
                  <th key={day.dateStr} className={`py-2 px-2 text-center ${day.isToday ? "text-primary font-bold bg-primary/5" : ""}`}>
                    <div>{day.name}</div>
                    <div className="text-[10px] font-mono font-normal opacity-80">{day.dateStr.slice(8)}</div>
                  </th>
                ))}
                <th className="py-2 px-3 text-center w-28">Streak</th>
                <th className="py-2 px-2 text-right w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {habits.map((habit) => {
                const { currentStreak, longestStreak, completionRate30Days } = calculateHabitStreak(habit.id, entries);

                return (
                  <tr key={habit.id} className="hover:bg-muted/20 transition-colors">
                    <td className="py-3 px-4 font-medium">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{habit.emoji}</span>
                        <div>
                          <p className="truncate font-semibold">{habit.name}</p>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {completionRate30Days}% last 30d
                          </span>
                        </div>
                      </div>
                    </td>

                    {weekDays.map((day) => {
                      const done = isHabitDoneOn(habit.id, day.dateStr);

                      return (
                        <td key={day.dateStr} className={`py-3 px-2 text-center ${day.isToday ? "bg-primary/5" : ""}`}>
                          <button
                            onClick={() => toggleHabit(habit.id, day.dateStr)}
                            className={`h-7 w-7 rounded-lg inline-flex items-center justify-center transition-all ${
                              done
                                ? "text-white shadow-xs"
                                : "border border-border/70 hover:border-primary/50 text-transparent hover:text-muted-foreground"
                            }`}
                            style={{ backgroundColor: done ? habit.color : "transparent" }}
                          >
                            <Check className="h-4 w-4 stroke-[3]" />
                          </button>
                        </td>
                      );
                    })}

                    <td className="py-3 px-3 text-center">
                      <Badge variant="outline" className="gap-1 font-mono text-[10px]">
                        <Flame className="h-3 w-3 text-orange-400" />
                        {currentStreak}d
                      </Badge>
                    </td>

                    <td className="py-3 px-2 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteHabit(habit.id)}
                        className="h-6 w-6 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}