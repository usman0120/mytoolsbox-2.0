// POST /api/feedback — submit feedback. Read submissions in the Firebase console (no admin panel).
import { NextRequest, NextResponse } from "next/server";
import { submitFeedback } from "@/lib/firebase/user-service";
import type { FeedbackType } from "@/types/user";

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

    if (body.message.length > 5000 || (body.name?.length ?? 0) > 120 || (body.email?.length ?? 0) > 200) {
      return NextResponse.json({ error: "Message is too long." }, { status: 400 });
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
