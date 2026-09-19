import { complete, streamComplete } from "../router";
import type { AIRequest, AIResponse, AIModelTier } from "../types";

// ---------------------------------------------------------------------------
// Base service – thin wrapper that every domain service extends
// ---------------------------------------------------------------------------

export interface AIServiceOptions {
  tier?: AIModelTier;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  onChunk?: (chunk: string) => void;
}

export async function aiService(
  systemPrompt: string,
  userPrompt: string,
  options: AIServiceOptions = {}
): Promise<AIResponse> {
  const request: AIRequest = {
    systemPrompt,
    prompt: userPrompt,
    tier: options.tier ?? "cheap",
    temperature: options.temperature,
    maxTokens: options.maxTokens,
  };

  if (options.stream && options.onChunk) {
    return streamComplete(request, options.onChunk);
  }

  return complete(request);
}