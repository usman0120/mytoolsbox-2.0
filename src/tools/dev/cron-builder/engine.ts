import { ProcessingResult } from "@/lib/processing/types";

export interface CronValidationData {
  description: string;
  nextRuns: Array<{ iso: string; formatted: string; relative: string }>;
  fields: string[];
  isQuartz?: boolean;
}

export function validateCron(expression: string): ProcessingResult & { data?: CronValidationData } {
  if (!expression.trim()) {
    return { status: "error", error: "Please enter a cron expression." };
  }

  const parts = expression.trim().split(/\s+/);
  let isQuartz = false;

  if (parts.length === 6) {
    isQuartz = true;
  } else if (parts.length !== 5) {
    return {
      status: "error",
      error: `Cron expression must have 5 standard fields (minute hour day-of-month month day-of-week). Found ${parts.length}.`,
    };
  }

  // If Quartz 6 fields (second min hour dom month dow), validate standard 5 parts
  const standardParts = isQuartz ? parts.slice(1, 6) : parts;
  const fieldNames = ["Minute", "Hour", "Day of Month", "Month", "Day of Week"];
  const ranges: [number, number][] = [[0, 59], [0, 23], [1, 31], [1, 12], [0, 7]];

  for (let i = 0; i < 5; i++) {
    if (!isValidCronField(standardParts[i], ranges[i][0], ranges[i][1])) {
      return {
        status: "error",
        error: `Invalid ${fieldNames[i]} field: "${standardParts[i]}". Expected range ${ranges[i][0]}-${ranges[i][1]}.`,
      };
    }
  }

  const description = describeCron(standardParts, isQuartz ? parts[0] : undefined);
  const nextRuns = getNextRunsDetailed(standardParts, 8);

  return {
    status: "success",
    message: "Valid cron expression",
    data: {
      description,
      nextRuns,
      fields: parts,
      isQuartz,
    },
  };
}

function isValidCronField(field: string, min: number, max: number): boolean {
  if (field === "*" || field === "?") return true;

  const parts = field.split(",");
  for (const part of parts) {
    if (part.includes("/")) {
      const [range, step] = part.split("/");
      const stepNum = parseInt(step);
      if (isNaN(stepNum) || stepNum < 1) return false;
      if (range === "*" || range === "?") continue;
      if (!isValidRange(range, min, max)) return false;
      continue;
    }
    if (part.includes("-")) {
      if (!isValidRange(part, min, max)) return false;
      continue;
    }
    const num = parseInt(part);
    if (isNaN(num) || num < min || num > max) return false;
  }
  return true;
}

function isValidRange(range: string, min: number, max: number): boolean {
  const [start, end] = range.split("-").map(Number);
  return !isNaN(start) && !isNaN(end) && start >= min && end <= max && start <= end;
}

function describeCron(parts: string[], secondField?: string): string {
  const [minute, hour, dom, month, dow] = parts;
  const monthNames = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dowNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  let desc = secondField ? `Every ${secondField} second(s), ` : "Runs ";

  if (minute === "*" && hour === "*" && dom === "*" && month === "*" && (dow === "*" || dow === "?")) {
    return "Runs every single minute, every day";
  }

  // Minute
  if (minute === "*") {
    desc += "every minute";
  } else if (minute.includes("/")) {
    desc += `every ${minute.split("/")[1]} minutes`;
  } else {
    desc += `at minute ${minute}`;
  }

  // Hour
  if (hour !== "*") {
    if (hour.includes("/")) {
      desc += `, every ${hour.split("/")[1]} hours`;
    } else {
      const hNum = parseInt(hour);
      const ampm = hNum >= 12 ? "PM" : "AM";
      const h12 = hNum % 12 || 12;
      const mStr = minute.includes("/") || minute === "*" ? "" : `:${minute.padStart(2, "0")}`;
      desc += ` at ${h12}${mStr} ${ampm}`;
    }
  }

  // Day of month
  if (dom !== "*" && dom !== "?") {
    desc += ` on day ${dom} of the month`;
  }

  // Month
  if (month !== "*") {
    const moNum = parseInt(month);
    desc += ` in ${monthNames[moNum] || month}`;
  }

  // Day of week
  if (dow !== "*" && dow !== "?") {
    if (dow === "1-5") {
      desc += " (Monday through Friday)";
    } else if (dow === "0,6" || dow === "6,0") {
      desc += " on weekends (Saturday & Sunday)";
    } else {
      const dows = dow.split(",").map((d) => dowNames[parseInt(d)] || d).join(", ");
      desc += ` on ${dows}`;
    }
  }

  return desc;
}

function getNextRunsDetailed(parts: string[], count: number): Array<{ iso: string; formatted: string; relative: string }> {
  const runs: Array<{ iso: string; formatted: string; relative: string }> = [];
  const now = new Date();
  const [minute, hour, dom, month, dow] = parts;

  let current = new Date(now);
  current.setSeconds(0, 0);

  let attempts = 0;
  while (runs.length < count && attempts < 50000) {
    attempts++;
    current = new Date(current.getTime() + 60000); // step 1 minute

    const m = current.getMinutes();
    const h = current.getHours();
    const d = current.getDate();
    const mo = current.getMonth() + 1;
    const w = current.getDay();

    if (!matchesField(minute, m)) continue;
    if (!matchesField(hour, h)) continue;
    if (!matchesField(dom, d)) continue;
    if (!matchesField(month, mo)) continue;
    if (!matchesField(dow, w)) continue;

    const diffMs = current.getTime() - now.getTime();
    const diffMins = Math.round(diffMs / 60000);
    let rel = "";
    if (diffMins < 60) {
      rel = `in ${diffMins} min${diffMins === 1 ? "" : "s"}`;
    } else if (diffMins < 1440) {
      const hrs = Math.floor(diffMins / 60);
      rel = `in ${hrs} hour${hrs === 1 ? "" : "s"}`;
    } else {
      const days = Math.floor(diffMins / 1440);
      rel = `in ${days} day${days === 1 ? "" : "s"}`;
    }

    runs.push({
      iso: current.toISOString(),
      formatted: current.toLocaleString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
      relative: rel,
    });
  }

  return runs;
}

function matchesField(field: string, value: number): boolean {
  if (field === "*" || field === "?") return true;
  const parts = field.split(",");
  return parts.some((part) => {
    if (part.includes("/")) {
      const [range, step] = part.split("/");
      const stepNum = parseInt(step);
      if (range === "*" || range === "?") return value % stepNum === 0;
      const [start, end] = range.split("-").map(Number);
      return value >= start && value <= end && (value - start) % stepNum === 0;
    }
    if (part.includes("-")) {
      const [start, end] = part.split("-").map(Number);
      return value >= start && value <= end;
    }
    const num = parseInt(part);
    // Support 7 as Sunday like 0
    if (num === 7 && value === 0) return true;
    return num === value;
  });
}