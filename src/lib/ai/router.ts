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
  // Centralized Credit Routing: In browser environments, route through /api/ai
  // to ensure credits are tracked and deducted accurately across all AI tools.
  if (typeof window !== "undefined") {
    try {
      return await completeViaServer(request);
    } catch (serverErr) {
      const errMsg = serverErr instanceof Error ? serverErr.message : String(serverErr);
      // Propagate critical business rule errors (credits, rate limits) directly to UI
      if (
        errMsg.toLowerCase().includes("credit") ||
        errMsg.toLowerCase().includes("insufficient") ||
        errMsg.toLowerCase().includes("blocked") ||
        errMsg.toLowerCase().includes("rate limit")
      ) {
        throw serverErr;
      }
      // Non-critical network/server error: allow local adapter fallback if available
      console.warn("Server AI route failed, attempting local adapter:", serverErr);
    }
  }

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
  // For now, fall back to non-streaming and simulate chunks
  const response = await complete(request);

  // Simulate streaming by sending chunks of the response
  const words = response.text.split(" ");
  const chunkSize = 3;

  for (let i = 0; i < words.length; i += chunkSize) {
    const chunk = words.slice(i, i + chunkSize).join(" ") + " ";
    onChunk(chunk);
    await new Promise((resolve) => setTimeout(resolve, 30));
  }

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
  const response = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(error.error ?? error.message ?? `Server AI API error: ${response.status}`);
  }

  const data: ServerAIResponse = await response.json();

  if (typeof window !== "undefined" && typeof data.creditsRemaining === "number") {
    window.dispatchEvent(
      new CustomEvent("credits-updated", {
        detail: { remaining: data.creditsRemaining, used: data.creditsUsed },
      })
    );
  }

  return data;
}