// Pomodoro Timer Core State Machine & Metrics

export type PomodoroState = "idle" | "working" | "short-break" | "long-break";

export interface PomodoroSettings {
  workMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  sessionsBeforeLongBreak: number;
  autoStartBreaks?: boolean;
  autoStartWork?: boolean;
}

export const DEFAULT_POMODORO_SETTINGS: PomodoroSettings = {
  workMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  sessionsBeforeLongBreak: 4,
  autoStartBreaks: false,
  autoStartWork: false,
};

export interface PomodoroSessionRecord {
  id: string;
  type: "work" | "break";
  durationMinutes: number;
  completedAt: string; // ISO string
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export function getNextState(
  currentState: PomodoroState,
  completedWorkSessions: number,
  settings: PomodoroSettings
): { nextState: PomodoroState; nextDurationSeconds: number } {
  if (currentState === "working") {
    // If just finished a working session
    const isLongBreak = (completedWorkSessions + 1) % settings.sessionsBeforeLongBreak === 0;
    const nextState: PomodoroState = isLongBreak ? "long-break" : "short-break";
    const nextDurationSeconds = isLongBreak ? settings.longBreakMinutes * 60 : settings.shortBreakMinutes * 60;
    return { nextState, nextDurationSeconds };
  } else {
    // Break finished -> back to working
    return {
      nextState: "working",
      nextDurationSeconds: settings.workMinutes * 60,
    };
  }
}

export function getTodayFocusMinutes(sessions: PomodoroSessionRecord[]): number {
  const today = new Date().toISOString().split("T")[0];
  return sessions
    .filter((s) => s.type === "work" && s.completedAt.startsWith(today))
    .reduce((acc, s) => acc + s.durationMinutes, 0);
}
