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
import { checkAdminAccess } from "@/lib/auth/admin-auth";

// ---------------------------------------------------------------------------
// Admin check (simple — replace with proper role-based auth in production)
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// GET /api/admin/stats
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  const accessError = await checkAdminAccess(request, await cookies());
  if (accessError) {
    return NextResponse.json({ error: accessError === 503 ? "Authentication unavailable" : "Unauthorized" }, { status: accessError });
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
  const accessError = await checkAdminAccess(request, await cookies());
  if (accessError) {
    return NextResponse.json({ error: accessError === 503 ? "Authentication unavailable" : "Unauthorized" }, { status: accessError });
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