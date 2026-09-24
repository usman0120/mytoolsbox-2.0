import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import type { AIRequest, AIResponse, AIProvider } from "@/lib/ai/types";
import { getCreditCost, tierToCreditOperation, type CreditOperation, type SubscriptionTier } from "@/lib/ai/credits";
import { checkAbuse } from "@/lib/payments/abuse";
import { checkCredits, deductCredits } from "@/lib/credits";
import { extractAuthUser, extractAuthUserFromCookies } from "@/lib/auth/server-auth";
import { SUPPORTED_PROVIDERS, getProviderConfig } from "@/lib/ai/providers-config";

// ---------------------------------------------------------------------------
// Server-side API key configuration (NEVER exposed to client)
// ---------------------------------------------------------------------------

const SERVER_API_KEYS: Record<string, string | undefined> = {
  openai: process.env.OPENAI_API_KEY,
  gemini: process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY,
  groq: process.env.GROQ_API_KEY || process.env.NEXT_PUBLIC_GROQ_API_KEY,
  claude: process.env.CLAUDE_API_KEY,
  deepseek: process.env.DEEPSEEK_API_KEY,
  mistral: process.env.MISTRAL_API_KEY,
};

// Model mapping (server-side, can be changed without client updates)
const MODEL_MAP: Record<string, Record<string, string>> = {
  openai: { cheap: "gpt-4o-mini", reasoning: "gpt-4o", vision: "gpt-4o", image: "dall-e-3" },
  gemini: { cheap: "gemini-3-flash-preview", reasoning: "gemini-3.1-pro-preview", vision: "gemini-3-flash-preview", image: "imagen-3" },
  groq: { cheap: "openai/gpt-oss-20b", reasoning: "openai/gpt-oss-120b", vision: "openai/gpt-oss-20b", image: "" },
  claude: { cheap: "claude-3-5-haiku-20241022", reasoning: "claude-3-5-sonnet-20241022", vision: "claude-3-5-sonnet-20241022", image: "" },
  deepseek: { cheap: "deepseek-chat", reasoning: "deepseek-reasoner", vision: "deepseek-chat", image: "" },
  mistral: { cheap: "mistral-small-latest", reasoning: "mistral-large-latest", vision: "mistral-small-latest", image: "" },
};

// ---------------------------------------------------------------------------
// Anti-Fraud & In-Memory Rate Limiting for AI Endpoints
// ---------------------------------------------------------------------------

interface AIRateLimitRecord {
  count: number;
  windowStart: number;
}

const AI_IP_RATE_STORE = new Map<string, AIRateLimitRecord>();
const AI_MAX_REQ_PER_MINUTE = 25; // Max 25 AI requests per minute per IP

function checkAIIpRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = AI_IP_RATE_STORE.get(ip);

  if (!record || now - record.windowStart > 60000) {
    AI_IP_RATE_STORE.set(ip, { count: 1, windowStart: now });
    return true;
  }

  if (record.count >= AI_MAX_REQ_PER_MINUTE) {
    return false;
  }

  record.count += 1;
  return true;
}

// ---------------------------------------------------------------------------
// Provider API callers (server-side only)
// ---------------------------------------------------------------------------

async function callOpenAI(request: AIRequest): Promise<AIResponse> {
  const apiKey = SERVER_API_KEYS.openai;
  if (!apiKey) throw new Error("OpenAI API key not configured");

  const model =
    request.model && (request.model.startsWith("gpt") || request.model.startsWith("o1") || request.model.startsWith("o3"))
      ? request.model
      : MODEL_MAP.openai[request.tier ?? "cheap"] || "gpt-4o-mini";

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

  const preferredModel =
    request.model && request.model.startsWith("gemini")
      ? request.model
      : MODEL_MAP.gemini[request.tier ?? "cheap"] || "gemini-3-flash-preview";

  const candidateModels = Array.from(
    new Set([
      preferredModel,
      "gemini-3-flash-preview",
      "gemini-flash-latest",
      "gemini-3.6-flash",
      "gemini-2.5-flash",
    ])
  );

  let lastError = "Gemini API failed";

  for (const model of candidateModels) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `${request.systemPrompt ? request.systemPrompt + "\n\n" : ""}${request.prompt}`,
                  },
                ],
              },
            ],
            generationConfig: {
              maxOutputTokens: request.maxTokens ?? 2048,
              temperature: request.temperature ?? 0.7,
            },
          }),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        lastError = `${response.status} - ${error}`;
        continue;
      }

      const data = await response.json();
      const text =
        data.candidates?.[0]?.content?.parts?.[0]?.text ??
        data.candidates?.[0]?.output ??
        "";

      if (!text) continue;

      return {
        text,
        provider: "gemini",
        model,
        usage: {
          promptTokens: data.usageMetadata?.promptTokenCount ?? 0,
          completionTokens: data.usageMetadata?.candidatesTokenCount ?? 0,
          totalTokens: data.usageMetadata?.totalTokenCount ?? 0,
        },
      };
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
    }
  }

  throw new Error(`Gemini API error: ${lastError}`);
}

async function callGroq(request: AIRequest): Promise<AIResponse> {
  const apiKey = SERVER_API_KEYS.groq;
  if (!apiKey) throw new Error("Groq API key not configured");

  const preferredModel =
    request.model || MODEL_MAP.groq[request.tier ?? "cheap"] || "openai/gpt-oss-20b";

  const candidateModels = Array.from(
    new Set([
      preferredModel,
      "openai/gpt-oss-20b",
      "openai/gpt-oss-120b",
      "qwen/qwen3.8-27b",
      "llama-3.3-70b-versatile",
      "llama-3.1-8b-instant",
    ])
  );

  let lastError = "Groq API failed";

  for (const model of candidateModels) {
    try {
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
        lastError = `${response.status} - ${error}`;
        continue;
      }

      const data = await response.json();
      const text = data.choices?.[0]?.message?.content ?? "";

      return {
        text,
        provider: "groq",
        model,
        usage: {
          promptTokens: data.usage?.prompt_tokens ?? 0,
          completionTokens: data.usage?.completion_tokens ?? 0,
          totalTokens: data.usage?.total_tokens ?? 0,
        },
      };
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
    }
  }

  throw new Error(`Groq API error: ${lastError}`);
}

async function callClaude(request: AIRequest): Promise<AIResponse> {
  const apiKey = SERVER_API_KEYS.claude;
  if (!apiKey) throw new Error("Claude API key not configured");

  const model =
    request.model && request.model.startsWith("claude")
      ? request.model
      : MODEL_MAP.claude[request.tier ?? "cheap"] || "claude-3-5-haiku-20241022";

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

async function callDeepSeek(request: AIRequest): Promise<AIResponse> {
  const apiKey = SERVER_API_KEYS.deepseek;
  if (!apiKey) throw new Error("DeepSeek API key not configured");

  const model = request.tier === "reasoning" ? "deepseek-reasoner" : "deepseek-chat";
  const response = await fetch("https://api.deepseek.com/chat/completions", {
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
    throw new Error(`DeepSeek API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return {
    text: data.choices[0]?.message?.content ?? "",
    provider: "deepseek",
    model,
    usage: {
      promptTokens: data.usage?.prompt_tokens ?? 0,
      completionTokens: data.usage?.completion_tokens ?? 0,
      totalTokens: data.usage?.total_tokens ?? 0,
    },
  };
}

async function callMistral(request: AIRequest): Promise<AIResponse> {
  const apiKey = SERVER_API_KEYS.mistral;
  if (!apiKey) throw new Error("Mistral API key not configured");

  const model = request.tier === "reasoning" ? "mistral-large-latest" : "mistral-small-latest";
  const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
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
    throw new Error(`Mistral API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return {
    text: data.choices[0]?.message?.content ?? "",
    provider: "mistral",
    model,
    usage: {
      promptTokens: data.usage?.prompt_tokens ?? 0,
      completionTokens: data.usage?.completion_tokens ?? 0,
      totalTokens: data.usage?.total_tokens ?? 0,
    },
  };
}

// ---------------------------------------------------------------------------
// Provider dispatcher
// ---------------------------------------------------------------------------

const PROVIDER_CALLERS: Record<string, (req: AIRequest) => Promise<AIResponse>> = {
  openai: callOpenAI,
  gemini: callGemini,
  groq: callGroq,
  claude: callClaude,
  deepseek: callDeepSeek,
  mistral: callMistral,
};

function getAvailableProviders(): AIProvider[] {
  return (Object.keys(SERVER_API_KEYS) as AIProvider[]).filter((p) => !!SERVER_API_KEYS[p]);
}

function getRecommendedServerProvider(tier: string, available: AIProvider[]): AIProvider {
  if (tier === "reasoning") {
    if (available.includes("deepseek")) return "deepseek";
    if (available.includes("claude")) return "claude";
    if (available.includes("openai")) return "openai";
    if (available.includes("groq")) return "groq";
    if (available.includes("gemini")) return "gemini";
  }
  // Default / cheap
  if (available.includes("gemini")) return "gemini";
  if (available.includes("groq")) return "groq";
  if (available.includes("mistral")) return "mistral";
  if (available.includes("openai")) return "openai";
  if (available.includes("claude")) return "claude";
  return available[0];
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    // -----------------------------------------------------------------------
    // 1. IP & Abuse prevention checks
    // -----------------------------------------------------------------------
    const forwardedFor = request.headers.get("x-forwarded-for");
    const clientIP = forwardedFor?.split(",")[0]?.trim() ?? request.headers.get("x-real-ip") ?? "127.0.0.1";

    if (!checkAIIpRateLimit(clientIP)) {
      return NextResponse.json(
        {
          error: "Too many AI requests. Please wait a minute before trying again.",
          code: "AI_RATE_LIMIT_EXCEEDED",
        },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }

    const body = (await request.json()) as AIRequest & { operation?: CreditOperation };

    // Payload validation
    if (!body || !body.prompt || typeof body.prompt !== "string") {
      return NextResponse.json(
        { error: "Invalid request: 'prompt' string is required." },
        { status: 400 }
      );
    }

    if (body.prompt.length > 80000) {
      return NextResponse.json(
        { error: "Prompt exceeds maximum allowed length of 80,000 characters." },
        { status: 400 }
      );
    }

    // -----------------------------------------------------------------------
    // 2. Authentication & Session Validation (Anti-Fraud & Security)
    // -----------------------------------------------------------------------
    const cookieStore = await cookies();
    const authUser = extractAuthUser(request, cookieStore);
    const userId = authUser?.userId ?? null;

    // Strict security rule: Guests & unauthenticated requests are blocked from AI
    if (!userId || authUser?.isAnonymous) {
      return NextResponse.json(
        {
          error: "Authentication required",
          message: "Please sign in to your account to use AI models. Free accounts receive 1,000 free credits every month!",
          code: "AUTH_REQUIRED",
        },
        { status: 401 }
      );
    }

    const abuseCheck = checkAbuse({
      ip: clientIP,
      userId,
      isGuest: false,
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
          status:
            abuseCheck.code === "IP_BLOCKED" || abuseCheck.code === "SUSPICIOUS_ACTIVITY"
              ? 403
              : 429,
          headers: abuseCheck.retryAfterMs
            ? { "Retry-After": String(Math.ceil(abuseCheck.retryAfterMs / 1000)) }
            : {},
        }
      );
    }

    // -----------------------------------------------------------------------
    // 3. Pre-Flight Credit Balance Check
    // -----------------------------------------------------------------------
    const operation: CreditOperation = body.operation ?? tierToCreditOperation(body.tier ?? "cheap");
    const creditCheck = await checkCredits(userId, operation);

    if (!creditCheck.allowed) {
      return NextResponse.json(
        {
          error: "Insufficient credits",
          message: `This operation requires ${creditCheck.required} credits, but you only have ${creditCheck.remaining} credits remaining. Your 1,000 credits automatically reset every 30 days.`,
          code: "INSUFFICIENT_CREDITS",
          requiredCredits: creditCheck.required,
          availableCredits: creditCheck.remaining,
        },
        { status: 402 }
      );
    }

    // -----------------------------------------------------------------------
    // 4. Provider Selection & Auto-Routing
    // -----------------------------------------------------------------------
    const available = getAvailableProviders();
    if (available.length === 0) {
      return NextResponse.json(
        { error: "No AI providers configured on the server. Please add API keys to .env.local" },
        { status: 503 }
      );
    }

    let targetProviders: AIProvider[] = [];

    if (body.provider && (body.provider as string) !== "auto" && available.includes(body.provider)) {
      targetProviders = [body.provider, ...available.filter((p) => p !== body.provider)];
    } else {
      const recommended = getRecommendedServerProvider(body.tier ?? "cheap", available);
      targetProviders = [recommended, ...available.filter((p) => p !== recommended)];
    }

    // Try providers in priority order
    const errors: string[] = [];
    for (const provider of targetProviders) {
      try {
        const caller = PROVIDER_CALLERS[provider];
        const response = await caller(body);

        // -------------------------------------------------------------------
        // 5. Automatic Credit Deduction on SUCCESS ONLY
        // -------------------------------------------------------------------
        const deduction = await deductCredits(userId, operation);

        return NextResponse.json({
          ...response,
          creditsUsed: getCreditCost(operation),
          creditsRemaining: deduction.remaining,
        });
      } catch (error) {
        errors.push(`${provider}: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }

    return NextResponse.json(
      { error: `All configured providers failed:\n${errors.join("\n")}` },
      { status: 502 }
    );
  } catch (error) {
    console.error("AI API internal error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}

// Health check and provider discovery
export async function GET() {
  const available = getAvailableProviders();
  const providerMeta = available.map((p) => {
    const cfg = getProviderConfig(p);
    return {
      id: p,
      name: cfg.name,
      badge: cfg.badge,
      modelLabel: cfg.modelLabel,
      description: cfg.description,
      color: cfg.color,
    };
  });

  return NextResponse.json({
    status: "ok",
    providers: available,
    providerMeta,
    allSupported: SUPPORTED_PROVIDERS,
    models: Object.fromEntries(available.map((p) => [p, MODEL_MAP[p] || {}])),
  });
}