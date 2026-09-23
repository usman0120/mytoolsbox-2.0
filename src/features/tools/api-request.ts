import { ProcessingResult } from "@/lib/processing/types";

export interface APIRequestConfig {
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: string;
  contentType?: string;
}

export interface APIResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  time: number;
  size: number;
}

export async function sendAPIRequest(config: APIRequestConfig): Promise<ProcessingResult & { data?: APIResponse }> {
  if (!config.url.trim()) {
    return { status: "error", error: "Please enter a target URL." };
  }

  let url: string;
  try {
    url = config.url.startsWith("http://") || config.url.startsWith("https://")
      ? config.url
      : `https://${config.url}`;
    new URL(url);
  } catch {
    return { status: "error", error: "Invalid URL. Please enter a valid URL." };
  }

  const startTime = performance.now();

  try {
    const headers: Record<string, string> = { ...config.headers };

    if (config.body && !headers["Content-Type"] && !headers["content-type"]) {
      headers["Content-Type"] = config.contentType || "application/json";
    }

    const fetchOptions: RequestInit = {
      method: config.method,
      headers,
    };

    if (config.body && config.method !== "GET" && config.method !== "HEAD") {
      fetchOptions.body = config.body;
    }

    const response = await fetch(url, fetchOptions);
    const endTime = performance.now();

    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    let responseBody: string;
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      try {
        const json = await response.json();
        responseBody = JSON.stringify(json, null, 2);
      } catch {
        responseBody = await response.text();
      }
    } else {
      responseBody = await response.text();
    }

    const result: APIResponse = {
      status: response.status,
      statusText: response.statusText || (response.status === 200 ? "OK" : ""),
      headers: responseHeaders,
      body: responseBody,
      time: Math.round(endTime - startTime),
      size: new Blob([responseBody]).size,
    };

    return {
      status: "success",
      message: `${response.status} ${result.statusText} (${result.time}ms)`,
      data: result,
    };
  } catch (err: unknown) {
    return {
      status: "error",
      error:
        err instanceof Error
          ? `${err.message} (Note: Direct browser API calls require CORS support on the target server. For restricted APIs, test via cURL).`
          : "Network request failed.",
    };
  }
}

export function generateCurl(config: APIRequestConfig): string {
  let url = config.url.trim();
  if (!url.startsWith("http")) url = `https://${url}`;

  let cmd = `curl -X ${config.method} "${url}"`;

  if (config.headers) {
    Object.entries(config.headers).forEach(([k, v]) => {
      if (k.trim() && v.trim()) {
        cmd += ` \\\n  -H "${k}: ${v}"`;
      }
    });
  }

  if (config.body && config.method !== "GET" && config.method !== "HEAD") {
    const escaped = config.body.replace(/"/g, '\\"');
    cmd += ` \\\n  -d "${escaped}"`;
  }

  return cmd;
}

export function parseCurl(curlCommand: string): APIRequestConfig | null {
  try {
    const clean = curlCommand.replace(/\\\n/g, " ").trim();
    if (!clean.startsWith("curl")) return null;

    let method = "GET";
    const methodMatch = clean.match(/-X\s+([A-Z]+)/i);
    if (methodMatch) {
      method = methodMatch[1].toUpperCase();
    }

    let url = "";
    const urlMatch = clean.match(/(?:curl\s+)?['"]?(https?:\/\/[^\s'"]+)/);
    if (urlMatch) {
      url = urlMatch[1];
    }

    const headers: Record<string, string> = {};
    const headerRegex = /-H\s+['"]([^'"]+)['"]/g;
    let hMatch: RegExpExecArray | null;
    while ((hMatch = headerRegex.exec(clean)) !== null) {
      const parts = hMatch[1].split(/:\s*/);
      if (parts.length >= 2) {
        headers[parts[0]] = parts.slice(1).join(":");
      }
    }

    let body = "";
    const dataMatch = clean.match(/(?:-d|--data(?:-raw)?)\s+['"]([\s\S]*?)['"](?:\s+-|$)/);
    if (dataMatch) {
      body = dataMatch[1];
      if (method === "GET") method = "POST";
    }

    return {
      method,
      url: url || "",
      headers,
      body,
      contentType: headers["Content-Type"] || headers["content-type"] || "application/json",
    };
  } catch {
    return null;
  }
}

export const HTTP_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"];
export const CONTENT_TYPES = [
  "application/json",
  "application/x-www-form-urlencoded",
  "text/plain",
  "text/html",
  "application/xml",
];

export const API_PRESETS = [
  {
    name: "JSONPlaceholder (Get Post)",
    method: "GET",
    url: "https://jsonplaceholder.typicode.com/posts/1",
    headers: { Accept: "application/json" },
    body: "",
  },
  {
    name: "JSONPlaceholder (Create Post)",
    method: "POST",
    url: "https://jsonplaceholder.typicode.com/posts",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: "foo", body: "bar", userId: 1 }, null, 2),
  },
  {
    name: "HTTPBin (Inspect Request)",
    method: "GET",
    url: "https://httpbin.org/get",
    headers: { "User-Agent": "MyToolsBox-Client/1.0" },
    body: "",
  },
  {
    name: "GitHub API (Octocat Zen)",
    method: "GET",
    url: "https://api.github.com/zen",
    headers: { Accept: "application/vnd.github.v3+json" },
    body: "",
  },
];