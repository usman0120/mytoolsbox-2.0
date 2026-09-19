export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return (value / total) * 100;
}

export function percentageOf(percent: number, total: number): number {
  return (percent / 100) * total;
}

export function percentageChange(from: number, to: number): number {
  if (from === 0) return 0;
  return ((to - from) / from) * 100;
}