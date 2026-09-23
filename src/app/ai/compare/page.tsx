import type { Metadata } from "next";
import { ComparePageClient } from "./page-client";

export const metadata: Metadata = {
  title: "AI Model Arena - Side-by-Side Comparison",
  description:
    "Compare Google Gemini 2.0 Flash against Groq Llama 3.3 70B and Groq DeepSeek-R1 Distill in real-time side-by-side benchmark arena.",
};

export default function ComparePage() {
  return <ComparePageClient />;
}
