import { ProcessingResult } from "@/lib/processing/types";

export interface ParsedTimestampData {
  unixSeconds: number;
  unixMilliseconds: number;
  unixMicroseconds: string;
  unixNanoseconds: string;
  iso8601: string;
  utcString: string;
  localString: string;
  relative: string;
  dayOfWeek: string;
  dayOfYear: number;
  weekNumber: number;
  isLeapYear: boolean;
  detectedUnit: "seconds" | "milliseconds" | "microseconds" | "nanoseconds" | "string";
}

export function parseTimestampOrDate(input: string): { success: boolean; data?: ParsedTimestampData; error?: string } {
  const clean = input.trim();
  if (!clean) {
    return { success: false, error: "Please enter a timestamp or date string." };
  }

  let date: Date;
  let detectedUnit: ParsedTimestampData["detectedUnit"] = "string";

  // Check numeric digits
  if (/^-?\d+(\.\d+)?$/.test(clean)) {
    const rawNum = parseFloat(clean);
    const absVal = Math.abs(rawNum);

    if (absVal > 1e16) {
      // Nanoseconds (19 digits)
      detectedUnit = "nanoseconds";
      date = new Date(Math.floor(rawNum / 1e6));
    } else if (absVal > 1e13) {
      // Microseconds (16 digits)
      detectedUnit = "microseconds";
      date = new Date(Math.floor(rawNum / 1e3));
    } else if (absVal > 1e10) {
      // Milliseconds (13 digits)
      detectedUnit = "milliseconds";
      date = new Date(rawNum);
    } else {
      // Seconds (10 digits or float)
      detectedUnit = "seconds";
      date = new Date(Math.floor(rawNum * 1000));
    }
  } else {
    date = new Date(clean);
  }

  if (isNaN(date.getTime())) {
    return {
      success: false,
      error: "Unable to parse date. Please enter a valid timestamp (e.g. 1740000000) or ISO string (e.g. 2025-05-15T12:00:00Z).",
    };
  }

  const ms = date.getTime();
  const sec = Math.floor(ms / 1000);

  // Calculate day of year
  const startOfYear = new Date(date.getUTCFullYear(), 0, 1);
  const diffTime = date.getTime() - startOfYear.getTime();
  const dayOfYear = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

  // Calculate ISO week number
  const target = new Date(date.valueOf());
  const dayNr = (date.getUTCDay() + 6) % 7;
  target.setUTCDate(target.getUTCDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setUTCMonth(0, 1);
  if (target.getUTCDay() !== 4) {
    target.setUTCMonth(0, 1 + ((4 - target.getUTCDay() + 7) % 7));
  }
  const weekNumber = 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);

  const year = date.getUTCFullYear();
  const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const dayOfWeek = daysOfWeek[date.getUTCDay()];

  return {
    success: true,
    data: {
      unixSeconds: sec,
      unixMilliseconds: ms,
      unixMicroseconds: `${ms}000`,
      unixNanoseconds: `${ms}000000`,
      iso8601: date.toISOString(),
      utcString: date.toUTCString(),
      localString: date.toString(),
      relative: getRelativeTimeString(date),
      dayOfWeek,
      dayOfYear,
      weekNumber,
      isLeapYear,
      detectedUnit,
    },
  };
}

export function getRelativeTimeString(date: Date): string {
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const isPast = diffMs < 0;
  const absSec = Math.abs(Math.round(diffMs / 1000));

  if (absSec < 5) return "just now";
  if (absSec < 60) return `${absSec} seconds ${isPast ? "ago" : "from now"}`;
  if (absSec < 3600) {
    const mins = Math.floor(absSec / 60);
    return `${mins} minute${mins > 1 ? "s" : ""} ${isPast ? "ago" : "from now"}`;
  }
  if (absSec < 86400) {
    const hours = Math.floor(absSec / 3600);
    return `${hours} hour${hours > 1 ? "s" : ""} ${isPast ? "ago" : "from now"}`;
  }
  if (absSec < 2592000) {
    const days = Math.floor(absSec / 86400);
    return `${days} day${days > 1 ? "s" : ""} ${isPast ? "ago" : "from now"}`;
  }
  if (absSec < 31536000) {
    const months = Math.floor(absSec / 2592000);
    return `${months} month${months > 1 ? "s" : ""} ${isPast ? "ago" : "from now"}`;
  }
  const years = Math.floor(absSec / 31536000);
  return `${years} year${years > 1 ? "s" : ""} ${isPast ? "ago" : "from now"}`;
}

export function convertTimestamp(
  input: string,
  targetFormat: "iso" | "unix" | "relative" | "utc" | "local" = "iso"
): ProcessingResult {
  const res = parseTimestampOrDate(input);
  if (!res.success || !res.data) {
    return { status: "error", error: res.error };
  }

  const map: Record<string, string> = {
    iso: res.data.iso8601,
    unix: String(res.data.unixSeconds),
    utc: res.data.utcString,
    local: res.data.localString,
    relative: res.data.relative,
  };

  return {
    status: "success",
    message: map[targetFormat] || res.data.iso8601,
    data: map,
  };
}

export const MAJOR_TIMEZONES = [
  { zone: "UTC", label: "UTC / GMT (Universal Coordinated Time)" },
  { zone: "America/New_York", label: "New York (EST / EDT)" },
  { zone: "America/Los_Angeles", label: "San Francisco / LA (PST / PDT)" },
  { zone: "Europe/London", label: "London (GMT / BST)" },
  { zone: "Europe/Paris", label: "Paris / Berlin (CET / CEST)" },
  { zone: "Asia/Dubai", label: "Dubai (GST)" },
  { zone: "Asia/Tokyo", label: "Tokyo (JST)" },
  { zone: "Asia/Singapore", label: "Singapore / Hong Kong (SGT)" },
  { zone: "Australia/Sydney", label: "Sydney (AEST / AEDT)" },
];