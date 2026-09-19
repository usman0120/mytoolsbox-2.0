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

const CODE_EXPLAIN_SYSTEM_PROMPT = `You are an expert programming tutor. Explain code clearly and concisely.
Return a JSON object with:
- "summary": a one-paragraph overview of what the code does
- "lineByLine": an array of objects with "line" (line number), "code" (the code on that line), "explanation" (what it does)
- "concepts": an array of programming concepts used
- "suggestions": optional array of improvement suggestions

Tailor explanations to the audience level. For beginners, avoid jargon. For experts, focus on patterns and edge cases.`;

export async function explainCode(input: CodeExplainInput): Promise<CodeExplainOutput> {
  const langHint = input.language ? ` Language: ${input.language}.` : "";
  const audienceHint = input.audience ? ` Audience: ${input.audience}.` : "";

  const response = await aiService(
    CODE_EXPLAIN_SYSTEM_PROMPT,
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