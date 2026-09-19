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

const SQL_ASSISTANT_SYSTEM_PROMPT = `You are an expert SQL developer and DBA. Help users with SQL queries.
Return a JSON object with:
- "result": the main output (explanation, optimized query, formatted query, or generated query)
- "explanation": detailed explanation of what was done
- "suggestions": array of improvement suggestions (for explain/optimize actions)
- "optimizedQuery": the optimized version (for optimize action)

For "explain": break down what the query does, table by table, clause by clause.
For "optimize": suggest indexes, rewrite inefficient patterns, explain the changes.
For "format": return a well-formatted version with consistent style.
For "generate": generate a SQL query from a natural language description.

Be precise about SQL syntax. Consider performance implications.`;

export async function sqlAssist(input: SQLAssistantInput): Promise<SQLAssistantOutput> {
  let prompt = `Action: ${input.action}`;
  if (input.dialect) prompt += `\nDialect: ${input.dialect}`;
  if (input.schema) prompt += `\nSchema:\n${input.schema}`;
  prompt += `\n\nQuery/Description:\n${input.query}`;

  const response = await aiService(
    SQL_ASSISTANT_SYSTEM_PROMPT,
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