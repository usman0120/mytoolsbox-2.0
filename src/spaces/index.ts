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
  /** Tool slugs to feature as large tiles on the Space home (filled in M3). */
  featured: string[];
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
    featured: [],
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
