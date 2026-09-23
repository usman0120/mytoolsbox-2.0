"use client";

import { AISubnav } from "@/features/ai/components/ai-subnav";
import { ModelCompare } from "@/features/ai/components/model-compare";

export function ComparePageClient() {
  return (
    <div className="container mx-auto px-3 sm:px-4 py-6 md:py-8 max-w-7xl">
      <AISubnav
        title="AI Model Comparison Arena"
        subtitle="Benchmark responses side-by-side in real time. Evaluate output quality, reasoning depth, and latency across Google Gemini 2.0 Flash and Groq models."
      />
      <div className="mt-2">
        <ModelCompare />
      </div>
    </div>
  );
}
