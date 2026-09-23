import type { Metadata } from "next";
import { PersonasPageClient } from "./page-client";

export const metadata: Metadata = {
  title: "AI Personas & Specialized Engines",
  description:
    "Tailored AI personas for software engineering, copywriting, mathematics, academic research, and product strategy with optimized system prompts.",
};

export default function PersonasPage() {
  return <PersonasPageClient />;
}
