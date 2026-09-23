// Pure logic engine for CSPRNG Random Generator, Dice Roller, Shuffler & UUID

export function getSecureRandomFloat(): number {
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const buffer = new Uint32Array(1);
    crypto.getRandomValues(buffer);
    return buffer[0] / (0xffffffff + 1);
  }
  return Math.random();
}

export function getRandomInt(min: number, max: number): number {
  const low = Math.ceil(min);
  const high = Math.floor(max);
  if (low > high) return low;
  const range = high - low + 1;
  return Math.floor(getSecureRandomFloat() * range) + low;
}

export function getRandomFloat(min: number, max: number, decimals = 2): number {
  const val = getSecureRandomFloat() * (max - min) + min;
  const factor = Math.pow(10, decimals);
  return Math.round(val * factor) / factor;
}

export type DiceType = 4 | 6 | 8 | 10 | 12 | 20 | 100;

export interface DiceRollResult {
  rolls: number[];
  sides: number;
  count: number;
  total: number;
  min: number;
  max: number;
  average: number;
}

export function rollDice(count: number, sides: DiceType): DiceRollResult {
  const validCount = Math.max(1, Math.min(count, 50));
  const rolls: number[] = [];
  for (let i = 0; i < validCount; i++) {
    rolls.push(getRandomInt(1, sides));
  }
  const total = rolls.reduce((acc, n) => acc + n, 0);
  const min = Math.min(...rolls);
  const max = Math.max(...rolls);
  const average = Math.round((total / rolls.length) * 100) / 100;

  return {
    rolls,
    sides,
    count: validCount,
    total,
    min,
    max,
    average,
  };
}

export type CoinFace = "heads" | "tails";

export interface CoinFlipSession {
  results: CoinFace[];
  headsCount: number;
  tailsCount: number;
  headsPercentage: number;
  currentStreak: { face: CoinFace; count: number };
}

export function flipCoin(times = 1, currentSession?: CoinFlipSession): CoinFlipSession {
  const count = Math.max(1, Math.min(times, 100));
  const newFlips: CoinFace[] = [];

  for (let i = 0; i < count; i++) {
    newFlips.push(getSecureRandomFloat() < 0.5 ? "heads" : "tails");
  }

  const allResults = currentSession ? [...currentSession.results, ...newFlips] : newFlips;
  const heads = allResults.filter((r) => r === "heads").length;
  const tails = allResults.length - heads;
  const headsPercentage = Math.round((heads / allResults.length) * 1000) / 10;

  // Calculate current streak from the end
  let streakFace: CoinFace = allResults[allResults.length - 1];
  let streakCount = 0;
  for (let i = allResults.length - 1; i >= 0; i--) {
    if (allResults[i] === streakFace) {
      streakCount++;
    } else {
      break;
    }
  }

  return {
    results: allResults.slice(-100), // Keep last 100 flips in history
    headsCount: heads,
    tailsCount: tails,
    headsPercentage,
    currentStreak: { face: streakFace, count: streakCount },
  };
}

export function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(getSecureRandomFloat() * (i + 1));
    const temp = result[i];
    result[i] = result[j];
    result[j] = temp;
  }
  return result;
}

export function pickRandomItems<T>(
  items: T[],
  count = 1,
  allowDuplicates = false
): T[] {
  if (items.length === 0) return [];
  const safeCount = Math.max(1, Math.min(count, allowDuplicates ? 100 : items.length));

  if (allowDuplicates) {
    const result: T[] = [];
    for (let i = 0; i < safeCount; i++) {
      const idx = Math.floor(getSecureRandomFloat() * items.length);
      result.push(items[idx]);
    }
    return result;
  }

  const shuffled = shuffleArray(items);
  return shuffled.slice(0, safeCount);
}

export const CHARSETS = {
  alphanumeric: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
  alpha: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  numeric: "0123456789",
  hex: "0123456789abcdef",
  symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
};

export function generateRandomString(
  length: number,
  charsetKey: keyof typeof CHARSETS | string = "alphanumeric"
): string {
  const chars = CHARSETS[charsetKey as keyof typeof CHARSETS] || charsetKey;
  let result = "";
  for (let i = 0; i < length; i++) {
    const idx = Math.floor(getSecureRandomFloat() * chars.length);
    result += chars.charAt(idx);
  }
  return result;
}

export function generateCryptoUUID(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  // RFC4122 v4 compliant fallback
  const bytes = new Uint8Array(16);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random() * 256);
  }

  // Set version to 0100 (v4)
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  // Set variant to 10xx (RFC 4122)
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export function generateRandomColor(): { hex: string; rgb: string; hsl: string } {
  const r = getRandomInt(0, 255);
  const g = getRandomInt(0, 255);
  const b = getRandomInt(0, 255);

  const hex = `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  const rgb = `rgb(${r}, ${g}, ${b})`;

  // Calculate HSL
  const rf = r / 255;
  const gf = g / 255;
  const bf = b / 255;
  const max = Math.max(rf, gf, bf);
  const min = Math.min(rf, gf, bf);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rf: h = (gf - bf) / d + (gf < bf ? 6 : 0); break;
      case gf: h = (bf - rf) / d + 2; break;
      case bf: h = (rf - gf) / d + 4; break;
    }
    h = Math.round(h * 60);
  }

  const hsl = `hsl(${h}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;

  return { hex, rgb, hsl };
}
