import type { PortType } from "@/tools/types";

/** Port type of a concrete file, from its MIME type and extension. */
export function portTypeOf(mime: string, name = ""): PortType {
  const ext = name.toLowerCase().split(".").pop() ?? "";
  if (mime === "application/pdf" || ext === "pdf") return "pdf";
  if (mime.startsWith("image/") || ["jpg", "jpeg", "png", "webp", "gif", "avif", "heic", "bmp"].includes(ext)) return "image";
  if (mime.startsWith("video/") || ["mp4", "webm", "mov", "mkv"].includes(ext)) return "video";
  if (mime.startsWith("audio/") || ["mp3", "wav", "ogg", "m4a", "flac"].includes(ext)) return "audio";
  if (/wordprocessingml|msword/.test(mime) || ["docx", "doc", "odt", "rtf"].includes(ext)) return "docx";
  if (/spreadsheetml|ms-excel/.test(mime) || ["xlsx", "xls"].includes(ext)) return "xlsx";
  if (mime === "text/csv" || ext === "csv") return "csv";
  if (/zip/.test(mime) || ext === "zip") return "zip";
  if (mime === "application/json" || ext === "json") return "json";
  if (mime === "text/markdown" || ext === "md") return "markdown";
  if (mime.startsWith("text/") || ext === "txt") return "text";
  return "any-file";
}

export interface CatalogEntry {
  id: string;
  name: string;
  url: string;
  /** Port types this tool takes as a file input (empty = no file input). */
  accepts: PortType[];
}

export function acceptsFile(entry: CatalogEntry, type: PortType): boolean {
  return entry.accepts.includes(type) || (entry.accepts.includes("any-file") && type !== "zip");
}
