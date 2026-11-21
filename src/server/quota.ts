import "server-only";
import { AI_LIMITS } from "@/config/limits";
import { counterStore } from "@/server/providers/ratelimit";

export interface QuotaIdentity {
  /** Firebase uid for signed-in users, otherwise `anon:{deviceId|ip}`. */
  key: string;
  signedIn: boolean;
}

export interface QuotaState {
  used: number;
  limit: number;
  remaining: number;
}

const DAY = 60 * 60 * 24;
const today = () => new Date().toISOString().slice(0, 10).replace(/-/g, "");

export function dailyLimit(identity: QuotaIdentity): number {
  return identity.signedIn ? AI_LIMITS.signedInDaily : AI_LIMITS.anonymousDaily;
}

export async function getQuota(identity: QuotaIdentity): Promise<QuotaState> {
  const used = await counterStore.get(`ai:day:${today()}:${identity.key}`);
  const limit = dailyLimit(identity);
  return { used, limit, remaining: Math.max(0, limit - used) };
}

export type QuotaCheck =
  | { ok: true; quota: QuotaState }
  | { ok: false; status: 429 | 503; code: string; message: string; retryAfter?: number; quota?: QuotaState };

/** Checks the per-minute rate limit, the user's daily allowance and the global cap. */
export async function checkQuota(identity: QuotaIdentity, ip: string, cost = 1): Promise<QuotaCheck> {
  const minute = Math.floor(Date.now() / 60_000);
  const [byId, byIp] = await Promise.all([
    counterStore.incr(`ai:min:${minute}:${identity.key}`, 70),
    counterStore.incr(`ai:min:${minute}:ip:${ip}`, 70),
  ]);
  if (byId > AI_LIMITS.perMinute || byIp > AI_LIMITS.perMinute * 3) {
    return { ok: false, status: 429, code: "RATE_LIMITED", message: "You're sending requests quickly. Wait a minute and try again.", retryAfter: 60 };
  }

  const quota = await getQuota(identity);
  if (quota.remaining < cost) {
    return {
      ok: false,
      status: 429,
      code: "DAILY_LIMIT",
      message: identity.signedIn
        ? `You've used today's ${quota.limit} free AI requests. They reset at midnight UTC.`
        : `You've used today's ${quota.limit} free AI requests. Sign in for ${AI_LIMITS.signedInDaily} a day.`,
      quota,
    };
  }

  const global = await counterStore.get(`ai:global:${today()}`);
  if (global + cost > AI_LIMITS.globalDaily) {
    return { ok: false, status: 503, code: "AI_BUSY", message: "AI is busy right now. Try again later; all other tools keep working." };
  }
  return { ok: true, quota };
}

/** Records usage after a successful AI response. */
export async function consumeQuota(identity: QuotaIdentity, cost = 1): Promise<QuotaState> {
  const day = today();
  const [used] = await Promise.all([
    counterStore.incr(`ai:day:${day}:${identity.key}`, DAY + 3600, cost),
    counterStore.incr(`ai:global:${day}`, DAY + 3600, cost),
  ]);
  const limit = dailyLimit(identity);
  return { used, limit, remaining: Math.max(0, limit - used) };
}
