// Statistics Calculator mathematical engine

export interface StatisticsResult {
  count: number;
  sum: number;
  mean: number;
  geometricMean: number | null;
  harmonicMean: number | null;
  median: number;
  mode: number[];
  min: number;
  max: number;
  range: number;
  sampleVariance: number;
  populationVariance: number;
  sampleStdDev: number;
  populationStdDev: number;
  mad: number; // Mean Absolute Deviation
  q1: number;
  q3: number;
  iqr: number;
  skewness: number;
  outliers: number[];
  sortedData: number[];
  frequencyTable: { value: number; frequency: number; cumulativeFrequency: number; relativeFrequency: number }[];
}

export function parseData(text: string): number[] {
  return text
    .split(/[\s,;\n\t]+/)
    .map(v => Number(v.trim()))
    .filter(v => !isNaN(v) && isFinite(v));
}

export function calculateStatistics(data: number[]): StatisticsResult | null {
  if (data.length === 0) return null;

  const sorted = [...data].sort((a, b) => a - b);
  const count = sorted.length;
  const sum = sorted.reduce((a, b) => a + b, 0);
  const mean = sum / count;

  // Geometric Mean (only for all positive)
  let geometricMean: number | null = null;
  if (sorted.every(v => v > 0)) {
    const logSum = sorted.reduce((acc, v) => acc + Math.log(v), 0);
    geometricMean = round(Math.exp(logSum / count));
  }

  // Harmonic Mean (only for all positive)
  let harmonicMean: number | null = null;
  if (sorted.every(v => v > 0)) {
    const reciprocalSum = sorted.reduce((acc, v) => acc + 1 / v, 0);
    harmonicMean = round(count / reciprocalSum);
  }

  // Median
  const mid = Math.floor(count / 2);
  const median = count % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];

  // Frequency Table & Mode
  const freqMap = new Map<number, number>();
  for (const v of sorted) {
    freqMap.set(v, (freqMap.get(v) || 0) + 1);
  }

  let maxFreq = 0;
  for (const f of freqMap.values()) {
    if (f > maxFreq) maxFreq = f;
  }

  const mode = maxFreq > 1
    ? [...freqMap.entries()].filter(([, f]) => f === maxFreq).map(([v]) => v)
    : [];

  let cumFreq = 0;
  const frequencyTable = [...freqMap.entries()].map(([value, frequency]) => {
    cumFreq += frequency;
    return {
      value,
      frequency,
      cumulativeFrequency: cumFreq,
      relativeFrequency: round((frequency / count) * 100),
    };
  });

  // Quartiles (using method recommended by NIST/Tukey)
  const q1 = percentile(sorted, 25);
  const q3 = percentile(sorted, 75);
  const iqr = q3 - q1;

  // Outliers (1.5 * IQR rule)
  const lowerFence = q1 - 1.5 * iqr;
  const upperFence = q3 + 1.5 * iqr;
  const outliers = sorted.filter(v => v < lowerFence || v > upperFence);

  // Variances & Std Deviations
  const sumSquaredDiffs = sorted.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0);
  const sampleVariance = count > 1 ? sumSquaredDiffs / (count - 1) : 0;
  const populationVariance = sumSquaredDiffs / count;
  const sampleStdDev = Math.sqrt(sampleVariance);
  const populationStdDev = Math.sqrt(populationVariance);

  // Mean Absolute Deviation (MAD)
  const mad = sorted.reduce((acc, v) => acc + Math.abs(v - mean), 0) / count;

  // Sample Skewness (Fisher-Pearson)
  let skewness = 0;
  if (count > 2 && sampleStdDev > 0) {
    const m3 = sorted.reduce((acc, v) => acc + Math.pow((v - mean) / sampleStdDev, 3), 0);
    skewness = (count / ((count - 1) * (count - 2))) * m3;
  }

  return {
    count,
    sum: round(sum),
    mean: round(mean),
    geometricMean,
    harmonicMean,
    median: round(median),
    mode,
    min: sorted[0],
    max: sorted[count - 1],
    range: round(sorted[count - 1] - sorted[0]),
    sampleVariance: round(sampleVariance),
    populationVariance: round(populationVariance),
    sampleStdDev: round(sampleStdDev),
    populationStdDev: round(populationStdDev),
    mad: round(mad),
    q1: round(q1),
    q3: round(q3),
    iqr: round(iqr),
    skewness: round(skewness),
    outliers,
    sortedData: sorted,
    frequencyTable,
  };
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 1) return sorted[0];
  const index = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  if (lower === upper) return sorted[lower];
  return sorted[lower] + (index - lower) * (sorted[upper] - sorted[lower]);
}

export function generateHistogram(data: number[], bins = 10): { binStart: number; binEnd: number; count: number; label: string; percent: number }[] {
  if (data.length === 0) return [];
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min;
  const binWidth = range === 0 ? 1 : range / bins;

  const result: { binStart: number; binEnd: number; count: number; label: string; percent: number }[] = [];
  for (let i = 0; i < bins; i++) {
    const binStart = min + i * binWidth;
    const binEnd = binStart + binWidth;
    const count = data.filter(v => (i === bins - 1 ? v >= binStart && v <= binEnd : v >= binStart && v < binEnd)).length;
    result.push({
      binStart: round(binStart),
      binEnd: round(binEnd),
      count,
      label: `${round(binStart)} - ${round(binEnd)}`,
      percent: round((count / data.length) * 100),
    });
  }
  return result;
}

function round(val: number): number {
  return parseFloat(val.toFixed(6));
}

export const EXAMPLE_DATASETS: Record<string, number[]> = {
  "Exam Scores": [68, 72, 75, 78, 82, 85, 85, 88, 90, 92, 95, 98, 42],
  "Response Times (ms)": [120, 135, 142, 145, 150, 155, 160, 165, 175, 210, 480],
  "Daily Temperatures (°C)": [18, 19, 21, 22, 22, 23, 24, 25, 26, 27, 28, 29, 31],
  "Monthly Sales ($k)": [12, 15, 18, 14, 22, 25, 29, 31, 35, 42, 48, 55],
};