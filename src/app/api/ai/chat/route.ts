// ---------------------------------------------------------------------------
// POST /api/ai/chat – Streaming AI chat completion
// ---------------------------------------------------------------------------

import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { complete, getAvailableProviders, getRecommendedProvider } from "@/lib/ai";
import { checkCredits, deductCredits } from "@/lib/credits";
import type { AIProvider } from "@/lib/ai";

import { extractAuthUserFromCookies } from "@/lib/auth/server-auth";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const authUser = extractAuthUserFromCookies(cookieStore);
    const userId = authUser?.userId ?? null;

    if (!userId || authUser?.isAnonymous) {
      return new Response(
        JSON.stringify({ error: "Authentication required", message: "Please sign in to chat with AI." }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const body = await request.json();
    const {
      messages,
      provider: requestedProvider,
      model,
      systemPrompt,
      temperature,
      maxTokens,
    } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Messages array is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Build the prompt from conversation history
    const conversationText = messages
      .map(
        (m: { role: string; content: string }) =>
          `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`
      )
      .join("\n\n");

    const lastMessage = messages[messages.length - 1];
    const prompt = lastMessage.role === "user" ? lastMessage.content : conversationText;

    // Determine provider
    let provider: AIProvider | undefined;
    if (requestedProvider && requestedProvider !== "auto") {
      const available = getAvailableProviders();
      if (available.includes(requestedProvider as AIProvider)) {
        provider = requestedProvider as AIProvider;
      }
    }
    if (!provider) {
      provider = getRecommendedProvider("cheap");
    }

    if (!provider) {
      return new Response(
        JSON.stringify({ error: "No AI provider available. Please configure an API key." }),
        { status: 503, headers: { "Content-Type": "application/json" } }
      );
    }

    // Check credits before executing
    const creditCheck = await checkCredits(userId, "chat_message");
    if (!creditCheck.allowed) {
      return new Response(
        JSON.stringify({
          error: "Insufficient credits",
          creditsRemaining: creditCheck.remaining,
        }),
        { status: 402, headers: { "Content-Type": "application/json" } }
      );
    }

    // Call AI
    const response = await complete({
      prompt,
      systemPrompt: systemPrompt || "You are a helpful, knowledgeable AI assistant. Be concise, accurate, and engaging. Use markdown formatting when helpful.",
      provider,
      model: model || undefined,
      tier: "cheap",
      temperature: temperature ?? 0.7,
      maxTokens: maxTokens ?? 4096,
    });

    // Deduct on success
    const deductRes = await deductCredits(userId, "chat_message");

    return new Response(
      JSON.stringify({
        text: response.text,
        provider: response.provider,
        model: response.model,
        usage: response.usage,
        creditsRemaining: deductRes.remaining,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("AI chat error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "AI request failed",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}