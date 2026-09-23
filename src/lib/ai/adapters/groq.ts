import { AIProviderAdapter, AIRequest, AIResponse } from "../types";

const GROQ_MODELS: Record<string, string> = {
  cheap: "openai/gpt-oss-20b",
  reasoning: "openai/gpt-oss-120b",
  vision: "openai/gpt-oss-20b",
  image: "openai/gpt-oss-20b",
};

export function createGroqAdapter(): AIProviderAdapter {
  // Prefer server-side key, fall back to public key for backward compatibility
  const apiKey = process.env.GROQ_API_KEY ?? process.env.NEXT_PUBLIC_GROQ_API_KEY;

  return {
    name: "groq",

    isAvailable(): boolean {
      return !!apiKey;
    },

    async complete(request: AIRequest): Promise<AIResponse> {
      if (!apiKey) {
        throw new Error("Groq API key not configured");
      }

      const model = request.model ?? GROQ_MODELS[request.tier ?? "cheap"];

      const response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model,
            messages: [
              ...(request.systemPrompt
                ? [{ role: "system", content: request.systemPrompt }]
                : []),
              { role: "user", content: request.prompt },
            ],
            max_tokens: request.maxTokens ?? 2048,
            temperature: request.temperature ?? 0.7,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Groq API error: ${response.status} - ${error}`);
      }

      const data = await response.json();
      const choice = data.choices?.[0];

      return {
        text: choice?.message?.content ?? "",
        provider: "groq",
        model,
        usage: {
          promptTokens: data.usage?.prompt_tokens ?? 0,
          completionTokens: data.usage?.completion_tokens ?? 0,
          totalTokens: data.usage?.total_tokens ?? 0,
        },
      };
    },
  };
}