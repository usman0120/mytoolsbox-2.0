import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import type { AIRequest, AIResponse, AIProvider } from "@/lib/ai/types";
import { getCreditCost, tierToCreditOperation, hasEnoughCredits, type CreditOperation, type SubscriptionTier } from "@/lib/ai/credits";
import { checkAbuse } from "@/lib/payments/abuse";

// ---------------------------------------------------------------------------
// Server-side API key configuration (NEVER exposed to client)
// ---------------------------------------------------------------------------

const SERVER_API_KEYS: Record<AIProvider, string | undefined> = {
  openai: process.env.OPENAI_API_KEY,
  gemini: process.env.GEMINI_API_KEY,
  groq: process.env.GROQ_API_KEY,
  claude: process.env.CLAUDE_API_KEY,
};

// Model mapping (server-side, can be changed without client updates)
const MODEL_MAP: Record<string, Record<string, string>> = {
  openai: { cheap: "gpt-4o-mini", reasoning: "gpt-4o", vision: "gpt-4o", image: "dall-e-3" },
  gemini: { cheap: "gemini-2.0-flash", reasoning: "gemini-2.0-pro", vision: "gemini-2.0-flash", image: "imagen-3" },
  groq: { cheap: "llama-3.3-70b-versatile", reasoning: "deepseek-r1-distill-llama-70b", vision: "llama-3.2-90b-vision-preview", image: "" },
  claude: { cheap: "claude-3-5-haiku-20241022", reasoning: "claude-3-5-sonnet-20241022", vision: "claude-3-5-sonnet-20241022", image: "" },
};

// ---------------------------------------------------------------------------
// Provider API callers (server-side only)
// ---------------------------------------------------------------------------

async function callOpenAI(request: AIRequest): Promise<AIResponse> {
  const apiKey = SERVER_API_KEYS.openai;
  if (!apiKey) throw new Error("OpenAI API key not configured");

  const model = request.model ?? MODEL_MAP.openai[request.tier ?? "cheap"];

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      messages: [
        ...(request.systemPrompt ? [{ role: "system", content: request.systemPrompt }] : []),
        { role: "user", content: request.prompt },
      ],
      max_tokens: request.maxTokens ?? 2048,
      temperature: request.temperature ?? 0.7,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return {
    text: data.choices[0]?.message?.content ?? "",
    provider: "openai",
    model,
    usage: {
      promptTokens: data.usage?.prompt_tokens ?? 0,
      completionTokens: data.usage?.completion_tokens ?? 0,
      totalTokens: data.usage?.total_tokens ?? 0,
    },
  };
}

async function callGemini(request: AIRequest): Promise<AIResponse> {
  const apiKey = SERVER_API_KEYS.gemini;
  if (!apiKey) throw new Error("Gemini API key not configured");

  const model = request.model ?? MODEL_MAP.gemini[request.tier ?? "cheap"];

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${request.systemPrompt ? request.systemPrompt + "\n\n" : ""}${request.prompt}` }] }],
        generationConfig: {
          maxOutputTokens: request.maxTokens ?? 2048,
          temperature: request.temperature ?? 0.7,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return {
    text: data.candidates?.[0]?.content?.parts?.[0]?.text ?? "",
    provider: "gemini",
    model,
    usage: {
      promptTokens: data.usageMetadata?.promptTokenCount ?? 0,
      completionTokens: data.usageMetadata?.candidatesTokenCount ?? 0,
      totalTokens: data.usageMetadata?.totalTokenCount ?? 0,
    },
  };
}

async function callGroq(request: AIRequest): Promise<AIResponse> {
  const apiKey = SERVER_API_KEYS.groq;
  if (!apiKey) throw new Error("Groq API key not configured");

  const model = request.model ?? MODEL_MAP.groq[request.tier ?? "cheap"];

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      messages: [
        ...(request.systemPrompt ? [{ role: "system", content: request.systemPrompt }] : []),
        { role: "user", content: request.prompt },
      ],
      max_tokens: request.maxTokens ?? 2048,
      temperature: request.temperature ?? 0.7,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Groq API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return {
    text: data.choices[0]?.message?.content ?? "",
    provider: "groq",
    model,
    usage: {
      promptTokens: data.usage?.prompt_tokens ?? 0,
      completionTokens: data.usage?.completion_tokens ?? 0,
      totalTokens: data.usage?.total_tokens ?? 0,
    },
  };
}

async function callClaude(request: AIRequest): Promise<AIResponse> {
  const apiKey = SERVER_API_KEYS.claude;
  if (!apiKey) throw new Error("Claude API key not configured");

  const model = request.model ?? MODEL_MAP.claude[request.tier ?? "cheap"];

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: request.maxTokens ?? 2048,
      system: request.systemPrompt,
      messages: [{ role: "user", content: request.prompt }],
      temperature: request.temperature ?? 0.7,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Claude API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return {
    text: data.content?.[0]?.text ?? "",
    provider: "claude",
    model,
    usage: {
      promptTokens: data.usage?.input_tokens ?? 0,
      completionTokens: data.usage?.output_tokens ?? 0,
      totalTokens: (data.usage?.input_tokens ?? 0) + (data.usage?.output_tokens ?? 0),
    },
  };
}

// ---------------------------------------------------------------------------
// Provider dispatcher
// ---------------------------------------------------------------------------

const PROVIDER_CALLERS: Record<AIProvider, (req: AIRequest) => Promise<AIResponse>> = {
  openai: callOpenAI,
  gemini: callGemini,
  groq: callGroq,
  claude: callClaude,
};

function getAvailableProviders(): AIProvider[] {
  return (Object.keys(SERVER_API_KEYS) as AIProvider[]).filter((p) => !!SERVER_API_KEYS[p]);
}

// ---------------------------------------------------------------------------
// Credit checking (server-side)
// ---------------------------------------------------------------------------

async function checkAndDeductCredits(
  userId: string | null,
  operation: CreditOperation
): Promise<{ allowed: boolean; remaining: number; tier: string }> {
  // If no user, check if operation is free-tier compatible
  if (!userId) {
    // Anonymous users get no AI credits — only local processing
    return { allowed: false, remaining: 0, tier: "free" };
  }

  // In production, this would query Firestore for the user's credit balance
  // For now, use a simple header-based approach
  // TODO: Integrate with Firestore user credits collection
  return { allowed: true, remaining: -1, tier: "free_account" };
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as AIRequest & { operation?: CreditOperation };

    // Get user from session cookie
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("__session");
    const userId = sessionCookie?.value ?? null;
    const isGuest = !userId;

    // -----------------------------------------------------------------------
    // Abuse prevention check
    // -----------------------------------------------------------------------
    const forwardedFor = request.headers.get("x-forwarded-for");
    const clientIP = forwardedFor?.split(",")[0]?.trim() ?? request.headers.get("x-real-ip") ?? "127.0.0.1";

    const abuseCheck = checkAbuse({
      ip: clientIP,
      userId: userId ?? undefined,
      isGuest,
      userAgent: request.headers.get("user-agent") ?? undefined,
      tier: (body.tier ?? "cheap") as SubscriptionTier,
      path: "/api/ai",
      timestamp: Date.now(),
    });

    if (!abuseCheck.allowed) {
      return NextResponse.json(
        {
          error: abuseCheck.reason ?? "Request blocked by abuse prevention.",
          code: abuseCheck.code ?? "BLOCKED",
          requiresCaptcha: abuseCheck.requiresCaptcha,
          retryAfterMs: abuseCheck.retryAfterMs,
        },
        {
          status: abuseCheck.code === "IP_BLOCKED" || abuseCheck.code === "SUSPICIOUS_ACTIVITY" ? 403 : 429,
          headers: abuseCheck.retryAfterMs
            ? { "Retry-After": String(Math.ceil(abuseCheck.retryAfterMs / 1000)) }
            : {},
        }
      );
    }

    // Determine credit operation
    const operation: CreditOperation = body.operation ?? tierToCreditOperation(body.tier ?? "cheap");

    // Check credits
    const creditCheck = await checkAndDeductCredits(userId, operation);
    if (!creditCheck.allowed) {
      return NextResponse.json(
        {
          error: "Insufficient credits",
          message: "Sign up for a free account to get AI credits, or upgrade to Pro for more.",
          code: "INSUFFICIENT_CREDITS",
          requiredCredits: getCreditCost(operation),
          availableCredits: creditCheck.remaining,
        },
        { status: 402 }
      );
    }

    // Route to appropriate provider
    const available = getAvailableProviders();
    if (available.length === 0) {
      return NextResponse.json(
        { error: "No AI providers configured on the server." },
        { status: 503 }
      );
    }

    // Try providers in order
    const errors: string[] = [];
    for (const provider of available) {
      try {
        const caller = PROVIDER_CALLERS[provider];
        const response = await caller(body);

        return NextResponse.json({
          ...response,
          creditsUsed: getCreditCost(operation),
          creditsRemaining: creditCheck.remaining === -1 ? null : creditCheck.remaining - getCreditCost(operation),
        });
      } catch (error) {
        errors.push(`${provider}: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }

    return NextResponse.json(
      { error: `All providers failed:\n${errors.join("\n")}` },
      { status: 502 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}

// Health check
export async function GET() {
  const available = getAvailableProviders();
  return NextResponse.json({
    status: "ok",
    providers: available,
    models: Object.fromEntries(
      available.map((p) => [p, MODEL_MAP[p]])
    ),
  });
}