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

const CHAT_SYSTEM_PROMPT = `You are a helpful, knowledgeable assistant integrated into MyToolsBox — a utility operating system platform.
You help users with their tasks, answer questions, and guide them to the right tools.

Be concise and actionable. When relevant, suggest specific MyToolsBox tools the user might find helpful.
Return a JSON object with:
- "reply": your response to the user
- "followUpQuestions": optional array of 2-3 follow-up questions the user might want to ask`;

export async function chat(input: ChatInput): Promise<ChatOutput> {
  // Build conversation from messages
  const conversation = input.messages
    .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
    .join("\n\n");

  const contextHint = input.context
    ? `\n\nAdditional context: ${input.context}`
    : "";

  const response = await aiService(
    CHAT_SYSTEM_PROMPT,
    `Conversation:\n${conversation}${contextHint}\n\nASSISTANT:`,
    { tier: "cheap", temperature: 0.7 }
  );

  try {
    return JSON.parse(response.text);
  } catch {
    return { reply: response.text };
  }
}