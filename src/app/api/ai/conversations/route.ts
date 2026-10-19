// ---------------------------------------------------------------------------
// GET /api/ai/conversations – List user's conversations
// POST /api/ai/conversations – Create/update a conversation
// ---------------------------------------------------------------------------

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  fetchConversations,
  saveConversation,
  updateConversation,
  deleteConversation,
  deleteAllConversations,
} from "@/features/ai/chat-persistence";
import { AuthVerificationUnavailableError, extractAuthUser } from "@/lib/auth/server-auth";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const authUser = await extractAuthUser(request, cookieStore);
    const userId = authUser?.userId ?? null;

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const conversations = await fetchConversations(userId);
    return NextResponse.json({ conversations });
  } catch (error) {
    if (error instanceof AuthVerificationUnavailableError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    console.error("Fetch conversations error:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const authUser = await extractAuthUser(request, cookieStore);
    const userId = authUser?.userId ?? null;

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, conversation } = body;

    switch (action) {
      case "save":
        if (!conversation) {
          return NextResponse.json(
            { error: "Conversation data required" },
            { status: 400 }
          );
        }
        await saveConversation(userId, conversation);
        return NextResponse.json({ success: true });

      case "update":
        if (!conversation?.id) {
          return NextResponse.json(
            { error: "Conversation ID required" },
            { status: 400 }
          );
        }
        await updateConversation(userId, conversation.id, conversation);
        return NextResponse.json({ success: true });

      case "delete":
        if (!conversation?.id) {
          return NextResponse.json(
            { error: "Conversation ID required" },
            { status: 400 }
          );
        }
        await deleteConversation(userId, conversation.id);
        return NextResponse.json({ success: true });

      case "clear":
        await deleteAllConversations(userId);
        return NextResponse.json({ success: true });

      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
    }
  } catch (error) {
    if (error instanceof AuthVerificationUnavailableError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    console.error("Conversation save error:", error);
    return NextResponse.json(
      { error: "Failed to save conversation" },
      { status: 500 }
    );
  }
}