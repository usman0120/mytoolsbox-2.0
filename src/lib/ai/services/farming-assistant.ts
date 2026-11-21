import { streamAiTask } from "../tasks-client";

// ---------------------------------------------------------------------------
// Farming Assistant AI Service
// ---------------------------------------------------------------------------

export interface FarmingAssistantInput {
  query: string;
  crop?: string;
  region?: string;
}

export interface FarmingAssistantOutput {
  answer: string;
  disclaimer: string;
  relatedTopics: string[];
  practicalSteps: string[];
}

/** Streams the server "farm.advise" task; `onText` receives the answer so far (Markdown). */
export async function askFarmingExpert(input: FarmingAssistantInput, onText?: (text: string) => void): Promise<FarmingAssistantOutput> {
  const { text, note } = await streamAiTask("farm.advise", input.query, { crop: input.crop ?? "", region: input.region ?? "" }, onText ?? (() => {}));
  return {
    answer: text.trim(),
    disclaimer: note ?? "General guidance only. Check product labels and ask your local agriculture extension office.",
    relatedTopics: [],
    practicalSteps: [],
  };
}
