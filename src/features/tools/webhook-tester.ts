import { ProcessingResult } from "@/lib/processing/types";

export interface WebhookConfig {
  url: string;
  method: string;
  headers: Record<string, string>;
  body: string;
  contentType: string;
}

export interface WebhookResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  time: number;
  timestamp: string;
}

export async function sendWebhook(config: WebhookConfig): Promise<ProcessingResult> {
  if (!config.url.trim()) {
    return { status: "error", error: "Please enter a webhook URL." };
  }

  let url: string;
  try {
    url = config.url.startsWith("http") ? config.url : `https://${config.url}`;
    new URL(url);
  } catch {
    return { status: "error", error: "Invalid URL. Please enter a valid webhook URL." };
  }

  const startTime = performance.now();
  const timestamp = new Date().toISOString();

  try {
    const headers: Record<string, string> = { ...config.headers };
    if (config.body && !headers["Content-Type"] && !headers["content-type"]) {
      headers["Content-Type"] = config.contentType || "application/json";
    }

    const fetchOptions: RequestInit = {
      method: config.method || "POST",
      headers,
    };

    if (config.body && config.method !== "GET") {
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

    const result: WebhookResponse = {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
      body: responseBody,
      time: Math.round(endTime - startTime),
      timestamp,
    };

    return {
      status: "success",
      message: `${response.status} ${response.statusText} (${result.time}ms)`,
      data: result,
    };
  } catch (err: any) {
    return {
      status: "error",
      error: err.message || "Webhook request failed.",
    };
  }
}

export function generateWebhookPayload(type: string): string {
  const payloads: Record<string, object> = {
    github: {
      action: "push",
      repository: { name: "my-repo", full_name: "user/my-repo" },
      commits: [{ id: "abc123", message: "Fix bug", author: { name: "Dev", email: "dev@example.com" } }],
      ref: "refs/heads/main",
    },
    stripe: {
      type: "payment_intent.succeeded",
      data: {
        object: {
          id: "pi_123456",
          amount: 2000,
          currency: "usd",
          status: "succeeded",
        },
      },
    },
    slack: {
      text: "Hello from webhook tester!",
      channel: "#general",
      username: "WebhookBot",
    },
    discord: {
      content: "Hello from webhook tester!",
      username: "WebhookBot",
      embeds: [{ title: "Test Embed", description: "This is a test webhook" }],
    },
    custom: {
      event: "test.event",
      timestamp: new Date().toISOString(),
      data: { message: "Hello, World!", id: crypto.randomUUID() },
    },
  };

  return JSON.stringify(payloads[type] || payloads.custom, null, 2);
}

export const WEBHOOK_TEMPLATES = [
  { value: "custom", label: "Custom JSON" },
  { value: "github", label: "GitHub Push Event" },
  { value: "stripe", label: "Stripe Payment" },
  { value: "slack", label: "Slack Message" },
  { value: "discord", label: "Discord Message" },
];