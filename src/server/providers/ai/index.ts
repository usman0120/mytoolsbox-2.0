import "server-only";
import type { AIRequest, AIResponse } from "@/lib/ai/types";

// Active providers: Gemini (primary) and Groq (fallback). OpenAI/Claude/DeepSeek/Mistral
// stay disabled until a later phase (blueprint section 13).
type Tier = NonNullable<AIRequest["tier"]>;
type Caller = (req: AIRequest, model: string, key: string) => Promise<AIResponse>;

/** A stalled provider must fail over instead of hanging the request. */
const CALL_TIMEOUT = 30_000;
const STREAM_TIMEOUT = 90_000;
/** A model that hasn't started answering within this time is skipped for the next fallback.
 * Vision and reasoning models think before the first token, so they get longer. */
const STREAM_OPEN_TIMEOUT: Record<Tier, number> = { cheap: 12_000, vision: 30_000, reasoning: 30_000, image: 30_000 };

interface Provider {
  id: "gemini" | "groq";
  /** Accepts inline images. */
  vision: boolean;
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
    signal: AbortSignal.timeout(req.timeoutMs ?? CALL_TIMEOUT),
    headers: { "Content-Type": "application/json", "x-goog-api-key": key },
    body: JSON.stringify({
      ...(req.systemPrompt ? { systemInstruction: { parts: [{ text: req.systemPrompt }] } } : {}),
      contents: [{ role: "user", parts: [...(req.images ?? []).map((i) => ({ inline_data: { mime_type: i.mime, data: i.data } })), { text: req.prompt }] }],
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
    signal: AbortSignal.timeout(req.timeoutMs ?? CALL_TIMEOUT),
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
    vision: true,
    key: () => process.env.GEMINI_API_KEY,
    models: {
      // Verified against the account's model list on 2026-11-21. Each model has its own free quota.
      cheap: ["gemini-3.8-flash", "gemini-flash-latest", "gemini-3-flash-preview"],
      reasoning: ["gemini-3.1-pro-preview", "gemini-3.8-flash"],
      vision: ["gemini-3.8-flash", "gemini-flash-latest", "gemini-3-flash-preview"],
      image: [],
    },
    call: callGemini,
  },
  {
    id: "groq",
    vision: false,
    key: () => process.env.GROQ_API_KEY,
    models: {
      cheap: ["openai/gpt-oss-20b", "qwen/qwen3.8-27b"],
      reasoning: ["openai/gpt-oss-120b", "qwen/qwen3.8-27b"],
      vision: [],
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
    if (!key || isOpen(p.id) || (req.images?.length && !p.vision)) continue;
    for (const model of p.models[tier]) {
      try {
        const result = await p.call(req, model, key);
        failures.delete(p.id);
        return result;
      } catch (e) {
        errors.push(`${p.id}/${model}: ${e instanceof Error ? e.message : String(e)}`);
        console.warn(`AI fallback after ${p.id}/${model}: ${(e instanceof Error ? e.message : String(e)).slice(0, 120)}`);
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

// ---------------------------------------------------------------------------
// Streaming: open a stream on the first provider/model that answers 200, then
// convert its server-sent events into plain text chunks.
// ---------------------------------------------------------------------------

type Opener = (req: AIRequest, model: string, key: string, signal: AbortSignal) => Promise<Response>;

const openGemini: Opener = (req, model, key, signal) =>
  fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse`, {
    method: "POST",
    signal,
    headers: { "Content-Type": "application/json", "x-goog-api-key": key },
    body: JSON.stringify({
      ...(req.systemPrompt ? { systemInstruction: { parts: [{ text: req.systemPrompt }] } } : {}),
      contents: [{ role: "user", parts: [...(req.images ?? []).map((i) => ({ inline_data: { mime_type: i.mime, data: i.data } })), { text: req.prompt }] }],
      generationConfig: { maxOutputTokens: req.maxTokens ?? 2048, temperature: req.temperature ?? 0.7 },
    }),
  });

const openGroq: Opener = (req, model, key, signal) =>
  fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    signal,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model,
      stream: true,
      messages: [...(req.systemPrompt ? [{ role: "system", content: req.systemPrompt }] : []), { role: "user", content: req.prompt }],
      max_tokens: req.maxTokens ?? 2048,
      temperature: req.temperature ?? 0.7,
    }),
  });

const OPENERS: Record<Provider["id"], Opener> = { gemini: openGemini, groq: openGroq };

function deltaOf(provider: Provider["id"], data: string): string {
  try {
    const json = JSON.parse(data);
    if (provider === "gemini") return (json.candidates?.[0]?.content?.parts ?? []).map((p: { text?: string }) => p.text ?? "").join("");
    return json.choices?.[0]?.delta?.content ?? "";
  } catch {
    return "";
  }
}

function sseToText(body: ReadableStream<Uint8Array>, provider: Provider["id"]): ReadableStream<string> {
  const decoder = new TextDecoder();
  let buffer = "";
  return body.pipeThrough(
    new TransformStream<Uint8Array, string>({
      transform(chunk, controller) {
        buffer += decoder.decode(chunk, { stream: true });
        const lines = buffer.split(/\r?\n/);
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data:")) continue;
          const data = line.slice(5).trim();
          if (!data || data === "[DONE]") continue;
          const text = deltaOf(provider, data);
          if (text) controller.enqueue(text);
        }
      },
    }),
  );
}

export async function streamAi(req: AIRequest): Promise<{ stream: ReadableStream<string>; provider: string; model: string }> {
  const tier: Tier = req.tier ?? "cheap";
  const errors: string[] = [];
  const ordered = [...PROVIDERS].sort((a, b) => Number(b.id === req.provider) - Number(a.id === req.provider));
  for (const p of ordered) {
    const key = p.key();
    if (!key || isOpen(p.id) || (req.images?.length && !p.vision)) continue;
    for (const model of p.models[tier]) {
      try {
        const opening = new AbortController();
        const openMs = STREAM_OPEN_TIMEOUT[tier] ?? 12_000;
        const timer = setTimeout(() => opening.abort(new Error(`no response within ${openMs / 1000} s`)), openMs);
        let res: Response;
        try {
          res = await OPENERS[p.id](req, model, key, AbortSignal.any([opening.signal, AbortSignal.timeout(STREAM_TIMEOUT)]));
        } finally {
          clearTimeout(timer);
        }
        if (!res.ok || !res.body) throw new ProviderError(res.status, await res.text().catch(() => ""));
        failures.delete(p.id);
        return { stream: sseToText(res.body, p.id), provider: p.id, model };
      } catch (e) {
        errors.push(`${p.id}/${model}: ${e instanceof Error ? e.message : String(e)}`);
        console.warn(`AI fallback after ${p.id}/${model}: ${(e instanceof Error ? e.message : String(e)).slice(0, 120)}`);
        if (e instanceof ProviderError && [400, 401, 403].includes(e.status)) break;
      }
    }
    recordFailure(p.id);
  }
  if (errors.length === 0) throw new ProviderError(503, "No AI provider is configured.");
  console.error("AI stream failed:", errors.join(" | "));
  throw new ProviderError(502, "AI providers are unavailable right now.");
}
