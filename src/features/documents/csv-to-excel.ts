import { ProcessingResult } from "@/lib/processing/types";
import { createXlsxBlob } from "@/lib/documents/openxml-builder";

export interface ParsedCsvData {
  rows: string[][];
  headers: string[];
  totalRows: number;
  totalCols: number;
  delimiter: string;
}

export function detectDelimiter(sample: string): string {
  const delimiters = [",", "\t", ";", "|"];
  const lines = sample.split(/\r?\n/).slice(0, 5).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return ",";

  let bestDelimiter = ",";
  let maxConsistentCount = -1;

  for (const d of delimiters) {
    const counts = lines.map((l) => (l.split(d).length - 1));
    const firstCount = counts[0];
    if (firstCount > 0 && counts.every((c) => c === firstCount)) {
      if (firstCount > maxConsistentCount) {
        maxConsistentCount = firstCount;
        bestDelimiter = d;
      }
    }
  }

  return bestDelimiter;
}

export function parseCsvText(csvText: string, customDelimiter?: string): string[][] {
  const delimiter = customDelimiter || detectDelimiter(csvText.slice(0, 4000));
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = "";
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        currentField += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === delimiter) {
        currentRow.push(currentField.trim());
        currentField = "";
      } else if (char === "\n" || (char === "\r" && nextChar === "\n")) {
        currentRow.push(currentField.trim());
        if (currentRow.some((f) => f !== "")) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentField = "";
        if (char === "\r") i++;
      } else if (char === "\r") {
        currentRow.push(currentField.trim());
        if (currentRow.some((f) => f !== "")) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentField = "";
      } else {
        currentField += char;
      }
    }
  }

  // Last field
  currentRow.push(currentField.trim());
  if (currentRow.some((f) => f !== "")) {
    rows.push(currentRow);
  }

  return rows;
}

export async function csvToExcel(
  file: File,
  options: { sheetName?: string; delimiter?: string } = {}
): Promise<ProcessingResult> {
  if (!file) {
    return { status: "error", error: "No file provided." };
  }

  try {
    const text = await file.text();
    if (!text.trim()) {
      return { status: "error", error: "CSV file is empty." };
    }

    const rows = parseCsvText(text, options.delimiter);
    if (rows.length === 0) {
      return { status: "error", error: "No tabular data found in CSV file." };
    }

    const colCount = Math.max(...rows.map((r) => r.length));
    // Pad rows so all rows have equal column count
    const normalizedRows = rows.map((r) => {
      const copy = [...r];
      while (copy.length < colCount) copy.push("");
      return copy;
    });

    const sheetName = options.sheetName || "Sheet1";
    // Generate genuine zipped Microsoft Excel OpenXML (.xlsx) blob
    const xlsxBlob = await createXlsxBlob(normalizedRows, sheetName);
    const url = URL.createObjectURL(xlsxBlob);

    const downloadName = file.name.replace(/\.[^.]+$/, "") + ".xlsx";

    return {
      status: "success",
      outputBlob: xlsxBlob,
      outputUrl: url,
      message: `Successfully converted ${normalizedRows.length} rows and ${colCount} columns into Excel (.xlsx)`,
      data: {
        downloadName,
        totalRows: normalizedRows.length,
        totalCols: colCount,
        sampleRows: normalizedRows.slice(0, 100),
      },
    };
  } catch (err: unknown) {
    return {
      status: "error",
      error: err instanceof Error ? err.message : "Failed to convert CSV to Excel.",
    };
  }
}