import { ProcessingResult } from "@/lib/processing/types";

export interface ParsedUA {
  browser: { name: string; version: string; major: string };
  os: { name: string; version: string; arch?: string };
  device: { type: "Desktop" | "Mobile" | "Tablet" | "Bot" | "SmartTV" | "Console" | "Unknown"; vendor: string; model: string };
  engine: { name: string; version: string };
  bot?: { isBot: boolean; name?: string; category?: string };
  raw: string;
}

export function parseUserAgent(ua: string): ProcessingResult & { data?: ParsedUA } {
  if (!ua.trim()) {
    return { status: "error", error: "Please enter a User-Agent string." };
  }

  const raw = ua.trim();
  const botInfo = detectBot(raw);
  const browser = parseBrowser(raw);
  const os = parseOS(raw);
  const device = parseDevice(raw, botInfo.isBot);
  const engine = parseEngine(raw);

  const result: ParsedUA = {
    browser,
    os,
    device,
    engine,
    bot: botInfo,
    raw,
  };

  const title = botInfo.isBot
    ? `Bot: ${botInfo.name}`
    : `${result.browser.name} ${result.browser.major} on ${result.os.name}`;

  return {
    status: "success",
    message: title,
    data: result,
  };
}

function detectBot(ua: string): { isBot: boolean; name?: string; category?: string } {
  const bots = [
    { pattern: /Googlebot/i, name: "Googlebot", category: "Search Engine Crawler" },
    { pattern: /bingbot/i, name: "Bingbot", category: "Search Engine Crawler" },
    { pattern: /Baiduspider/i, name: "Baiduspider", category: "Search Engine Crawler" },
    { pattern: /YandexBot/i, name: "YandexBot", category: "Search Engine Crawler" },
    { pattern: /DuckDuckBot/i, name: "DuckDuckBot", category: "Search Engine Crawler" },
    { pattern: /ChatGPT-User|GPTBot/i, name: "OpenAI GPTBot", category: "AI Web Scraper" },
    { pattern: /Claude-Web|anthropic-ai/i, name: "Anthropic Claude Bot", category: "AI Web Scraper" },
    { pattern: /PerplexityBot/i, name: "Perplexity AI Bot", category: "AI Web Scraper" },
    { pattern: /Twitterbot/i, name: "Twitter / X Preview Bot", category: "Social Media Bot" },
    { pattern: /facebookexternalhit/i, name: "Facebook Metadata Scraper", category: "Social Media Bot" },
    { pattern: /Discordbot/i, name: "Discord Embed Bot", category: "Social Media Bot" },
    { pattern: /Slackbot/i, name: "Slackbot", category: "Social Media Bot" },
    { pattern: /curl/i, name: "cURL CLI Tool", category: "HTTP Client" },
    { pattern: /PostmanRuntime/i, name: "Postman API Client", category: "HTTP Client" },
  ];

  for (const b of bots) {
    if (b.pattern.test(ua)) {
      return { isBot: true, name: b.name, category: b.category };
    }
  }

  return { isBot: false };
}

function parseBrowser(ua: string): { name: string; version: string; major: string } {
  // Arc
  if (ua.includes("Arc/")) {
    const v = ua.match(/Arc\/([\d.]+)/)?.[1] || "1.0";
    return { name: "Arc Browser", version: v, major: v.split(".")[0] };
  }
  // Brave
  if (ua.includes("Brave/")) {
    const v = ua.match(/Brave\/([\d.]+)/)?.[1] || "1.0";
    return { name: "Brave", version: v, major: v.split(".")[0] };
  }
  // Edge
  const edgeMatch = ua.match(/Edg(?:e|A|iOS)?\/([\d.]+)/);
  if (edgeMatch) return { name: "Microsoft Edge", version: edgeMatch[1], major: edgeMatch[1].split(".")[0] };

  // Chrome
  const chromeMatch = ua.match(/Chrome\/([\d.]+)/);
  if (chromeMatch && !ua.includes("Edg") && !ua.includes("OPR")) {
    return { name: "Google Chrome", version: chromeMatch[1], major: chromeMatch[1].split(".")[0] };
  }

  // Firefox
  const firefoxMatch = ua.match(/Firefox\/([\d.]+)/);
  if (firefoxMatch) return { name: "Mozilla Firefox", version: firefoxMatch[1], major: firefoxMatch[1].split(".")[0] };

  // Safari
  const safariMatch = ua.match(/Version\/([\d.]+).*Safari/);
  if (safariMatch && !ua.includes("Chrome")) {
    return { name: "Apple Safari", version: safariMatch[1], major: safariMatch[1].split(".")[0] };
  }

  // Opera
  const operaMatch = ua.match(/(?:OPR|Opera)\/([\d.]+)/);
  if (operaMatch) return { name: "Opera", version: operaMatch[1], major: operaMatch[1].split(".")[0] };

  // Samsung
  const samsungMatch = ua.match(/SamsungBrowser\/([\d.]+)/);
  if (samsungMatch) return { name: "Samsung Internet", version: samsungMatch[1], major: samsungMatch[1].split(".")[0] };

  // DuckDuckGo
  if (ua.includes("DuckDuckGo")) {
    return { name: "DuckDuckGo Privacy Browser", version: "Mobile", major: "Mobile" };
  }

  return { name: "Unknown Browser", version: "Unknown", major: "Unknown" };
}

function parseOS(ua: string): { name: string; version: string; arch?: string } {
  let arch = "x64";
  if (ua.includes("ARM") || ua.includes("aarch64") || ua.includes("Apple Silicon")) {
    arch = "ARM64";
  } else if (ua.includes("x86") || ua.includes("i686")) {
    arch = "x86";
  }

  // Windows
  const winMatch = ua.match(/Windows NT ([\d.]+)/);
  if (winMatch) {
    const versions: Record<string, string> = {
      "10.0": "10 / 11", "6.3": "8.1", "6.2": "8", "6.1": "7",
    };
    return { name: "Windows", version: versions[winMatch[1]] || winMatch[1], arch };
  }

  // macOS
  const macMatch = ua.match(/Mac OS X ([\d_.]+)/);
  if (macMatch) {
    const v = macMatch[1].replace(/_/g, ".");
    return { name: "macOS", version: v, arch: ua.includes("Macintosh") ? "Apple Silicon / Intel" : arch };
  }

  // iOS / iPadOS
  const iosMatch = ua.match(/(?:iPhone|iPad|iPod).*OS ([\d_]+)/);
  if (iosMatch) {
    return { name: ua.includes("iPad") ? "iPadOS" : "iOS", version: iosMatch[1].replace(/_/g, "."), arch: "ARM64" };
  }

  // Android
  const androidMatch = ua.match(/Android ([\d.]+)/);
  if (androidMatch) {
    return { name: "Android", version: androidMatch[1], arch: "ARM64" };
  }

  // Linux
  if (ua.includes("Linux")) return { name: "Linux", version: "GNU/Linux", arch };
  if (ua.includes("CrOS")) return { name: "ChromeOS", version: "Latest", arch };

  return { name: "Unknown OS", version: "Unknown", arch };
}

function parseDevice(ua: string, isBot: boolean): { type: ParsedUA["device"]["type"]; vendor: string; model: string } {
  if (isBot) {
    return { type: "Bot", vendor: "Automated Robot", model: "Server Web Crawler" };
  }

  if (ua.includes("iPhone")) {
    return { type: "Mobile", vendor: "Apple", model: "iPhone" };
  }
  if (ua.includes("iPad")) {
    return { type: "Tablet", vendor: "Apple", model: "iPad" };
  }
  if (ua.includes("Android")) {
    const isTablet = !ua.includes("Mobile");
    const modelMatch = ua.match(/; ([^;)]+) Build/);
    return {
      type: isTablet ? "Tablet" : "Mobile",
      vendor: "Android",
      model: modelMatch?.[1]?.trim() || (isTablet ? "Tablet" : "Smartphone"),
    };
  }
  if (ua.includes("SmartTV") || ua.includes("Tizen") || ua.includes("Web0S")) {
    return { type: "SmartTV", vendor: "Television", model: "Smart TV Display" };
  }
  if (ua.includes("PlayStation") || ua.includes("Xbox") || ua.includes("Nintendo")) {
    return { type: "Console", vendor: "Gaming", model: "Video Game Console" };
  }

  return { type: "Desktop", vendor: "PC / Mac", model: "Workstation" };
}

function parseEngine(ua: string): { name: string; version: string } {
  if (ua.includes("AppleWebKit")) {
    const v = ua.match(/AppleWebKit\/([\d.]+)/)?.[1] || "";
    if (ua.includes("Chrome") || ua.includes("Edg")) {
      return { name: "Blink (Chromium)", version: v };
    }
    return { name: "WebKit (Apple)", version: v };
  }
  if (ua.includes("Gecko") && ua.includes("Firefox")) {
    const v = ua.match(/Firefox\/([\d.]+)/)?.[1] || "";
    return { name: "Gecko (Mozilla)", version: v };
  }
  return { name: "Unknown Engine", version: "Unknown" };
}

export const SAMPLE_USER_AGENTS = [
  { name: "iPhone 16 Safari", ua: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1" },
  { name: "MacBook Chrome (Blink)", ua: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36" },
  { name: "Windows 11 Edge", ua: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0" },
  { name: "Google Pixel 9 Android", ua: "Mozilla/5.0 (Linux; Android 15; Pixel 9 Build/AP3A.241005.015) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.6778.81 Mobile Safari/537.36" },
  { name: "Googlebot Spider", ua: "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" },
  { name: "OpenAI GPTBot", ua: "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.2; +https://openai.com/gptbot)" },
];