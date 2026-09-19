import { aiService } from "./base";

// ---------------------------------------------------------------------------
// AI Regex Builder
// ---------------------------------------------------------------------------

export interface RegexBuilderInput {
  description: string;
  testCases?: string[];
  flags?: string;
}

export interface RegexBuilderOutput {
  pattern: string;
  explanation: string;
  testResults?: Array<{ input: string; matches: string[]; success: boolean }>;
  flags: string;
}

const REGEX_BUILDER_SYSTEM_PROMPT = `You are an expert regex engineer. Build precise regular expressions based on user descriptions.
Return a JSON object with:
- "pattern": the regex pattern string (without delimiters)
- "explanation": a detailed breakdown of each part of the pattern
- "flags": recommended flags (e.g. "gi", "gm", "i", "m", "")
- "testResults": if test cases are provided, an array of { "input": string, "matches": string[], "success": boolean }

Make patterns as specific as possible. Handle edge cases. Explain each component clearly.`;

export async function buildRegex(input: RegexBuilderInput): Promise<RegexBuilderOutput> {
  let prompt = `Build a regex for: ${input.description}`;
  if (input.flags) prompt += `\nPreferred flags: ${input.flags}`;
  if (input.testCases?.length) {
    prompt += `\nTest cases:\n${input.testCases.map((t) => `- "${t}"`).join("\n")}`;
  }

  const response = await aiService(
    REGEX_BUILDER_SYSTEM_PROMPT,
    prompt,
    { tier: "cheap", temperature: 0.2 }
  );

  try {
    return JSON.parse(response.text);
  } catch {
    return {
      pattern: response.text,
      explanation: "Could not parse structured response.",
      flags: input.flags || "",
    };
  }
}