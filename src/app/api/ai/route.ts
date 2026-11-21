import { NextRequest, NextResponse } from "next/server";
import type { AIRequest } from "@/lib/ai/types";
import { AI_LIMITS } from "@/config/limits";
import { FEATURES } from "@/config/features";
import { availableProviders, ProviderError, runAi } from "@/server/providers/ai";
import { checkQuota, consumeQuota } from "@/server/quota";
import { clientIp, resolveIdentity } from "@/server/ai-identity";
import { AuthVerificationUnavailableError } from "@/lib/auth/server-auth";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => null)) as AIRequest | null;
    if (!body || typeof body.prompt !== "string" || !body.prompt.trim()) {
      return NextResponse.json({ error: "Enter a prompt to continue." }, { status: 400 });
    }
    if (body.prompt.length > AI_LIMITS.maxPromptChars) {
      return NextResponse.json(
        { error: `That's too long. Keep it under ${AI_LIMITS.maxPromptChars.toLocaleString("en-US")} characters.` },
        { status: 413 },
      );
    }

    const identity = await resolveIdentity(request);
    if (!identity.signedIn && !FEATURES.anonymousAi) {
      return NextResponse.json({ error: "Sign in to use AI.", code: "AUTH_REQUIRED" }, { status: 401 });
    }

    const check = await checkQuota(identity, clientIp(request));
    if (!check.ok) {
      return NextResponse.json(
        { error: check.message, code: check.code, quota: check.quota },
        { status: check.status, headers: check.retryAfter ? { "Retry-After": String(check.retryAfter) } : {} },
      );
    }

    const response = await runAi({
      prompt: body.prompt,
      systemPrompt: typeof body.systemPrompt === "string" ? body.systemPrompt.slice(0, 20_000) : undefined,
      tier: body.tier === "reasoning" || body.tier === "vision" ? body.tier : "cheap",
      provider: body.provider,
      temperature: typeof body.temperature === "number" ? Math.min(Math.max(body.temperature, 0), 1.5) : undefined,
      maxTokens: typeof body.maxTokens === "number" ? Math.min(Math.max(body.maxTokens, 64), 8192) : undefined,
    });
    const quota = await consumeQuota(identity);
    return NextResponse.json({ ...response, quota });
  } catch (error) {
    if (error instanceof AuthVerificationUnavailableError) {
      return NextResponse.json({ error: "Sign-in check is unavailable. Try again shortly." }, { status: 503 });
    }
    if (error instanceof ProviderError) {
      const notConfigured = error.status === 503;
      return NextResponse.json(
        { error: notConfigured ? "AI isn't set up on this server yet." : "AI is busy right now. Try again in a minute." },
        { status: notConfigured ? 503 : 502 },
      );
    }
    console.error("AI route error:", error);
    return NextResponse.json({ error: "Something went wrong. Try again." }, { status: 500 });
  }
}

/** Health check: lists configured providers (no keys or model details). */
export async function GET() {
  return NextResponse.json({ status: "ok", providers: availableProviders() });
}
