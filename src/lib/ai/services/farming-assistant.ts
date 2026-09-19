import { aiService } from "./base";

// ---------------------------------------------------------------------------
// Farming Assistant AI Service
// ---------------------------------------------------------------------------

export interface FarmingAssistantInput {
  query: string;
  context?: string;       // e.g., crop name, region, language preference
  language?: string;      // e.g., "hindi", "punjabi", "english"
}

export interface FarmingAssistantOutput {
  answer: string;
  disclaimer: string;
  relatedTopics: string[];
  practicalSteps: string[];
}

const FARMING_SYSTEM_PROMPT = `You are an expert agricultural assistant helping farmers with practical, actionable advice.

IMPORTANT GUIDELINES:
- Provide practical, evidence-based farming advice
- If the user asks in a non-English language, respond in that same language
- Keep answers simple and actionable — farmers need clear steps
- Include local context when possible (season, climate zone, soil type)
- For high-stakes advice (pesticides, disease treatment, livestock health), ALWAYS include a disclaimer to consult local agricultural extension services
- NEVER recommend banned or restricted pesticides
- Promote sustainable and organic farming practices when appropriate
- Include cost-effective solutions suitable for small and medium farms

Return your response as a JSON object with:
- "answer": the main response (in the user's language)
- "disclaimer": a brief disclaimer about consulting local experts (in the user's language)
- "relatedTopics": array of 2-4 related topics the farmer might want to explore
- "practicalSteps": array of 2-5 concrete actionable steps the farmer can take`;

export async function askFarmingExpert(input: FarmingAssistantInput): Promise<FarmingAssistantOutput> {
  const langHint = input.language && input.language !== "english"
    ? ` Please respond in ${input.language} language.`
    : "";

  const contextHint = input.context
    ? ` Context: the farmer is growing ${input.context}.`
    : "";

  const response = await aiService(
    FARMING_SYSTEM_PROMPT,
    `Question: ${input.query}${contextHint}${langHint}`,
    { tier: "reasoning", temperature: 0.3 }
  );

  try {
    const parsed = JSON.parse(response.text);
    return {
      answer: parsed.answer ?? response.text,
      disclaimer: parsed.disclaimer ?? "Consult your local agricultural extension officer for region-specific advice.",
      relatedTopics: parsed.relatedTopics ?? [],
      practicalSteps: parsed.practicalSteps ?? [],
    };
  } catch {
    return {
      answer: response.text,
      disclaimer: "Consult your local agricultural extension officer for region-specific advice.",
      relatedTopics: [],
      practicalSteps: [],
    };
  }
}