export type AIProvider = "openai" | "gemini" | "groq" | "claude" | "deepseek" | "mistral" | (string & {});

export type AIModelTier = "cheap" | "reasoning" | "vision" | "image";

export interface AIRequest {
  prompt: string;
  systemPrompt?: string;
  provider?: AIProvider;
  model?: string;
  tier?: AIModelTier;
  maxTokens?: number;
  temperature?: number;
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