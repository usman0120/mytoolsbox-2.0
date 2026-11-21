import "server-only";
import type { NextRequest } from "next/server";
import { extractAuthUser } from "@/lib/auth/server-auth";
import type { QuotaIdentity } from "@/server/quota";

export function clientIp(request: NextRequest): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "local";
}

/** Signed-in users are keyed by uid; others by device ID (header) plus IP. */
export async function resolveIdentity(request: NextRequest): Promise<QuotaIdentity> {
  const user = await extractAuthUser(request);
  if (user && !user.isAnonymous) return { key: `uid:${user.userId}`, signedIn: true };
  const device = request.headers.get("x-device-id")?.replace(/[^a-zA-Z0-9-]/g, "").slice(0, 64);
  return { key: `anon:${device || "none"}:${clientIp(request)}`, signedIn: false };
}
