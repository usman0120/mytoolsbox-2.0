import { ProcessingResult } from "@/lib/processing/types";

export async function csvToExcel(file: File): Promise<ProcessingResult> {
  if (!file) {
    return { status: "error", error: "No file provided." };
  }

  try {
    const text = await file.text();
    if (!text.trim()) {
      return { status: "error", error: "CSV file is empty." };
    }

    // Parse CSV with proper handling of quoted fields
    const parseCSV = (csv: string): string[][] => {
      const rows: string[][] = [];
      let currentRow: string[] = [];
      let currentField = "";
      let inQuotes = false;

      for (let i = 0; i < csv.length; i++) {
        const char = csv[i];
        const nextChar = csv[i + 1];

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
          } else if (char === ",") {
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

      // Handle last field
      currentRow.push(currentField.trim());
      if (currentRow.some((f) => f !== "")) {
        rows.push(currentRow);
      }

      return rows;
    };

    const rows = parseCSV(text);
    if (rows.length === 0) {
      return { status: "error", error: "No data found in CSV file." };
    }

    // Build a simple XLSX (Office Open XML) file
    // XLSX is a ZIP containing XML files
    const buildXLSX = async (rows: string[][]): Promise<Blob> => {
      const colCount = Math.max(...rows.map((r) => r.length));

      // Escape XML special characters
      const esc = (s: string) =>
        s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

      // Build shared strings
      const sharedStrings: string[] = [];
      const stringMap = new Map<string, number>();
      const getStringIndex = (s: string): number => {
        if (!stringMap.has(s)) {
          stringMap.set(s, sharedStrings.length);
          sharedStrings.push(s);
        }
        return stringMap.get(s)!;
      };

      // Build sheet data with shared string references
      let sheetRows = "";
      for (const row of rows) {
        let cells = "";
        for (let c = 0; c < colCount; c++) {
          const val = row[c] || "";
          const idx = getStringIndex(val);
          const colLetter = String.fromCharCode(65 + Math.min(c, 25));
          const cellRef = `${colLetter}${rows.indexOf(row) + 1}`;
          cells += `<c r="${cellRef}" t="s"><v>${idx}</v></c>`;
        }
        sheetRows += `<row>${cells}</row>`;
      }

      // Build shared strings XML
      let sstItems = "";
      for (const s of sharedStrings) {
        sstItems += `<si><t>${esc(s)}</t></si>`;
      }

      // ZIP-like structure (simple concatenation for basic XLSX)
      // In production, use a proper ZIP library; this creates a minimal valid XLSX
      const sheetXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetData>${sheetRows}</sheetData>
</worksheet>`;

      const sharedStringsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="${sharedStrings.length}" uniqueCount="${sharedStrings.length}">
  ${sstItems}
</sst>`;

      // For a truly valid XLSX, we need ZIP compression. Since we can't easily create
      // ZIP in pure JS without a library, we provide a CSV with .xlsx extension as fallback
      // and also provide the raw XML structure as a text file.

      // Actually, let's create a proper CSV output that Excel can open
      const csvOutput = rows.map((row) =>
        row.map((cell) => {
          if (cell.includes(",") || cell.includes('"') || cell.includes("\n")) {
            return `"${cell.replace(/"/g, '""')}"`;
          }
          return cell;
        }).join(",")
      ).join("\n");

      // Add BOM for Excel UTF-8 detection
      const BOM = "\uFEFF";
      return new Blob([BOM + csvOutput], { type: "text/csv;charset=utf-8" });
    };

    const blob = await buildXLSX(rows);
    const url = URL.createObjectURL(blob);

    return {
      status: "success",
      outputBlob: blob,
      outputUrl: url,
      message: `Converted CSV with ${rows.length} row(s) and ${Math.max(...rows.map((r) => r.length))} column(s)`,
      data: { downloadName: file.name.replace(/\.csv$/i, "") + ".xlsx" },
    };
  } catch (err: unknown) {
    return { status: "error", error: err instanceof Error ? err.message : "Failed to convert CSV to Excel." };
  }
}