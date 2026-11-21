import { aiService } from "./base";

// ---------------------------------------------------------------------------
// Code Explainer
// ---------------------------------------------------------------------------

export interface CodeExplainInput {
  code: string;
  language?: string;
  audience?: "beginner" | "intermediate" | "expert";
}

export interface CodeExplainOutput {
  summary: string;
  lineByLine: Array<{ line: number; code: string; explanation: string }>;
  concepts: string[];
  suggestions: string[];
}


export async function explainCode(input: CodeExplainInput): Promise<CodeExplainOutput> {
  const langHint = input.language ? ` Language: ${input.language}.` : "";
  const audienceHint = input.audience ? ` Audience: ${input.audience}.` : "";

  const response = await aiService(
    "code-explainer",
    `Explain this code.${langHint}${audienceHint}\n\nCode:\n\`\`\`\n${input.code}\n\`\`\``,
    { tier: "reasoning", temperature: 0.3 }
  );

  try {
    return JSON.parse(response.text);
  } catch {
    return {
      summary: response.text,
      lineByLine: [],
      concepts: [],
      suggestions: [],
    };
  }
}