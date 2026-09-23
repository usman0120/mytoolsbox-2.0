import { ProcessingResult } from "@/lib/processing/types";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { parsePptxSlides, PptxSlide } from "@/lib/documents/openxml-builder";

export interface PptToPdfOptions {
  theme?: "clean-light" | "modern-navy" | "dark-slate";
}

export async function pptToPDF(
  file: File,
  options: PptToPdfOptions = {}
): Promise<ProcessingResult> {
  if (!file) {
    return { status: "error", error: "No file provided." };
  }

  const isPPT =
    file.name.toLowerCase().endsWith(".pptx") ||
    file.name.toLowerCase().endsWith(".ppt") ||
    file.type === "application/vnd.openxmlformats-officedocument.presentationml.presentation" ||
    file.type === "application/vnd.ms-powerpoint";

  if (!isPPT) {
    return { status: "unsupported", error: "Please select a PowerPoint file (.pptx or .ppt)." };
  }

  try {
    const theme = options.theme || "clean-light";
    // 1. Unpack and parse genuine PPTX structure using OpenXML builder
    let parsedSlides: PptxSlide[] = [];
    try {
      parsedSlides = await parsePptxSlides(file);
    } catch (parseErr) {
      console.warn("Could not unpack PPTX with JSZip:", parseErr);
    }

    if (parsedSlides.length === 0) {
      return {
        status: "error",
        error: "Could not find any readable slides in this presentation. Please ensure it is a valid .pptx file.",
      };
    }

    // 2. Create Landscape 16:9 PDF (842 x 474 pt)
    const pdf = await PDFDocument.create();
    pdf.setTitle(file.name.replace(/\.[^.]+$/, ""));
    pdf.setProducer("MyToolsBox PowerPoint Engine");
    pdf.setCreator("MyToolsBox Presentation Studio");

    const font = await pdf.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdf.embedFont(StandardFonts.HelveticaBold);

    const slideWidth = 842;
    const slideHeight = 474;

    // Theme color palettes
    const themes = {
      "clean-light": {
        bg: rgb(0.98, 0.98, 0.99),
        titleBar: rgb(0.12, 0.22, 0.45),
        titleText: rgb(1, 1, 1),
        bodyText: rgb(0.15, 0.15, 0.2),
        bulletColor: rgb(0.2, 0.45, 0.85),
        cardBg: rgb(1, 1, 1),
        cardBorder: rgb(0.88, 0.9, 0.94),
        footerText: rgb(0.5, 0.5, 0.55),
      },
      "modern-navy": {
        bg: rgb(0.06, 0.1, 0.2),
        titleBar: rgb(0.1, 0.18, 0.35),
        titleText: rgb(0.95, 0.97, 1),
        bodyText: rgb(0.85, 0.9, 0.98),
        bulletColor: rgb(0.3, 0.65, 1),
        cardBg: rgb(0.09, 0.15, 0.28),
        cardBorder: rgb(0.18, 0.28, 0.48),
        footerText: rgb(0.55, 0.65, 0.8),
      },
      "dark-slate": {
        bg: rgb(0.1, 0.1, 0.12),
        titleBar: rgb(0.16, 0.16, 0.2),
        titleText: rgb(1, 1, 1),
        bodyText: rgb(0.88, 0.88, 0.9),
        bulletColor: rgb(0.9, 0.6, 0.2),
        cardBg: rgb(0.14, 0.14, 0.18),
        cardBorder: rgb(0.24, 0.24, 0.3),
        footerText: rgb(0.55, 0.55, 0.6),
      },
    };

    const activeTheme = themes[theme] || themes["clean-light"];
    const totalSlides = parsedSlides.length;

    const wrapText = (text: string, maxWidth: number, fontSize: number): string[] => {
      const words = text.split(" ");
      const result: string[] = [];
      let currentLine = "";

      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const width = font.widthOfTextAtSize(testLine, fontSize);
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

    for (let i = 0; i < totalSlides; i++) {
      const slide = parsedSlides[i];
      const page = pdf.addPage([slideWidth, slideHeight]);

      // 1. Background fill
      page.drawRectangle({
        x: 0,
        y: 0,
        width: slideWidth,
        height: slideHeight,
        color: activeTheme.bg,
      });

      // 2. Title Header Banner
      const titleBannerHeight = 72;
      page.drawRectangle({
        x: 0,
        y: slideHeight - titleBannerHeight,
        width: slideWidth,
        height: titleBannerHeight,
        color: activeTheme.titleBar,
      });

      // Slide Title
      const slideTitle = slide.title || `Slide ${slide.slideNumber}`;
      page.drawText(slideTitle, {
        x: 44,
        y: slideHeight - 46,
        size: 20,
        font: boldFont,
        color: activeTheme.titleText,
      });

      // Slide number pill on title banner
      const slideBadge = `SLIDE ${slide.slideNumber} / ${totalSlides}`;
      const badgeWidth = font.widthOfTextAtSize(slideBadge, 10);
      page.drawText(slideBadge, {
        x: slideWidth - badgeWidth - 44,
        y: slideHeight - 44,
        size: 10,
        font: boldFont,
        color: activeTheme.titleText,
      });

      // 3. Slide Content Area (Card Container)
      const contentX = 44;
      const contentY = 40;
      const contentWidth = slideWidth - 88;
      const contentHeight = slideHeight - titleBannerHeight - 64;

      page.drawRectangle({
        x: contentX,
        y: contentY,
        width: contentWidth,
        height: contentHeight,
        color: activeTheme.cardBg,
        borderColor: activeTheme.cardBorder,
        borderWidth: 1,
      });

      // Render bullet items / text lines
      let textY = contentY + contentHeight - 34;
      const bodyFontSize = 13;
      const bodyLineSpacing = 22;

      const bodyItems = slide.body || slide.bullets || [];

      if (bodyItems.length === 0) {
        page.drawText("(Slide contains graphics or diagrams without textual annotations)", {
          x: contentX + 32,
          y: textY,
          size: 11,
          font,
          color: activeTheme.footerText,
        });
      } else {
        for (const rawLine of bodyItems) {
          if (textY < contentY + 30) break; // prevent overflowing off card

          const wrappedLines = wrapText(rawLine, contentWidth - 70, bodyFontSize);

          for (let wIdx = 0; wIdx < wrappedLines.length; wIdx++) {
            if (textY < contentY + 30) break;

            const wl = wrappedLines[wIdx];

            // Draw bullet marker for the first line of an item
            if (wIdx === 0) {
              page.drawCircle({
                x: contentX + 36,
                y: textY + 4,
                size: 3,
                color: activeTheme.bulletColor,
              });
            }

            page.drawText(wl, {
              x: contentX + 50,
              y: textY,
              size: bodyFontSize,
              font,
              color: activeTheme.bodyText,
            });

            textY -= bodyLineSpacing;
          }

          textY -= 6; // paragraph gap
        }
      }

      // 4. Footer
      const footerText = `${file.name} • Converted with MyToolsBox`;
      page.drawText(footerText, {
        x: 44,
        y: 18,
        size: 8.5,
        font,
        color: activeTheme.footerText,
      });
    }

    const pdfBytes = await pdf.save();
    const blob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    const downloadName = `${file.name.replace(/\.[^.]+$/, "")}.pdf`;

    return {
      status: "success",
      outputBlob: blob,
      outputUrl: url,
      message: `Successfully rendered ${totalSlides} slides into presentation PDF`,
      data: {
        downloadName,
        totalSlides,
        slidesPreview: parsedSlides,
      },
    };
  } catch (err: unknown) {
    return {
      status: "error",
      error: err instanceof Error ? err.message : "Failed to convert PPT to PDF.",
    };
  }
}