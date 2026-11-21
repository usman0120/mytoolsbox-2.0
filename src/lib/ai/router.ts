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
import { getDeviceId } from "./device-id";
import { getFirebaseAuth } from "@/lib/firebase";

// Only Gemini and Groq are active. OpenAI/Claude adapters stay available for later phases.
const adapterFactories: Partial<Record<AIProvider, () => AIProviderAdapter>> = {
  gemini: createGeminiAdapter,
  groq: createGroqAdapter,
};
void createOpenAIAdapter;
void createClaudeAdapter;

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
  // In the browser, AI always goes through the server gateway.
  if (typeof window !== "undefined") return ["server"];
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

export async function complete(request: AIRequest): Promise<AIResponse> {
  // Browser requests always go through the server gateway.
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
// Browser client for the /api/ai gateway (quota is enforced on the server)
// ---------------------------------------------------------------------------

export interface AiQuota {
  used: number;
  limit: number;
  remaining: number;
}

export interface ServerAIResponse extends AIResponse {
  quota?: AiQuota;
}

export async function completeViaServer(request: AIRequest): Promise<ServerAIResponse> {
  const headers: Record<string, string> = { "Content-Type": "application/json", "x-device-id": getDeviceId() };
  try {
    const token = await getFirebaseAuth()?.currentUser?.getIdToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  } catch {}

  const response = await fetch("/api/ai", { method: "POST", headers, body: JSON.stringify(request) });
  const data = await response.json().catch(() => ({ error: "Something went wrong. Try again." }));

  if (typeof window !== "undefined" && data?.quota) {
    window.dispatchEvent(new CustomEvent<AiQuota>("ai-quota-updated", { detail: data.quota }));
  }
  if (!response.ok) throw new Error(data.error ?? `AI request failed (${response.status})`);
  return data as ServerAIResponse;
}
