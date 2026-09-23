"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import {
  CheckCircle2,
  Plus,
  Trash2,
  Flame,
  Calendar,
  TrendingUp,
  Target,
  BarChart3,
  Clock,
  Trophy,
  Award,
  Sparkles,
  Download,
  Upload,
  RefreshCw,
  Zap,
  Check,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export interface Habit {
  id: string;
  name: string;
  description: string;
  category: string;
  color: string;
  targetPerWeek: number;
  createdAt: string;
  completions: Record<string, boolean>; // YYYY-MM-DD -> boolean
  streak: number;
  bestStreak: number;
}

const CATEGORIES = [
  "Health & Fitness",
  "Deep Work & Career",
  "Learning & Growth",
  "Mindfulness & Mental Health",
  "Finances & Wealth",
  "Creative & Hobbies",
];

const HABIT_COLORS = [
  "#10b981", // emerald
  "#3b82f6", // blue
  "#8b5cf6", // purple
  "#f59e0b", // amber
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#f97316", // orange
];

const PRESET_STACKS: Record<string, { label: string; habits: Omit<Habit, "id" | "completions" | "streak" | "bestStreak" | "createdAt">[] }> = {
  morning: {
    label: "Morning Titan Stack",
    habits: [
      { name: "Hydrate (500ml Water + Electrolytes)", description: "Kickstart metabolism immediately upon waking", category: "Health & Fitness", color: "#06b6d4", targetPerWeek: 7 },
      { name: "Morning Sunlight & 15m Walk", description: "Set circadian rhythm with outdoor natural light", category: "Health & Fitness", color: "#f59e0b", targetPerWeek: 7 },
      { name: "Cold Shower / Contrast Wash", description: "Dopamine & alertness boost", category: "Health & Fitness", color: "#3b82f6", targetPerWeek: 5 },
      { name: "Read 15 Pages of High-Value Book", description: "Continuous learning before checking phone", category: "Learning & Growth", color: "#8b5cf6", targetPerWeek: 6 },
    ],
  },
  deep_work: {
    label: "Deep Work & Focus Stack",
    habits: [
      { name: "90-Minute Uninterrupted Work Block", description: "Zero notifications, single task focus", category: "Deep Work & Career", color: "#3b82f6", targetPerWeek: 5 },
      { name: "Zero Social Media Before Noon", description: "Preserve morning cognitive bandwidth", category: "Deep Work & Career", color: "#ec4899", targetPerWeek: 6 },
      { name: "Inbox Zero & Daily Closeout", description: "Process emails and plan tomorrow's top 3 tasks", category: "Deep Work & Career", color: "#10b981", targetPerWeek: 5 },
      { name: "Code / Build Something New", description: "Consistent engineering shipping cadence", category: "Deep Work & Career", color: "#8b5cf6", targetPerWeek: 5 },
    ],
  },
  athlete: {
    label: "Athletic Vitality Stack",
    habits: [
      { name: "10,000 Daily Steps", description: "Baseline non-exercise activity thermogenesis", category: "Health & Fitness", color: "#10b981", targetPerWeek: 7 },
      { name: "Hypertrophy / Resistance Training", description: "Progressive overload weightlifting session", category: "Health & Fitness", color: "#f97316", targetPerWeek: 4 },
      { name: "150g Protein Target Hit", description: "Adequate amino acids for muscle recovery", category: "Health & Fitness", color: "#3b82f6", targetPerWeek: 7 },
      { name: "8 Hours Quality Sleep", description: "Restorative sleep with cold dark bedroom", category: "Health & Fitness", color: "#8b5cf6", targetPerWeek: 7 },
    ],
  },
  mindfulness: {
    label: "Mindful Living Stack",
    habits: [
      { name: "10m Breathwork & Meditation", description: "Calm nervous system with physiological sighs", category: "Mindfulness & Mental Health", color: "#06b6d4", targetPerWeek: 7 },
      { name: "3-Item Gratitude Journal", description: "Cultivate positive perspective & groundedness", category: "Mindfulness & Mental Health", color: "#f59e0b", targetPerWeek: 7 },
      { name: "Evening Digital Sunset at 9 PM", description: "Turn off screens 60m before sleeping", category: "Mindfulness & Mental Health", color: "#8b5cf6", targetPerWeek: 6 },
    ],
  },
};

const STORAGE_KEY = "mytoolsbox-habit-tracker-v2";

function formatDateKey(d: Date): string {
  return d.toISOString().split("T")[0];
}

function calculateStreaks(completions: Record<string, boolean>): { streak: number; bestStreak: number } {
  const dates = Object.keys(completions)
    .filter((k) => completions[k])
    .sort();

  if (dates.length === 0) return { streak: 0, bestStreak: 0 };

  const todayStr = formatDateKey(new Date());
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = formatDateKey(yesterday);

  // Check current streak starting from today or yesterday
  let current = 0;
  const cursor = new Date();
  // If not completed today, check if yesterday was completed
  if (!completions[todayStr]) {
    if (completions[yesterdayStr]) {
      cursor.setDate(cursor.getDate() - 1);
    } else {
      // Streak broken
      current = 0;
    }
  }

  if (completions[formatDateKey(cursor)]) {
    while (true) {
      const key = formatDateKey(cursor);
      if (completions[key]) {
        current++;
        cursor.setDate(cursor.getDate() - 1);
      } else {
        break;
      }
    }
  }

  // Calculate best all-time streak
  let best = 0;
  let temp = 0;
  const dateSet = new Set(dates);

  // Scan across sorted dates
  const startDate = new Date(dates[0]);
  const endDate = new Date(dates[dates.length - 1]);
  const scan = new Date(startDate);

  while (scan <= endDate) {
    const k = formatDateKey(scan);
    if (dateSet.has(k)) {
      temp++;
      if (temp > best) best = temp;
    } else {
      temp = 0;
    }
    scan.setDate(scan.getDate() + 1);
  }

  return { streak: current, bestStreak: Math.max(best, current) };
}

export function HabitTrackerEngine() {
  const [habits, setHabits] = useState<Habit[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return JSON.parse(raw);
      } catch {
        // Fall back
      }
    }
    // Generate initial morning stack with some mock completions for visual glory
    const initialDate = new Date();
    const mockCompletions1: Record<string, boolean> = {};
    const mockCompletions2: Record<string, boolean> = {};
    for (let i = 0; i < 18; i++) {
      const d = new Date(initialDate);
      d.setDate(d.getDate() - i);
      if (i !== 3 && i !== 11) mockCompletions1[formatDateKey(d)] = true;
      if (i % 3 !== 0) mockCompletions2[formatDateKey(d)] = true;
    }

    return [
      {
        id: "h1",
        name: "Morning Sunlight & 15m Walk",
        description: "Circadian rhythm alignment with outdoor photons",
        category: "Health & Fitness",
        color: "#f59e0b",
        targetPerWeek: 7,
        createdAt: "2026-09-01",
        completions: mockCompletions1,
        ...calculateStreaks(mockCompletions1),
      },
      {
        id: "h2",
        name: "90-Minute Deep Work Sprint",
        description: "Zero notifications, building core product",
        category: "Deep Work & Career",
        color: "#3b82f6",
        targetPerWeek: 5,
        createdAt: "2026-09-01",
        completions: mockCompletions2,
        ...calculateStreaks(mockCompletions2),
      },
    ];
  });

  const [newHabitName, setNewHabitName] = useState("");
  const [newHabitDesc, setNewHabitDesc] = useState("");
  const [newCategory, setNewCategory] = useState(CATEGORIES[0]);
  const [newColor, setNewColor] = useState(HABIT_COLORS[0]);
  const [newTarget, setNewTarget] = useState(7);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);

  // Save to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
    }
  }, [habits]);

  // Generate last 30 calendar days for the heatmap
  const calendarDays = useMemo(() => {
    const list: { date: Date; dateStr: string; dayNum: number; isToday: boolean }[] = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      list.push({
        date: d,
        dateStr: formatDateKey(d),
        dayNum: d.getDate(),
        isToday: i === 0,
      });
    }
    return list;
  }, []);

  // Consistency & Velocity score
  const overallStats = useMemo(() => {
    if (habits.length === 0) return { totalHabits: 0, todayCompleted: 0, consistencyPct: 0, maxStreak: 0 };

    const todayStr = formatDateKey(new Date());
    const todayCompleted = habits.filter((h) => h.completions[todayStr]).length;

    // Check last 7 days completion rate
    let totalChecksPossible = habits.length * 7;
    let totalChecksMade = 0;
    const last7Days = calendarDays.slice(-7);

    habits.forEach((h) => {
      last7Days.forEach((day) => {
        if (h.completions[day.dateStr]) totalChecksMade++;
      });
    });

    const consistencyPct = totalChecksPossible > 0 ? (totalChecksMade / totalChecksPossible) * 100 : 0;
    const maxStreak = Math.max(...habits.map((h) => h.streak), 0);

    return {
      totalHabits: habits.length,
      todayCompleted,
      consistencyPct,
      maxStreak,
    };
  }, [habits, calendarDays]);

  // Toggle habit on specific date
  const toggleDate = useCallback((habitId: string, dateStr: string) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id !== habitId) return h;
        const current = !!h.completions[dateStr];
        const newCompletions = { ...h.completions, [dateStr]: !current };
        if (current) delete newCompletions[dateStr];
        const streaks = calculateStreaks(newCompletions);
        return {
          ...h,
          completions: newCompletions,
          ...streaks,
        };
      })
    );
  }, []);

  // Add new custom habit
  const addHabit = useCallback(() => {
    if (!newHabitName.trim()) {
      toast.error("Please enter a habit name.");
      return;
    }

    const newH: Habit = {
      id: `habit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: newHabitName.trim(),
      description: newHabitDesc.trim() || "Daily atomic habit",
      category: newCategory,
      color: newColor,
      targetPerWeek: newTarget,
      createdAt: formatDateKey(new Date()),
      completions: {},
      streak: 0,
      bestStreak: 0,
    };

    setHabits((prev) => [newH, ...prev]);
    setNewHabitName("");
    setNewHabitDesc("");
    toast.success(`Created habit: ${newH.name}`);
  }, [newHabitName, newHabitDesc, newCategory, newColor, newTarget]);

  // Load preset stack
  const loadStack = useCallback((key: string) => {
    const stack = PRESET_STACKS[key];
    if (!stack) return;

    const newItems: Habit[] = stack.habits.map((h, i) => ({
      id: `habit-${Date.now()}-${i}`,
      name: h.name,
      description: h.description,
      category: h.category,
      color: h.color,
      targetPerWeek: h.targetPerWeek,
      createdAt: formatDateKey(new Date()),
      completions: {},
      streak: 0,
      bestStreak: 0,
    }));

    setHabits((prev) => [...newItems, ...prev]);
    toast.success(`Added ${stack.habits.length} habits from ${stack.label}!`);
  }, []);

  const removeHabit = useCallback((id: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
    toast.info("Habit removed");
  }, []);

  // Export JSON backup
  const exportBackup = useCallback(() => {
    const blob = new Blob([JSON.stringify(habits, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `habits-backup-${formatDateKey(new Date())}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Habits backup exported!");
  }, [habits]);

  // Filtered habits
  const filteredHabits = useMemo(() => {
    if (!selectedFilter) return habits;
    return habits.filter((h) => h.category === selectedFilter);
  }, [habits, selectedFilter]);

  return (
    <div className="space-y-6">
      {/* Top Command Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl border bg-card/60 backdrop-blur-sm shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400">
            <Flame className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold tracking-tight">Atomic Habit & Streak Command Center</h2>
              <Badge variant="outline" className="text-[10px] uppercase font-semibold text-orange-600 border-orange-500/30">
                Heatmap Grid
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Track consistency across 30-day matrices, maintain streaks, and load proven habit stacks.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Select onValueChange={(v: any) => v && loadStack(String(v))}>
            <SelectTrigger className="h-8 w-44 text-xs font-medium">
              <Sparkles className="h-3.5 w-3.5 mr-1 text-orange-500" />
              <span>Load Habit Stack</span>
            </SelectTrigger>
            <SelectContent>
              {Object.entries(PRESET_STACKS).map(([k, s]) => (
                <SelectItem key={k} value={k} className="text-xs">
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" onClick={exportBackup} className="h-8 text-xs gap-1.5">
            <Download className="h-3.5 w-3.5 text-muted-foreground" />
            Backup JSON
          </Button>
        </div>
      </div>

      {/* Analytics & Milestone Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Completed */}
        <Card className="border-border/60 shadow-xs">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Today's Execution</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-bold tracking-tight text-foreground">
              {overallStats.todayCompleted}{" "}
              <span className="text-sm font-normal text-muted-foreground">/ {overallStats.totalHabits}</span>
            </p>
            <p className="text-[11px] text-muted-foreground">
              {overallStats.todayCompleted === overallStats.totalHabits && overallStats.totalHabits > 0
                ? "🎉 All daily habits executed today!"
                : "Keep the momentum going today"}
            </p>
          </CardContent>
        </Card>

        {/* 7-Day Consistency Rate */}
        <Card className="border-border/60 shadow-xs">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">7-Day Velocity</span>
              <TrendingUp className="h-4 w-4 text-blue-500" />
            </div>
            <p className="text-2xl font-bold tracking-tight text-blue-600 dark:text-blue-400">
              {overallStats.consistencyPct.toFixed(0)}%
            </p>
            <p className="text-[11px] text-muted-foreground">Rolling weekly completion consistency</p>
          </CardContent>
        </Card>

        {/* Longest Active Streak */}
        <Card className="border-border/60 shadow-xs">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Top Active Streak</span>
              <Flame className="h-4 w-4 text-orange-500" />
            </div>
            <p className="text-2xl font-bold tracking-tight text-orange-600 dark:text-orange-400">
              {overallStats.maxStreak} <span className="text-sm font-normal text-muted-foreground">Days</span>
            </p>
            <p className="text-[11px] text-muted-foreground">Unbroken consecutive chain</p>
          </CardContent>
        </Card>

        {/* Milestone Badges */}
        <Card className="border-border/60 shadow-xs">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Milestone Status</span>
              <Trophy className="h-4 w-4 text-amber-500" />
            </div>
            <div className="flex items-center gap-1.5 pt-1">
              <span
                className={`p-1 rounded-md text-[10px] font-semibold border ${
                  overallStats.maxStreak >= 7 ? "bg-amber-500/10 text-amber-600 border-amber-500/30" : "bg-muted text-muted-foreground border-transparent"
                }`}
                title="7-Day Ignition"
              >
                7D
              </span>
              <span
                className={`p-1 rounded-md text-[10px] font-semibold border ${
                  overallStats.maxStreak >= 21 ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30" : "bg-muted text-muted-foreground border-transparent"
                }`}
                title="21-Day Habit Formed"
              >
                21D
              </span>
              <span
                className={`p-1 rounded-md text-[10px] font-semibold border ${
                  overallStats.maxStreak >= 30 ? "bg-blue-500/10 text-blue-600 border-blue-500/30" : "bg-muted text-muted-foreground border-transparent"
                }`}
                title="30-Day Master"
              >
                30D
              </span>
              <span
                className={`p-1 rounded-md text-[10px] font-semibold border ${
                  overallStats.maxStreak >= 100 ? "bg-purple-500/10 text-purple-600 border-purple-500/30" : "bg-muted text-muted-foreground border-transparent"
                }`}
                title="100-Day Centurion"
              >
                100D
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground pt-0.5">
              {overallStats.maxStreak >= 21 ? "Atomic habit firmly wired!" : "Forming neural pathways"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Heatmap Grid & Habit List */}
      <Card className="border-border/60">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Calendar className="h-4 w-4 text-orange-500" />
              30-Day Consistency Heatmap
            </CardTitle>
            <CardDescription className="text-xs">
              Click any square to toggle completion. Darker colors signify completed days.
            </CardDescription>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1">
            <Button
              size="sm"
              variant={selectedFilter === null ? "default" : "outline"}
              onClick={() => setSelectedFilter(null)}
              className="h-6 text-[10px] px-2"
            >
              All
            </Button>
            {CATEGORIES.slice(0, 3).map((cat) => (
              <Button
                key={cat}
                size="sm"
                variant={selectedFilter === cat ? "default" : "outline"}
                onClick={() => setSelectedFilter(selectedFilter === cat ? null : cat)}
                className="h-6 text-[10px] px-2 truncate max-w-[120px]"
              >
                {cat.split(" ")[0]}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {filteredHabits.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-xl border-border/60">
              <Target className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
              <p className="text-xs font-medium text-muted-foreground mb-1">No habits registered in this view</p>
              <p className="text-[11px] text-muted-foreground/60 mb-3">Load a curated habit stack above or add a new custom habit below</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredHabits.map((habit) => (
                <div
                  key={habit.id}
                  className="p-3.5 rounded-xl border bg-card/50 hover:bg-card hover:border-border transition-all space-y-2 group"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: habit.color }} />
                      <span className="font-semibold text-xs text-foreground truncate">{habit.name}</span>
                      <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 text-muted-foreground">
                        {habit.category}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {/* Current Streak */}
                      <div className="flex items-center gap-1 text-xs font-bold text-orange-600 dark:text-orange-400">
                        <Flame className="h-3.5 w-3.5" />
                        <span>{habit.streak}d</span>
                        <span className="text-[10px] font-normal text-muted-foreground">({habit.bestStreak}d best)</span>
                      </div>

                      {/* Delete */}
                      <button
                        onClick={() => removeHabit(habit.id)}
                        className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive opacity-40 group-hover:opacity-100 transition-opacity"
                        title="Remove habit"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* 30-Day Grid */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1">
                    {calendarDays.map((day) => {
                      const completed = !!habit.completions[day.dateStr];
                      return (
                        <button
                          key={day.dateStr}
                          type="button"
                          onClick={() => toggleDate(habit.id, day.dateStr)}
                          title={`${day.dateStr}: ${completed ? "Completed" : "Not completed"}`}
                          className={`h-6 w-6 rounded-md flex items-center justify-center text-[10px] font-medium transition-all ${
                            completed
                              ? "text-white shadow-xs scale-105"
                              : "bg-muted/60 text-muted-foreground/60 hover:bg-muted hover:text-foreground"
                          } ${day.isToday ? "ring-2 ring-foreground/20" : ""}`}
                          style={completed ? { backgroundColor: habit.color } : {}}
                        >
                          {completed ? "✓" : day.dayNum}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* New Custom Habit Creation Bar */}
      <Card className="border-border/60">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Create Custom Atomic Habit
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
            <div className="space-y-1">
              <Label className="text-xs">Habit Name</Label>
              <Input
                placeholder="e.g. Read 20 Pages, 30m Exercise"
                value={newHabitName}
                onChange={(e) => setNewHabitName(e.target.value)}
                className="h-8 text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Category</Label>
              <Select value={newCategory} onValueChange={(v) => v && setNewCategory(v)}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c} className="text-xs">
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Highlight Color</Label>
              <div className="flex items-center gap-1.5 h-8">
                {HABIT_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setNewColor(c)}
                    className={`h-5 w-5 rounded-full border transition-transform ${newColor === c ? "scale-125 border-foreground" : "border-transparent"}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <Button onClick={addHabit} className="h-8 text-xs font-semibold bg-orange-600 hover:bg-orange-700 text-white">
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add Habit
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}