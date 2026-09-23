// Habit Tracker Core Streak Algorithms & Analytics

export interface Habit {
  id: string;
  name: string;
  emoji: string;
  color: string;
  targetDaysPerWeek?: number;
  createdAt: number;
}

export interface HabitEntry {
  date: string; // YYYY-MM-DD
  habitId: string;
  done: boolean;
}

export function generateHabitId(): string {
  return `habit_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

export function calculateHabitStreak(habitId: string, entries: HabitEntry[]): {
  currentStreak: number;
  longestStreak: number;
  completionRate30Days: number;
} {
  const completedDates = new Set(
    entries
      .filter((e) => e.habitId === habitId && e.done)
      .map((e) => e.date)
  );

  const sortedDates = Array.from(completedDates).sort();

  if (sortedDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0, completionRate30Days: 0 };
  }

  // Calculate longest streak
  let longest = 1;
  let currentRun = 1;

  for (let i = 1; i < sortedDates.length; i++) {
    const prev = new Date(sortedDates[i - 1]);
    const curr = new Date(sortedDates[i]);
    const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 3600 * 24));

    if (diffDays === 1) {
      currentRun++;
      if (currentRun > longest) longest = currentRun;
    } else {
      currentRun = 1;
    }
  }

  // Calculate current streak
  let currentStreak = 0;
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  let checkDate = completedDates.has(todayStr) ? today : (completedDates.has(yesterdayStr) ? yesterday : null);

  if (checkDate) {
    let d = new Date(checkDate);
    while (true) {
      const dStr = d.toISOString().split("T")[0];
      if (completedDates.has(dStr)) {
        currentStreak++;
        d.setDate(d.getDate() - 1);
      } else {
        break;
      }
    }
  }

  // 30-day completion rate
  let doneLast30 = 0;
  for (let i = 0; i < 30; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dStr = d.toISOString().split("T")[0];
    if (completedDates.has(dStr)) doneLast30++;
  }
  const completionRate30Days = Math.round((doneLast30 / 30) * 100);

  return { currentStreak, longestStreak: Math.max(longest, currentStreak), completionRate30Days };
}

export function getDaysOfWeek(startDate: Date): { name: string; dateStr: string; isToday: boolean }[] {
  const day = startDate.getDay();
  const diff = startDate.getDate() - day + (day === 0 ? -6 : 1); // Monday start
  const monday = new Date(startDate);
  monday.setDate(diff);

  const days = [];
  const todayStr = new Date().toISOString().split("T")[0];

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dateStr = d.toISOString().split("T")[0];
    const name = d.toLocaleDateString("en-US", { weekday: "short" });
    days.push({ name, dateStr, isToday: dateStr === todayStr });
  }

  return days;
}
