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

const API_DOC_GENERATOR_SYSTEM_PROMPT = `You are an expert API designer and technical writer. Generate comprehensive API documentation from code.
Return a JSON object with:
- "title": the API title
- "description": overall description of the API
- "endpoints": array of endpoint objects with:
  - "method": HTTP method (GET, POST, PUT, DELETE, PATCH)
  - "path": the endpoint path
  - "summary": short summary
  - "description": detailed description
  - "parameters": array of { "name", "in" (query/path/header/body), "type", "required" (boolean), "description" }
  - "responses": array of { "code" (number), "description", "schema" (optional type) }
- "schemas": optional array of data schemas
- "markdown": a complete Markdown version of the documentation

Be thorough. Document all endpoints, parameters, responses, and error cases.`;

export async function generateAPIDocs(input: APIDocGeneratorInput): Promise<APIDocGeneratorOutput> {
  const langHint = input.language ? ` Language: ${input.language}.` : "";
  const formatHint = input.format && input.format !== "auto" ? ` Format: ${input.format}.` : "";

  const response = await aiService(
    API_DOC_GENERATOR_SYSTEM_PROMPT,
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