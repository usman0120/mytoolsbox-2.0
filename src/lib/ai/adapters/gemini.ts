import { AIProviderAdapter, AIRequest, AIResponse } from "../types";

const GEMINI_MODELS: Record<string, string> = {
  cheap: "gemini-2.0-flash",
  reasoning: "gemini-2.0-pro",
  vision: "gemini-2.0-flash",
  image: "gemini-2.0-flash-exp-image",
};

export function createGeminiAdapter(): AIProviderAdapter {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  return {
    name: "gemini",

    isAvailable(): boolean {
      return !!apiKey;
    },

    async complete(request: AIRequest): Promise<AIResponse> {
      if (!apiKey) {
        throw new Error("Gemini API key not configured");
      }

      const model = request.model ?? GEMINI_MODELS[request.tier ?? "cheap"];

      const contents: Record<string, unknown>[] = [];

      if (request.systemPrompt) {
        contents.push({
          role: "user",
          parts: [{ text: `System: ${request.systemPrompt}\n\nUser: ${request.prompt}` }],
        });
      } else {
        contents.push({
          role: "user",
          parts: [{ text: request.prompt }],
        });
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents,
            generationConfig: {
              maxOutputTokens: request.maxTokens ?? 2048,
              temperature: request.temperature ?? 0.7,
            },
          }),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Gemini API error: ${response.status} - ${error}`);
      }

      const data = await response.json();
      const candidate = data.candidates?.[0];
      const text = candidate?.content?.parts?.[0]?.text ?? "";

      return {
        text,
        provider: "gemini",
        model,
        usage: {
          promptTokens: data.usageMetadata?.promptTokenCount ?? 0,
          completionTokens: data.usageMetadata?.candidatesTokenCount ?? 0,
          totalTokens: data.usageMetadata?.totalTokenCount ?? 0,
        },
      };
    },
  };
}