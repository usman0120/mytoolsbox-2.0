import { ProcessingResult } from "@/lib/processing/types";

export type WatermarkPosition =
  | "topLeft"
  | "topCenter"
  | "topRight"
  | "centerLeft"
  | "center"
  | "centerRight"
  | "bottomLeft"
  | "bottomCenter"
  | "bottomRight";

export interface WatermarkOptions {
  type: "text" | "image";
  // Text options
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  isBold?: boolean;
  // Image options
  logoSource?: string | File;
  logoScale?: number; // 0.05 to 1.0 (relative to image width)
  // Common options
  opacity?: number;
  position?: WatermarkPosition;
  rotation?: number;
  repeat?: boolean;
  repeatSpacing?: number;
  format?: "png" | "jpeg" | "webp";
  quality?: number;
}

export async function watermarkImage(
  file: File,
  options: WatermarkOptions
): Promise<ProcessingResult> {
  const {
    type = "text",
    text = "© MyToolbox",
    fontSize = 48,
    fontFamily = "sans-serif",
    color = "#ffffff",
    isBold = true,
    logoSource,
    logoScale = 0.2,
    opacity = 0.6,
    position = "center",
    rotation = 0,
    repeat = false,
    repeatSpacing = 160,
    format = "png",
    quality = 0.92,
  } = options;

  if (!file.type.startsWith("image/")) {
    return { status: "unsupported", error: "Selected file is not an image." };
  }

  if (type === "text" && (!text || text.trim().length === 0)) {
    return { status: "error", error: "Watermark text is required." };
  }

  return new Promise((resolve) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = () => {
      img.src = reader.result as string;
    };

    reader.onerror = () => {
      resolve({ status: "error", error: "Failed to read base image file." });
    };

    img.onload = async () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          resolve({ status: "error", error: "Unable to create 2D canvas context." });
          return;
        }

        // Draw original base image
        ctx.drawImage(img, 0, 0);

        // Helper to compute anchor coordinates
        const getAnchorPosition = (itemWidth: number, itemHeight: number, padding = 40) => {
          let x = 0;
          let y = 0;
          switch (position) {
            case "topLeft":
              x = padding + itemWidth / 2;
              y = padding + itemHeight / 2;
              break;
            case "topCenter":
              x = canvas.width / 2;
              y = padding + itemHeight / 2;
              break;
            case "topRight":
              x = canvas.width - padding - itemWidth / 2;
              y = padding + itemHeight / 2;
              break;
            case "centerLeft":
              x = padding + itemWidth / 2;
              y = canvas.height / 2;
              break;
            case "centerRight":
              x = canvas.width - padding - itemWidth / 2;
              y = canvas.height / 2;
              break;
            case "bottomLeft":
              x = padding + itemWidth / 2;
              y = canvas.height - padding - itemHeight / 2;
              break;
            case "bottomCenter":
              x = canvas.width / 2;
              y = canvas.height - padding - itemHeight / 2;
              break;
            case "bottomRight":
              x = canvas.width - padding - itemWidth / 2;
              y = canvas.height - padding - itemHeight / 2;
              break;
            case "center":
            default:
              x = canvas.width / 2;
              y = canvas.height / 2;
              break;
          }
          return { x, y };
        };

        if (type === "text") {
          ctx.save();
          ctx.globalAlpha = Math.max(0, Math.min(1, opacity));
          ctx.fillStyle = color;
          ctx.font = `${isBold ? "bold " : ""}${fontSize}px ${fontFamily}`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";

          const metrics = ctx.measureText(text);
          const textWidth = metrics.width;
          const textHeight = fontSize;

          if (repeat) {
            const rotRad = (rotation * Math.PI) / 180;
            const stepX = Math.max(textWidth + 60, repeatSpacing);
            const stepY = Math.max(textHeight + 60, repeatSpacing * 0.7);

            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate(rotRad);

            const diag = Math.sqrt(canvas.width * canvas.width + canvas.height * canvas.height);
            for (let y = -diag; y < diag; y += stepY) {
              for (let x = -diag; x < diag; x += stepX) {
                ctx.fillText(text, x, y);
              }
            }
          } else {
            const { x, y } = getAnchorPosition(textWidth, textHeight, Math.max(20, fontSize * 0.5));
            ctx.translate(x, y);
            if (rotation !== 0) {
              ctx.rotate((rotation * Math.PI) / 180);
            }
            ctx.fillText(text, 0, 0);
          }
          ctx.restore();
        } else if (type === "image" && logoSource) {
          // Load logo
          const logoImg = new Image();
          let logoUrl = "";
          if (typeof logoSource === "string") {
            logoUrl = logoSource;
          } else if (logoSource) {
            logoUrl = URL.createObjectURL(logoSource);
          }

          await new Promise<void>((resLogo, rejLogo) => {
            logoImg.onload = () => resLogo();
            logoImg.onerror = () => rejLogo(new Error("Failed to load watermark logo image."));
            logoImg.src = logoUrl;
          });

          // Compute logo target dimensions maintaining aspect ratio
          const baseWidth = canvas.width;
          const targetWidth = Math.max(24, Math.round(baseWidth * logoScale));
          const logoAspect = (logoImg.naturalHeight || logoImg.height) / (logoImg.naturalWidth || logoImg.width);
          const targetHeight = Math.round(targetWidth * logoAspect);

          ctx.save();
          ctx.globalAlpha = Math.max(0, Math.min(1, opacity));

          if (repeat) {
            const rotRad = (rotation * Math.PI) / 180;
            const stepX = targetWidth + repeatSpacing;
            const stepY = targetHeight + repeatSpacing;

            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate(rotRad);

            const diag = Math.sqrt(canvas.width * canvas.width + canvas.height * canvas.height);
            for (let y = -diag; y < diag; y += stepY) {
              for (let x = -diag; x < diag; x += stepX) {
                ctx.drawImage(logoImg, x - targetWidth / 2, y - targetHeight / 2, targetWidth, targetHeight);
              }
            }
          } else {
            const { x, y } = getAnchorPosition(targetWidth, targetHeight, 30);
            ctx.translate(x, y);
            if (rotation !== 0) {
              ctx.rotate((rotation * Math.PI) / 180);
            }
            ctx.drawImage(logoImg, -targetWidth / 2, -targetHeight / 2, targetWidth, targetHeight);
          }
          ctx.restore();

          if (typeof logoSource !== "string" && logoUrl.startsWith("blob:")) {
            URL.revokeObjectURL(logoUrl);
          }
        }

        const mimeType = format === "png" ? "image/png" : format === "webp" ? "image/webp" : "image/jpeg";
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve({ status: "error", error: "Failed to generate watermarked image blob." });
              return;
            }

            const url = URL.createObjectURL(blob);
            const originalName = file.name.replace(/\.[^.]+$/, "");
            const ext = format === "png" ? "png" : format === "webp" ? "webp" : "jpg";

            resolve({
              status: "success",
              outputBlob: blob,
              outputUrl: url,
              message: `Watermark applied successfully (${canvas.width}×${canvas.height})`,
              data: {
                downloadName: `${originalName}_watermarked.${ext}`,
                dimensions: `${canvas.width} × ${canvas.height}`,
                fileSize: `${(blob.size / 1024).toFixed(1)} KB`,
              },
            });
          },
          mimeType,
          quality
        );
      } catch (err: unknown) {
        resolve({
          status: "error",
          error: err instanceof Error ? err.message : "Error applying watermark",
        });
      }
    };

    img.onerror = () => {
      resolve({ status: "error", error: "Failed to decode image file." });
    };

    reader.readAsDataURL(file);
  });
}