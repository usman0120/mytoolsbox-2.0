import { ProcessingResult } from "@/lib/processing/types";

export type URLEncodeMode = "component" | "full" | "rfc3986" | "form";

export interface URLEncodeResult extends ProcessingResult {
  data?: {
    output: string;
    changedCount: number;
  };
}

export function encodeRFC3986(str: string): string {
  return encodeURIComponent(str).replace(/[!'()*]/g, (c) => "%" + c.charCodeAt(0).toString(16).toUpperCase());
}

export function encodeURL(text: string, mode: URLEncodeMode = "component"): URLEncodeResult {
  if (!text) {
    return { status: "error", error: "Please enter text or URL to encode." };
  }

  try {
    let output = "";
    if (mode === "full") {
      output = encodeURI(text);
    } else if (mode === "rfc3986") {
      output = encodeRFC3986(text);
    } else if (mode === "form") {
      output = encodeURIComponent(text).replace(/%20/g, "+");
    } else {
      output = encodeURIComponent(text);
    }

    let changedCount = 0;
    for (let i = 0; i < output.length; i++) {
      if (output[i] === "%") changedCount++;
    }

    return {
      status: "success",
      message: `Encoded successfully (${output.length} characters)`,
      data: {
        output,
        changedCount,
      },
    };
  } catch (err: unknown) {
    return {
      status: "error",
      error: err instanceof Error ? err.message : "Failed to encode URL",
    };
  }
}

export function decodeURL(text: string, isForm = false): URLEncodeResult {
  if (!text) {
    return { status: "error", error: "Please enter encoded text to decode." };
  }

  try {
    let toDecode = text;
    if (isForm) {
      toDecode = toDecode.replace(/\+/g, " ");
    }
    const output = decodeURIComponent(toDecode);

    return {
      status: "success",
      message: "Decoded successfully",
      data: {
        output,
        changedCount: 0,
      },
    };
  } catch {
    return {
      status: "error",
      error: "Malformed URL encoding. Check for incomplete percent-encoding sequences.",
    };
  }
}

export interface ParsedURLComponent {
  protocol: string;
  host: string;
  port: string;
  pathname: string;
  hash: string;
  queryParams: Array<{ id: string; key: string; value: string; enabled: boolean }>;
}

export function parseURL(rawUrl: string): ParsedURLComponent | null {
  try {
    // If no protocol is provided, prefix with https:// for parsing
    const hasProtocol = /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(rawUrl);
    const urlToParse = hasProtocol ? rawUrl : `https://${rawUrl}`;
    const parsed = new URL(urlToParse);

    const queryParams: Array<{ id: string; key: string; value: string; enabled: boolean }> = [];
    parsed.searchParams.forEach((value, key) => {
      queryParams.push({
        id: Math.random().toString(36).substring(2, 9),
        key,
        value,
        enabled: true,
      });
    });

    return {
      protocol: hasProtocol ? parsed.protocol : "",
      host: parsed.hostname,
      port: parsed.port,
      pathname: parsed.pathname,
      hash: parsed.hash,
      queryParams,
    };
  } catch {
    return null;
  }
}

export function rebuildURL(parsed: ParsedURLComponent): string {
  try {
    let base = "";
    if (parsed.protocol) {
      base += `${parsed.protocol}//`;
    }
    base += parsed.host;
    if (parsed.port) {
      base += `:${parsed.port}`;
    }
    base += parsed.pathname || "/";

    const activeParams = parsed.queryParams.filter((p) => p.enabled && p.key.trim().length > 0);
    if (activeParams.length > 0) {
      const search = new URLSearchParams();
      activeParams.forEach((p) => {
        search.append(p.key, p.value);
      });
      base += `?${search.toString()}`;
    }

    if (parsed.hash) {
      base += parsed.hash.startsWith("#") ? parsed.hash : `#${parsed.hash}`;
    }

    return base;
  } catch {
    return "";
  }
}