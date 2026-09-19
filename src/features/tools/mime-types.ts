import { ProcessingResult } from "@/lib/processing/types";

export const MIME_TYPES: Record<string, { extension: string; mimeType: string; description: string; category: string }> = {
  // Text
  txt: { extension: ".txt", mimeType: "text/plain", description: "Plain text file", category: "Text" },
  html: { extension: ".html", mimeType: "text/html", description: "HyperText Markup Language", category: "Text" },
  htm: { extension: ".htm", mimeType: "text/html", description: "HyperText Markup Language", category: "Text" },
  css: { extension: ".css", mimeType: "text/css", description: "Cascading Style Sheet", category: "Text" },
  csv: { extension: ".csv", mimeType: "text/csv", description: "Comma-Separated Values", category: "Text" },
  xml: { extension: ".xml", mimeType: "application/xml", description: "Extensible Markup Language", category: "Text" },
  js: { extension: ".js", mimeType: "text/javascript", description: "JavaScript source code", category: "Text" },
  mjs: { extension: ".mjs", mimeType: "text/javascript", description: "JavaScript ES Module", category: "Text" },
  ts: { extension: ".ts", mimeType: "text/typescript", description: "TypeScript source code", category: "Text" },
  tsx: { extension: ".tsx", mimeType: "text/typescript", description: "TypeScript with JSX", category: "Text" },
  jsx: { extension: ".jsx", mimeType: "text/javascript", description: "JavaScript with JSX", category: "Text" },
  json: { extension: ".json", mimeType: "application/json", description: "JavaScript Object Notation", category: "Text" },
  jsonld: { extension: ".jsonld", mimeType: "application/ld+json", description: "JSON-LD Linked Data", category: "Text" },
  md: { extension: ".md", mimeType: "text/markdown", description: "Markdown document", category: "Text" },
  yaml: { extension: ".yaml", mimeType: "text/yaml", description: "YAML document", category: "Text" },
  yml: { extension: ".yml", mimeType: "text/yaml", description: "YAML document", category: "Text" },

  // Images
  png: { extension: ".png", mimeType: "image/png", description: "Portable Network Graphics", category: "Image" },
  jpg: { extension: ".jpg", mimeType: "image/jpeg", description: "JPEG image", category: "Image" },
  jpeg: { extension: ".jpeg", mimeType: "image/jpeg", description: "JPEG image", category: "Image" },
  gif: { extension: ".gif", mimeType: "image/gif", description: "Graphics Interchange Format", category: "Image" },
  svg: { extension: ".svg", mimeType: "image/svg+xml", description: "Scalable Vector Graphics", category: "Image" },
  webp: { extension: ".webp", mimeType: "image/webp", description: "WebP image format", category: "Image" },
  ico: { extension: ".ico", mimeType: "image/x-icon", description: "Icon file", category: "Image" },
  bmp: { extension: ".bmp", mimeType: "image/bmp", description: "Bitmap image", category: "Image" },
  tiff: { extension: ".tiff", mimeType: "image/tiff", description: "Tagged Image File Format", category: "Image" },
  tif: { extension: ".tif", mimeType: "image/tiff", description: "Tagged Image File Format", category: "Image" },
  avif: { extension: ".avif", mimeType: "image/avif", description: "AV1 Image File Format", category: "Image" },

  // Audio
  mp3: { extension: ".mp3", mimeType: "audio/mpeg", description: "MPEG Audio Layer III", category: "Audio" },
  wav: { extension: ".wav", mimeType: "audio/wav", description: "Waveform Audio", category: "Audio" },
  ogg: { extension: ".ogg", mimeType: "audio/ogg", description: "Ogg Vorbis audio", category: "Audio" },
  flac: { extension: ".flac", mimeType: "audio/flac", description: "Free Lossless Audio Codec", category: "Audio" },
  aac: { extension: ".aac", mimeType: "audio/aac", description: "Advanced Audio Coding", category: "Audio" },
  m4a: { extension: ".m4a", mimeType: "audio/mp4", description: "MPEG-4 Audio", category: "Audio" },
  wma: { extension: ".wma", mimeType: "audio/x-ms-wma", description: "Windows Media Audio", category: "Audio" },

  // Video
  mp4: { extension: ".mp4", mimeType: "video/mp4", description: "MPEG-4 Video", category: "Video" },
  webm: { extension: ".webm", mimeType: "video/webm", description: "WebM video", category: "Video" },
  avi: { extension: ".avi", mimeType: "video/x-msvideo", description: "Audio Video Interleave", category: "Video" },
  mov: { extension: ".mov", mimeType: "video/quicktime", description: "QuickTime video", category: "Video" },
  mkv: { extension: ".mkv", mimeType: "video/x-matroska", description: "Matroska video", category: "Video" },
  wmv: { extension: ".wmv", mimeType: "video/x-ms-wmv", description: "Windows Media Video", category: "Video" },

  // Documents
  pdf: { extension: ".pdf", mimeType: "application/pdf", description: "Portable Document Format", category: "Document" },
  doc: { extension: ".doc", mimeType: "application/msword", description: "Microsoft Word document", category: "Document" },
  docx: { extension: ".docx", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", description: "Microsoft Word (OpenXML)", category: "Document" },
  xls: { extension: ".xls", mimeType: "application/vnd.ms-excel", description: "Microsoft Excel spreadsheet", category: "Document" },
  xlsx: { extension: ".xlsx", mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", description: "Microsoft Excel (OpenXML)", category: "Document" },
  ppt: { extension: ".ppt", mimeType: "application/vnd.ms-powerpoint", description: "Microsoft PowerPoint", category: "Document" },
  pptx: { extension: ".pptx", mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation", description: "Microsoft PowerPoint (OpenXML)", category: "Document" },

  // Archives
  zip: { extension: ".zip", mimeType: "application/zip", description: "ZIP archive", category: "Archive" },
  gz: { extension: ".gz", mimeType: "application/gzip", description: "GZip compressed archive", category: "Archive" },
  tar: { extension: ".tar", mimeType: "application/x-tar", description: "Tape Archive", category: "Archive" },
  rar: { extension: ".rar", mimeType: "application/vnd.rar", description: "RAR archive", category: "Archive" },
  "7z": { extension: ".7z", mimeType: "application/x-7z-compressed", description: "7-Zip archive", category: "Archive" },

  // Fonts
  woff: { extension: ".woff", mimeType: "font/woff", description: "Web Open Font Format", category: "Font" },
  woff2: { extension: ".woff2", mimeType: "font/woff2", description: "Web Open Font Format 2", category: "Font" },
  ttf: { extension: ".ttf", mimeType: "font/ttf", description: "TrueType Font", category: "Font" },
  otf: { extension: ".otf", mimeType: "font/otf", description: "OpenType Font", category: "Font" },
  eot: { extension: ".eot", mimeType: "application/vnd.ms-fontobject", description: "Embedded OpenType", category: "Font" },

  // Binary/Other
  bin: { extension: ".bin", mimeType: "application/octet-stream", description: "Binary data", category: "Binary" },
  exe: { extension: ".exe", mimeType: "application/vnd.microsoft.portable-executable", description: "Windows executable", category: "Binary" },
  wasm: { extension: ".wasm", mimeType: "application/wasm", description: "WebAssembly binary", category: "Binary" },
};

export function lookupMimeType(extension: string): ProcessingResult {
  const ext = extension.replace(/^\./, "").toLowerCase();
  const entry = MIME_TYPES[ext];
  if (!entry) {
    return { status: "error", error: `No MIME type found for extension ".${ext}".` };
  }
  return { status: "success", message: entry.mimeType, data: entry };
}

export function lookupByMimeType(mimeType: string): ProcessingResult {
  const results = Object.values(MIME_TYPES).filter((e) => e.mimeType === mimeType);
  if (results.length === 0) {
    return { status: "error", error: `No extension found for MIME type "${mimeType}".` };
  }
  return { status: "success", message: results.map((r) => r.extension).join(", "), data: results };
}

export function searchMimeTypes(query: string): ProcessingResult {
  const q = query.toLowerCase();
  const results = Object.values(MIME_TYPES).filter(
    (e) =>
      e.extension.includes(q) ||
      e.mimeType.includes(q) ||
      e.description.toLowerCase().includes(q)
  );
  return {
    status: "success",
    message: `Found ${results.length} MIME type(s)`,
    data: results,
  };
}

export function getMimeCategories(): string[] {
  return ["Text", "Image", "Audio", "Video", "Document", "Archive", "Font", "Binary"];
}