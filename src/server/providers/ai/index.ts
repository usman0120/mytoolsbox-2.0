import "server-only";
import type { AIRequest, AIResponse } from "@/lib/ai/types";

// Active providers: Gemini (primary) and Groq (fallback). OpenAI/Claude/DeepSeek/Mistral
// stay disabled until a later phase (blueprint section 13).
type Tier = NonNullable<AIRequest["tier"]>;
type Caller = (req: AIRequest, model: string, key: string) => Promise<AIResponse>;

interface Provider {
  id: "gemini" | "groq";
  key: () => string | undefined;
  models: Record<Tier, string[]>;
  call: Caller;
}

export class ProviderError extends Error {
  constructor(
    public status: number,
    detail: string,
  ) {
    super(`HTTP ${status}: ${detail.slice(0, 300)}`);
  }
}

const callGemini: Caller = async (req, model, key) => {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": key },
    body: JSON.stringify({
      ...(req.systemPrompt ? { systemInstruction: { parts: [{ text: req.systemPrompt }] } } : {}),
      contents: [{ role: "user", parts: [{ text: req.prompt }] }],
      generationConfig: { maxOutputTokens: req.maxTokens ?? 2048, temperature: req.temperature ?? 0.7 },
    }),
  });
  if (!res.ok) throw new ProviderError(res.status, await res.text());
  const data = await res.json();
  const parts: { text?: string }[] = data.candidates?.[0]?.content?.parts ?? [];
  const text = parts.map((p) => p.text ?? "").join("");
  if (!text) throw new ProviderError(502, "Empty response");
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
};

const callGroq: Caller = async (req, model, key) => {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model,
      messages: [
        ...(req.systemPrompt ? [{ role: "system", content: req.systemPrompt }] : []),
        { role: "user", content: req.prompt },
      ],
      max_tokens: req.maxTokens ?? 2048,
      temperature: req.temperature ?? 0.7,
    }),
  });
  if (!res.ok) throw new ProviderError(res.status, await res.text());
  const data = await res.json();
  const text: string = data.choices?.[0]?.message?.content ?? "";
  if (!text) throw new ProviderError(502, "Empty response");
  return {
    text,
    provider: "groq",
    model,
    usage: {
      promptTokens: data.usage?.prompt_tokens ?? 0,
      completionTokens: data.usage?.completion_tokens ?? 0,
      totalTokens: data.usage?.total_tokens ?? 0,
    },
  };
};

// Model IDs live here only. Update them from each provider's console when they change.
const PROVIDERS: Provider[] = [
  {
    id: "gemini",
    key: () => process.env.GEMINI_API_KEY,
    models: {
      cheap: ["gemini-3-flash-preview", "gemini-2.5-flash"],
      reasoning: ["gemini-3.1-pro-preview", "gemini-3-flash-preview"],
      vision: ["gemini-3-flash-preview", "gemini-2.5-flash"],
      image: [],
    },
    call: callGemini,
  },
  {
    id: "groq",
    key: () => process.env.GROQ_API_KEY,
    models: {
      cheap: ["openai/gpt-oss-20b", "llama-3.3-70b-versatile"],
      reasoning: ["openai/gpt-oss-120b", "llama-3.3-70b-versatile"],
      vision: ["openai/gpt-oss-20b"],
      image: [],
    },
    call: callGroq,
  },
];

// Circuit breaker: skip a provider for 60 s after 3 consecutive failures.
const failures = new Map<string, { count: number; until: number }>();
const isOpen = (id: string) => (failures.get(id)?.until ?? 0) > Date.now();
function recordFailure(id: string) {
  const f = failures.get(id) ?? { count: 0, until: 0 };
  f.count += 1;
  if (f.count >= 3) {
    f.until = Date.now() + 60_000;
    f.count = 0;
  }
  failures.set(id, f);
}

export function availableProviders(): string[] {
  return PROVIDERS.filter((p) => !!p.key()).map((p) => p.id);
}

/** Runs the request on the first healthy provider/model, falling back on errors. */
export async function runAi(req: AIRequest): Promise<AIResponse> {
  const tier: Tier = req.tier ?? "cheap";
  const ordered = [...PROVIDERS].sort((a, b) => Number(b.id === req.provider) - Number(a.id === req.provider));
  const errors: string[] = [];
  for (const p of ordered) {
    const key = p.key();
    if (!key || isOpen(p.id)) continue;
    for (const model of p.models[tier]) {
      try {
        const result = await p.call(req, model, key);
        failures.delete(p.id);
        return result;
      } catch (e) {
        errors.push(`${p.id}/${model}: ${e instanceof Error ? e.message : String(e)}`);
        // Auth/bad-request errors will not improve with another model of the same provider.
        if (e instanceof ProviderError && [400, 401, 403].includes(e.status)) break;
      }
    }
    recordFailure(p.id);
  }
  if (errors.length === 0) throw new ProviderError(503, "No AI provider is configured.");
  console.error("AI providers failed:", errors.join(" | "));
  throw new ProviderError(502, "AI providers are unavailable right now.");
}
