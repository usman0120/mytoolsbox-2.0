"use client";

import { useState, useCallback, useEffect } from "react";
import {
  CalendarDays, Download, Copy, Check, Trash2, Plus,
  Clock, Sun, Moon, Coffee, Utensils, Dumbbell, BookOpen,
  Briefcase, Heart, Star, Smile,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

interface TimeSlot {
  id: string;
  time: string;
  activity: string;
  icon: string;
  color: string;
}

interface PlannerDay {
  date: string;
  focus: string;
  gratitude: string;
  priorities: string[];
  slots: TimeSlot[];
  notes: string;
}

const DEFAULT_SLOTS: TimeSlot[] = [
  { id: "1", time: "06:00 - 07:00", activity: "Morning Routine", icon: "Sun", color: "#f97316" },
  { id: "2", time: "07:00 - 08:00", activity: "Breakfast", icon: "Coffee", color: "#eab308" },
  { id: "3", time: "08:00 - 12:00", activity: "Deep Work", icon: "Briefcase", color: "#3b82f6" },
  { id: "4", time: "12:00 - 13:00", activity: "Lunch Break", icon: "Utensils", color: "#22c55e" },
  { id: "5", time: "13:00 - 17:00", activity: "Meetings & Tasks", icon: "Briefcase", color: "#8b5cf6" },
  { id: "6", time: "17:00 - 18:00", activity: "Exercise", icon: "Dumbbell", color: "#ef4444" },
  { id: "7", time: "18:00 - 19:00", activity: "Dinner", icon: "Utensils", color: "#ec4899" },
  { id: "8", time: "19:00 - 22:00", activity: "Free Time", icon: "Smile", color: "#06b6d4" },
];

const STORAGE_KEY = "mytoolsbox-daily-planner";

function getTodayStr(): string {
  return new Date().toISOString().split("T")[0];
}

function loadPlanner(): PlannerDay | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data.date !== getTodayStr()) return null;
    return data;
  } catch {
    return null;
  }
}

function savePlanner(data: PlannerDay) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Sun, Coffee, Utensils, Dumbbell, BookOpen, Briefcase, Heart, Star, Smile, Moon, Clock,
};

export function DailyPlannerEngine() {
  const [planner, setPlanner] = useState<PlannerDay>(() => {
    const saved = loadPlanner();
    return (
      saved || {
        date: getTodayStr(),
        focus: "",
        gratitude: "",
        priorities: ["", "", ""],
        slots: DEFAULT_SLOTS.map((s) => ({ ...s, id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6) })),
        notes: "",
      }
    );
  });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    savePlanner(planner);
  }, [planner]);

  const updateSlot = useCallback(
    (id: string, field: keyof TimeSlot, value: string) => {
      setPlanner((prev) => ({
        ...prev,
        slots: prev.slots.map((s) => (s.id === id ? { ...s, [field]: value } : s)),
      }));
    },
    []
  );

  const addSlot = useCallback(() => {
    setPlanner((prev) => ({
      ...prev,
      slots: [
        ...prev.slots,
        {
          id: Date.now().toString(36),
          time: "",
          activity: "",
          icon: "Clock",
          color: "#78716c",
        },
      ],
    }));
  }, []);

  const removeSlot = useCallback((id: string) => {
    setPlanner((prev) => ({
      ...prev,
      slots: prev.slots.filter((s) => s.id !== id),
    }));
  }, []);

  const updatePriority = useCallback((index: number, value: string) => {
    setPlanner((prev) => {
      const priorities = [...prev.priorities];
      priorities[index] = value;
      return { ...prev, priorities };
    });
  }, []);

  const handleCopy = useCallback(async () => {
    const text = generatePlannerText(planner);
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Copied to clipboard!");
  }, [planner]);

  const handleDownload = useCallback(() => {
    const text = generatePlannerText(planner);
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `daily-planner-${planner.date}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded!");
  }, [planner]);

  const handleReset = useCallback(() => {
    setPlanner({
      date: getTodayStr(),
      focus: "",
      gratitude: "",
      priorities: ["", "", ""],
      slots: DEFAULT_SLOTS.map((s) => ({ ...s, id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6) })),
      notes: "",
    });
    toast.success("Planner reset.");
  }, []);

  const formattedDate = new Date(planner.date + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{formattedDate}</h3>
          <p className="text-sm text-muted-foreground">Daily Planner</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1.5">
            {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
            Copy
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload} className="gap-1.5">
            <Download className="h-3.5 w-3.5" /> Download
          </Button>
          <Button variant="ghost" size="sm" onClick={handleReset} className="gap-1.5 text-destructive">
            <Trash2 className="h-3.5 w-3.5" /> Reset
          </Button>
        </div>
      </div>

      {/* Focus & Gratitude */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 space-y-2">
            <Label className="text-sm font-medium flex items-center gap-1.5">
              <Star className="h-4 w-4 text-amber-500" /> Today&apos;s Focus
            </Label>
            <Input
              placeholder="What's your main focus today?"
              value={planner.focus}
              onChange={(e) => setPlanner((p) => ({ ...p, focus: e.target.value }))}
            />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 space-y-2">
            <Label className="text-sm font-medium flex items-center gap-1.5">
              <Heart className="h-4 w-4 text-red-500" /> Gratitude
            </Label>
            <Input
              placeholder="What are you grateful for?"
              value={planner.gratitude}
              onChange={(e) => setPlanner((p) => ({ ...p, gratitude: e.target.value }))}
            />
          </CardContent>
        </Card>
      </div>

      {/* Top 3 Priorities */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <Label className="text-sm font-medium flex items-center gap-1.5">
            <Target className="h-4 w-4 text-primary" /> Top 3 Priorities
          </Label>
          {planner.priorities.map((p, i) => (
            <div key={i} className="flex items-center gap-2">
              <Badge variant="secondary" className="w-6 h-6 rounded-full flex items-center justify-center p-0 text-xs">
                {i + 1}
              </Badge>
              <Input
                placeholder={`Priority ${i + 1}...`}
                value={p}
                onChange={(e) => updatePriority(i, e.target.value)}
                className="flex-1 h-8 text-sm"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Time Slots */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-blue-500" /> Schedule
            </Label>
            <Button variant="ghost" size="sm" onClick={addSlot} className="gap-1 h-7">
              <Plus className="h-3.5 w-3.5" /> Add Slot
            </Button>
          </div>
          <div className="space-y-2">
            {planner.slots.map((slot) => {
              const Icon = ICON_MAP[slot.icon] || Clock;
              return (
                <div key={slot.id} className="flex items-center gap-2 group">
                  <div
                    className="w-1 h-10 rounded-full shrink-0"
                    style={{ backgroundColor: slot.color }}
                  />
                  <Input
                    placeholder="Time"
                    value={slot.time}
                    onChange={(e) => updateSlot(slot.id, "time", e.target.value)}
                    className="w-32 h-8 text-xs font-mono"
                  />
                  <Input
                    placeholder="Activity"
                    value={slot.activity}
                    onChange={(e) => updateSlot(slot.id, "activity", e.target.value)}
                    className="flex-1 h-8 text-sm"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 opacity-0 group-hover:opacity-100"
                    onClick={() => removeSlot(slot.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardContent className="p-4 space-y-2">
          <Label className="text-sm font-medium">Notes</Label>
          <Textarea
            placeholder="Any additional notes, reminders, or thoughts..."
            className="min-h-[100px]"
            value={planner.notes}
            onChange={(e) => setPlanner((p) => ({ ...p, notes: e.target.value }))}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function generatePlannerText(planner: PlannerDay): string {
  const date = new Date(planner.date + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  let text = `📅 DAILY PLANNER - ${date}\n`;
  text += `${"─".repeat(40)}\n\n`;
  if (planner.focus) text += `🎯 FOCUS: ${planner.focus}\n`;
  if (planner.gratitude) text += `💖 GRATITUDE: ${planner.gratitude}\n`;
  text += `\n📋 TOP PRIORITIES:\n`;
  planner.priorities.forEach((p, i) => {
    if (p.trim()) text += `  ${i + 1}. ${p}\n`;
  });
  text += `\n⏰ SCHEDULE:\n`;
  planner.slots.forEach((s) => {
    if (s.time || s.activity) text += `  ${s.time || "..."}  ${s.activity || "..."}\n`;
  });
  if (planner.notes) text += `\n📝 NOTES:\n${planner.notes}\n`;
  return text;
}

// Need Target icon
import { Target } from "lucide-react";