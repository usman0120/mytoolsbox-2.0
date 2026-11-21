import { aiService } from "./base";

// ---------------------------------------------------------------------------
// AI SQL Assistant
// ---------------------------------------------------------------------------

export interface SQLAssistantInput {
  query: string;
  action: "explain" | "optimize" | "format" | "generate";
  dialect?: string;
  schema?: string;
}

export interface SQLAssistantOutput {
  result: string;
  explanation?: string;
  suggestions?: string[];
  optimizedQuery?: string;
}


export async function sqlAssist(input: SQLAssistantInput): Promise<SQLAssistantOutput> {
  let prompt = `Action: ${input.action}`;
  if (input.dialect) prompt += `\nDialect: ${input.dialect}`;
  if (input.schema) prompt += `\nSchema:\n${input.schema}`;
  prompt += `\n\nQuery/Description:\n${input.query}`;

  const response = await aiService(
    "sql-assistant",
    prompt,
    { tier: "reasoning", temperature: 0.2 }
  );

  try {
    return JSON.parse(response.text);
  } catch {
    return {
      result: response.text,
      explanation: "Could not parse structured response.",
    };
  }
}