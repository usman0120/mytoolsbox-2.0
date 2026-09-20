import { ProcessingResult } from "@/lib/processing/types";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

interface TextToPDFOptions {
  title?: string;
  fontSize?: number;
  fontFamily?: "Helvetica" | "Courier" | "TimesRoman";
  pageSize?: "letter" | "a4" | "legal";
}

const PAGE_SIZES = {
  letter: [612, 792] as [number, number],
  a4: [595.28, 841.89] as [number, number],
  legal: [612, 1008] as [number, number],
};

const FONT_MAP = {
  Helvetica: StandardFonts.Helvetica,
  Courier: StandardFonts.Courier,
  TimesRoman: StandardFonts.TimesRoman,
};

export async function textToPDF(
  file: File,
  options: TextToPDFOptions = {}
): Promise<ProcessingResult> {
  const {
    title,
    fontSize = 11,
    fontFamily = "Helvetica",
    pageSize = "letter",
  } = options;

  if (!file) {
    return { status: "error", error: "No file provided." };
  }

  try {
    const text = await file.text();
    if (!text.trim()) {
      return { status: "error", error: "File is empty." };
    }

    const pdf = await PDFDocument.create();
    const font = await pdf.embedFont(FONT_MAP[fontFamily]);
    const boldFont = await pdf.embedFont(StandardFonts.HelveticaBold);
    const [pageWidth, pageHeight] = PAGE_SIZES[pageSize];
    const margin = 60;
    const maxWidth = pageWidth - margin * 2;
    const lineHeight = fontSize * 1.5;

    const lines = text.split("\n");
    let currentPage = pdf.addPage([pageWidth, pageHeight]);
    let y = pageHeight - margin;

    const addNewPage = () => {
      currentPage = pdf.addPage([pageWidth, pageHeight]);
      y = pageHeight - margin;
    };

    const wrapText = (text: string, maxWidth: number, font: any, size: number): string[] => {
      const words = text.split(" ");
      const result: string[] = [];
      let currentLine = "";

      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const width = font.widthOfTextAtSize(testLine, size);
        if (width > maxWidth && currentLine) {
          result.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) result.push(currentLine);
      return result.length > 0 ? result : [""];
    };

    // Add title if provided
    if (title) {
      currentPage.drawText(title, {
        x: margin,
        y,
        size: 18,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      y -= lineHeight * 2.5;
    }

    for (const line of lines) {
      const trimmed = line.trim();
      const isHeading = trimmed.length > 0 && trimmed.length < 80 &&
        (trimmed === trimmed.toUpperCase() || /^#{1,3}\s/.test(trimmed) || /^[A-Z][a-z]+:/.test(trimmed));

      const displayText = trimmed.replace(/^#{1,3}\s/, "");
      const useFont = isHeading ? boldFont : font;
      const useSize = isHeading ? 14 : fontSize;

      if (displayText === "") {
        y -= lineHeight;
      } else {
        const wrappedLines = wrapText(displayText, maxWidth, useFont, useSize);
        for (const wl of wrappedLines) {
          if (y < margin + lineHeight) addNewPage();
          currentPage.drawText(wl, {
            x: margin,
            y,
            size: useSize,
            font: useFont,
            color: rgb(0, 0, 0),
          });
          y -= lineHeight * (useSize / fontSize);
        }
      }

      if (y < margin) addNewPage();
    }

    const pdfBytes = await pdf.save();
    const blob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    return {
      status: "success",
      outputBlob: blob,
      outputUrl: url,
      message: `Created PDF with ${pdf.getPageCount()} page(s)`,
      data: { downloadName: file.name.replace(/\.[^.]+$/, "") + ".pdf" },
    };
  } catch (err: any) {
    return { status: "error", error: err.message || "Failed to create PDF from text." };
  }
}