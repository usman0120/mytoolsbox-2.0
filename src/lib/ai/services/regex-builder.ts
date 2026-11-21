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


export async function buildRegex(input: RegexBuilderInput): Promise<RegexBuilderOutput> {
  let prompt = `Build a regex for: ${input.description}`;
  if (input.flags) prompt += `\nPreferred flags: ${input.flags}`;
  if (input.testCases?.length) {
    prompt += `\nTest cases:\n${input.testCases.map((t) => `- "${t}"`).join("\n")}`;
  }

  const response = await aiService(
    "regex-builder",
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