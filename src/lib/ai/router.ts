import {
  AIProvider,
  AIProviderAdapter,
  AIRequest,
  AIResponse,
} from "./types";
import {
  createOpenAIAdapter,
  createGeminiAdapter,
  createGroqAdapter,
  createClaudeAdapter,
} from "./adapters";
import { tierToCreditOperation, getCreditCost, type CreditOperation } from "./credits";
import { getFirebaseAuth } from "@/lib/firebase";

const adapterFactories: Partial<Record<AIProvider, () => AIProviderAdapter>> = {
  openai: createOpenAIAdapter,
  gemini: createGeminiAdapter,
  groq: createGroqAdapter,
  claude: createClaudeAdapter,
};

const adapterCache = new Map<AIProvider, AIProviderAdapter>();

function getAdapter(provider: AIProvider): AIProviderAdapter {
  const cached = adapterCache.get(provider);
  if (cached) return cached;

  const factory = adapterFactories[provider];
  if (!factory) {
    throw new Error(`Client adapter for provider "${provider}" is not configured. Use completeViaServer instead.`);
  }
  const adapter = factory();
  adapterCache.set(provider, adapter);
  return adapter;
}

export function getAvailableProviders(): AIProvider[] {
  return (Object.keys(adapterFactories) as AIProvider[]).filter((provider) => {
    try {
      return getAdapter(provider).isAvailable();
    } catch {
      return false;
    }
  });
}

/**
 * Get the recommended provider for a given tier.
 * Prefers cheaper providers for "cheap" tier, reasoning-capable for "reasoning".
 */
export function getRecommendedProvider(tier: string): AIProvider | undefined {
  const available = getAvailableProviders();
  if (available.length === 0) return undefined;

  switch (tier) {
    case "cheap":
      // Prefer Groq (fastest/cheapest), then Gemini, then OpenAI
      if (available.includes("groq")) return "groq";
      if (available.includes("gemini")) return "gemini";
      return available[0];
    case "reasoning":
      // Prefer Claude (best reasoning), then OpenAI, then Groq (DeepSeek)
      if (available.includes("claude")) return "claude";
      if (available.includes("openai")) return "openai";
      if (available.includes("groq")) return "groq";
      return available[0];
    case "vision":
      // Prefer OpenAI (GPT-4o vision), then Gemini, then Claude
      if (available.includes("openai")) return "openai";
      if (available.includes("gemini")) return "gemini";
      if (available.includes("claude")) return "claude";
      return available[0];
    case "image":
      // Only OpenAI supports image generation
      if (available.includes("openai")) return "openai";
      return undefined;
    default:
      return available[0];
  }
}

/**
 * Get the credit cost for a given AI request.
 */
export function getRequestCreditCost(request: AIRequest): number {
  const operation = tierToCreditOperation(request.tier ?? "cheap");
  return getCreditCost(operation);
}

export async function complete(request: AIRequest): Promise<AIResponse> {
  // Browser requests stay on the server's authenticated, credit-accounted path.
  if (typeof window !== "undefined") return completeViaServer(request);

  // If a specific provider is requested, use it
  if (request.provider) {
    const adapter = getAdapter(request.provider);
    if (!adapter.isAvailable()) {
      throw new Error(`Provider "${request.provider}" is not available`);
    }
    return adapter.complete(request);
  }

  // Otherwise, try providers in order of preference based on tier
  const available = getAvailableProviders();
  if (available.length === 0) {
    throw new Error(
      "No AI providers available. Please configure at least one API key."
    );
  }

  // Use tier-based routing
  const recommended = getRecommendedProvider(request.tier ?? "cheap");
  const orderedProviders = recommended
    ? [recommended, ...available.filter((p) => p !== recommended)]
    : available;

  // Try each provider until one succeeds
  const errors: string[] = [];
  for (const provider of orderedProviders) {
    try {
      const adapter = getAdapter(provider);
      return await adapter.complete({ ...request, provider });
    } catch (error) {
      errors.push(
        `${provider}: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  throw new Error(`All providers failed:\n${errors.join("\n")}`);
}

export async function streamComplete(
  request: AIRequest,
  onChunk: (chunk: string) => void
): Promise<AIResponse> {
  // The current provider contract returns complete JSON, not a token stream.
  const response = await complete(request);
  onChunk(response.text);
  return response;
}

// ---------------------------------------------------------------------------
// Server-side API client (routes through /api/ai for credit deduction)
// ---------------------------------------------------------------------------

export interface ServerAIResponse extends AIResponse {
  creditsUsed?: number;
  creditsRemaining?: number;
}

/**
 * Call the AI API through the server route, which handles credit deduction.
 * This is the preferred method for authenticated users — it ensures credits
 * are properly tracked and deducted.
 */
export async function completeViaServer(
  request: AIRequest & { operation?: CreditOperation }
): Promise<ServerAIResponse> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };

  try {
    const auth = getFirebaseAuth();
    const token = await auth?.currentUser?.getIdToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  } catch {}

  const response = await fetch("/api/ai", {
    method: "POST",
    headers,
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(error.error ?? error.message ?? `Server AI API error: ${response.status}`);
  }

  const data: ServerAIResponse = await response.json();

  if (typeof window !== "undefined") {
    try {
      const auth = getFirebaseAuth();
      const currentUid = auth?.currentUser?.uid;
      if (currentUid && typeof data.creditsRemaining === "number") {
        const { syncCreditsToFirestore } = await import("@/lib/credits/credit-firestore");
        syncCreditsToFirestore(currentUid, data.creditsRemaining, data.creditsUsed).catch(() => {});
      }
    } catch {}

    if (typeof data.creditsRemaining === "number") {
      window.dispatchEvent(
        new CustomEvent("credits-updated", {
          detail: { remaining: data.creditsRemaining, used: data.creditsUsed },
        })
      );
    }
  }

  return data;
}