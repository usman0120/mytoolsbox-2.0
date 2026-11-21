// Old /tools/{slug} URLs → their new Space path. Kept as a plain map so the proxy stays tiny.
// Must match the manifests' legacySlugs exactly; `npm run check:tools` verifies it.
export const LEGACY_TOOL_PATHS: Record<string, string> = {
  "csv-to-excel": "/docs/csv-to-excel",
  "images-to-pdf": "/docs/jpg-to-pdf",
  "jpg-to-pdf-merger": "/docs/jpg-to-pdf",
  "pdf-compressor": "/docs/compress-pdf",
  "pdf-merger": "/docs/merge-pdf",
  "pdf-splitter": "/docs/split-pdf",
  "pdf-to-images": "/docs/pdf-to-jpg",
  "pdf-to-office-converter": "/docs/pdf-to-word",
  "pdf-to-ppt-converter": "/docs/pdf-to-powerpoint",
  "ppt-to-pdf": "/docs/powerpoint-to-pdf",
  "text-to-pdf": "/docs/text-to-pdf",
  "txt-to-docx": "/docs/text-to-word",
  "word-to-pdf-converter": "/docs/word-to-pdf",
};

/** Canonical path for a tool slug from the old catalog (migrated tools go to their Space). */
export function toolPath(slug: string): string {
  return Object.hasOwn(LEGACY_TOOL_PATHS, slug) ? LEGACY_TOOL_PATHS[slug] : `/tools/${slug}`;
}

/** Canonical path for an old-catalog item (tool or app). */
export function productPath(item: { slug: string; productType?: string }): string {
  return item.productType === "app" ? `/apps/${item.slug}` : toolPath(item.slug);
}
