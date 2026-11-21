import type { MetadataRoute } from "next";
import { SITE_CONFIG } from "@/config/site";

const SHAREABLE = ["image/*", "application/pdf", "video/*", "audio/*", "text/plain", "text/csv", ".docx", ".pptx", ".xlsx"];

/**
 * Installable app (blueprint section 17): shortcuts, share target (phone share sheet → File Tray)
 * and file handlers (open PDFs and images with MyToolsBox on desktop).
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: `${SITE_CONFIG.name} – Get small jobs done`,
    short_name: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    start_url: "/?source=pwa",
    scope: "/",
    display: "standalone",
    display_override: ["window-controls-overlay", "standalone"],
    background_color: "#fafaf9",
    theme_color: "#fafaf9",
    lang: "en-US",
    dir: "ltr",
    orientation: "any",
    categories: ["productivity", "utilities", "education"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Compress Image", url: "/media/compress-image?source=pwa", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Merge PDF", url: "/docs/merge-pdf?source=pwa", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Ask", url: "/?open=ask", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "File Tray", url: "/?open=tray", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
    ],
    share_target: {
      action: "/share-target",
      method: "POST",
      enctype: "multipart/form-data",
      params: { title: "title", text: "text", url: "url", files: [{ name: "files", accept: SHAREABLE }] },
    },
    // Not yet in Next's manifest type; supported by Chromium desktop.
    ...({
      file_handlers: [
        {
          action: "/?open=files",
          accept: { "application/pdf": [".pdf"], "image/*": [".jpg", ".jpeg", ".png", ".webp", ".gif", ".heic"] },
        },
      ],
      launch_handler: { client_mode: "focus-existing" },
    } as object),
  } as MetadataRoute.Manifest;
}
