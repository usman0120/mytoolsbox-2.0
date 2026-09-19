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

const CITATION_SYSTEM_PROMPT = `You are an expert citation generator. Generate accurate citations in the requested style.
Return a JSON object with:
- "citation": the full citation string
- "inTextCitation": the in-text citation (e.g. "(Smith, 2023)" or "[1]")
- "bibliography": the bibliography/reference list entry
- "style": the citation style used

If you cannot determine enough information from the source, make reasonable inferences and note them.
For web sources, try to identify: author, title, date, publisher/website, URL.`;

export async function generateCitation(input: CitationInput): Promise<CitationOutput> {
  const style = input.style ?? "apa";

  const response = await aiService(
    CITATION_SYSTEM_PROMPT,
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