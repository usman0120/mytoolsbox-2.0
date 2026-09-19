import { aiService } from "./base";

// ---------------------------------------------------------------------------
// Text Summarizer
// ---------------------------------------------------------------------------

export interface SummarizeInput {
  text: string;
  maxLength?: number; // target length in words
  format?: "paragraph" | "bullets" | "tldr";
}

export interface SummarizeOutput {
  summary: string;
  originalLength: number;
  summaryLength: number;
  compressionRatio: number;
  keyPoints: string[];
}

const SUMMARIZE_SYSTEM_PROMPT = `You are an expert text summarizer. Create concise, accurate summaries.
Return a JSON object with:
- "summary": the summarized text
- "keyPoints": an array of 3-5 key takeaways
- "originalLength": the approximate word count of the original
- "summaryLength": the word count of the summary
- "compressionRatio": summaryLength / originalLength as a decimal

Preserve the core message. Remove redundancy. Keep important facts and figures.`;

export async function summarize(input: SummarizeInput): Promise<SummarizeOutput> {
  const lengthHint = input.maxLength ? ` Keep the summary under ${input.maxLength} words.` : "";
  const formatHint =
    input.format === "bullets"
      ? " Use bullet points."
      : input.format === "tldr"
        ? " Keep it extremely short (1-2 sentences)."
        : "";

  const response = await aiService(
    SUMMARIZE_SYSTEM_PROMPT,
    `Summarize this text.${lengthHint}${formatHint}\n\nText:\n${input.text}`,
    { tier: "cheap", temperature: 0.3 }
  );

  try {
    return JSON.parse(response.text);
  } catch {
    return {
      summary: response.text,
      originalLength: input.text.split(/\s+/).length,
      summaryLength: response.text.split(/\s+/).length,
      compressionRatio: 0,
      keyPoints: [],
    };
  }
}