import { aiService } from "./base";

// ---------------------------------------------------------------------------
// General Chat / Assistant
// ---------------------------------------------------------------------------

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ChatInput {
  messages: ChatMessage[];
  context?: string;
}

export interface ChatOutput {
  reply: string;
  followUpQuestions?: string[];
}


export async function chat(input: ChatInput): Promise<ChatOutput> {
  // Build conversation from messages
  const conversation = input.messages
    .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
    .join("\n\n");

  const contextHint = input.context
    ? `\n\nAdditional context: ${input.context}`
    : "";

  const response = await aiService(
    "chat",
    `Conversation:\n${conversation}${contextHint}\n\nASSISTANT:`,
    { tier: "cheap", temperature: 0.7 }
  );

  try {
    return JSON.parse(response.text);
  } catch {
    return { reply: response.text };
  }
}