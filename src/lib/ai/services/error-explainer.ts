import { aiService } from "./base";

// ---------------------------------------------------------------------------
// AI Error Explainer
// ---------------------------------------------------------------------------

export interface ErrorExplainerInput {
  error: string;
  language?: string;
  context?: string;
}

export interface ErrorExplainerOutput {
  summary: string;
  cause: string;
  solution: string;
  codeExample?: string;
  relatedErrors: string[];
  severity: "low" | "medium" | "high" | "critical";
}

const ERROR_EXPLAINER_SYSTEM_PROMPT = `You are an expert debugger and developer. Explain programming errors clearly and provide actionable solutions.
Return a JSON object with:
- "summary": a one-sentence summary of the error
- "cause": detailed explanation of what causes this error
- "solution": step-by-step solution to fix the error
- "codeExample": a code snippet showing the fix (if applicable)
- "relatedErrors": array of related error messages that might appear
- "severity": one of "low", "medium", "high", "critical"

Be practical and specific. Provide real, working solutions. If the error is vague, suggest debugging steps.`;

export async function explainError(input: ErrorExplainerInput): Promise<ErrorExplainerOutput> {
  const langHint = input.language ? ` Language/Environment: ${input.language}.` : "";
  const contextHint = input.context ? `\n\nCode context:\n\`\`\`\n${input.context}\n\`\`\`` : "";

  const response = await aiService(
    ERROR_EXPLAINER_SYSTEM_PROMPT,
    `Explain this error and how to fix it.${langHint}\n\nError:\n${input.error}${contextHint}`,
    { tier: "reasoning", temperature: 0.3 }
  );

  try {
    return JSON.parse(response.text);
  } catch {
    return {
      summary: response.text,
      cause: "",
      solution: "",
      severity: "medium",
      relatedErrors: [],
    };
  }
}