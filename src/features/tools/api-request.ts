import { ProcessingResult } from "@/lib/processing/types";

export interface APIRequestConfig {
  method: string;
  url: string;
  headers: Record<string, string>;
  body: string;
  contentType: string;
}

export interface APIResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  time: number;
  size: number;
}

export async function sendAPIRequest(config: APIRequestConfig): Promise<ProcessingResult> {
  if (!config.url.trim()) {
    return { status: "error", error: "Please enter a URL." };
  }

  // Validate URL
  let url: string;
  try {
    url = config.url.startsWith("http") ? config.url : `https://${config.url}`;
    new URL(url);
  } catch {
    return { status: "error", error: "Invalid URL. Please enter a valid URL." };
  }

  const startTime = performance.now();

  try {
    const headers: Record<string, string> = { ...config.headers };

    // Set content-type if body exists
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
      const json = await response.json();
      responseBody = JSON.stringify(json, null, 2);
    } else {
      responseBody = await response.text();
    }

    const result: APIResponse = {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
      body: responseBody,
      time: Math.round(endTime - startTime),
      size: new Blob([responseBody]).size,
    };

    return {
      status: "success",
      message: `${response.status} ${response.statusText} (${result.time}ms)`,
      data: result,
    };
  } catch (err: unknown) {
    return {
      status: "error",
      error: err instanceof Error ? err.message : "Request failed. Check the URL and try again.",
    };
  }
}

export function formatHeaders(headersText: string): Record<string, string> {
  const headers: Record<string, string> = {};
  if (!headersText.trim()) return headers;

  const lines = headersText.split("\n");
  for (const line of lines) {
    const colonIndex = line.indexOf(":");
    if (colonIndex > 0) {
      const key = line.substring(0, colonIndex).trim();
      const value = line.substring(colonIndex + 1).trim();
      if (key) headers[key] = value;
    }
  }
  return headers;
}

export const HTTP_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"];

export const CONTENT_TYPES = [
  "application/json",
  "application/x-www-form-urlencoded",
  "multipart/form-data",
  "text/plain",
  "text/html",
  "application/xml",
];