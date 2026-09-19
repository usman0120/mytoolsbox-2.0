// Statistics Calculator utility functions

export interface StatisticsResult {
  count: number;
  sum: number;
  mean: number;
  median: number;
  mode: number[];
  min: number;
  max: number;
  range: number;
  variance: number;
  stdDev: number;
  q1: number;
  q3: number;
  iqr: number;
  sortedData: number[];
}

export function parseData(text: string): number[] {
  return text
    .split(/[\s,;\n]+/)
    .map(v => Number(v.trim()))
    .filter(v => !isNaN(v));
}

export function calculateStatistics(data: number[]): StatisticsResult | null {
  if (data.length === 0) return null;

  const sorted = [...data].sort((a, b) => a - b);
  const count = sorted.length;
  const sum = sorted.reduce((a, b) => a + b, 0);
  const mean = sum / count;

  // Median
  const mid = Math.floor(count / 2);
  const median = count % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];

  // Mode
  const freq: Map<number, number> = new Map();
  let maxFreq = 0;
  for (const v of sorted) {
    const f = (freq.get(v) || 0) + 1;
    freq.set(v, f);
    if (f > maxFreq) maxFreq = f;
  }
  const mode = maxFreq > 1 ? [...freq.entries()].filter(([, f]) => f === maxFreq).map(([v]) => v) : [];

  // Quartiles
  const q1 = percentile(sorted, 25);
  const q3 = percentile(sorted, 75);

  // Variance & Std Dev (sample)
  const variance = sorted.reduce((acc, v) => acc + (v - mean) ** 2, 0) / (count - 1);
  const stdDev = Math.sqrt(variance);

  return {
    count,
    sum,
    mean,
    median,
    mode,
    min: sorted[0],
    max: sorted[count - 1],
    range: sorted[count - 1] - sorted[0],
    variance,
    stdDev,
    q1,
    q3,
    iqr: q3 - q1,
    sortedData: sorted,
  };
}

function percentile(sorted: number[], p: number): number {
  const index = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  if (lower === upper) return sorted[lower];
  return sorted[lower] + (index - lower) * (sorted[upper] - sorted[lower]);
}

export function generateHistogram(data: number[], bins = 10): { binStart: number; binEnd: number; count: number; label: string }[] {
  if (data.length === 0) return [];
  const min = Math.min(...data);
  const max = Math.max(...data);
  const binWidth = (max - min) / bins || 1;

  const result: { binStart: number; binEnd: number; count: number; label: string }[] = [];
  for (let i = 0; i < bins; i++) {
    const binStart = min + i * binWidth;
    const binEnd = binStart + binWidth;
    const count = data.filter(v => v >= binStart && (i === bins - 1 ? v <= binEnd : v < binEnd)).length;
    result.push({
      binStart: parseFloat(binStart.toFixed(2)),
      binEnd: parseFloat(binEnd.toFixed(2)),
      count,
      label: `${binStart.toFixed(1)}-${binEnd.toFixed(1)}`,
    });
  }
  return result;
}

export const EXAMPLE_DATASETS: Record<string, number[]> = {
  "Test Scores": [78, 82, 91, 65, 88, 72, 95, 84, 79, 87, 93, 76, 81, 90, 85],
  "Heights (cm)": [165, 172, 180, 158, 175, 168, 182, 170, 177, 163, 185, 169, 173, 160, 178],
  "Weights (kg)": [62, 75, 80, 55, 70, 68, 85, 72, 78, 58, 90, 65, 73, 60, 82],
};