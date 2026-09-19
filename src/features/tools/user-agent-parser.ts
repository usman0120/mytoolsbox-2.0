import { ProcessingResult } from "@/lib/processing/types";

export interface ParsedUA {
  browser: { name: string; version: string };
  os: { name: string; version: string };
  device: { type: string; vendor: string; model: string };
  engine: { name: string; version: string };
  raw: string;
}

export function parseUserAgent(ua: string): ProcessingResult {
  if (!ua.trim()) {
    return { status: "error", error: "Please enter a User-Agent string." };
  }

  const result: ParsedUA = {
    browser: parseBrowser(ua),
    os: parseOS(ua),
    device: parseDevice(ua),
    engine: parseEngine(ua),
    raw: ua,
  };

  return { status: "success", message: `${result.browser.name} on ${result.os.name}`, data: result };
}

function parseBrowser(ua: string): { name: string; version: string } {
  // Edge
  const edgeMatch = ua.match(/Edg(?:e|A|iOS)?\/([\d.]+)/);
  if (edgeMatch) return { name: "Microsoft Edge", version: edgeMatch[1] };

  // Chrome
  const chromeMatch = ua.match(/Chrome\/([\d.]+)/);
  if (chromeMatch && !ua.includes("Edg")) {
    return { name: "Google Chrome", version: chromeMatch[1] };
  }

  // Firefox
  const firefoxMatch = ua.match(/Firefox\/([\d.]+)/);
  if (firefoxMatch) return { name: "Mozilla Firefox", version: firefoxMatch[1] };

  // Safari
  const safariMatch = ua.match(/Version\/([\d.]+).*Safari/);
  if (safariMatch && !ua.includes("Chrome")) {
    return { name: "Apple Safari", version: safariMatch[1] };
  }

  // Opera
  const operaMatch = ua.match(/OPR\/([\d.]+)/);
  if (operaMatch) return { name: "Opera", version: operaMatch[1] };

  // Samsung Internet
  const samsungMatch = ua.match(/SamsungBrowser\/([\d.]+)/);
  if (samsungMatch) return { name: "Samsung Internet", version: samsungMatch[1] };

  // Brave
  if (ua.includes("Brave")) return { name: "Brave", version: "Unknown" };

  // Vivaldi
  if (ua.includes("Vivaldi")) return { name: "Vivaldi", version: "Unknown" };

  // IE
  const ieMatch = ua.match(/(?:MSIE |rv:)([\d.]+)/);
  if (ieMatch || ua.includes("Trident")) return { name: "Internet Explorer", version: ieMatch?.[1] || "Unknown" };

  return { name: "Unknown Browser", version: "Unknown" };
}

function parseOS(ua: string): { name: string; version: string } {
  // Windows
  const winMatch = ua.match(/Windows NT ([\d.]+)/);
  if (winMatch) {
    const versions: Record<string, string> = {
      "10.0": "10/11", "6.3": "8.1", "6.2": "8", "6.1": "7", "6.0": "Vista",
    };
    return { name: "Windows", version: versions[winMatch[1]] || winMatch[1] };
  }

  // macOS
  const macMatch = ua.match(/Mac OS X ([\d_.]+)/);
  if (macMatch) {
    return { name: "macOS", version: macMatch[1].replace(/_/g, ".") };
  }

  // iOS
  const iosMatch = ua.match(/(?:iPhone|iPad).*OS ([\d_]+)/);
  if (iosMatch) {
    return { name: ua.includes("iPad") ? "iPadOS" : "iOS", version: iosMatch[1].replace(/_/g, ".") };
  }

  // Android
  const androidMatch = ua.match(/Android ([\d.]+)/);
  if (androidMatch) return { name: "Android", version: androidMatch[1] };

  // Linux
  if (ua.includes("Linux")) return { name: "Linux", version: "Unknown" };

  // ChromeOS
  if (ua.includes("CrOS")) return { name: "ChromeOS", version: "Unknown" };

  return { name: "Unknown OS", version: "Unknown" };
}

function parseDevice(ua: string): { type: string; vendor: string; model: string } {
  if (ua.includes("iPhone")) return { type: "Mobile", vendor: "Apple", model: "iPhone" };
  if (ua.includes("iPad")) return { type: "Tablet", vendor: "Apple", model: "iPad" };
  if (ua.includes("Android") && ua.includes("Mobile")) {
    // Try to extract model
    const modelMatch = ua.match(/; ([^;)]+) Build/);
    return { type: "Mobile", vendor: "Android", model: modelMatch?.[1]?.trim() || "Unknown" };
  }
  if (ua.includes("Android")) return { type: "Tablet", vendor: "Android", model: "Unknown" };
  if (ua.includes("Windows Phone")) return { type: "Mobile", vendor: "Microsoft", model: "Windows Phone" };

  return { type: "Desktop", vendor: "Unknown", model: "Unknown" };
}

function parseEngine(ua: string): { name: string; version: string } {
  // Blink (Chrome/Edge/Opera)
  if (ua.includes("Chrome") || ua.includes("Edg")) {
    return { name: "Blink", version: "Unknown" };
  }

  // WebKit (Safari)
  const webkitMatch = ua.match(/AppleWebKit\/([\d.]+)/);
  if (webkitMatch && !ua.includes("Chrome")) {
    return { name: "WebKit", version: webkitMatch[1] };
  }

  // Gecko (Firefox)
  const geckoMatch = ua.match(/Gecko\/([\d.]+)/);
  if (geckoMatch) return { name: "Gecko", version: geckoMatch[1] };

  // Trident (IE)
  if (ua.includes("Trident")) return { name: "Trident", version: "Unknown" };

  return { name: "Unknown Engine", version: "Unknown" };
}