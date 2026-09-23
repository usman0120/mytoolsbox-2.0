import { ProcessingResult } from "@/lib/processing/types";

export interface WebhookConfig {
  url: string;
  method: string;
  headers: Record<string, string>;
  body: string;
  contentType: string;
  secret?: string;
  signatureHeader?: "x-hub-signature-256" | "stripe-signature" | "x-signature";
}

export interface WebhookResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  time: number;
  timestamp: string;
}

export async function computeHmacSha256(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  const hex = Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hex;
}

export async function sendWebhook(config: WebhookConfig): Promise<ProcessingResult & { data?: WebhookResponse }> {
  if (!config.url.trim()) {
    return { status: "error", error: "Please enter a target webhook URL." };
  }

  let url: string;
  try {
    url = config.url.startsWith("http://") || config.url.startsWith("https://")
      ? config.url
      : `https://${config.url}`;
    new URL(url);
  } catch {
    return { status: "error", error: "Invalid webhook URL." };
  }

  const startTime = performance.now();
  const timestamp = new Date().toISOString();

  try {
    const headers: Record<string, string> = { ...config.headers };
    if (config.body && !headers["Content-Type"] && !headers["content-type"]) {
      headers["Content-Type"] = config.contentType || "application/json";
    }

    // Compute HMAC signature if secret provided
    if (config.secret && config.secret.trim() && config.body) {
      const hmacHex = await computeHmacSha256(config.secret.trim(), config.body);
      if (config.signatureHeader === "stripe-signature") {
        const t = Math.floor(Date.now() / 1000);
        headers["Stripe-Signature"] = `t=${t},v1=${hmacHex}`;
      } else {
        headers["X-Hub-Signature-256"] = `sha256=${hmacHex}`;
      }
    }

    const fetchOptions: RequestInit = {
      method: config.method || "POST",
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

    const result: WebhookResponse = {
      status: response.status,
      statusText: response.statusText || (response.status === 200 ? "OK" : ""),
      headers: responseHeaders,
      body: responseBody,
      time: Math.round(endTime - startTime),
      timestamp,
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
          ? `${err.message} (Note: Browser requests require CORS support. If testing external third-party webhook receivers like Slack/Discord, ensure webhook URL is active).`
          : "Webhook dispatch failed.",
    };
  }
}

export function generateWebhookPayload(type: string): string {
  const payloads: Record<string, object> = {
    github: {
      zen: "Approachable is better than simple.",
      hook_id: 12345678,
      hook: {
        type: "Repository",
        id: 12345678,
        name: "web",
        active: true,
        events: ["push", "pull_request"],
      },
      repository: {
        id: 987654321,
        name: "mytoolsbox-app",
        full_name: "acme/mytoolsbox-app",
        owner: { login: "acme" },
      },
      sender: { login: "octocat" },
    },
    stripe: {
      id: "evt_1MockEvent00000000000001",
      object: "event",
      api_version: "2024-12-18",
      created: Math.floor(Date.now() / 1000),
      data: {
        object: {
          id: "cs_test_mock_session_12345",
          object: "checkout.session",
          amount_total: 4900,
          currency: "usd",
          customer_email: "customer@example.com",
          payment_status: "paid",
          status: "complete",
        },
      },
      type: "checkout.session.completed",
    },
    slack: {
      text: "🚨 Alert: Production deployment successful for *mytoolsbox-app* v2.0!",
      channel: "#deployments",
      username: "DeployBot",
      icon_emoji: ":rocket:",
    },
    discord: {
      username: "System Alerts",
      avatar_url: "https://i.imgur.com/4M34hi2.png",
      content: "📢 **Webhook Notification**: Automated health check completed successfully.",
      embeds: [
        {
          title: "Service Health Status: Healthy",
          color: 3066993,
          description: "All cluster nodes operational with 99.99% uptime.",
        },
      ],
    },
    shopify: {
      id: 820982911946154500,
      email: "jon@example.com",
      created_at: new Date().toISOString(),
      currency: "USD",
      total_price: "119.00",
      order_number: 1001,
      line_items: [
        { id: 1, title: "Pro Subscription (Annual)", price: "119.00", quantity: 1 },
      ],
    },
    custom: {
      event: "user.signup",
      timestamp: new Date().toISOString(),
      data: {
        userId: "usr_998124",
        email: "alex@domain.com",
        plan: "pro",
      },
    },
  };

  return JSON.stringify(payloads[type] || payloads.custom, null, 2);
}

export const WEBHOOK_TEMPLATES = [
  { value: "custom", label: "Custom JSON Event" },
  { value: "github", label: "GitHub Webhook Ping" },
  { value: "stripe", label: "Stripe checkout.session.completed" },
  { value: "slack", label: "Slack Incoming Message" },
  { value: "discord", label: "Discord Rich Embed" },
  { value: "shopify", label: "Shopify Order Created" },
];