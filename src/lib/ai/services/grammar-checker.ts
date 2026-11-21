import { aiService } from "./base";

// ---------------------------------------------------------------------------
// Grammar Checker
// ---------------------------------------------------------------------------

export interface GrammarCheckInput {
  text: string;
  language?: string;
  mode?: "proofread" | "concise" | "formal" | "casual";
}

export interface GrammarIssue {
  type: "spelling" | "grammar" | "style" | "punctuation";
  original: string;
  suggestion: string;
  explanation: string;
  offset: number;
  length: number;
}

export interface GrammarCheckOutput {
  correctedText: string;
  issues: GrammarIssue[];
  summary: string;
}


export async function checkGrammar(input: GrammarCheckInput): Promise<GrammarCheckOutput> {
  const modeHint = input.mode ? ` Mode: ${input.mode}.` : "";
  const langHint = input.language ? ` Language: ${input.language}.` : "";

  const response = await aiService(
    "grammar-checker",
    `Proofread this text.${modeHint}${langHint}\n\nText:\n${input.text}`,
    { tier: "cheap", temperature: 0.1 }
  );

  try {
    const parsed = JSON.parse(response.text);
    return {
      correctedText: parsed.correctedText ?? input.text,
      issues: parsed.issues ?? [],
      summary: parsed.summary ?? "Text has been reviewed.",
    };
  } catch {
    return {
      correctedText: response.text,
      issues: [],
      summary: "Text has been reviewed.",
    };
  }
}