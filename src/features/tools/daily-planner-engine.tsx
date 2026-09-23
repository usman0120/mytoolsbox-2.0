"use client";

import { useState, useCallback, useEffect } from "react";
import {
  CalendarDays, Download, Printer, Check, Circle, Trash2, Plus,
  Clock, Sun, Coffee, Briefcase, Heart, Smile, Sparkles, Target
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import {
  DayPlan,
  TimeSlot,
  DailyPriority,
  generateDefaultTimeSlots,
  calculateProductivityScore,
  exportPlanMarkdown,
} from "@/features/tools/daily-planner";

const STORAGE_PREFIX = "mytoolsbox-daily-planner-";

export function DailyPlannerEngine() {
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split("T")[0]);

  const [plan, setPlan] = useState<DayPlan>(() => {
    const today = new Date().toISOString().split("T")[0];
    try {
      const raw = localStorage.getItem(`${STORAGE_PREFIX}${today}`);
      if (raw) return JSON.parse(raw);
    } catch {}
    return {
      date: today,
      focusGoal: "Ship the MVP features and maintain clear daily momentum",
      gratitude: "Great coffee and supportive teammates",
      priorities: [
        { id: "p1", text: "Complete core architecture refactoring", completed: false },
        { id: "p2", text: "Conduct user feedback review session", completed: false },
        { id: "p3", text: "Review pull requests & merge tests", completed: false },
      ],
      slots: generateDefaultTimeSlots(),
      notes: "Remember to drink water every 2 hours!",
    };
  });

  const [newPriorityText, setNewPriorityText] = useState("");

  // Load plan when date changes
  useEffect(() => {
    try {
      const raw = localStorage.getItem(`${STORAGE_PREFIX}${selectedDate}`);
      if (raw) {
        setPlan(JSON.parse(raw));
        return;
      }
    } catch {}
    // If no plan exists for this date, start clean
    setPlan({
      date: selectedDate,
      focusGoal: "",
      gratitude: "",
      priorities: [],
      slots: generateDefaultTimeSlots(),
      notes: "",
    });
  }, [selectedDate]);

  // Persist plan changes
  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}${plan.date}`, JSON.stringify(plan));
  }, [plan]);

  const handleTogglePriority = (id: string) => {
    setPlan((prev) => ({
      ...prev,
      priorities: prev.priorities.map((p) => (p.id === id ? { ...p, completed: !p.completed } : p)),
    }));
  };

  const handleAddPriority = () => {
    if (!newPriorityText.trim()) return;
    const newP: DailyPriority = {
      id: `p_${Date.now()}`,
      text: newPriorityText.trim(),
      completed: false,
    };
    setPlan((prev) => ({ ...prev, priorities: [...prev.priorities, newP] }));
    setNewPriorityText("");
  };

  const handleDeletePriority = (id: string) => {
    setPlan((prev) => ({ ...prev, priorities: prev.priorities.filter((p) => p.id !== id) }));
  };

  const handleToggleSlot = (id: string) => {
    setPlan((prev) => ({
      ...prev,
      slots: prev.slots.map((s) => (s.id === id ? { ...s, completed: !s.completed } : s)),
    }));
  };

  const handleUpdateSlot = (id: string, activity: string) => {
    setPlan((prev) => ({
      ...prev,
      slots: prev.slots.map((s) => (s.id === id ? { ...s, activity } : s)),
    }));
  };

  const handleExportMarkdown = () => {
    const md = exportPlanMarkdown(plan);
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `daily-plan-${plan.date}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Daily plan exported as Markdown!");
  };

  const handlePrint = () => window.print();

  const { score, completedSlots, totalSlots, completedPriorities, totalPriorities } =
    calculateProductivityScore(plan);

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" /> Daily Planner & Time Blocker
          </h2>
          <p className="text-sm text-muted-foreground">Plan daily time blocks, top 3 priorities, and track your daily productivity score</p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-36 h-8 text-xs font-mono"
          />
          <Button variant="outline" size="sm" onClick={handleExportMarkdown} className="text-xs gap-1.5 h-8">
            <Download className="h-3.5 w-3.5" /> Markdown
          </Button>
          <Button variant="default" size="sm" onClick={handlePrint} className="text-xs gap-1.5 h-8">
            <Printer className="h-3.5 w-3.5" /> Print
          </Button>
        </div>
      </div>

      {/* Productivity Score Bar */}
      <Card className="bg-primary/5 border-primary/20 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 flex items-center justify-center rounded-full bg-primary/10 border border-primary/30">
              <span className="font-mono font-bold text-sm text-primary">{score}%</span>
            </div>
            <div>
              <p className="font-semibold text-xs">Daily Productivity Score</p>
              <p className="text-[11px] text-muted-foreground">
                {completedPriorities}/{totalPriorities} priorities & {completedSlots}/{totalSlots} schedule blocks completed
              </p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs font-mono border-primary/30 text-primary">
            {score >= 80 ? "🔥 High Output" : score >= 50 ? "⚡ Steady Flow" : "🌱 In Progress"}
          </Badge>
        </div>
      </Card>

      {/* Focus & Gratitude Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Card className="p-3 space-y-1">
          <Label className="text-xs flex items-center gap-1 font-semibold text-primary">
            <Target className="h-3.5 w-3.5" /> Main Focus Goal
          </Label>
          <Input
            placeholder="What single achievement defines success today?"
            value={plan.focusGoal}
            onChange={(e) => setPlan((p) => ({ ...p, focusGoal: e.target.value }))}
            className="h-8 text-xs"
          />
        </Card>
        <Card className="p-3 space-y-1">
          <Label className="text-xs flex items-center gap-1 font-semibold text-green-500">
            <Heart className="h-3.5 w-3.5" /> Gratitude & Wins
          </Label>
          <Input
            placeholder="Something I appreciate or a recent win..."
            value={plan.gratitude}
            onChange={(e) => setPlan((p) => ({ ...p, gratitude: e.target.value }))}
            className="h-8 text-xs"
          />
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Top Priorities (5 cols) */}
        <div className="md:col-span-5 space-y-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-muted-foreground uppercase flex items-center justify-between">
                <span>Top Priorities</span>
                <span className="font-mono text-[10px]">{completedPriorities}/{plan.priorities.length}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex gap-1.5">
                <Input
                  placeholder="Add high-impact task..."
                  value={newPriorityText}
                  onChange={(e) => setNewPriorityText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddPriority()}
                  className="h-7 text-xs flex-1"
                />
                <Button size="sm" onClick={handleAddPriority} className="h-7 text-xs px-2.5">
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>

              <div className="space-y-1.5 pt-1">
                {plan.priorities.map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between p-2 rounded border text-xs ${
                      item.completed ? "bg-muted/40 opacity-70 line-through text-muted-foreground" : "bg-card"
                    }`}
                  >
                    <div
                      onClick={() => handleTogglePriority(item.id)}
                      className="flex items-center gap-2 flex-1 cursor-pointer truncate"
                    >
                      {item.completed ? (
                        <Check className="h-3.5 w-3.5 text-green-500 shrink-0" />
                      ) : (
                        <Circle className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      )}
                      <span className="truncate">{item.text}</span>
                    </div>
                    <button
                      onClick={() => handleDeletePriority(item.id)}
                      className="text-muted-foreground hover:text-destructive p-0.5"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Notes Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-muted-foreground uppercase">Day Notes & Reflection</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Thoughts, meeting insights, or evening reflection..."
                rows={4}
                value={plan.notes}
                onChange={(e) => setPlan((p) => ({ ...p, notes: e.target.value }))}
                className="text-xs resize-none"
              />
            </CardContent>
          </Card>
        </div>

        {/* Time Blocks Schedule (7 cols) */}
        <div className="md:col-span-7 space-y-2">
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-xs text-muted-foreground uppercase">Time-Blocked Schedule</CardTitle>
              <span className="text-[10px] text-muted-foreground font-mono">
                {completedSlots}/{plan.slots.length} Blocks Finished
              </span>
            </CardHeader>
            <CardContent className="space-y-1.5 p-3">
              {plan.slots.map((slot) => (
                <div
                  key={slot.id}
                  className={`flex items-center gap-2 p-2 rounded-lg border text-xs transition-colors ${
                    slot.completed ? "bg-muted/30 opacity-70" : "bg-card hover:border-primary/40"
                  }`}
                >
                  <button
                    onClick={() => handleToggleSlot(slot.id)}
                    className="text-muted-foreground hover:text-primary shrink-0 transition-colors"
                  >
                    {slot.completed ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Circle className="h-4 w-4" />
                    )}
                  </button>

                  <span className="font-mono text-[11px] text-muted-foreground w-24 shrink-0 font-medium">
                    {slot.startTime} - {slot.endTime}
                  </span>

                  <Input
                    value={slot.activity}
                    onChange={(e) => handleUpdateSlot(slot.id, e.target.value)}
                    placeholder="Activity or scheduled work..."
                    className={`h-7 text-xs border-transparent hover:border-input focus:border-input ${
                      slot.completed ? "line-through text-muted-foreground" : ""
                    }`}
                  />

                  {slot.category && (
                    <Badge variant="outline" className="text-[9px] uppercase font-mono px-1 py-0 shrink-0">
                      {slot.category}
                    </Badge>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}