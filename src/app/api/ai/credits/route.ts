import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUserCreditSummary } from "@/lib/credits";
import { extractAuthUser } from "@/lib/auth/server-auth";

/**
 * GET /api/ai/credits
 * Returns the current authenticated user's credit balance, total allowance,
 * used credits, period dates, and countdown until the next 30-day reset.
 */
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const authUser = extractAuthUser(request, cookieStore);

    if (!authUser || !authUser.userId) {
      return NextResponse.json(
        { error: "Authentication required", remaining: 0, total: 0 },
        { status: 401 }
      );
    }

    const summary = await getUserCreditSummary(authUser.userId);

    return NextResponse.json({
      remaining: summary.remaining,
      total: summary.total,
      used: summary.used,
      tier: summary.tier,
      periodStart: summary.periodStart,
      periodEnd: summary.periodEnd,
      daysRemaining: summary.daysRemaining,
    });
  } catch (error) {
    console.error("Credits fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch credits", remaining: 0, total: 0 },
      { status: 500 }
    );
  }
}