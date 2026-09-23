// Countdown Timer Date Math & Interval Calculations

export interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
  isExpired: boolean;
}

export function calculateTimeLeft(targetDate: Date | string, now: Date = new Date()): TimeLeft {
  const target = typeof targetDate === "string" ? new Date(targetDate) : targetDate;
  const difference = target.getTime() - now.getTime();

  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, totalSeconds: 0, isExpired: true };
  }

  const totalSeconds = Math.floor(difference / 1000);
  const days = Math.floor(totalSeconds / (3600 * 24));
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { days, hours, minutes, seconds, totalSeconds, isExpired: false };
}

export interface PresetEvent {
  title: string;
  getTargetDate: () => Date;
  category: "holiday" | "milestone" | "personal";
}

export function getUpcomingPresetEvents(): Array<{ title: string; date: string; category: string }> {
  const now = new Date();
  const year = now.getFullYear();

  const presets = [
    { title: "New Year's Day", date: `${year + 1}-01-01T00:00:00`, category: "holiday" },
    { title: "Summer Solstice", date: `${year}-06-21T00:00:00`, category: "holiday" },
    { title: "Halloween", date: `${year}-10-31T00:00:00`, category: "holiday" },
    { title: "Christmas Day", date: `${year}-12-25T00:00:00`, category: "holiday" },
  ];

  return presets
    .map((p) => {
      const d = new Date(p.date);
      if (d <= now) {
        d.setFullYear(year + 1);
        return { ...p, date: d.toISOString() };
      }
      return p;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}
