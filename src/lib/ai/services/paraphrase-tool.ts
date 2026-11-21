import { aiService } from "./base";

// ---------------------------------------------------------------------------
// Paraphrase Tool
// ---------------------------------------------------------------------------

export interface ParaphraseInput {
  text: string;
  mode?: "standard" | "fluent" | "academic" | "creative" | "shorten" | "expand";
  preserveKeywords?: string[];
}

export interface ParaphraseVariant {
  text: string;
  style: string;
  description: string;
}

export interface ParaphraseOutput {
  variants: ParaphraseVariant[];
  bestPick: number; // index of recommended variant
}


export async function paraphrase(input: ParaphraseInput): Promise<ParaphraseOutput> {
  const modeHint = input.mode ? ` Style preference: ${input.mode}.` : "";
  const kwHint = input.preserveKeywords?.length
    ? ` Preserve these keywords: ${input.preserveKeywords.join(", ")}.`
    : "";

  const response = await aiService(
    "paraphrase-tool",
    `Paraphrase this text.${modeHint}${kwHint}\n\nText:\n${input.text}`,
    { tier: "cheap", temperature: 0.8 }
  );

  try {
    return JSON.parse(response.text);
  } catch {
    return {
      variants: [{ text: response.text, style: "Standard", description: "Paraphrased version" }],
      bestPick: 0,
    };
  }
}