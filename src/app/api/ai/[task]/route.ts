import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { getTask, SAFETY_NOTES, taskSystem, type AiTaskPreset } from "@/server/ai/tasks";
import { ProviderError, runAi, streamAi } from "@/server/providers/ai";
import { checkQuota, consumeQuota, getQuota } from "@/server/quota";
import { clientIp, resolveIdentity } from "@/server/ai-identity";
import { counterStore } from "@/server/providers/ratelimit";
import { TURNSTILE_AFTER, turnstileEnabled, verifyTurnstile } from "@/server/turnstile";
import { FEATURES } from "@/config/features";
import { parseModelJson } from "@/lib/ai/parse-json";

export const runtime = "nodejs";

const CACHE_TTL = 60 * 60 * 24;
const json = (body: unknown, status = 200, headers: Record<string, string> = {}) => NextResponse.json(body, { status, headers });

function cacheKey(task: AiTaskPreset, input: string, options: Record<string, string>) {
  const normalized = input.trim().replace(/\s+/g, " ").toLowerCase();
  const opts = Object.keys(options).sort().map((k) => `${k}=${options[k]}`).join("&");
  return `ai:cache:${task.prompt}:${createHash("sha256").update(`${normalized}|${opts}`).digest("hex").slice(0, 32)}`;
}

function parseJson(task: AiTaskPreset, text: string): unknown | null {
  const value = parseModelJson(text);
  if (value === null) return null;
  const parsed = task.schema ? task.schema.safeParse(value) : { success: true as const, data: value };
  return parsed.success ? parsed.data : null;
}

/** Accepts a base64 data URL (JPEG, PNG or WebP, up to ~4 MB). The browser downsizes photos first. */
function parseImage(value: unknown): { mime: string; data: string } | null {
  if (typeof value !== "string") return null;
  const m = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(value);
  if (!m || m[2].length > 5_600_000) return null;
  return { mime: m[1], data: m[2] };
}

/**
 * POST /api/ai/{task}  { input: string, options?: Record<string,string>, turnstileToken?: string }
 * Markdown tasks stream text/plain; JSON tasks return { data, quota }. Prompts live on the server.
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ task: string }> }) {
  const task = getTask((await params).task);
  if (!task) return json({ error: "Unknown AI task." }, 404);

  const body = (await request.json().catch(() => null)) as { input?: unknown; options?: unknown; turnstileToken?: unknown; image?: unknown } | null;
  const input = typeof body?.input === "string" ? body.input.trim() : "";
  const image = task.acceptsImage ? parseImage(body?.image) : null;
  if (task.acceptsImage && !image) return json({ error: "Add a JPG, PNG or WebP photo under 4 MB." }, 400);
  if (!input && !image) return json({ error: "Enter something for the AI to work on." }, 400);
  if (input.length > task.maxInputChars) return json({ error: `Keep it under ${task.maxInputChars.toLocaleString("en-US")} characters.` }, 413);
  const options: Record<string, string> = {};
  if (body?.options && typeof body.options === "object") {
    for (const [k, v] of Object.entries(body.options as Record<string, unknown>).slice(0, 8)) {
      if (/^[a-z]{1,20}$/.test(k) && (typeof v === "string" || typeof v === "number")) options[k] = String(v).slice(0, 80);
    }
  }

  try {
    const identity = await resolveIdentity(request);
    if (!identity.signedIn && !FEATURES.anonymousAi) return json({ error: "Sign in to use AI.", code: "AUTH_REQUIRED" }, 401);
    const ip = clientIp(request);

    if (!identity.signedIn && turnstileEnabled()) {
      const used = (await getQuota(identity)).used;
      const token = typeof body?.turnstileToken === "string" ? body.turnstileToken : null;
      if (used >= TURNSTILE_AFTER && !(await verifyTurnstile(token, ip))) {
        return json({ error: "Please confirm you're human to continue.", code: "TURNSTILE_REQUIRED" }, 403);
      }
    }

    const check = await checkQuota(identity, ip, task.cost);
    if (!check.ok) return json({ error: check.message, code: check.code, quota: check.quota }, check.status, check.retryAfter ? { "Retry-After": String(check.retryAfter) } : {});

    const key = cacheKey(task, image ? `${input}|img:${createHash("sha256").update(image.data).digest("hex")}` : input, options);
    const cached = await counterStore.getText(key).catch(() => null);
    const req = { systemPrompt: taskSystem(task), prompt: task.build(input, options), tier: task.tier, provider: task.provider, temperature: task.temperature, maxTokens: task.maxTokens, ...(image ? { images: [image] } : {}) };
    const note = task.safety ? SAFETY_NOTES[task.safety] : undefined;

    if (task.output === "json") {
      let data = cached ? parseJson(task, cached) : null;
      for (let attempt = 0; !data && attempt < 2; attempt++) {
        const res = await runAi(req);
        data = parseJson(task, res.text);
        if (data) await counterStore.setText(key, JSON.stringify(data), CACHE_TTL).catch(() => {});
      }
      if (!data) return json({ error: "The AI reply wasn't usable. Try rephrasing and ask again." }, 502);
      const quota = cached ? (await getQuota(identity)) : await consumeQuota(identity, task.cost);
      return json({ data, note, cached: !!cached, quota });
    }

    // Markdown: stream plain text. Cached answers are replayed without using quota.
    const quota = cached ? await getQuota(identity) : await consumeQuota(identity, task.cost);
    const headers = {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Quota": JSON.stringify(quota),
      ...(note ? { "X-AI-Note": encodeURIComponent(note) } : {}),
      ...(cached ? { "X-AI-Cached": "1" } : {}),
    };
    if (cached) return new Response(cached, { headers });

    const { stream } = await streamAi(req);
    let full = "";
    const encoder = new TextEncoder();
    const out = stream.pipeThrough(
      new TransformStream<string, Uint8Array>({
        transform(chunk, controller) {
          full += chunk;
          controller.enqueue(encoder.encode(chunk));
        },
        async flush() {
          if (full.length > 40) await counterStore.setText(key, full, CACHE_TTL).catch(() => {});
        },
      }),
    );
    return new Response(out, { headers });
  } catch (error) {
    if (error instanceof ProviderError) {
      const notConfigured = error.status === 503;
      return json({ error: notConfigured ? "AI isn't set up on this server yet." : "AI is busy right now. Try again in a minute." }, notConfigured ? 503 : 502);
    }
    console.error("AI task error:", error);
    return json({ error: "Something went wrong. Try again." }, 500);
  }
}
