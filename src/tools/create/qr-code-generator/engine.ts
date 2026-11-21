import QRCode from "qrcode";
import { ProcessingResult } from "@/lib/processing/types";

export interface QROptions {
  text: string;
  size?: number;
  color?: string;
  bgColor?: string;
  errorCorrectionLevel?: "L" | "M" | "Q" | "H";
  logoDataUrl?: string;
  logoScale?: number; // 0.15 - 0.28
  format?: "png" | "svg" | "webp";
}

export async function generateQR(options: QROptions): Promise<ProcessingResult> {
  const {
    text,
    size = 400,
    color = "#000000",
    bgColor = "#ffffff",
    errorCorrectionLevel = "H", // High recommended when logo is present
    logoDataUrl,
    logoScale = 0.22,
    format = "png",
  } = options;

  if (!text || !text.trim()) {
    return { status: "error", error: "Please enter text or a URL to generate a QR code." };
  }

  try {
    if (format === "svg") {
      const svgString = await QRCode.toString(text, {
        type: "svg",
        width: size,
        margin: 2,
        color: { dark: color, light: bgColor === "transparent" ? "#00000000" : bgColor },
        errorCorrectionLevel,
      });

      const blob = new Blob([svgString], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      return {
        status: "success",
        outputBlob: blob,
        outputUrl: url,
        message: "Vector SVG QR code generated successfully.",
        data: { downloadName: "qrcode.svg", rawSvg: svgString },
      };
    }

    // Canvas generation for PNG / WebP with optional Center Logo overlay
    const canvas = document.createElement("canvas");
    await QRCode.toCanvas(canvas, text, {
      width: size,
      margin: 2,
      color: { dark: color, light: bgColor === "transparent" ? "#00000000" : bgColor },
      errorCorrectionLevel,
    });

    // If center logo provided, draw circular/rounded badge with logo in the center
    if (logoDataUrl) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const logoImg = new Image();
        await new Promise<void>((res, rej) => {
          logoImg.onload = () => res();
          logoImg.onerror = () => rej(new Error("Failed to load center logo."));
          logoImg.src = logoDataUrl;
        });

        const logoW = Math.round(canvas.width * logoScale);
        const logoH = Math.round(logoW * ((logoImg.naturalHeight || logoImg.height) / (logoImg.naturalWidth || logoImg.width)));
        const cx = (canvas.width - logoW) / 2;
        const cy = (canvas.height - logoH) / 2;
        const pad = Math.max(6, Math.round(logoW * 0.12));

        // Draw protective white background pill behind logo
        ctx.save();
        ctx.fillStyle = bgColor === "transparent" ? "#ffffff" : bgColor;
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(cx - pad, cy - pad, logoW + pad * 2, logoH + pad * 2, pad * 1.5);
        } else {
          ctx.rect(cx - pad, cy - pad, logoW + pad * 2, logoH + pad * 2);
        }
        ctx.fill();

        // Draw border ring
        ctx.lineWidth = 2;
        ctx.strokeStyle = color;
        ctx.stroke();

        // Draw logo
        ctx.drawImage(logoImg, cx, cy, logoW, logoH);
        ctx.restore();
      }
    }

    const mime = format === "webp" ? "image/webp" : "image/png";
    const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, mime, 0.95));

    if (!blob) {
      return { status: "error", error: "Failed to create QR code blob." };
    }

    const url = URL.createObjectURL(blob);
    return {
      status: "success",
      outputBlob: blob,
      outputUrl: url,
      message: `QR code generated (${size}×${size})`,
      data: {
        downloadName: `qrcode.${format}`,
        dimensions: `${size} × ${size}`,
      },
    };
  } catch (err: unknown) {
    return {
      status: "error",
      error: err instanceof Error ? err.message : "Failed to generate QR code.",
    };
  }
}