// Cryptographically Secure Password & Passphrase Generator

export interface PasswordOptions {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
  avoidAmbiguous?: boolean;
  excludeAmbiguous?: boolean;
}

const UPPERCASE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWERCASE_CHARS = "abcdefghijklmnopqrstuvwxyz";
const NUMBER_CHARS = "0123456789";
const SYMBOL_CHARS = "!@#$%^&*()_+-=[]{}|;:,.<>?";
const AMBIGUOUS_CHARS = /[il1Lo0OI|]/g;

const MEMORABLE_WORDS = [
  "falcon", "orbit", "crystal", "summit", "timber", "canyon", "velvet", "breeze",
  "harbor", "zenith", "aurora", "beacon", "galaxy", "meadow", "anchor", "shadow",
  "phoenix", "quarry", "whisper", "silver", "planet", "radiant", "vortex", "cascade",
  "glacier", "horizon", "solace", "nebula", "tempest", "mirage", "thunder", "cobalt",
];

export function generateSecurePassword(options: PasswordOptions): string {
  const { length, uppercase, lowercase, numbers, symbols } = options;
  const avoid = options.avoidAmbiguous ?? options.excludeAmbiguous ?? false;

  let pool = "";
  const requiredChars: string[] = [];

  const filter = (set: string) => (avoid ? set.replace(AMBIGUOUS_CHARS, "") : set);

  if (uppercase) {
    const s = filter(UPPERCASE_CHARS);
    if (s) {
      pool += s;
      requiredChars.push(getRandomChar(s));
    }
  }
  if (lowercase) {
    const s = filter(LOWERCASE_CHARS);
    if (s) {
      pool += s;
      requiredChars.push(getRandomChar(s));
    }
  }
  if (numbers) {
    const s = filter(NUMBER_CHARS);
    if (s) {
      pool += s;
      requiredChars.push(getRandomChar(s));
    }
  }
  if (symbols) {
    const s = filter(SYMBOL_CHARS);
    if (s) {
      pool += s;
      requiredChars.push(getRandomChar(s));
    }
  }

  if (!pool || length <= 0) return "";

  const effectiveLength = Math.max(length, requiredChars.length);
  const remainingCount = effectiveLength - requiredChars.length;

  const resultChars: string[] = [...requiredChars];

  const randomValues = new Uint32Array(remainingCount);
  if (remainingCount > 0 && typeof crypto !== "undefined") {
    crypto.getRandomValues(randomValues);
    for (let i = 0; i < remainingCount; i++) {
      resultChars.push(pool[randomValues[i] % pool.length]);
    }
  }

  // Shuffle using Fisher-Yates CSPRNG
  for (let i = resultChars.length - 1; i > 0; i--) {
    const rand = new Uint32Array(1);
    crypto.getRandomValues(rand);
    const j = rand[0] % (i + 1);
    [resultChars[i], resultChars[j]] = [resultChars[j], resultChars[i]];
  }

  return resultChars.join("");
}

export const generatePassword = generateSecurePassword;

function getRandomChar(str: string): string {
  const rand = new Uint32Array(1);
  crypto.getRandomValues(rand);
  return str[rand[0] % str.length];
}

export function generatePassphrase(wordCount: number = 4, separator: string = "-"): string {
  const words: string[] = [];
  const rand = new Uint32Array(wordCount);
  crypto.getRandomValues(rand);

  for (let i = 0; i < wordCount; i++) {
    words.push(MEMORABLE_WORDS[rand[i] % MEMORABLE_WORDS.length]);
  }
  return words.join(separator);
}

export function generatePIN(digits: number = 4): string {
  const rand = new Uint32Array(digits);
  crypto.getRandomValues(rand);
  let pin = "";
  for (let i = 0; i < digits; i++) {
    pin += String(rand[i] % 10);
  }
  return pin;
}

export const generatePin = generatePIN;

export function calculateEntropyBits(password: string): number {
  if (!password) return 0;
  let poolSize = 0;
  if (/[a-z]/.test(password)) poolSize += 26;
  if (/[A-Z]/.test(password)) poolSize += 26;
  if (/[0-9]/.test(password)) poolSize += 10;
  if (/[^a-zA-Z0-9]/.test(password)) poolSize += 32;

  if (poolSize === 0) return 0;
  return Math.round(password.length * Math.log2(poolSize));
}

export function calculatePasswordEntropy(password: string): {
  bits: number;
  strength: "very-weak" | "weak" | "fair" | "strong" | "very-strong";
  label: string;
} {
  const bits = calculateEntropyBits(password);
  let strength: "very-weak" | "weak" | "fair" | "strong" | "very-strong";
  let label: string;

  if (bits < 28) {
    strength = "very-weak";
    label = "Very Weak";
  } else if (bits < 45) {
    strength = "weak";
    label = "Weak";
  } else if (bits < 65) {
    strength = "fair";
    label = "Fair";
  } else if (bits < 85) {
    strength = "strong";
    label = "Strong";
  } else {
    strength = "very-strong";
    label = "Very Strong";
  }

  return { bits, strength, label };
}

export function estimateCrackTime(entropyBits: number): string {
  if (entropyBits < 28) return "Instant (< 1 millisecond)";
  if (entropyBits < 45) return "Few seconds to minutes";
  if (entropyBits < 65) return "Several days to months";
  if (entropyBits < 85) return "Thousands of years";
  return "Trillions of centuries";
}

export function evaluatePasswordStrength(password: string): {
  entropyBits: number;
  label: "Very Weak" | "Weak" | "Fair" | "Strong" | "Very Strong";
  color: string;
  crackTimeEstimate: string;
} {
  const entropy = calculateEntropyBits(password);

  if (entropy < 28) {
    return { entropyBits: entropy, label: "Very Weak", color: "text-red-500", crackTimeEstimate: "Instant" };
  }
  if (entropy < 45) {
    return { entropyBits: entropy, label: "Weak", color: "text-orange-500", crackTimeEstimate: "Few seconds" };
  }
  if (entropy < 65) {
    return { entropyBits: entropy, label: "Fair", color: "text-yellow-500", crackTimeEstimate: "Few hours to days" };
  }
  if (entropy < 85) {
    return { entropyBits: entropy, label: "Strong", color: "text-green-500", crackTimeEstimate: "Thousands of years" };
  }
  return { entropyBits: entropy, label: "Very Strong", color: "text-emerald-500", crackTimeEstimate: "Millions of years" };
}
