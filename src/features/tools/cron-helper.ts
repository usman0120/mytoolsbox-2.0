import { ProcessingResult } from "@/lib/processing/types";

export function validateCron(expression: string): ProcessingResult {
  if (!expression.trim()) {
    return { status: "error", error: "Please enter a cron expression." };
  }

  const parts = expression.trim().split(/\s+/);
  if (parts.length !== 5) {
    return {
      status: "error",
      error: `Cron expression must have 5 fields (minute hour day month weekday). Found ${parts.length}.`,
    };
  }

  const fieldNames = ["Minute", "Hour", "Day of Month", "Month", "Day of Week"];
  const ranges: [number, number][] = [[0, 59], [0, 23], [1, 31], [1, 12], [0, 7]];

  for (let i = 0; i < 5; i++) {
    if (!isValidCronField(parts[i], ranges[i][0], ranges[i][1])) {
      return {
        status: "error",
        error: `Invalid ${fieldNames[i]} field: "${parts[i]}". Expected range ${ranges[i][0]}-${ranges[i][1]}.`,
      };
    }
  }

  const description = describeCron(parts);
  const nextRuns = getNextRuns(parts, 5);

  return {
    status: "success",
    message: "Valid cron expression",
    data: { description, nextRuns, fields: parts },
  };
}

function isValidCronField(field: string, min: number, max: number): boolean {
  if (field === "*") return true;

  const parts = field.split(",");
  for (const part of parts) {
    if (part.includes("/")) {
      const [range, step] = part.split("/");
      const stepNum = parseInt(step);
      if (isNaN(stepNum) || stepNum < 1) return false;
      if (range === "*") continue;
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

function describeCron(parts: string[]): string {
  const [minute, hour, dom, month, dow] = parts;
  const monthNames = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dowNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  let desc = "Runs ";

  if (minute === "*" && hour === "*" && dom === "*" && month === "*" && dow === "*") {
    return "Runs every minute";
  }

  // Minute
  if (minute === "*") desc += "every minute";
  else if (minute.includes("/")) desc += `every ${minute.split("/")[1]} minutes`;
  else desc += `at minute ${minute}`;

  // Hour
  if (hour !== "*") {
    desc += minute === "*" ? " of " : " past ";
    if (hour.includes("/")) desc += `every ${hour.split("/")[1]} hours`;
    else desc += `hour ${hour}`;
  }

  // Day of month
  if (dom !== "*") {
    desc += ` on day ${dom} of the month`;
  }

  // Month
  if (month !== "*") {
    desc += ` in ${monthNames[parseInt(month)] || month}`;
  }

  // Day of week
  if (dow !== "*") {
    desc += ` on ${dowNames[parseInt(dow)] || dow}`;
  }

  return desc;
}

function getNextRuns(parts: string[], count: number): string[] {
  const runs: string[] = [];
  const now = new Date();
  const [minute, hour, dom, month, dow] = parts;

  // Simple simulation for common patterns
  let current = new Date(now);
  current.setSeconds(0, 0);

  while (runs.length < count) {
    current = new Date(current.getTime() + 60000); // +1 minute

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

    runs.push(current.toISOString());
  }

  return runs;
}

function matchesField(field: string, value: number): boolean {
  if (field === "*") return true;
  const parts = field.split(",");
  return parts.some((part) => {
    if (part.includes("/")) {
      const [range, step] = part.split("/");
      const stepNum = parseInt(step);
      if (range === "*") return value % stepNum === 0;
      const [start, end] = range.split("-").map(Number);
      return value >= start && value <= end && (value - start) % stepNum === 0;
    }
    if (part.includes("-")) {
      const [start, end] = part.split("-").map(Number);
      return value >= start && value <= end;
    }
    return parseInt(part) === value;
  });
}