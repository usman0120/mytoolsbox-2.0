// Pure logic engine for Barcode & QR Code Generation
import QRCode from "qrcode";

export type BarcodeType = "CODE128" | "CODE39" | "EAN13" | "QR";

export interface BarcodeRenderOptions {
  barWidth?: number;       // default 2
  height?: number;         // default 100
  quietZone?: number;      // default 15
  showText?: boolean;      // default true
  fontSize?: number;       // default 14
  color?: string;          // default "#000000"
  backgroundColor?: string;// default "#FFFFFF"
}

// ----------------------------------------------------
// 1. Code 128 (Subset B)
// ----------------------------------------------------
const CODE128_PATTERNS = [
  "212222", "222122", "222221", "121223", "121322", "131222", "122213", "122312", "132212", "221213",
  "221312", "231212", "112232", "122132", "122231", "113222", "123122", "123221", "223211", "221132",
  "221231", "213212", "223112", "312131", "311222", "321122", "321221", "312212", "322112", "322211",
  "212123", "212321", "232121", "111323", "131123", "131321", "112313", "132113", "132311", "211313",
  "231113", "231311", "112133", "112331", "132131", "113123", "113321", "133121", "313121", "211331",
  "231131", "213113", "213311", "213131", "311123", "311321", "331121", "312113", "312311", "332111",
  "314111", "221411", "431111", "111224", "111422", "121124", "121421", "141122", "141221", "112214",
  "112412", "122114", "122411", "142112", "142211", "241211", "221114", "413111", "241112", "134111",
  "111242", "121142", "121241", "114212", "124112", "124211", "411212", "421112", "421211", "212141",
  "214121", "412121", "111143", "111341", "131141", "114113", "114311", "411113", "411311", "113141",
  "114131", "311141", "411131", "211412", "211214", "211232", "2331112"
];

function patternToBits(pattern: string): string {
  let bits = "";
  let isBar = true;
  for (const char of pattern) {
    const len = parseInt(char, 10);
    bits += (isBar ? "1" : "0").repeat(len);
    isBar = !isBar;
  }
  return bits;
}

export function encodeCode128(text: string): { bits: string; valid: boolean; error?: string } {
  if (!text) return { bits: "", valid: false, error: "Input text is required" };

  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if (code < 32 || code > 126) {
      return { bits: "", valid: false, error: `Invalid character '${text[i]}'. Code 128B supports ASCII 32 to 126.` };
    }
  }

  // Start with Start Code B (index 104)
  const values: number[] = [104];
  let checkSum = 104;

  for (let i = 0; i < text.length; i++) {
    const val = text.charCodeAt(i) - 32;
    values.push(val);
    checkSum += val * (i + 1);
  }

  const checksumValue = checkSum % 103;
  values.push(checksumValue);
  values.push(106); // Stop Code (index 106)

  let bits = "";
  for (const val of values) {
    bits += patternToBits(CODE128_PATTERNS[val]);
  }

  return { bits, valid: true };
}

// ----------------------------------------------------
// 2. Code 39
// ----------------------------------------------------
const CODE39_MAP: Record<string, string> = {
  "0": "000110100", "1": "100100001", "2": "001100001", "3": "101100000", "4": "000110001",
  "5": "100110000", "6": "001110000", "7": "000100101", "8": "100100100", "9": "001100100",
  "A": "100001001", "B": "001001001", "C": "101001000", "D": "000011001", "E": "100011000",
  "F": "001011000", "G": "000001101", "H": "100001100", "I": "001001100", "J": "000011100",
  "K": "100000011", "L": "001000011", "M": "101000010", "N": "000010011", "O": "100010010",
  "P": "001010010", "Q": "000000111", "R": "100000110", "S": "001000110", "T": "000010110",
  "U": "110000001", "V": "011000001", "W": "111000000", "X": "010010001", "Y": "110010000",
  "Z": "011010000", "-": "010000101", ".": "110000100", " ": "011000100", "$": "010101000",
  "/": "010100010", "+": "010001010", "%": "000101010", "*": "010010100",
};

export function encodeCode39(text: string): { bits: string; valid: boolean; error?: string } {
  const upper = text.toUpperCase();
  if (!upper) return { bits: "", valid: false, error: "Input text is required" };

  for (const ch of upper) {
    if (!CODE39_MAP[ch]) {
      return { bits: "", valid: false, error: `Character '${ch}' is not supported in Code 39.` };
    }
  }

  const fullText = `*${upper}*`;
  let bits = "";

  for (let i = 0; i < fullText.length; i++) {
    const pattern = CODE39_MAP[fullText[i]];
    // 9 elements: 5 bars (indices 0, 2, 4, 6, 8) and 4 spaces (indices 1, 3, 5, 7)
    // '1' = wide (2 modules), '0' = narrow (1 module)
    for (let j = 0; j < 9; j++) {
      const isBar = j % 2 === 0;
      const isWide = pattern[j] === "1";
      const moduleCount = isWide ? 2 : 1;
      bits += (isBar ? "1" : "0").repeat(moduleCount);
    }
    // Narrow inter-character space
    if (i < fullText.length - 1) {
      bits += "0";
    }
  }

  return { bits, valid: true };
}

// ----------------------------------------------------
// 3. EAN-13
// ----------------------------------------------------
const EAN_L = ["0001101", "0011001", "0010011", "0111101", "0100011", "0110001", "0101111", "0111011", "0110111", "0001011"];
const EAN_G = ["0100111", "0110011", "0011011", "0100001", "0011101", "0111001", "0000101", "0010001", "0001001", "0010111"];
const EAN_R = ["1110010", "1100110", "1101100", "1000010", "1011100", "1001110", "1010000", "1000100", "1001000", "1110100"];

const EAN_PARITY = [
  "LLLLLL", "LLGLGG", "LLGGLG", "LLGGGL", "LGLLGG",
  "LGGLLG", "LGGGLL", "LGLGLG", "LGLGGL", "LGGLGL"
];

export function calculateEANChecksum(digits12: string): number {
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(digits12[i], 10);
    sum += i % 2 === 0 ? digit : digit * 3;
  }
  return (10 - (sum % 10)) % 10;
}

export function encodeEAN13(digitsInput: string): { bits: string; fullCode: string; valid: boolean; error?: string } {
  const clean = digitsInput.replace(/\D/g, "");
  if (clean.length !== 12 && clean.length !== 13) {
    return { bits: "", fullCode: "", valid: false, error: "EAN-13 requires 12 or 13 numerical digits." };
  }

  const base12 = clean.slice(0, 12);
  const check = calculateEANChecksum(base12);

  if (clean.length === 13 && parseInt(clean[12], 10) !== check) {
    return {
      bits: "",
      fullCode: "",
      valid: false,
      error: `Invalid EAN-13 check digit. Expected '${check}', got '${clean[12]}'.`,
    };
  }

  const fullCode = base12 + check.toString();
  const firstDigit = parseInt(fullCode[0], 10);
  const parity = EAN_PARITY[firstDigit];

  let bits = "101"; // Start guard pattern

  // Left 6 digits
  for (let i = 0; i < 6; i++) {
    const d = parseInt(fullCode[i + 1], 10);
    const enc = parity[i] === "L" ? EAN_L[d] : EAN_G[d];
    bits += enc;
  }

  bits += "01010"; // Center guard pattern

  // Right 6 digits
  for (let i = 7; i < 13; i++) {
    const d = parseInt(fullCode[i], 10);
    bits += EAN_R[d];
  }

  bits += "101"; // End guard pattern

  return { bits, fullCode, valid: true };
}

// ----------------------------------------------------
// 4. Barcode Renderers (SVG & Canvas)
// ----------------------------------------------------
export function generateBarcodeSvg(
  bits: string,
  displayLabel: string,
  options: BarcodeRenderOptions = {}
): string {
  const barWidth = options.barWidth || 2;
  const height = options.height || 100;
  const quietZone = options.quietZone || 15;
  const showText = options.showText ?? true;
  const fontSize = options.fontSize || 14;
  const color = options.color || "#000000";
  const bg = options.backgroundColor || "#FFFFFF";

  const totalWidth = bits.length * barWidth + quietZone * 2;
  const textSpace = showText ? fontSize + 10 : 0;
  const totalHeight = height + textSpace;

  let rects = "";
  let x = quietZone;

  for (let i = 0; i < bits.length; i++) {
    if (bits[i] === "1") {
      rects += `<rect x="${x}" y="10" width="${barWidth}" height="${height - 20}" fill="${color}" />`;
    }
    x += barWidth;
  }

  const textElement = showText
    ? `<text x="${totalWidth / 2}" y="${height + fontSize - 6}" font-family="monospace" font-size="${fontSize}" fill="${color}" text-anchor="middle">${displayLabel}</text>`
    : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalWidth} ${totalHeight}" width="${totalWidth}" height="${totalHeight}">
    <rect width="${totalWidth}" height="${totalHeight}" fill="${bg}"/>
    ${rects}
    ${textElement}
  </svg>`;
}

export function drawBarcodeToCanvas(
  canvas: HTMLCanvasElement,
  bits: string,
  displayLabel: string,
  options: BarcodeRenderOptions = {}
): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const barWidth = options.barWidth || 2;
  const height = options.height || 100;
  const quietZone = options.quietZone || 15;
  const showText = options.showText ?? true;
  const fontSize = options.fontSize || 14;
  const color = options.color || "#000000";
  const bg = options.backgroundColor || "#FFFFFF";

  const totalWidth = bits.length * barWidth + quietZone * 2;
  const textSpace = showText ? fontSize + 10 : 0;
  const totalHeight = height + textSpace;

  canvas.width = totalWidth;
  canvas.height = totalHeight;

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, totalWidth, totalHeight);

  ctx.fillStyle = color;
  let x = quietZone;

  for (let i = 0; i < bits.length; i++) {
    if (bits[i] === "1") {
      ctx.fillRect(x, 10, barWidth, height - 20);
    }
    x += barWidth;
  }

  if (showText) {
    ctx.font = `${fontSize}px monospace`;
    ctx.textAlign = "center";
    ctx.fillText(displayLabel, totalWidth / 2, height + fontSize - 6);
  }
}

// ----------------------------------------------------
// 5. QR Code Generation
// ----------------------------------------------------
export async function generateQrDataUrl(
  text: string,
  options?: { width?: number; margin?: number; darkColor?: string; lightColor?: string }
): Promise<string> {
  return QRCode.toDataURL(text, {
    width: options?.width || 300,
    margin: options?.margin || 2,
    color: {
      dark: options?.darkColor || "#000000",
      light: options?.lightColor || "#ffffff",
    },
  });
}

export async function generateQrSvg(
  text: string,
  options?: { width?: number; margin?: number }
): Promise<string> {
  return QRCode.toString(text, {
    type: "svg",
    width: options?.width || 300,
    margin: options?.margin || 2,
  });
}
