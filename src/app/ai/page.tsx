import type { Metadata } from "next";
import { AIPageClient } from "./page-client";

export const metadata: Metadata = {
  title: "AI Chat - Multi-Provider AI Assistant",
  description:
    "Chat with multiple AI models from OpenAI, Gemini, Groq, and Claude. Compare responses, get coding help, brainstorm ideas, and more.",
};

export default function AIPage() {
  return <AIPageClient />;
}