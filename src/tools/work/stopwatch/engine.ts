// Stopwatch & Lap Analysis Logic

export interface LapDetail {
  lapNumber: number;
  lapTimeMs: number;
  splitTimeMs: number;
  isFastest?: boolean;
  isSlowest?: boolean;
  deltaToAverageMs?: number;
}

export function formatStopwatchTime(ms: number): string {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const hundredths = Math.floor((ms % 1000) / 10);

  if (hours > 0) {
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}.${hundredths.toString().padStart(2, "0")}`;
  }
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}.${hundredths.toString().padStart(2, "0")}`;
}

export function analyzeLaps(rawLapsMs: number[]): LapDetail[] {
  if (rawLapsMs.length === 0) return [];

  const lapTimes: number[] = [];
  let prevSplit = 0;

  for (const split of rawLapsMs) {
    lapTimes.push(split - prevSplit);
    prevSplit = split;
  }

  const minLap = Math.min(...lapTimes);
  const maxLap = Math.max(...lapTimes);
  const avgLap = lapTimes.reduce((a, b) => a + b, 0) / lapTimes.length;

  return rawLapsMs.map((split, i) => {
    const lapTime = lapTimes[i];
    return {
      lapNumber: i + 1,
      lapTimeMs: lapTime,
      splitTimeMs: split,
      isFastest: lapTimes.length > 1 && lapTime === minLap,
      isSlowest: lapTimes.length > 1 && lapTime === maxLap,
      deltaToAverageMs: Math.round(lapTime - avgLap),
    };
  });
}

export function exportLapsCSV(laps: LapDetail[]): string {
  const lines = [
    `"Lap #","Lap Time","Split Time","Delta to Avg"`,
    ...laps.map(
      (l) =>
        `"${l.lapNumber}","${formatStopwatchTime(l.lapTimeMs)}","${formatStopwatchTime(l.splitTimeMs)}","${(l.deltaToAverageMs ?? 0) > 0 ? "+" : ""}${((l.deltaToAverageMs ?? 0) / 1000).toFixed(2)}s"`
    ),
  ];
  return lines.join("\n");
}
