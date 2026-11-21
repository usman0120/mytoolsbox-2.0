import { NextRequest, NextResponse } from "next/server";
import { getQuota } from "@/server/quota";
import { resolveIdentity } from "@/server/ai-identity";

export const runtime = "nodejs";

/** GET /api/ai/quota → today's AI allowance for the caller. */
export async function GET(request: NextRequest) {
  const identity = await resolveIdentity(request).catch(() => null);
  if (!identity) return NextResponse.json({ error: "Unavailable" }, { status: 503 });
  return NextResponse.json({ ...(await getQuota(identity)), signedIn: identity.signedIn });
}
