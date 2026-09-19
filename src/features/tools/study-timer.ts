// Study Timer utility functions

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
  duration: number;
  date: string;
  completed: boolean;
}

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
    .filter(s => new Date(s.date).toDateString() === today)
    .reduce((sum, s) => sum + s.duration, 0);
}

export function getWeekTotal(sessions: StudySession[]): number {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);
  return sessions
    .filter(s => new Date(s.date) >= weekStart)
    .reduce((sum, s) => sum + s.duration, 0);
}

export function getStreak(sessions: StudySession[]): number {
  const dates = [...new Set(sessions.map(s => new Date(s.date).toDateString()))].sort().reverse();
  let streak = 0;
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  if (dates[0] !== today && dates[0] !== yesterday) return 0;

  for (let i = 0; i < dates.length; i++) {
    const expected = new Date(Date.now() - (streak + (dates[0] === yesterday ? 1 : 0)) * 86400000).toDateString();
    if (dates[i] === expected || dates[i] === new Date(Date.now() - streak * 86400000).toDateString()) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

export const SUBJECT_COLORS: Record<string, string> = {
  Math: "#0891b2",
  Physics: "#7c3aed",
  Chemistry: "#059669",
  "Computer Science": "#2563eb",
  Statistics: "#d97706",
  Writing: "#dc2626",
  Research: "#db2777",
  Biology: "#65a30d",
  History: "#9333ea",
  Other: "#6b7280",
};

export const PRESET_TIMES = [
  { label: "25 min", value: 25 * 60 },
  { label: "45 min", value: 45 * 60 },
  { label: "60 min", value: 60 * 60 },
  { label: "90 min", value: 90 * 60 },
  { label: "120 min", value: 120 * 60 },
];