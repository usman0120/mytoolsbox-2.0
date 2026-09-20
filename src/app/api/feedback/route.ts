// ---------------------------------------------------------------------------
// Feedback API — Submit & retrieve contact form / feedback submissions
// ---------------------------------------------------------------------------
// POST /api/feedback — Submit a new feedback/contact message
// GET  /api/feedback — Get all feedback (admin only, requires session)
// PATCH /api/feedback — Update feedback status (admin only)
// DELETE /api/feedback — Delete feedback (admin only)
// ---------------------------------------------------------------------------

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  submitFeedback,
  getFeedback,
  updateFeedbackStatus,
  deleteFeedback,
} from "@/lib/firebase/user-service";
import type { FeedbackType, FeedbackStatus } from "@/types/user";

// ---------------------------------------------------------------------------
// Admin check
// ---------------------------------------------------------------------------

async function isAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("__session");
  return !!sessionCookie;
}

// ---------------------------------------------------------------------------
// POST /api/feedback — Submit feedback (public)
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      type: FeedbackType;
      message: string;
      name: string;
      email: string;
    };

    if (!body.message || !body.message.trim()) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    if (!body.type || !["suggestion", "bug", "feedback", "question"].includes(body.type)) {
      return NextResponse.json(
        { error: "Valid type is required (suggestion, bug, feedback, question)" },
        { status: 400 }
      );
    }

    const id = await submitFeedback({
      type: body.type,
      message: body.message.trim(),
      name: body.name?.trim() ?? "Anonymous",
      email: body.email?.trim() ?? "",
    });

    return NextResponse.json({ success: true, id });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to submit feedback" },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// GET /api/feedback — Get all feedback (admin only)
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const feedback = await getFeedback();
    return NextResponse.json({ feedback });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch feedback" },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// PATCH /api/feedback — Update feedback status (admin only)
// ---------------------------------------------------------------------------

export async function PATCH(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json() as {
      id: string;
      status: FeedbackStatus;
    };

    if (!body.id || !body.status) {
      return NextResponse.json(
        { error: "id and status are required" },
        { status: 400 }
      );
    }

    await updateFeedbackStatus(body.id, body.status);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update feedback" },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// DELETE /api/feedback — Delete feedback (admin only)
// ---------------------------------------------------------------------------

export async function DELETE(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    await deleteFeedback(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete feedback" },
      { status: 500 }
    );
  }
}