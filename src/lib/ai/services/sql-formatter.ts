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


export async function formatSQL(input: SQLFormatInput): Promise<SQLFormatOutput> {
  const dialect = input.dialect ?? "mysql";

  const response = await aiService(
    "sql-formatter",
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