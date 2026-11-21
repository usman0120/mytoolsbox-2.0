import { ProcessingResult } from "@/lib/processing/types";

export type SQLDialect = "standard" | "postgresql" | "mysql" | "sqlite" | "mssql" | "oracle";

export interface SQLFormatOptions {
  dialect?: SQLDialect;
  uppercase?: boolean;
  indent?: "2" | "4" | "tab";
  minify?: boolean;
}

export interface SQLFormatResult extends ProcessingResult {
  data?: {
    formatted: string;
    originalLines: number;
    formattedLines: number;
    statementType: string;
    lintNotes?: string[];
  };
}

const COMMON_KEYWORDS = [
  "SELECT", "DISTINCT", "FROM", "WHERE", "AND", "OR", "NOT", "IN", "IS", "NULL",
  "LIKE", "ILIKE", "BETWEEN", "EXISTS", "CASE", "WHEN", "THEN", "ELSE", "END",
  "AS", "JOIN", "INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "FULL JOIN", "CROSS JOIN",
  "ON", "USING", "GROUP BY", "HAVING", "ORDER BY", "ASC", "DESC", "LIMIT", "OFFSET",
  "UNION", "UNION ALL", "INTERSECT", "EXCEPT", "INSERT INTO", "VALUES", "UPDATE",
  "SET", "DELETE FROM", "CREATE TABLE", "ALTER TABLE", "DROP TABLE", "PRIMARY KEY",
  "FOREIGN KEY", "REFERENCES", "INDEX", "VIEW", "TRIGGER", "CONSTRAINT", "DEFAULT",
  "CASCADE", "WITH", "RECURSIVE", "RETURNING", "FETCH FIRST", "ROWS ONLY", "TOP",
];

export function formatSQLOffline(sql: string, options: SQLFormatOptions = {}): SQLFormatResult {
  const { dialect = "standard", uppercase = true, indent = "2", minify = false } = options;

  if (!sql.trim()) {
    return { status: "error", error: "Please enter SQL to format." };
  }

  try {
    const lintNotes: string[] = [];

    // Minify mode
    if (minify) {
      // Remove block and line comments
      const minified = sql
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/--.*$/gm, "")
        .replace(/\s+/g, " ")
        .trim();

      return {
        status: "success",
        message: "SQL Minified",
        data: {
          formatted: minified,
          originalLines: sql.split("\n").length,
          formattedLines: 1,
          statementType: detectStatementType(sql),
        },
      };
    }

    // Dialect lint checks
    const upperInput = sql.toUpperCase();
    if (dialect === "mysql" && upperInput.includes("ILIKE")) {
      lintNotes.push("`ILIKE` is PostgreSQL-specific. In MySQL, `LIKE` is case-insensitive by default depending on collation.");
    }
    if ((dialect === "oracle" || dialect === "mssql") && upperInput.includes("LIMIT")) {
      lintNotes.push(
        dialect === "oracle"
          ? "Oracle traditional SQL uses `FETCH FIRST n ROWS ONLY` or `ROWNUM` instead of `LIMIT`."
          : "SQL Server (T-SQL) uses `SELECT TOP n` or `OFFSET / FETCH NEXT` instead of `LIMIT`."
      );
    }
    if (dialect === "sqlite" && upperInput.includes("FULL OUTER JOIN")) {
      lintNotes.push("SQLite does not natively support `FULL OUTER JOIN` (emulate via UNION of LEFT JOINs).");
    }

    // Indentation unit
    const indentStr = indent === "4" ? "    " : indent === "tab" ? "\t" : "  ";

    let clean = sql.trim();

    // Preserve comments by placeholder if needed, or format around them
    // Format major clauses onto new lines
    const majorClauses = [
      "SELECT", "FROM", "WHERE", "AND", "OR", "GROUP BY", "HAVING", "ORDER BY",
      "LIMIT", "OFFSET", "JOIN", "INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "FULL JOIN",
      "CROSS JOIN", "ON", "UNION ALL", "UNION", "INSERT INTO", "VALUES", "UPDATE",
      "SET", "DELETE FROM", "WITH", "WINDOW", "FETCH FIRST",
    ];

    // Case normalization for keywords
    if (uppercase) {
      for (const kw of COMMON_KEYWORDS) {
        const regex = new RegExp(`\\b${kw.replace(/ /g, "\\s+")}\\b`, "gi");
        clean = clean.replace(regex, kw);
      }
    }

    // Place clauses on newlines
    for (const clause of majorClauses) {
      const regex = new RegExp(`\\s+\\b(${clause.replace(/ /g, "\\s+")})\\b`, "gi");
      clean = clean.replace(regex, "\n$1");
    }

    // Break commas after SELECT or inside column lists into new lines
    const rawLines = clean.split("\n");
    const formattedLines: string[] = [];
    let currentIndent = 0;

    for (let line of rawLines) {
      let trimmed = line.trim();
      if (!trimmed) continue;

      const startsWithClause = /^(SELECT|FROM|WHERE|GROUP BY|HAVING|ORDER BY|LIMIT|OFFSET|JOIN|LEFT JOIN|RIGHT JOIN|INNER JOIN|FULL JOIN|UNION|INSERT INTO|VALUES|UPDATE|SET|DELETE FROM|WITH)\b/i.test(
        trimmed
      );

      if (startsWithClause) {
        currentIndent = /^(AND|OR|ON)\b/i.test(trimmed) ? 1 : 0;
      }

      // Check for parentheses indent
      const openParens = (trimmed.match(/\(/g) || []).length;
      const closeParens = (trimmed.match(/\)/g) || []).length;

      const appliedIndent = indentStr.repeat(currentIndent);
      formattedLines.push(appliedIndent + trimmed);

      currentIndent = Math.max(0, currentIndent + openParens - closeParens);
    }

    const output = formattedLines.join("\n");

    return {
      status: "success",
      message: "SQL Formatted",
      data: {
        formatted: output,
        originalLines: sql.split("\n").length,
        formattedLines: formattedLines.length,
        statementType: detectStatementType(sql),
        lintNotes: lintNotes.length > 0 ? lintNotes : undefined,
      },
    };
  } catch (err: unknown) {
    return {
      status: "error",
      error: err instanceof Error ? err.message : "Failed to format SQL",
    };
  }
}

function detectStatementType(sql: string): string {
  const match = sql.trim().match(/^(\w+)/i);
  return match ? match[1].toUpperCase() : "SQL";
}
