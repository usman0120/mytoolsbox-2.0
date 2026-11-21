import { ProcessingResult } from "@/lib/processing/types";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export interface TextToPDFOptions {
  title?: string;
  author?: string;
  fontSize?: number;
  fontFamily?: "Helvetica" | "Courier" | "TimesRoman";
  pageSize?: "letter" | "a4" | "legal";
  margin?: "narrow" | "normal" | "wide";
  includePageNumbers?: boolean;
  headerText?: string;
  footerText?: string;
}

const PAGE_SIZES = {
  letter: [612, 792] as [number, number],
  a4: [595.28, 841.89] as [number, number],
  legal: [612, 1008] as [number, number],
};

const MARGIN_SIZES = {
  narrow: 36,
  normal: 54,
  wide: 72,
};

const FONT_MAP = {
  Helvetica: { regular: StandardFonts.Helvetica, bold: StandardFonts.HelveticaBold },
  Courier: { regular: StandardFonts.Courier, bold: StandardFonts.CourierBold },
  TimesRoman: { regular: StandardFonts.TimesRoman, bold: StandardFonts.TimesRomanBold },
};

export async function convertRawTextToPdf(
  rawText: string,
  downloadBaseName: string,
  options: TextToPDFOptions = {}
): Promise<ProcessingResult> {
  const {
    title,
    author,
    fontSize = 11,
    fontFamily = "Helvetica",
    pageSize = "a4",
    margin = "normal",
    includePageNumbers = true,
    headerText,
    footerText,
  } = options;

  if (!rawText.trim()) {
    return { status: "error", error: "Text content is empty." };
  }

  try {
    const pdf = await PDFDocument.create();
    if (title) pdf.setTitle(title);
    if (author) pdf.setAuthor(author);
    pdf.setProducer("MyToolsBox Text to PDF");
    pdf.setCreator("MyToolsBox Document Engine");

    const fonts = FONT_MAP[fontFamily];
    const font = await pdf.embedFont(fonts.regular);
    const boldFont = await pdf.embedFont(fonts.bold);

    const [pageWidth, pageHeight] = PAGE_SIZES[pageSize];
    const marginSize = MARGIN_SIZES[margin];
    const maxWidth = pageWidth - marginSize * 2;
    const lineHeight = fontSize * 1.5;

    const lines = rawText.split(/\r?\n/);
    const pagesList: any[] = [];

    const addNewPage = () => {
      const page = pdf.addPage([pageWidth, pageHeight]);
      pagesList.push(page);
      return page;
    };

    let currentPage = addNewPage();
    let y = pageHeight - marginSize;

    // Header space if defined
    if (headerText) {
      y -= 20;
    }

    const wrapText = (
      text: string,
      maxW: number,
      targetFont: { widthOfTextAtSize: (t: string, s: number) => number },
      size: number
    ): string[] => {
      const words = text.split(" ");
      const result: string[] = [];
      let currentLine = "";

      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const width = targetFont.widthOfTextAtSize(testLine, size);
        if (width > maxW && currentLine) {
          result.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) result.push(currentLine);
      return result.length > 0 ? result : [""];
    };

    // Draw Title if provided
    if (title) {
      const titleLines = wrapText(title, maxWidth, boldFont, 20);
      for (const tl of titleLines) {
        currentPage.drawText(tl, {
          x: marginSize,
          y,
          size: 20,
          font: boldFont,
          color: rgb(0.1, 0.1, 0.15),
        });
        y -= 26;
      }

      if (author) {
        currentPage.drawText(`By ${author}`, {
          x: marginSize,
          y,
          size: 11,
          font,
          color: rgb(0.4, 0.4, 0.45),
        });
        y -= 18;
      }

      y -= 14; // divider gap
      // Draw horizontal divider rule
      currentPage.drawLine({
        start: { x: marginSize, y },
        end: { x: pageWidth - marginSize, y },
        thickness: 0.75,
        color: rgb(0.8, 0.8, 0.85),
      });
      y -= 20;
    }

    for (let i = 0; i < lines.length; i++) {
      const rawLine = lines[i];
      const trimmed = rawLine.trim();

      // Check for horizontal rule
      if (trimmed === "---" || trimmed === "***" || trimmed === "___") {
        if (y < marginSize + 30) {
          currentPage = addNewPage();
          y = pageHeight - marginSize;
        }
        y -= 6;
        currentPage.drawLine({
          start: { x: marginSize, y },
          end: { x: pageWidth - marginSize, y },
          thickness: 0.5,
          color: rgb(0.8, 0.8, 0.85),
        });
        y -= 14;
        continue;
      }

      // Check empty line
      if (trimmed === "") {
        y -= lineHeight * 0.8;
        continue;
      }

      // Heading detection
      let isHeading1 = false;
      let isHeading2 = false;
      let isHeading3 = false;
      let isBullet = false;
      let displayText = trimmed;

      if (trimmed.startsWith("# ")) {
        isHeading1 = true;
        displayText = trimmed.substring(2);
      } else if (trimmed.startsWith("## ")) {
        isHeading2 = true;
        displayText = trimmed.substring(3);
      } else if (trimmed.startsWith("### ")) {
        isHeading3 = true;
        displayText = trimmed.substring(4);
      } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        isBullet = true;
        displayText = trimmed.substring(2);
      } else if (/^\d+\.\s/.test(trimmed)) {
        isBullet = true;
      }

      let activeFont = font;
      let activeSize = fontSize;
      let textColor = rgb(0.1, 0.1, 0.15);
      let lineMarginLeft = marginSize;

      if (isHeading1) {
        activeFont = boldFont;
        activeSize = fontSize + 6;
        y -= 8;
      } else if (isHeading2) {
        activeFont = boldFont;
        activeSize = fontSize + 3;
        y -= 6;
      } else if (isHeading3) {
        activeFont = boldFont;
        activeSize = fontSize + 1;
        y -= 4;
      } else if (isBullet) {
        lineMarginLeft = marginSize + 14;
      }

      const effectiveMaxWidth = maxWidth - (lineMarginLeft - marginSize);
      const wrapped = wrapText(displayText, effectiveMaxWidth, activeFont, activeSize);
      const stepY = activeSize * 1.45;

      for (let wIdx = 0; wIdx < wrapped.length; wIdx++) {
        if (y < marginSize + 30) {
          currentPage = addNewPage();
          y = pageHeight - marginSize;
          if (headerText) y -= 20;
        }

        const currentWl = wrapped[wIdx];

        // Draw bullet circle on first wrapped line
        if (isBullet && wIdx === 0 && (trimmed.startsWith("- ") || trimmed.startsWith("* "))) {
          currentPage.drawCircle({
            x: marginSize + 4,
            y: y + activeSize / 3,
            size: 2,
            color: rgb(0.3, 0.3, 0.35),
          });
        }

        currentPage.drawText(currentWl, {
          x: lineMarginLeft,
          y,
          size: activeSize,
          font: activeFont,
          color: textColor,
        });

        y -= stepY;
      }

      // Small spacing after heading
      if (isHeading1 || isHeading2 || isHeading3) {
        y -= 4;
      }
    }

    // Second pass: stamp headers, footers and "Page X of Y" numbers
    const totalPages = pagesList.length;
    for (let pIdx = 0; pIdx < totalPages; pIdx++) {
      const page = pagesList[pIdx];

      // Header
      if (headerText) {
        page.drawText(headerText, {
          x: marginSize,
          y: pageHeight - marginSize + 10,
          size: 8.5,
          font,
          color: rgb(0.4, 0.4, 0.45),
        });
      }

      // Footer
      if (footerText) {
        page.drawText(footerText, {
          x: marginSize,
          y: marginSize - 20,
          size: 8.5,
          font,
          color: rgb(0.4, 0.4, 0.45),
        });
      }

      // Page numbers
      if (includePageNumbers) {
        const pageNumText = `Page ${pIdx + 1} of ${totalPages}`;
        const numW = font.widthOfTextAtSize(pageNumText, 8.5);
        page.drawText(pageNumText, {
          x: pageWidth - marginSize - numW,
          y: marginSize - 20,
          size: 8.5,
          font,
          color: rgb(0.4, 0.4, 0.45),
        });
      }
    }

    const pdfBytes = await pdf.save();
    const blob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    return {
      status: "success",
      outputBlob: blob,
      outputUrl: url,
      message: `Created PDF with ${totalPages} page(s)`,
      data: { downloadName: `${downloadBaseName}.pdf` },
    };
  } catch (err: unknown) {
    return {
      status: "error",
      error: err instanceof Error ? err.message : "Failed to create PDF from text.",
    };
  }
}

export async function textToPDF(
  file: File,
  options: TextToPDFOptions = {}
): Promise<ProcessingResult> {
  if (!file) {
    return { status: "error", error: "No file provided." };
  }
  const text = await file.text();
  const baseName = file.name.replace(/\.[^.]+$/, "");
  return convertRawTextToPdf(text, baseName, options);
}