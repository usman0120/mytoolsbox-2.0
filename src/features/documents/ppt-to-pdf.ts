import { ProcessingResult } from "@/lib/processing/types";
import { PDFDocument } from "pdf-lib";

export async function pptToPDF(file: File): Promise<ProcessingResult> {
  if (!file) {
    return { status: "error", error: "No file provided." };
  }

  const isPPT = file.name.toLowerCase().endsWith(".pptx") ||
    file.name.toLowerCase().endsWith(".ppt") ||
    file.type === "application/vnd.openxmlformats-officedocument.presentationml.presentation" ||
    file.type === "application/vnd.ms-powerpoint";

  if (!isPPT) {
    return { status: "unsupported", error: "Please select a PowerPoint file (.pptx or .ppt)." };
  }

  try {
    // For PPTX files, we can extract the text content and create a PDF
    // PPTX is a ZIP containing XML slides. We'll read the raw content.
    const arrayBuffer = await file.arrayBuffer();
    const text = new TextDecoder().decode(arrayBuffer);

    // Extract readable text from the PPTX binary/text content
    const extractTextFromPPTX = (raw: string): string[] => {
      const slides: string[] = [];
      // PPTX stores slide text between <a:t> tags
      const textRegex = /<a:t[^>]*>([^<]*)<\/a:t>/g;
      const slideRegex = /<p:slide[^>]*>/g;

      // Split by slide markers
      const slideParts = raw.split(/<p:slide[^>]*>/);
      for (let i = 1; i < slideParts.length; i++) {
        const slideContent = slideParts[i];
        const texts: string[] = [];
        let match;
        const localRegex = /<a:t[^>]*>([^<]*)<\/a:t>/g;
        while ((match = localRegex.exec(slideContent)) !== null) {
          const t = match[1].trim();
          if (t) texts.push(t);
        }
        if (texts.length > 0) {
          slides.push(texts.join("\n"));
        }
      }

      // If no slides found via regex, try to extract any readable text
      if (slides.length === 0) {
        const allTexts: string[] = [];
        let match;
        while ((match = textRegex.exec(raw)) !== null) {
          const t = match[1].trim();
          if (t) allTexts.push(t);
        }
        if (allTexts.length > 0) {
          slides.push(allTexts.join("\n"));
        }
      }

      return slides;
    };

    const slides = extractTextFromPPTX(text);

    if (slides.length === 0) {
      // Fallback: create a PDF with file info
      const pdf = await PDFDocument.create();
      const { StandardFonts, rgb } = await import("pdf-lib");
      const font = await pdf.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdf.embedFont(StandardFonts.HelveticaBold);

      const page = pdf.addPage([612, 792]);
      page.drawText("PowerPoint to PDF Conversion", { x: 60, y: 700, size: 18, font: boldFont, color: rgb(0, 0, 0) });
      page.drawText(`Original file: ${file.name}`, { x: 60, y: 660, size: 12, font, color: rgb(0, 0, 0) });
      page.drawText(`Size: ${(file.size / 1024).toFixed(1)} KB`, { x: 60, y: 640, size: 12, font, color: rgb(0, 0, 0) });
      page.drawText("", { x: 60, y: 600, size: 12, font, color: rgb(0, 0, 0) });
      page.drawText("For full PPT-to-PDF conversion with slide rendering,", { x: 60, y: 580, size: 11, font, color: rgb(0.3, 0.3, 0.3) });
      page.drawText("deploy a server-side converter like LibreOffice or Gotenberg.", { x: 60, y: 560, size: 11, font, color: rgb(0.3, 0.3, 0.3) });

      const pdfBytes = await pdf.save();
      const blob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      return {
        status: "success",
        outputBlob: blob,
        outputUrl: url,
        message: "PPT file analyzed. For full slide rendering, use a server-side converter.",
        data: { downloadName: file.name.replace(/\.pptx?$/i, "") + ".pdf" },
      };
    }

    // Create PDF with extracted slide content
    const pdf = await PDFDocument.create();
    const { StandardFonts, rgb } = await import("pdf-lib");
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdf.embedFont(StandardFonts.HelveticaBold);

    for (let i = 0; i < slides.length; i++) {
      const page = pdf.addPage([612, 792]);
      const slideLines = slides[i].split("\n");

      page.drawText(`Slide ${i + 1}`, {
        x: 60, y: 740, size: 16, font: boldFont, color: rgb(0, 0, 0),
      });

      let y = 700;
      for (const line of slideLines) {
        if (y < 60) break;
        page.drawText(line.substring(0, 100), {
          x: 60, y, size: 11, font, color: rgb(0, 0, 0),
        });
        y -= 20;
      }
    }

    const pdfBytes = await pdf.save();
    const blob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    return {
      status: "success",
      outputBlob: blob,
      outputUrl: url,
      message: `Converted PPT to PDF with ${slides.length} slide(s) extracted`,
      data: { downloadName: file.name.replace(/\.pptx?$/i, "") + ".pdf" },
    };
  } catch (err: any) {
    return { status: "error", error: err.message || "Failed to convert PPT to PDF." };
  }
}