// Pure logic engine for URL Shortener & Link Management

export interface ShortLink {
  id: string;
  originalUrl: string;
  shortCode: string;
  createdAt: number;
  clicks: number;
  title?: string;
  customAlias?: boolean;
}

const BASE62_CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

export function generateShortCode(length = 6): string {
  const bytes = new Uint8Array(length);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < length; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  let result = "";
  for (let i = 0; i < length; i++) {
    result += BASE62_CHARS.charAt(bytes[i] % BASE62_CHARS.length);
  }
  return result;
}

export function normalizeUrl(rawUrl: string): string {
  let url = rawUrl.trim();
  if (!url) return "";
  if (!/^https?:\/\//i.test(url)) {
    url = "https://" + url;
  }
  return url;
}

export function validateUrl(url: string): { valid: boolean; normalized: string; error?: string } {
  const normalized = normalizeUrl(url);
  if (!normalized) {
    return { valid: false, normalized: "", error: "URL cannot be empty." };
  }

  try {
    const parsed = new URL(normalized);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return { valid: false, normalized, error: "Only HTTP and HTTPS URLs are permitted." };
    }
    if (!parsed.hostname || !parsed.hostname.includes(".")) {
      return { valid: false, normalized, error: "URL must contain a valid domain name." };
    }
    return { valid: true, normalized };
  } catch {
    return { valid: false, normalized, error: "Malformed URL format." };
  }
}

export function validateCustomAlias(alias: string, existingCodes: string[] = []): { valid: boolean; error?: string } {
  const trimmed = alias.trim();
  if (!trimmed) {
    return { valid: true };
  }

  if (trimmed.length < 2 || trimmed.length > 30) {
    return { valid: false, error: "Custom alias must be between 2 and 30 characters." };
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
    return { valid: false, error: "Alias can only contain letters, numbers, hyphens, and underscores." };
  }

  if (existingCodes.some((code) => code.toLowerCase() === trimmed.toLowerCase())) {
    return { valid: false, error: "This alias is already taken. Please choose another." };
  }

  return { valid: true };
}

export function createShortLink(
  originalUrl: string,
  options?: { customAlias?: string; existingCodes?: string[]; title?: string }
): { success: true; link: ShortLink } | { success: false; error: string } {
  const urlCheck = validateUrl(originalUrl);
  if (!urlCheck.valid) {
    return { success: false, error: urlCheck.error || "Invalid URL" };
  }

  let code: string;
  const isCustom = Boolean(options?.customAlias?.trim());
  if (isCustom) {
    const aliasCheck = validateCustomAlias(options!.customAlias!, options?.existingCodes);
    if (!aliasCheck.valid) {
      return { success: false, error: aliasCheck.error || "Invalid alias" };
    }
    code = options!.customAlias!.trim();
  } else {
    code = generateShortCode();
    // Guarantee uniqueness
    while (options?.existingCodes?.includes(code)) {
      code = generateShortCode();
    }
  }

  const link: ShortLink = {
    id: `link_${Date.now()}_${generateShortCode(4)}`,
    originalUrl: urlCheck.normalized,
    shortCode: code,
    createdAt: Date.now(),
    clicks: 0,
    title: options?.title?.trim() || undefined,
    customAlias: isCustom,
  };

  return { success: true, link };
}

export function exportLinksToCSV(links: ShortLink[], domain = "mytoolsbox.me"): string {
  const headers = ["ID", "Short URL", "Original URL", "Clicks", "Created Date"];
  const rows = links.map((l) => [
    l.id,
    `https://${domain}/s/${l.shortCode}`,
    `"${l.originalUrl.replace(/"/g, '""')}"`,
    l.clicks,
    new Date(l.createdAt).toISOString(),
  ]);

  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}
