import type { Metadata } from "next";
import { PromptsPageClient } from "./page-client";

export const metadata: Metadata = {
  title: "AI Prompt Library - 160+ Curated Prompts",
  description:
    "Explore 160+ battle-tested prompts across engineering, copywriting, product strategy, academic research, data science, and business.",
};

export default function PromptsPage() {
  return <PromptsPageClient />;
}
