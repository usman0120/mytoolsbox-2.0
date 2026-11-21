export type AIProvider = "openai" | "gemini" | "groq" | "claude" | "deepseek" | "mistral" | (string & {});

export type AIModelTier = "cheap" | "reasoning" | "vision" | "image";

export interface AIRequest {
  prompt: string;
  /** Server-side only; browsers send `promptKey` and the server supplies the instructions. */
  systemPrompt?: string;
  /** Key into the server prompt library for /api/ai. */
  promptKey?: string;
  provider?: AIProvider;
  model?: string;
  tier?: AIModelTier;
  maxTokens?: number;
  temperature?: number;
  /** Inline images for vision tasks (base64 without the data: prefix). */
  images?: { mime: string; data: string }[];
  /** Per-attempt timeout; short tasks fail over to the next model sooner. */
  timeoutMs?: number;
}

export interface AIResponse {
  text: string;
  provider: AIProvider;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface AIProviderAdapter {
  name: AIProvider;
  complete(request: AIRequest): Promise<AIResponse>;
  isAvailable(): boolean;
}