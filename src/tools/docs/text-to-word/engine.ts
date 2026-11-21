import { ProcessingResult } from "@/lib/processing/types";
import { createDocxBlob } from "@/lib/documents/openxml-builder";

export interface TxtToDocxOptions {
  title?: string;
}

export async function convertRawTextToDocx(
  text: string,
  baseName: string,
  options: TxtToDocxOptions = {}
): Promise<ProcessingResult> {
  if (!text.trim()) {
    return { status: "error", error: "Text content is empty." };
  }

  try {
    const lines = text.split(/\r?\n/);
    const paragraphs: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) {
        paragraphs.push("");
        continue;
      }

      // Check if uppercase short line acts as heading
      const isShortAllCaps = trimmed.length > 2 && trimmed.length < 60 && trimmed === trimmed.toUpperCase() && !trimmed.startsWith("#");
      if (isShortAllCaps) {
        paragraphs.push(`## ${trimmed}`);
      } else {
        paragraphs.push(trimmed);
      }
    }

    const title = options.title || baseName;
    // Generate genuine zipped Microsoft Word OpenXML (.docx)
    const docxBlob = await createDocxBlob(paragraphs, title);
    const url = URL.createObjectURL(docxBlob);

    const downloadName = `${baseName}.docx`;

    return {
      status: "success",
      outputBlob: docxBlob,
      outputUrl: url,
      message: `Successfully converted ${paragraphs.filter(Boolean).length} paragraphs into Microsoft Word (.docx)`,
      data: {
        downloadName,
        totalParagraphs: paragraphs.length,
      },
    };
  } catch (err: unknown) {
    return {
      status: "error",
      error: err instanceof Error ? err.message : "Failed to convert text to DOCX.",
    };
  }
}

export async function txtToDocx(
  file: File,
  options: TxtToDocxOptions = {}
): Promise<ProcessingResult> {
  if (!file) {
    return { status: "error", error: "No file provided." };
  }
  const text = await file.text();
  const baseName = file.name.replace(/\.[^.]+$/, "");
  return convertRawTextToDocx(text, baseName, options);
}