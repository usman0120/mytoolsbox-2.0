// The 8 Spaces (blueprint section 4). Each is a sub-platform with its own colour,
// glyph, categories and SEO cluster. Colours appear only as accents, never as page backgrounds.

export type SpaceId = "docs" | "media" | "create" | "dev" | "study" | "calc" | "work" | "ai";

export interface SpaceCategory {
  id: string;
  name: string;
}

export interface Space {
  id: SpaceId;
  name: string;
  /** URL segment; `ai` lives at /ai. */
  slug: string;
  /** CSS colour token, e.g. `var(--color-space-docs)`. */
  color: string;
  tagline: string;
  description: string;
  categories: SpaceCategory[];
  /** Tool slugs to feature as large tiles on the Space home. */
  featured: string[];
  /** Space home H1 and meta title (≤ 60 chars, brand added by the layout). */
  headline?: string;
  /** 200–400 words of plain-language copy for the Space home. */
  about?: string[];
  faq?: { q: string; a: string }[];
}

const c = (...items: [string, string][]): SpaceCategory[] => items.map(([id, name]) => ({ id, name }));

export const SPACES: Space[] = [
  {
    id: "docs",
    name: "Docs",
    slug: "docs",
    color: "var(--color-space-docs)",
    tagline: "PDFs and office files",
    description: "Merge, split, compress, convert, sign and protect PDFs and office documents on your device.",
    categories: c(["organize", "Organize"], ["convert", "Convert"], ["edit-sign", "Edit & sign"], ["secure", "Secure"], ["ocr", "OCR"]),
    featured: ["compress-pdf", "merge-pdf", "pdf-to-jpg"],
    headline: "PDF tools that run on your device",
    about: [
      "Docs collects everyday PDF and office jobs in one place: merging and splitting, making a PDF small enough for an email or an upload portal, turning pages into images and photos into a PDF, and moving text between PDF, Word, Excel and PowerPoint.",
      "Every Docs tool runs inside your browser. Your files are opened and processed on your own device and are never uploaded to a server, so contracts, IDs and school work stay private. Because nothing travels over the network, most jobs finish in a few seconds, even on a phone.",
      "There is no sign-up, no watermark and no daily limit. Signing in is optional and only adds favorites and history. If a conversion cannot keep something, such as the exact layout when exporting PDF text to Word, the tool says so up front instead of surprising you after the download.",
    ],
    faq: [
      { q: "Are my documents uploaded anywhere?", a: "No. Docs tools read and write files in your browser. Nothing is sent to a server, which is why they also work offline once loaded." },
      { q: "Is there a file size limit?", a: "There is no fixed limit. Very large files depend on your device memory; a modern phone or laptop handles typical documents easily." },
      { q: "Do the tools add a watermark?", a: "Never. Downloads are clean copies of your result." },
      { q: "Can I edit a scanned PDF?", a: "Scans are images of pages. You can merge, split, compress, rotate and sign them; extracting their text needs OCR, which is coming to this Space." },
    ],
  },
  {
    id: "media",
    name: "Media",
    slug: "media",
    color: "var(--color-space-media)",
    tagline: "Images, video and audio",
    description: "Compress, resize and convert photos, trim video, make GIFs and edit audio without uploading.",
    categories: c(["image-edit", "Image edit"], ["image-convert", "Image convert"], ["video", "Video"], ["audio", "Audio"], ["ai-image", "AI image"]),
    featured: [],
  },
  {
    id: "create",
    name: "Create",
    slug: "create",
    color: "var(--color-space-create)",
    tagline: "Design and visual thinking",
    description: "Design social posts, draw diagrams, sketch on a whiteboard and make QR codes and palettes.",
    categories: c(["design", "Design canvas"], ["diagrams", "Diagrams"], ["whiteboard", "Whiteboard"], ["qr-barcodes", "QR & barcodes"], ["social-sizes", "Social sizes"]),
    featured: [],
  },
  {
    id: "dev",
    name: "Dev",
    slug: "dev",
    color: "var(--color-space-dev)",
    tagline: "Developer utilities",
    description: "Format JSON, test regex, decode JWTs, hash, encode and generate. Fast, keyboard-first and offline.",
    categories: c(["format-validate", "Format & validate"], ["encode-decode", "Encode & decode"], ["generators", "Generators"], ["web-seo", "Web & SEO"], ["docs-diagrams", "Docs & diagrams"]),
    featured: [],
  },
  {
    id: "study",
    name: "Study",
    slug: "study",
    color: "var(--color-space-study)",
    tagline: "Learning and academic work",
    description: "Solve maths step by step, cite sources, make flashcards, plan study time and calculate grades.",
    categories: c(["maths", "Maths"], ["writing-citing", "Writing & citing"], ["exam-prep", "Exam prep"], ["planning", "Planning"], ["grades", "Grades"]),
    featured: [],
  },
  {
    id: "calc",
    name: "Calc",
    slug: "calc",
    color: "var(--color-space-calc)",
    tagline: "Calculators and converters",
    description: "Finance, health, maths, science, engineering, date and farming calculators with the formula shown.",
    categories: c(
      ["finance", "Finance"], ["health", "Health"], ["maths", "Maths"], ["physics", "Physics"], ["chemistry", "Chemistry"],
      ["engineering", "Engineering"], ["date-time", "Date & time"], ["units", "Units"], ["agriculture", "Agriculture"],
    ),
    featured: [],
  },
  {
    id: "work",
    name: "Work",
    slug: "work",
    color: "var(--color-space-work)",
    tagline: "Writing, office and productivity",
    description: "Count and clean text, make invoices and resumes, write emails and keep tasks and habits on track.",
    categories: c(["text", "Text tools"], ["business-docs", "Business docs"], ["career", "Career"], ["productivity", "Productivity"]),
    featured: [],
  },
  {
    id: "ai",
    name: "AI Studio",
    slug: "ai",
    color: "var(--color-space-ai)",
    tagline: "Focused AI assistants",
    description: "Task-tuned AI apps for maths, farming, projects, planning, writing and careers. Free daily allowance.",
    categories: c(["learn", "Learn"], ["build", "Build"], ["plan", "Plan"], ["grow", "Grow"], ["everyday", "Everyday"]),
    featured: [],
  },
];

export const SPACE_IDS = SPACES.map((s) => s.id);

export function getSpace(id: string): Space | undefined {
  return SPACES.find((s) => s.id === id || s.slug === id);
}
