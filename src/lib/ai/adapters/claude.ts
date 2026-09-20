import { AIProviderAdapter, AIRequest, AIResponse } from "../types";

const CLAUDE_MODELS: Record<string, string> = {
  cheap: "claude-3-5-haiku-20241022",
  reasoning: "claude-3-5-sonnet-20241022",
  vision: "claude-3-5-sonnet-20241022",
  image: "claude-3-5-sonnet-20241022",
};

export function createClaudeAdapter(): AIProviderAdapter {
  // Prefer server-side key, fall back to public key for backward compatibility
  const apiKey = process.env.CLAUDE_API_KEY ?? process.env.NEXT_PUBLIC_CLAUDE_API_KEY;

  return {
    name: "claude",

    isAvailable(): boolean {
      return !!apiKey;
    },

    async complete(request: AIRequest): Promise<AIResponse> {
      if (!apiKey) {
        throw new Error("Claude API key not configured");
      }

      const model = request.model ?? CLAUDE_MODELS[request.tier ?? "cheap"];

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model,
          system: request.systemPrompt,
          messages: [{ role: "user", content: request.prompt }],
          max_tokens: request.maxTokens ?? 2048,
          temperature: request.temperature ?? 0.7,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Claude API error: ${response.status} - ${error}`);
      }

      const data = await response.json();
      const content = data.content?.[0];

      return {
        text: content?.text ?? "",
        provider: "claude",
        model,
        usage: {
          promptTokens: data.usage?.input_tokens ?? 0,
          completionTokens: data.usage?.output_tokens ?? 0,
          totalTokens:
            (data.usage?.input_tokens ?? 0) + (data.usage?.output_tokens ?? 0),
        },
      };
    },
  };
}