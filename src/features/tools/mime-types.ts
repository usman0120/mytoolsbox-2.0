import { ProcessingResult } from "@/lib/processing/types";

export interface MimeEntry {
  extension: string;
  mimeType: string;
  description: string;
  category: "Text" | "Image" | "Audio" | "Video" | "Document" | "Archive" | "Font" | "Binary" | "Code";
  headerSnippet?: string;
}

export const MIME_TYPES: Record<string, MimeEntry> = {
  // Text & Code
  txt: { extension: ".txt", mimeType: "text/plain", description: "Plain text file", category: "Text" },
  html: { extension: ".html", mimeType: "text/html", description: "HTML Web Document", category: "Text" },
  htm: { extension: ".htm", mimeType: "text/html", description: "HTML Document", category: "Text" },
  css: { extension: ".css", mimeType: "text/css", description: "Cascading Style Sheet", category: "Text" },
  csv: { extension: ".csv", mimeType: "text/csv", description: "Comma-Separated Values", category: "Text" },
  xml: { extension: ".xml", mimeType: "application/xml", description: "XML Document", category: "Text" },
  json: { extension: ".json", mimeType: "application/json", description: "JSON Data File", category: "Text" },
  jsonld: { extension: ".jsonld", mimeType: "application/ld+json", description: "JSON-LD Linked Data", category: "Text" },
  md: { extension: ".md", mimeType: "text/markdown", description: "Markdown Document", category: "Text" },
  yaml: { extension: ".yaml", mimeType: "application/yaml", description: "YAML Configuration", category: "Text" },
  yml: { extension: ".yml", mimeType: "application/yaml", description: "YAML Configuration", category: "Text" },
  toml: { extension: ".toml", mimeType: "application/toml", description: "TOML Configuration", category: "Text" },
  sql: { extension: ".sql", mimeType: "application/sql", description: "SQL Database Script", category: "Code" },
  js: { extension: ".js", mimeType: "text/javascript", description: "JavaScript Source Code", category: "Code" },
  mjs: { extension: ".mjs", mimeType: "text/javascript", description: "ES Module JavaScript", category: "Code" },
  ts: { extension: ".ts", mimeType: "text/typescript", description: "TypeScript Source Code", category: "Code" },
  tsx: { extension: ".tsx", mimeType: "text/typescript", description: "React TypeScript JSX", category: "Code" },
  jsx: { extension: ".jsx", mimeType: "text/javascript", description: "React JavaScript JSX", category: "Code" },
  py: { extension: ".py", mimeType: "text/x-python", description: "Python Script", category: "Code" },
  sh: { extension: ".sh", mimeType: "application/x-sh", description: "Shell Script", category: "Code" },

  // Images
  png: { extension: ".png", mimeType: "image/png", description: "Portable Network Graphics", category: "Image" },
  jpg: { extension: ".jpg", mimeType: "image/jpeg", description: "JPEG Image", category: "Image" },
  jpeg: { extension: ".jpeg", mimeType: "image/jpeg", description: "JPEG Image", category: "Image" },
  gif: { extension: ".gif", mimeType: "image/gif", description: "Graphics Interchange Format", category: "Image" },
  svg: { extension: ".svg", mimeType: "image/svg+xml", description: "Scalable Vector Graphics", category: "Image" },
  webp: { extension: ".webp", mimeType: "image/webp", description: "WebP Modern Image", category: "Image" },
  avif: { extension: ".avif", mimeType: "image/avif", description: "AV1 Image File Format", category: "Image" },
  ico: { extension: ".ico", mimeType: "image/x-icon", description: "Website Favicon", category: "Image" },
  bmp: { extension: ".bmp", mimeType: "image/bmp", description: "Bitmap Image", category: "Image" },
  tiff: { extension: ".tiff", mimeType: "image/tiff", description: "Tagged Image File", category: "Image" },
  heic: { extension: ".heic", mimeType: "image/heic", description: "High Efficiency Image Container", category: "Image" },

  // Audio
  mp3: { extension: ".mp3", mimeType: "audio/mpeg", description: "MPEG Audio Layer III", category: "Audio" },
  wav: { extension: ".wav", mimeType: "audio/wav", description: "Waveform Audio File", category: "Audio" },
  ogg: { extension: ".ogg", mimeType: "audio/ogg", description: "Ogg Vorbis Audio", category: "Audio" },
  flac: { extension: ".flac", mimeType: "audio/flac", description: "Free Lossless Audio Codec", category: "Audio" },
  aac: { extension: ".aac", mimeType: "audio/aac", description: "Advanced Audio Coding", category: "Audio" },
  m4a: { extension: ".m4a", mimeType: "audio/mp4", description: "Apple MPEG-4 Audio", category: "Audio" },

  // Video
  mp4: { extension: ".mp4", mimeType: "video/mp4", description: "MPEG-4 Video", category: "Video" },
  webm: { extension: ".webm", mimeType: "video/webm", description: "WebM Open Media Video", category: "Video" },
  mov: { extension: ".mov", mimeType: "video/quicktime", description: "Apple QuickTime Video", category: "Video" },
  avi: { extension: ".avi", mimeType: "video/x-msvideo", description: "Audio Video Interleave", category: "Video" },
  mkv: { extension: ".mkv", mimeType: "video/x-matroska", description: "Matroska Multimedia Container", category: "Video" },

  // Documents
  pdf: { extension: ".pdf", mimeType: "application/pdf", description: "Adobe Portable Document Format", category: "Document" },
  doc: { extension: ".doc", mimeType: "application/msword", description: "Microsoft Word Document", category: "Document" },
  docx: { extension: ".docx", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", description: "Word OpenXML Document", category: "Document" },
  xls: { extension: ".xls", mimeType: "application/vnd.ms-excel", description: "Microsoft Excel Spreadsheet", category: "Document" },
  xlsx: { extension: ".xlsx", mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", description: "Excel OpenXML Spreadsheet", category: "Document" },
  ppt: { extension: ".ppt", mimeType: "application/vnd.ms-powerpoint", description: "PowerPoint Presentation", category: "Document" },
  pptx: { extension: ".pptx", mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation", description: "PowerPoint OpenXML Presentation", category: "Document" },
  epub: { extension: ".epub", mimeType: "application/epub+zip", description: "Electronic Publication E-book", category: "Document" },

  // Archives
  zip: { extension: ".zip", mimeType: "application/zip", description: "ZIP Compressed Archive", category: "Archive" },
  tar: { extension: ".tar", mimeType: "application/x-tar", description: "TAR Tarball Archive", category: "Archive" },
  gz: { extension: ".gz", mimeType: "application/gzip", description: "GZip Compressed Archive", category: "Archive" },
  rar: { extension: ".rar", mimeType: "application/vnd.rar", description: "RAR Compressed Archive", category: "Archive" },
  "7z": { extension: ".7z", mimeType: "application/x-7z-compressed", description: "7-Zip High Ratio Archive", category: "Archive" },

  // Fonts & Binary
  woff2: { extension: ".woff2", mimeType: "font/woff2", description: "Web Open Font Format 2", category: "Font" },
  woff: { extension: ".woff", mimeType: "font/woff", description: "Web Open Font Format", category: "Font" },
  ttf: { extension: ".ttf", mimeType: "font/ttf", description: "TrueType Font", category: "Font" },
  otf: { extension: ".otf", mimeType: "font/otf", description: "OpenType Font", category: "Font" },
  wasm: { extension: ".wasm", mimeType: "application/wasm", description: "WebAssembly Binary Code", category: "Binary" },
  bin: { extension: ".bin", mimeType: "application/octet-stream", description: "Generic Binary Stream", category: "Binary" },
  apk: { extension: ".apk", mimeType: "application/vnd.android.package-archive", description: "Android Application Package", category: "Binary" },
};

export function lookupMimeType(extensionOrName: string): ProcessingResult & { data?: MimeEntry } {
  let ext = extensionOrName.trim().toLowerCase();
  if (ext.includes(".")) {
    ext = ext.split(".").pop() || ext;
  }
  const entry = MIME_TYPES[ext];
  if (!entry) {
    return { status: "error", error: `No registered MIME type found for ".${ext}".` };
  }
  return {
    status: "success",
    message: entry.mimeType,
    data: {
      ...entry,
      headerSnippet: `Content-Type: ${entry.mimeType}${entry.category === "Text" || entry.category === "Code" ? "; charset=utf-8" : ""}`,
    },
  };
}

export function searchMimeTypes(query: string): ProcessingResult & { data?: MimeEntry[] } {
  const q = query.toLowerCase().trim();
  const results = Object.values(MIME_TYPES).filter(
    (e) =>
      e.extension.includes(q) ||
      e.mimeType.toLowerCase().includes(q) ||
      e.description.toLowerCase().includes(q) ||
      e.category.toLowerCase().includes(q)
  );
  return {
    status: "success",
    message: `Found ${results.length} MIME type(s)`,
    data: results.map((r) => ({
      ...r,
      headerSnippet: `Content-Type: ${r.mimeType}${r.category === "Text" || r.category === "Code" ? "; charset=utf-8" : ""}`,
    })),
  };
}

export function getMimeCategories(): string[] {
  return ["Text", "Image", "Audio", "Video", "Document", "Archive", "Font", "Code", "Binary"];
}