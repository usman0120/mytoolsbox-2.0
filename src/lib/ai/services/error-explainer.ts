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


export async function explainError(input: ErrorExplainerInput): Promise<ErrorExplainerOutput> {
  const langHint = input.language ? ` Language/Environment: ${input.language}.` : "";
  const contextHint = input.context ? `\n\nCode context:\n\`\`\`\n${input.context}\n\`\`\`` : "";

  const response = await aiService(
    "error-explainer",
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