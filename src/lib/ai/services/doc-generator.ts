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


export async function generateDocs(input: DocGeneratorInput): Promise<DocGeneratorOutput> {
  const langHint = input.language ? ` Language: ${input.language}.` : "";
  const styleHint = input.style && input.style !== "auto" ? ` Style: ${input.style}.` : "";
  const detailHint = input.detail ? ` Detail level: ${input.detail}.` : "";

  const response = await aiService(
    "doc-generator",
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