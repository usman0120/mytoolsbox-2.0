import { aiService } from "./base";

// ---------------------------------------------------------------------------
// Citation Generator
// ---------------------------------------------------------------------------

export type CitationStyle = "apa" | "mla" | "chicago" | "harvard" | "ieee" | "vancouver";

export interface CitationInput {
  source: string; // URL, DOI, ISBN, or free-text description
  style?: CitationStyle;
}

export interface CitationOutput {
  citation: string;
  inTextCitation: string;
  bibliography: string;
  style: CitationStyle;
}


export async function generateCitation(input: CitationInput): Promise<CitationOutput> {
  const style = input.style ?? "apa";

  const response = await aiService(
    "citation-generator",
    `Generate a ${style.toUpperCase()} citation for this source: ${input.source}`,
    { tier: "cheap", temperature: 0.1 }
  );

  try {
    return JSON.parse(response.text);
  } catch {
    return {
      citation: response.text,
      inTextCitation: "",
      bibliography: response.text,
      style,
    };
  }
}