// Study Timer utility functions & statistics engine

export interface StudyTimerState {
  isRunning: boolean;
  isPaused: boolean;
  elapsedSeconds: number;
  targetSeconds: number;
  sessions: StudySession[];
}

export interface StudySession {
  id: string;
  subject: string;
  duration: number; // in minutes
  date: string; // ISO string
  completed: boolean;
  notes?: string;
}

export interface SubjectGoal {
  subject: string;
  weeklyTargetMinutes: number;
  color?: string;
}

export const SUBJECT_COLORS: Record<string, string> = {
  Math: "#3b82f6",
  Science: "#22c55e",
  History: "#f59e0b",
  Languages: "#ec4899",
  Coding: "#8b5cf6",
  Reading: "#06b6d4",
  Other: "#6b7280",
};

export const PRESET_TIMES = [
  { label: "15m", value: "15" },
  { label: "25m (Pomodoro)", value: "25" },
  { label: "45m", value: "45" },
  { label: "60m (1h)", value: "60" },
  { label: "90m", value: "90" },
];

export function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function getProgressPercent(elapsed: number, target: number): number {
  if (target <= 0) return 0;
  return Math.min(100, Math.round((elapsed / target) * 100));
}

export function getTodayTotal(sessions: StudySession[]): number {
  const today = new Date().toDateString();
  return sessions
    .filter((s) => new Date(s.date).toDateString() === today)
    .reduce((sum, s) => sum + s.duration, 0);
}

export function getWeekTotal(sessions: StudySession[]): number {
  const now = new Date();
  const weekStart = new Date(now);
  const day = weekStart.getDay();
  const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1); // Monday
  weekStart.setDate(diff);
  weekStart.setHours(0, 0, 0, 0);

  return sessions
    .filter((s) => new Date(s.date) >= weekStart)
    .reduce((sum, s) => sum + s.duration, 0);
}

export function getSubjectTotals(sessions: StudySession[]): Record<string, number> {
  const totals: Record<string, number> = {};
  for (const s of sessions) {
    totals[s.subject] = (totals[s.subject] || 0) + s.duration;
  }
  return totals;
}

export function getStreak(sessions: StudySession[]): number {
  if (sessions.length === 0) return 0;

  const dates = Array.from(
    new Set(
      sessions
        .filter((s) => s.duration > 0)
        .map((s) => new Date(s.date).toISOString().split("T")[0])
    )
  ).sort().reverse();

  if (dates.length === 0) return 0;

  const today = new Date().toISOString().split("T")[0];
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = yesterdayDate.toISOString().split("T")[0];

  // Must have studied today or yesterday to continue streak
  if (dates[0] !== today && dates[0] !== yesterday) {
    return 0;
  }

  let streak = 1;
  let curr = new Date(dates[0]);

  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i]);
    const expected = new Date(curr);
    expected.setDate(expected.getDate() - 1);

    if (prev.toISOString().split("T")[0] === expected.toISOString().split("T")[0]) {
      streak++;
      curr = prev;
    } else {
      break;
    }
  }

  return streak;
}