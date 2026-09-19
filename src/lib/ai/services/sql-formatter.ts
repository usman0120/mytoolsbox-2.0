import { aiService } from "./base";

// ---------------------------------------------------------------------------
// SQL Formatter / Explainer
// ---------------------------------------------------------------------------

export interface SQLFormatInput {
  sql: string;
  dialect?: "mysql" | "postgresql" | "sqlite" | "mssql" | "oracle";
  action: "format" | "explain" | "optimize";
}

export interface SQLFormatOutput {
  result: string;
  dialect: string;
  action: string;
  suggestions?: string[];
}

const SQL_SYSTEM_PROMPT = `You are an expert SQL developer and database administrator.
Return a JSON object with:
- "result": the formatted/explained/optimized SQL
- "dialect": the SQL dialect detected or specified
- "action": the action performed
- "suggestions": optional array of optimization or improvement suggestions

For "format": properly indent, capitalize keywords, add line breaks.
For "explain": describe what the query does in plain English.
For "optimize": suggest and apply performance improvements (indexes, query restructuring).`;

export async function formatSQL(input: SQLFormatInput): Promise<SQLFormatOutput> {
  const dialect = input.dialect ?? "mysql";

  const response = await aiService(
    SQL_SYSTEM_PROMPT,
    `Action: ${input.action}. Dialect: ${dialect}.\n\nSQL:\n${input.sql}`,
    { tier: "cheap", temperature: 0.1 }
  );

  try {
    return JSON.parse(response.text);
  } catch {
    return {
      result: response.text,
      dialect,
      action: input.action,
    };
  }
}