import { describe, it, expect } from "vitest";
import {
  DESIGN_TEMPLATES,
  PRESET_GRADIENTS,
  calculateFittedDimensions,
} from "@/features/images/canva-design";
import {
  generatePalette,
  hexToRgb,
  rgbToHex,
  rgbToHsl,
  rgbToCmyk,
  getLuminance,
  getContrastRatio,
  generateShades,
  exportCssVariables,
  exportTailwindConfig,
} from "@/features/tools/color-palette";
import {
  generatePassword,
  generatePassphrase,
  generatePin,
  calculatePasswordEntropy,
  estimateCrackTime,
} from "@/features/tools/password-generator";
import {
  computeHash,
  crc32,
  md5,
  computeHMAC,
  compareHashes,
  computeAllHashes,
} from "@/features/tools/hash-generator";
import {
  decodeJWT,
  getTokenStatus,
  formatDuration,
  verifyJwtHmacSignature,
} from "@/features/tools/jwt-decoder";
import {
  generateShortCode,
  normalizeUrl,
  validateUrl,
  validateCustomAlias,
  createShortLink,
  exportLinksToCSV,
} from "@/features/tools/url-shortener";
import {
  encodeCode128,
  encodeCode39,
  calculateEANChecksum,
  encodeEAN13,
  generateBarcodeSvg,
} from "@/features/tools/barcode-generator";
import {
  CURRENCY_REGISTRY,
  convertCurrency,
  formatCurrencyValue,
  generateComparisonMatrix,
} from "@/features/tools/currency-converter";
import {
  getRandomInt,
  getRandomFloat,
  rollDice,
  flipCoin,
  shuffleArray,
  pickRandomItems,
  generateRandomString,
  generateCryptoUUID,
  generateRandomColor,
} from "@/features/tools/random-generator";

describe("1. Canva Design Studio Engine", () => {
  it("provides templates for all social, print, and presentation formats", () => {
    expect(DESIGN_TEMPLATES.length).toBeGreaterThanOrEqual(8);
    const insta = DESIGN_TEMPLATES.find((t) => t.id === "insta_post");
    expect(insta?.width).toBe(1080);
    expect(insta?.height).toBe(1080);
  });

  it("calculates fitted dimensions within container boundaries maintaining aspect ratio", () => {
    const fitted = calculateFittedDimensions(1920, 1080, 800, 600);
    expect(fitted.width).toBeLessThanOrEqual(800);
    expect(fitted.height).toBeLessThanOrEqual(600);
    expect(fitted.scale).toBeCloseTo(800 / 1920, 2);
  });

  it("provides preset gradient options with valid hex colors", () => {
    expect(PRESET_GRADIENTS.length).toBeGreaterThanOrEqual(6);
    expect(PRESET_GRADIENTS[0].from).toMatch(/^#[0-9a-fA-F]{6}$/);
    expect(PRESET_GRADIENTS[0].to).toMatch(/^#[0-9a-fA-F]{6}$/);
  });
});

describe("2. Color Palette Generator Engine", () => {
  it("converts hex to RGB, HSL, and CMYK correctly", () => {
    const rgb = hexToRgb("#3b82f6");
    expect(rgb).toEqual({ r: 59, g: 130, b: 246 });
    expect(rgbToHex(59, 130, 246)).toBe("#3b82f6");

    const hsl = rgbToHsl(59, 130, 246);
    expect(hsl.h).toBe(217);
    expect(hsl.s).toBe(91);
    expect(hsl.l).toBe(60);

    const cmyk = rgbToCmyk(59, 130, 246);
    expect(cmyk.c).toBe(76);
    expect(cmyk.k).toBe(4);
  });

  it("generates correct color harmonies (complementary, triadic, analogous)", () => {
    const palette = generatePalette("#ff0000", "complementary", 5);
    expect(palette.length).toBe(5);
    expect(palette[0].hex).toBe("#ff0000");

    const triadic = generatePalette("#00ff00", "triadic", 3);
    expect(triadic.length).toBe(3);
  });

  it("calculates WCAG contrast ratios and relative luminance accurately", () => {
    const blackLum = getLuminance({ r: 0, g: 0, b: 0 });
    const whiteLum = getLuminance({ r: 255, g: 255, b: 255 });
    expect(blackLum).toBe(0);
    expect(whiteLum).toBe(1);

    const contrast = getContrastRatio("#000000", "#ffffff");
    expect(contrast).toBe(21);
  });

  it("generates full 50-900 shade spectrum and exports CSS variables", () => {
    const shades = generateShades("#3b82f6");
    expect(shades.length).toBe(10);
    expect(shades[0].shade).toBe(50);
    expect(shades[9].shade).toBe(900);

    const palette = generatePalette("#3b82f6", "analogous", 5);
    const css = exportCssVariables(palette);
    expect(css).toContain(":root {");
    expect(css).toContain("--color-primary-1:");

    const tw = exportTailwindConfig(palette);
    expect(tw).toContain("colors: {");
  });
});

describe("3. Password Generator Engine", () => {
  it("generates passwords of specified length adhering to options", () => {
    const pwd = generatePassword({
      length: 20,
      uppercase: true,
      lowercase: true,
      numbers: true,
      symbols: true,
    });
    expect(pwd.length).toBe(20);
    expect(/[A-Z]/.test(pwd)).toBe(true);
    expect(/[a-z]/.test(pwd)).toBe(true);
    expect(/[0-9]/.test(pwd)).toBe(true);
  });

  it("avoids ambiguous characters when requested", () => {
    for (let i = 0; i < 10; i++) {
      const pwd = generatePassword({
        length: 30,
        uppercase: true,
        lowercase: true,
        numbers: true,
        symbols: true,
        avoidAmbiguous: true,
      });
      expect(/[0O1lI]/.test(pwd)).toBe(false);
    }
  });

  it("generates Diceware passphrases and numeric PINs", () => {
    const phrase = generatePassphrase(4, "-");
    const words = phrase.split("-");
    expect(words.length).toBe(4);

    const pin = generatePin(6);
    expect(pin).toMatch(/^\d{6}$/);
  });

  it("calculates Shannon entropy and crack time estimations", () => {
    const entropy = calculatePasswordEntropy("correct-horse-battery-staple");
    expect(entropy.bits).toBeGreaterThan(60);
    expect(entropy.strength).toBe("very-strong");

    const crackTime = estimateCrackTime(entropy.bits);
    expect(crackTime).toBeTruthy();
  });
});

describe("4. Hash Generator Engine", () => {
  it("calculates correct MD5, CRC-32, and SHA digests", async () => {
    const md5Hash = await computeHash("hello", "MD5");
    expect(md5Hash).toBe("5d41402abc4b2a76b9719d911017c592");

    const crc = crc32("hello");
    expect(crc).toBe("3610a686");

    const sha256Hash = await computeHash("hello", "SHA-256");
    expect(sha256Hash).toBe("2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824");
  });

  it("computes HMAC-SHA256 signatures", async () => {
    const hmac = await computeHMAC("secretKey", "message");
    expect(hmac.length).toBe(64);
  });

  it("compares hashes case-insensitively and computes all hashes simultaneously", async () => {
    expect(compareHashes("ABCDEF", "abcdef")).toBe(true);
    const all = await computeAllHashes("antigravity");
    expect(all["MD5"]).toBeTruthy();
    expect(all["SHA-256"]).toBeTruthy();
    expect(all["CRC-32"]).toBeTruthy();
  });
});

describe("5. JWT Decoder Engine", () => {
  const sampleToken =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." +
    "eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFsaWNlIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMiwiZXhwIjoxNzk4NzU0NDAwfQ." +
    "TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ";

  it("decodes valid JWT tokens and extracts headers & claims", () => {
    const result = decodeJWT(sampleToken);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.header.alg).toBe("HS256");
      expect(result.data.payload.sub).toBe("1234567890");
      expect(result.data.payload["name"]).toBe("Alice");
    }
  });

  it("detects expired tokens and calculates remaining time", () => {
    const expiredStatus = getTokenStatus(1500000000); // Year 2017
    expect(expiredStatus.status).toBe("expired");

    const validStatus = getTokenStatus(Math.floor(Date.now() / 1000) + 3600);
    expect(validStatus.status).toBe("valid");
    expect(validStatus.remainingSeconds).toBeGreaterThan(3500);

    expect(formatDuration(3665)).toBe("1h 1m");
  });

  it("verifies HMAC-SHA256 signature when secret matches", async () => {
    const testSecret = "my-secret-key-123";
    const headerB64 = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
    const payloadB64 = btoa(JSON.stringify({ sub: "user123", iat: 1600000000 }))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    // Sign it
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      enc.encode(testSecret),
      { name: "HMAC", hash: { name: "SHA-256" } },
      false,
      ["sign"]
    );
    const sigBuf = await crypto.subtle.sign("HMAC", key, enc.encode(`${headerB64}.${payloadB64}`));
    let bin = "";
    new Uint8Array(sigBuf).forEach((b) => (bin += String.fromCharCode(b)));
    const sigB64 = btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

    const token = `${headerB64}.${payloadB64}.${sigB64}`;
    const verifyPass = await verifyJwtHmacSignature(token, testSecret);
    expect(verifyPass.verified).toBe(true);

    const verifyFail = await verifyJwtHmacSignature(token, "wrong-key");
    expect(verifyFail.verified).toBe(false);
  });
});

describe("6. URL Shortener Engine", () => {
  it("normalizes and validates URLs properly", () => {
    expect(normalizeUrl("google.com")).toBe("https://google.com");
    expect(normalizeUrl("http://example.com")).toBe("http://example.com");

    expect(validateUrl("https://mytoolsbox.me").valid).toBe(true);
    expect(validateUrl("invalid-domain").valid).toBe(false);
    expect(validateUrl("javascript:alert(1)").valid).toBe(false);
  });

  it("generates unique base62 shortcodes and validates aliases", () => {
    const code = generateShortCode(6);
    expect(code.length).toBe(6);
    expect(/^[0-9a-zA-Z]{6}$/.test(code)).toBe(true);

    expect(validateCustomAlias("docs-2026").valid).toBe(true);
    expect(validateCustomAlias("a").valid).toBe(false); // too short
    expect(validateCustomAlias("duplicate", ["duplicate"]).valid).toBe(false);
  });

  it("creates shortlink objects and exports them to CSV", () => {
    const res = createShortLink("https://github.com", { customAlias: "gh" });
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.link.shortCode).toBe("gh");
      const csv = exportLinksToCSV([res.link]);
      expect(csv).toContain("https://mytoolsbox.me/s/gh");
    }
  });
});

describe("7. Barcode Generator Engine", () => {
  it("encodes authentic Code 128 (Subset B) with Modulo 103 checksum", () => {
    const result = encodeCode128("ABC123");
    expect(result.valid).toBe(true);
    expect(result.bits.length).toBeGreaterThan(50);
    expect(result.bits.startsWith("11010010000")).toBe(true); // Start B pattern
  });

  it("encodes authentic Code 39 with standard start/stop characters", () => {
    const result = encodeCode39("HELLO-1");
    expect(result.valid).toBe(true);
    expect(result.bits.length).toBeGreaterThan(60);
  });

  it("calculates EAN-13 check digit and encodes with guard patterns", () => {
    const check = calculateEANChecksum("400638133393");
    expect(check).toBe(1); // Standard Stabilo Boss pen barcode

    const eanRes = encodeEAN13("4006381333931");
    expect(eanRes.valid).toBe(true);
    expect(eanRes.bits.startsWith("101")).toBe(true); // Start guard
    expect(eanRes.bits.endsWith("101")).toBe(true);   // End guard
    expect(eanRes.bits.includes("01010")).toBe(true); // Center guard
  });

  it("renders barcode SVG markup with quiet zones", () => {
    const code = encodeCode128("TEST");
    const svg = generateBarcodeSvg(code.bits, "TEST");
    expect(svg).toContain("<svg");
    expect(svg).toContain("<rect");
    expect(svg).toContain("TEST</text>");
  });
});

describe("8. Currency Converter Engine", () => {
  it("contains registry of 35+ fiats and cryptocurrencies", () => {
    const keys = Object.keys(CURRENCY_REGISTRY);
    expect(keys.length).toBeGreaterThanOrEqual(35);
    expect(CURRENCY_REGISTRY["USD"]).toBeDefined();
    expect(CURRENCY_REGISTRY["EUR"]).toBeDefined();
    expect(CURRENCY_REGISTRY["BTC"]).toBeDefined();
  });

  it("performs accurate cross-rate conversions and inverse rates", () => {
    // 100 USD to EUR (at 0.92)
    const conv = convertCurrency(100, "USD", "EUR");
    expect(conv.result).toBeCloseTo(92, 1);
    expect(conv.exchangeRate).toBeCloseTo(0.92, 2);
    expect(conv.inverseRate).toBeCloseTo(1 / 0.92, 2);
  });

  it("formats currency values and generates comparison matrix", () => {
    const formatted = formatCurrencyValue(1234.56, CURRENCY_REGISTRY["USD"]);
    expect(formatted).toBe("$1,234.56");

    const matrix = generateComparisonMatrix(100, "USD", ["EUR", "GBP", "JPY"]);
    expect(matrix.length).toBe(3);
    expect(matrix[0].code).toBe("EUR");
  });
});

describe("9. Random Generator Engine", () => {
  it("generates CSPRNG integers and floats within boundaries", () => {
    for (let i = 0; i < 50; i++) {
      const val = getRandomInt(10, 20);
      expect(val).toBeGreaterThanOrEqual(10);
      expect(val).toBeLessThanOrEqual(20);
    }

    const floatVal = getRandomFloat(1.5, 3.5, 2);
    expect(floatVal).toBeGreaterThanOrEqual(1.5);
    expect(floatVal).toBeLessThanOrEqual(3.5);
  });

  it("simulates dice rolls and coin flips with streak tracking", () => {
    const dice = rollDice(5, 6);
    expect(dice.rolls.length).toBe(5);
    expect(dice.total).toBe(dice.rolls.reduce((a, b) => a + b, 0));
    expect(dice.min).toBe(Math.min(...dice.rolls));
    expect(dice.max).toBe(Math.max(...dice.rolls));

    const coin = flipCoin(20);
    expect(coin.results.length).toBe(20);
    expect(coin.headsCount + coin.tailsCount).toBe(20);
    expect(coin.currentStreak.count).toBeGreaterThanOrEqual(1);
  });

  it("shuffles arrays and samples items without replacement", () => {
    const list = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const shuffled = shuffleArray(list);
    expect(shuffled.length).toBe(10);
    expect(shuffled.sort((a, b) => a - b)).toEqual(list);

    const picked = pickRandomItems(list, 3, false);
    expect(picked.length).toBe(3);
    const unique = new Set(picked);
    expect(unique.size).toBe(3);
  });

  it("generates valid RFC4122 v4 UUIDs and random colors", () => {
    const uuid = generateCryptoUUID();
    expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);

    const color = generateRandomColor();
    expect(color.hex).toMatch(/^#[0-9a-f]{6}$/i);
    expect(color.rgb).toMatch(/^rgb\(\d{1,3}, \d{1,3}, \d{1,3}\)$/);
    expect(color.hsl).toMatch(/^hsl\(\d{1,3}, \d{1,3}%, \d{1,3}%\)$/);

    const randStr = generateRandomString(16, "alphanumeric");
    expect(randStr.length).toBe(16);
  });
});
