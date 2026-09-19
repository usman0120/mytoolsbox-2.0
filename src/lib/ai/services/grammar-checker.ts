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

const GRAMMAR_SYSTEM_PROMPT = `You are an expert proofreader and grammar checker.
Analyze the provided text and return a JSON object with:
- "correctedText": the fully corrected version of the text
- "issues": an array of issues found, each with:
  - "type": one of "spelling", "grammar", "style", "punctuation"
  - "original": the problematic text fragment
  - "suggestion": the corrected text fragment
  - "explanation": a brief explanation of the issue
  - "offset": approximate character offset where the issue starts (0-based)
  - "length": length of the original text fragment
- "summary": a one-sentence summary of the changes made

Be thorough but don't flag stylistic preferences as errors unless the mode is "formal".`;

export async function checkGrammar(input: GrammarCheckInput): Promise<GrammarCheckOutput> {
  const modeHint = input.mode ? ` Mode: ${input.mode}.` : "";
  const langHint = input.language ? ` Language: ${input.language}.` : "";

  const response = await aiService(
    GRAMMAR_SYSTEM_PROMPT,
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