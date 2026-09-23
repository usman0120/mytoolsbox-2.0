// File Organizer Classification & Batch Renaming Engine

export type FileCategory = "images" | "documents" | "audio" | "video" | "archives" | "code" | "other";

export const CATEGORY_EXTENSIONS: Record<FileCategory, string[]> = {
  images: ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "ico", "tiff"],
  documents: ["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt", "md", "csv", "rtf", "odt"],
  audio: ["mp3", "wav", "flac", "aac", "ogg", "m4a", "wma"],
  video: ["mp4", "mkv", "avi", "mov", "wmv", "webm", "flv"],
  archives: ["zip", "rar", "7z", "tar", "gz", "bz2"],
  code: ["js", "ts", "tsx", "jsx", "html", "css", "json", "py", "java", "c", "cpp", "go", "rs", "sql", "sh"],
  other: [],
};

export function classifyFile(filename: string): FileCategory {
  const parts = filename.split(".");
  if (parts.length < 2) return "other";
  const ext = parts.pop()!.toLowerCase();

  for (const [category, extensions] of Object.entries(CATEGORY_EXTENSIONS) as [FileCategory, string[]][]) {
    if (extensions.includes(ext)) {
      return category;
    }
  }
  return "other";
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export interface RenameOptions {
  pattern: string; // e.g. "photo_{n}", "{name}_backup", "{date}_{name}"
  startNumber?: number;
  caseTransform?: "lowercase" | "uppercase" | "keep";
  replaceFind?: string;
  replaceWith?: string;
}

export function generateNewFilename(
  originalName: string,
  index: number,
  options: RenameOptions
): string {
  const lastDot = originalName.lastIndexOf(".");
  let nameWithoutExt = lastDot !== -1 ? originalName.substring(0, lastDot) : originalName;
  let ext = lastDot !== -1 ? originalName.substring(lastDot + 1) : "";

  // Find & Replace
  if (options.replaceFind) {
    nameWithoutExt = nameWithoutExt.split(options.replaceFind).join(options.replaceWith || "");
  }

  // Case transformation
  if (options.caseTransform === "lowercase") {
    nameWithoutExt = nameWithoutExt.toLowerCase();
    ext = ext.toLowerCase();
  } else if (options.caseTransform === "uppercase") {
    nameWithoutExt = nameWithoutExt.toUpperCase();
    ext = ext.toUpperCase();
  }

  const num = (options.startNumber ?? 1) + index;
  const paddedNum = String(num).padStart(3, "0");
  const today = new Date().toISOString().split("T")[0];

  let formatted = options.pattern;
  if (!formatted.trim()) {
    formatted = "{name}";
  }

  formatted = formatted
    .replace(/\{name\}/g, nameWithoutExt)
    .replace(/\{n\}/g, String(num))
    .replace(/\{nnn\}/g, paddedNum)
    .replace(/\{date\}/g, today)
    .replace(/\{ext\}/g, ext);

  return ext ? `${formatted}.${ext}` : formatted;
}
