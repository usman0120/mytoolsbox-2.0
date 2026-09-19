import { AIProviderAdapter, AIRequest, AIResponse, AIProvider } from "../types";

const OPENAI_MODELS: Record<string, string> = {
  cheap: "gpt-4o-mini",
  reasoning: "gpt-4o",
  vision: "gpt-4o",
  image: "dall-e-3",
};

export function createOpenAIAdapter(): AIProviderAdapter {
  const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

  return {
    name: "openai",

    isAvailable(): boolean {
      return !!apiKey;
    },

    async complete(request: AIRequest): Promise<AIResponse> {
      if (!apiKey) {
        throw new Error("OpenAI API key not configured");
      }

      const model = request.model ?? OPENAI_MODELS[request.tier ?? "cheap"];

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
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
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`OpenAI API error: ${response.status} - ${error}`);
      }

      const data = await response.json();
      const choice = data.choices?.[0];

      return {
        text: choice?.message?.content ?? "",
        provider: "openai",
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