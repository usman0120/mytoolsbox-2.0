import QRCode from "qrcode";
import { ProcessingResult } from "@/lib/processing/types";

interface QROptions {
  text: string;
  size?: number;
  color?: string;
  bgColor?: string;
}

export async function generateQR(options: QROptions): Promise<ProcessingResult> {
  const { text, size = 300, color = "#000000", bgColor = "#ffffff" } = options;

  if (!text.trim()) {
    return { status: "error", error: "Please enter text or URL to generate a QR code." };
  }

  try {
    const dataUrl = await QRCode.toDataURL(text, {
      width: size,
      margin: 2,
      color: { dark: color, light: bgColor },
      errorCorrectionLevel: "M",
    });

    // Convert data URL to blob
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);

    return {
      status: "success",
      outputBlob: blob,
      outputUrl: url,
      message: "QR code generated successfully.",
    };
  } catch (err: any) {
    return { status: "error", error: err.message || "Failed to generate QR code." };
  }
}