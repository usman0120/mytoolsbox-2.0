import { ProcessingResult } from "@/lib/processing/types";

export type IDType = "v4" | "v7" | "v1" | "nanoid" | "ulid";

export interface UUIDFormatOptions {
  type?: IDType;
  uppercase?: boolean;
  noHyphens?: boolean;
  braces?: boolean;
  format?: "lines" | "csv" | "json" | "sql";
}

export interface UUIDInspectResult {
  valid: boolean;
  version?: number;
  variant?: string;
  timestamp?: string;
  error?: string;
}

// Generate UUID v7 (RFC 9562 - timestamp based, sortable)
export function generateUUIDv7(): string {
  const timestamp = BigInt(Date.now());
  const randBytes = crypto.getRandomValues(new Uint8Array(10));

  // 48-bit timestamp
  const timeHex = timestamp.toString(16).padStart(12, "0");

  // Version 7 in bits 48-51
  const ver = "7";
  const randA = ((randBytes[0] & 0x0f) << 8) | randBytes[1];
  const randAHex = randA.toString(16).padStart(3, "0");

  // Variant (10xx) in bits 64-65
  const varByte = (randBytes[2] & 0x3f) | 0x80;
  const varHex = varByte.toString(16).padStart(2, "0");

  const randB = Array.from(randBytes.slice(3))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return `${timeHex.slice(0, 8)}-${timeHex.slice(8, 12)}-${ver}${randAHex}-${varHex}${randB.slice(0, 2)}-${randB.slice(2, 14)}`;
}

// Generate UUID v1 simulation
export function generateUUIDv1(): string {
  const now = Date.now();
  // 100-nanosecond intervals since Oct 15, 1582
  const gregorianOffset = BigInt("122192928000000000");
  const intervals = BigInt(now) * BigInt(10000) + gregorianOffset;
  const timeHex = intervals.toString(16).padStart(16, "0");

  const timeLow = timeHex.slice(8, 16);
  const timeMid = timeHex.slice(4, 8);
  const timeHiAndVersion = "1" + timeHex.slice(1, 4);

  const rand = crypto.getRandomValues(new Uint8Array(8));
  const clockSeq = ((rand[0] & 0x3f) | 0x80).toString(16).padStart(2, "0") + rand[1].toString(16).padStart(2, "0");
  const node = Array.from(rand.slice(2))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return `${timeLow}-${timeMid}-${timeHiAndVersion}-${clockSeq}-${node}`;
}

// NanoID generator (21 characters)
export function generateNanoID(size = 21): string {
  const alphabet = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLFGQZ_t~";
  const bytes = crypto.getRandomValues(new Uint8Array(size));
  let id = "";
  for (let i = 0; i < size; i++) {
    id += alphabet[bytes[i] % alphabet.length];
  }
  return id;
}

// ULID generator (26 characters, Crockford's base32, timestamp-sortable)
export function generateULID(): string {
  const ENCODING = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
  let time = Date.now();
  let timeChars = "";
  for (let i = 9; i >= 0; i--) {
    timeChars = ENCODING[time % 32] + timeChars;
    time = Math.floor(time / 32);
  }

  const randBytes = crypto.getRandomValues(new Uint8Array(10));
  let randChars = "";
  for (let i = 0; i < 10; i++) {
    randChars += ENCODING[randBytes[i] % 32];
    randChars += ENCODING[Math.floor(randBytes[i] / 8) % 32];
  }

  return timeChars + randChars.slice(0, 16);
}

// Core ID Generator
export function generateSingleID(type: IDType = "v4"): string {
  switch (type) {
    case "v7":
      return generateUUIDv7();
    case "v1":
      return generateUUIDv1();
    case "nanoid":
      return generateNanoID();
    case "ulid":
      return generateULID();
    case "v4":
    default:
      return crypto.randomUUID();
  }
}

export function formatSingleID(raw: string, options: UUIDFormatOptions = {}): string {
  let res = raw;
  if (options.noHyphens && raw.includes("-")) {
    res = res.replace(/-/g, "");
  }
  if (options.uppercase) {
    res = res.toUpperCase();
  } else {
    res = res.toLowerCase();
  }
  if (options.braces) {
    res = `{${res}}`;
  }
  return res;
}

export function generateUUIDBulk(count: number, options: UUIDFormatOptions = {}): ProcessingResult {
  const { type = "v4", format = "lines" } = options;
  const num = Math.min(Math.max(1, count), 500);

  const ids: string[] = [];
  for (let i = 0; i < num; i++) {
    ids.push(formatSingleID(generateSingleID(type), options));
  }

  let formattedOutput = "";
  if (format === "csv") {
    formattedOutput = ids.join(", ");
  } else if (format === "json") {
    formattedOutput = JSON.stringify(ids, null, 2);
  } else if (format === "sql") {
    formattedOutput = ids.map((id) => `('${id}')`).join(",\n");
  } else {
    formattedOutput = ids.join("\n");
  }

  return {
    status: "success",
    message: formattedOutput,
  };
}

export function generateUUID(): ProcessingResult {
  return { status: "success", message: crypto.randomUUID() };
}

export function inspectUUID(uuidStr: string): UUIDInspectResult {
  const clean = uuidStr.trim().replace(/^\{|\}$/g, "");
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-([1-8])[0-9a-f]{3}-([89ab])[0-9a-f]{3}-[0-9a-f]{12}$/i;
  const match = clean.match(uuidRegex);

  if (!match) {
    return {
      valid: false,
      error: "Not a valid RFC 4122 / RFC 9562 UUID format.",
    };
  }

  const version = parseInt(match[1], 10);
  const variantHex = match[2].toLowerCase();
  let variant = "RFC 4122 / DCE 1.1";
  if (["8", "9", "a", "b"].includes(variantHex)) {
    variant = "RFC 4122 (Standard)";
  }

  let timestamp: string | undefined;
  if (version === 7) {
    try {
      const timeHex = clean.replace(/-/g, "").slice(0, 12);
      const ms = parseInt(timeHex, 16);
      timestamp = new Date(ms).toISOString();
    } catch {
      // ignore
    }
  }

  return {
    valid: true,
    version,
    variant,
    timestamp,
  };
}