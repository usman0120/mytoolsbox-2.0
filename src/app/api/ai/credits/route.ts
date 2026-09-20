import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getRemainingCredits } from "@/lib/credits";

/**
 * GET /api/ai/credits
 * Returns the current user's credit balance.
 * Requires authentication (__session cookie).
 */
export async function GET(_request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("__session");
    const userId = sessionCookie?.value ?? null;

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required", remaining: 0 },
        { status: 401 }
      );
    }

    const remaining = await getRemainingCredits(userId);

    return NextResponse.json({ remaining });
  } catch (error) {
    console.error("Credits fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch credits", remaining: 0 },
      { status: 500 }
    );
  }
}