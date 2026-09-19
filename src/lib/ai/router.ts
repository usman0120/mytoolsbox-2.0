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

const adapterFactories: Record<AIProvider, () => AIProviderAdapter> = {
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

export async function complete(request: AIRequest): Promise<AIResponse> {
  // If a specific provider is requested, use it
  if (request.provider) {
    const adapter = getAdapter(request.provider);
    if (!adapter.isAvailable()) {
      throw new Error(`Provider "${request.provider}" is not available`);
    }
    return adapter.complete(request);
  }

  // Otherwise, try providers in order of preference
  const available = getAvailableProviders();
  if (available.length === 0) {
    throw new Error(
      "No AI providers available. Please configure at least one API key."
    );
  }

  // Try each provider until one succeeds
  const errors: string[] = [];
  for (const provider of available) {
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