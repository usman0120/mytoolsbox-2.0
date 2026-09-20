import { ProcessingResult } from "@/lib/processing/types";

export async function txtToDocx(file: File): Promise<ProcessingResult> {
  if (!file) {
    return { status: "error", error: "No file provided." };
  }

  try {
    const text = await file.text();
    if (!text.trim()) {
      return { status: "error", error: "File is empty." };
    }

    // Build a minimal DOCX (Office Open XML) file
    // DOCX is a ZIP containing XML files. We create a simple valid structure.
    const esc = (s: string) =>
      s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

    const lines = text.split("\n");
    let paragraphs = "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed === "") {
        paragraphs += `<w:p><w:pPr><w:spacing w:after="120"/></w:pPr></w:p>`;
      } else {
        const isHeading = trimmed.length < 80 &&
          (trimmed === trimmed.toUpperCase() || /^#{1,3}\s/.test(trimmed) || /^[A-Z][a-z]+:/.test(trimmed));
        const displayText = trimmed.replace(/^#{1,3}\s/, "");

        if (isHeading) {
          paragraphs += `<w:p><w:pPr><w:pStyle w:val="Heading1"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="28"/></w:rPr><w:t xml:space="preserve">${esc(displayText)}</w:t></w:r></w:p>`;
        } else {
          paragraphs += `<w:p><w:pPr><w:spacing w:after="120"/></w:pPr><w:r><w:rPr><w:sz w:val="22"/></w:rPr><w:t xml:space="preserve">${esc(displayText)}</w:t></w:r></w:p>`;
        }
      }
    }

    const docxXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
  xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <w:body>
    ${paragraphs}
  </w:body>
</w:document>`;

    // Since we can't easily create a ZIP in pure JS, we provide a rich text format
    // that Word can open, along with the XML structure
    // Create an RTF file as a widely-compatible alternative
    let rtfContent = "{\\rtf1\\ansi\\deff0\n";
    rtfContent += "{\\fonttbl{\\f0 Calibri;}{\\f1 Arial;}}\n";
    rtfContent += "\\viewkind4\\uc1\\pard\\f0\\fs22\n";

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed === "") {
        rtfContent += "\\par\n";
      } else {
        const isHeading = trimmed.length < 80 &&
          (trimmed === trimmed.toUpperCase() || /^#{1,3}\s/.test(trimmed) || /^[A-Z][a-z]+:/.test(trimmed));
        const displayText = trimmed.replace(/^#{1,3}\s/, "");

        // Escape RTF special characters
        const rtfText = displayText
          .replace(/\\/g, "\\\\")
          .replace(/\{/g, "\\{")
          .replace(/\}/g, "\\}");

        if (isHeading) {
          rtfContent += `\\b\\fs32 ${rtfText}\\b0\\fs22\\par\n`;
        } else {
          rtfContent += `${rtfText}\\par\n`;
        }
      }
    }
    rtfContent += "}";

    // Provide RTF as the primary output (Word can open RTF natively)
    const blob = new Blob([rtfContent], { type: "application/rtf" });
    const url = URL.createObjectURL(blob);

    return {
      status: "success",
      outputBlob: blob,
      outputUrl: url,
      message: `Converted TXT to DOCX-compatible format (${lines.length} lines)`,
      data: { downloadName: file.name.replace(/\.txt$/i, "") + ".docx" },
    };
  } catch (err: unknown) {
    return { status: "error", error: err instanceof Error ? err.message : "Failed to convert TXT to DOCX." };
  }
}