import { aiService } from "./base";

// ---------------------------------------------------------------------------
// AI API Documentation Generator
// ---------------------------------------------------------------------------

export interface APIDocGeneratorInput {
  code: string;
  language?: string;
  format?: "openapi" | "swagger" | "markdown" | "auto";
}

export interface APIDocGeneratorOutput {
  title: string;
  description: string;
  endpoints: Array<{
    method: string;
    path: string;
    summary: string;
    description: string;
    parameters: Array<{ name: string; in: string; type: string; required: boolean; description: string }>;
    responses: Array<{ code: number; description: string; schema?: string }>;
  }>;
  schemas?: Array<{ name: string; type: string; properties: Record<string, { type: string; description: string }> }>;
  markdown?: string;
}


export async function generateAPIDocs(input: APIDocGeneratorInput): Promise<APIDocGeneratorOutput> {
  const langHint = input.language ? ` Language: ${input.language}.` : "";
  const formatHint = input.format && input.format !== "auto" ? ` Format: ${input.format}.` : "";

  const response = await aiService(
    "api-doc-generator",
    `Generate API documentation for this code.${langHint}${formatHint}\n\nCode:\n\`\`\`\n${input.code}\n\`\`\``,
    { tier: "reasoning", temperature: 0.3 }
  );

  try {
    return JSON.parse(response.text);
  } catch {
    return {
      title: "API Documentation",
      description: response.text,
      endpoints: [],
      markdown: response.text,
    };
  }
}