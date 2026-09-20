// ---------------------------------------------------------------------------
// Admin API — Stats & Management
// ---------------------------------------------------------------------------
// GET /api/admin/stats — Dashboard overview
// GET /api/admin/abuse  — Abuse prevention stats
// POST /api/admin/abuse/unblock — Unblock an IP
// ---------------------------------------------------------------------------

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAbuseStats, getBlockedIPs, unblockIP } from "@/lib/payments/abuse";

// ---------------------------------------------------------------------------
// Admin check (simple — replace with proper role-based auth in production)
// ---------------------------------------------------------------------------

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim()).filter(Boolean);

async function isAdmin(): Promise<boolean> {
  // In production: verify Firebase Auth token + check admin claim
  // For now: check session cookie exists (basic auth gate)
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("__session");
  return !!sessionCookie;
}

// ---------------------------------------------------------------------------
// GET /api/admin/stats
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const section = searchParams.get("section") ?? "overview";

  switch (section) {
    case "abuse":
      return NextResponse.json({
        abuse: getAbuseStats(),
        blockedIPs: getBlockedIPs(),
      });

    case "overview":
    default:
      return NextResponse.json({
        status: "ok",
        sections: ["overview", "abuse", "users", "feedback", "tools", "subscriptions"],
        timestamp: Date.now(),
      });
  }
}

// ---------------------------------------------------------------------------
// POST /api/admin/abuse/unblock
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json() as { action: string; ip?: string };

    if (body.action === "unblock" && body.ip) {
      unblockIP(body.ip);
      return NextResponse.json({ success: true, unblockedIP: body.ip });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}