// Daily Planner Core Data Structures & Productivity Scoring

export interface TimeSlot {
  id: string;
  startTime: string; // "08:00"
  endTime: string;   // "09:00"
  activity: string;
  category?: "work" | "study" | "health" | "leisure" | "chores";
  completed?: boolean;
}

export interface DailyPriority {
  id: string;
  text: string;
  completed: boolean;
}

export interface DayPlan {
  date: string; // YYYY-MM-DD
  focusGoal: string;
  gratitude: string;
  priorities: DailyPriority[];
  slots: TimeSlot[];
  notes: string;
}

export function generateDefaultTimeSlots(): TimeSlot[] {
  return [
    { id: "s1", startTime: "07:00", endTime: "08:00", activity: "Morning Routine & Breakfast", category: "health", completed: false },
    { id: "s2", startTime: "08:00", endTime: "10:00", activity: "Deep Work Block 1", category: "work", completed: false },
    { id: "s3", startTime: "10:00", endTime: "10:30", activity: "Coffee Break & Stretch", category: "leisure", completed: false },
    { id: "s4", startTime: "10:30", endTime: "12:30", activity: "Deep Work Block 2", category: "work", completed: false },
    { id: "s5", startTime: "12:30", endTime: "13:30", activity: "Healthy Lunch & Walk", category: "health", completed: false },
    { id: "s6", startTime: "13:30", endTime: "15:30", activity: "Collaborative Tasks & Emails", category: "work", completed: false },
    { id: "s7", startTime: "15:30", endTime: "16:00", activity: "Afternoon Rest", category: "leisure", completed: false },
    { id: "s8", startTime: "16:00", endTime: "17:30", activity: "Admin & Wrap Up", category: "work", completed: false },
    { id: "s9", startTime: "17:30", endTime: "19:00", activity: "Workout / Fitness", category: "health", completed: false },
    { id: "s10", startTime: "19:00", endTime: "22:00", activity: "Dinner & Downtime", category: "leisure", completed: false },
  ];
}

export function calculateProductivityScore(plan: DayPlan): {
  score: number; // 0-100
  completedSlots: number;
  totalSlots: number;
  completedPriorities: number;
  totalPriorities: number;
} {
  const totalSlots = plan.slots.length;
  const completedSlots = plan.slots.filter((s) => s.completed).length;

  const totalPriorities = plan.priorities.length;
  const completedPriorities = plan.priorities.filter((p) => p.completed).length;

  if (totalSlots === 0 && totalPriorities === 0) {
    return { score: 0, completedSlots: 0, totalSlots: 0, completedPriorities: 0, totalPriorities: 0 };
  }

  const slotScore = totalSlots > 0 ? (completedSlots / totalSlots) * 50 : 25;
  const priorityScore = totalPriorities > 0 ? (completedPriorities / totalPriorities) * 50 : 25;

  const score = Math.round(slotScore + priorityScore);
  return { score, completedSlots, totalSlots, completedPriorities, totalPriorities };
}

export function exportPlanMarkdown(plan: DayPlan): string {
  const lines: string[] = [
    `# Daily Plan: ${plan.date}`,
    "",
    `**Primary Focus:** ${plan.focusGoal || "Not specified"}`,
    "",
    "## Top Priorities",
    ...plan.priorities.map((p) => `- [${p.completed ? "x" : " "}] ${p.text}`),
    "",
    "## Schedule",
    ...plan.slots.map((s) => `- [${s.completed ? "x" : " "}] **${s.startTime} - ${s.endTime}**: ${s.activity} (${s.category || "general"})`),
    "",
    "## Gratitude",
    plan.gratitude || "None noted.",
    "",
    "## Notes",
    plan.notes || "None.",
  ];

  return lines.join("\n");
}
