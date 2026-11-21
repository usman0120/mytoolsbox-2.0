import "server-only";

/**
 * Counter store used for AI quotas and rate limits.
 * Uses Upstash Redis (REST) when UPSTASH_REDIS_REST_URL/TOKEN are set,
 * otherwise an in-memory store (per server instance; fine for local dev).
 */
export interface CounterStore {
  /** Increments `key` by `by`, setting a TTL on first write. Returns the new value. */
  incr(key: string, ttlSeconds: number, by?: number): Promise<number>;
  get(key: string): Promise<number>;
  /** Small string cache (AI responses). */
  getText(key: string): Promise<string | null>;
  setText(key: string, value: string, ttlSeconds: number): Promise<void>;
}

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

async function upstash(commands: (string | number)[][]): Promise<unknown[]> {
  const res = await fetch(`${url}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(commands),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Rate-limit store error: ${res.status}`);
  const data = (await res.json()) as { result: unknown }[];
  return data.map((d) => d.result);
}

const upstashStore: CounterStore = {
  async incr(key, ttl, by = 1) {
    const [value] = await upstash([["INCRBY", key, by], ["EXPIRE", key, ttl, "NX"]]);
    return Number(value);
  },
  async get(key) {
    const [value] = await upstash([["GET", key]]);
    return Number(value ?? 0);
  },
  async getText(key) {
    const [value] = await upstash([["GET", key]]);
    return typeof value === "string" ? value : null;
  },
  async setText(key, value, ttl) {
    await upstash([["SET", key, value, "EX", ttl]]);
  },
};

const memory = new Map<string, { value: number; expires: number }>();
const texts = new Map<string, { value: string; expires: number }>();
const memoryStore: CounterStore = {
  async incr(key, ttl, by = 1) {
    const now = Date.now();
    const entry = memory.get(key);
    if (!entry || entry.expires < now) {
      memory.set(key, { value: by, expires: now + ttl * 1000 });
      return by;
    }
    entry.value += by;
    return entry.value;
  },
  async get(key) {
    const entry = memory.get(key);
    return entry && entry.expires >= Date.now() ? entry.value : 0;
  },
  async getText(key) {
    const entry = texts.get(key);
    return entry && entry.expires >= Date.now() ? entry.value : null;
  },
  async setText(key, value, ttl) {
    if (texts.size > 500) texts.delete(texts.keys().next().value as string);
    texts.set(key, { value, expires: Date.now() + ttl * 1000 });
  },
};

export const counterStore: CounterStore = url && token ? upstashStore : memoryStore;
