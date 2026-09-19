import { aiService } from "./base";

// ---------------------------------------------------------------------------
// AI Documentation Generator
// ---------------------------------------------------------------------------

export interface DocGeneratorInput {
  code: string;
  language?: string;
  style?: "jsdoc" | "godoc" | "docstring" | "rubydoc" | "auto";
  detail?: "brief" | "standard" | "detailed";
}

export interface DocGeneratorOutput {
  documentedCode: string;
  summary: string;
  parameters: Array<{ name: string; type: string; description: string }>;
  returns: { type: string; description: string };
  examples: string[];
}

const DOC_GENERATOR_SYSTEM_PROMPT = `You are an expert technical writer and developer. Generate high-quality documentation for code.
Return a JSON object with:
- "documentedCode": the original code with documentation comments added
- "summary": a concise summary of what the code does
- "parameters": array of { "name", "type", "description" } for function parameters
- "returns": { "type", "description" } for return value
- "examples": array of usage example strings

Choose the appropriate documentation style based on the language:
- JavaScript/TypeScript: JSDoc
- Python: docstring (Google style)
- Go: GoDoc
- Ruby: RubyDoc
- Java/C#: Javadoc/XML doc
- Other: most appropriate style

Be thorough but concise. Include edge cases and important notes.`;

export async function generateDocs(input: DocGeneratorInput): Promise<DocGeneratorOutput> {
  const langHint = input.language ? ` Language: ${input.language}.` : "";
  const styleHint = input.style && input.style !== "auto" ? ` Style: ${input.style}.` : "";
  const detailHint = input.detail ? ` Detail level: ${input.detail}.` : "";

  const response = await aiService(
    DOC_GENERATOR_SYSTEM_PROMPT,
    `Generate documentation for this code.${langHint}${styleHint}${detailHint}\n\nCode:\n\`\`\`\n${input.code}\n\`\`\``,
    { tier: "cheap", temperature: 0.3 }
  );

  try {
    return JSON.parse(response.text);
  } catch {
    return {
      documentedCode: input.code,
      summary: response.text,
      parameters: [],
      returns: { type: "unknown", description: "" },
      examples: [],
    };
  }
}