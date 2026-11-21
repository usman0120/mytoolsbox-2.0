// Barcode & QR Code Validation, Checksums, and Data Parsing

export type BarcodeType = "ean13" | "upca" | "code128" | "code39" | "qrcode" | "unknown";
export type ParsedDataType = "url" | "wifi" | "email" | "phone" | "text" | "number";

export interface ParsedBarcodeResult {
  rawValue: string;
  format: string;
  dataType: ParsedDataType;
  isValidChecksum: boolean;
  metadata?: Record<string, string>;
}

/**
 * Validates and checks standard EAN-13 barcode checksum.
 * Formula: sum odd position digits * 1, even position digits * 3.
 * Check digit = (10 - (sum % 10)) % 10.
 */
export function validateEAN13(barcode: string): boolean {
  const clean = barcode.replace(/[-\s]/g, "");
  if (!/^\d{13}$/.test(clean)) return false;

  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(clean[i], 10);
    sum += i % 2 === 0 ? digit : digit * 3;
  }

  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit === parseInt(clean[12], 10);
}

/**
 * Validates standard UPC-A (12-digit) barcode checksum.
 */
export function validateUPCA(barcode: string): boolean {
  const clean = barcode.replace(/[-\s]/g, "");
  if (!/^\d{12}$/.test(clean)) return false;

  let sum = 0;
  for (let i = 0; i < 11; i++) {
    const digit = parseInt(clean[i], 10);
    sum += i % 2 === 0 ? digit * 3 : digit;
  }

  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit === parseInt(clean[11], 10);
}

/**
 * Parses QR code content to extract structured metadata (WiFi, URL, vCard, Email, Phone).
 */
export function parseQRData(content: string): { type: ParsedDataType; metadata?: Record<string, string> } {
  const text = content.trim();

  // WiFi: WIFI:S:MySSID;T:WPA;P:MyPassword;;
  if (/^WIFI:/i.test(text)) {
    const ssidMatch = text.match(/S:([^;]+)/i);
    const passMatch = text.match(/P:([^;]+)/i);
    const typeMatch = text.match(/T:([^;]+)/i);
    return {
      type: "wifi",
      metadata: {
        ssid: ssidMatch ? ssidMatch[1] : "",
        type: typeMatch ? typeMatch[1] : "WPA",
        password: passMatch ? passMatch[1] : "",
      },
    };
  }

  // URL
  if (/^https?:\/\//i.test(text)) {
    return { type: "url", metadata: { url: text } };
  }

  // Email: mailto: or plain email
  if (/^mailto:/i.test(text) || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(text)) {
    const email = text.replace(/^mailto:/i, "");
    return { type: "email", metadata: { email } };
  }

  // Pure numbers (like product barcodes: UPC, EAN, ISBN, serials)
  if (/^\d+$/.test(text)) {
    return { type: "number" };
  }

  // Phone: tel: or international/formatted phone
  if (/^tel:/i.test(text) || /^\+[\d\s\-().]{7,}$/.test(text) || /^(\(?\d{3}\)?[\s.-]?)\d{3}[\s.-]?\d{4}$/.test(text)) {
    const phone = text.replace(/^tel:/i, "");
    return { type: "phone", metadata: { phone } };
  }

  return { type: "text" };
}

/**
 * Comprehensive parser for scanned barcode / QR codes.
 */
export function parseBarcode(value: string, formatGuess: string = "QR_CODE"): ParsedBarcodeResult {
  const clean = value.trim();
  const parsed = parseQRData(clean);

  let isValidChecksum = true;
  if (/^\d{13}$/.test(clean)) {
    isValidChecksum = validateEAN13(clean);
  } else if (/^\d{12}$/.test(clean)) {
    isValidChecksum = validateUPCA(clean);
  }

  return {
    rawValue: clean,
    format: formatGuess.toUpperCase(),
    dataType: parsed.type,
    isValidChecksum,
    metadata: parsed.metadata,
  };
}
