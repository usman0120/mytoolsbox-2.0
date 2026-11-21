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
    featured: ["compress-image", "resize-image", "video-to-gif"],
    headline: "Photo, video and audio tools",
    about: [
      "Media covers the jobs people do with pictures and clips every day: shrinking a photo for a form or an email, resizing for a social post, cropping, converting between JPG, PNG and WebP, turning a clip into a GIF, cutting audio and pulling the sound out of a video.",
      "Images, video and audio are processed in your browser, so nothing is uploaded and nothing waits in a queue. Short clips and photos finish in seconds. Long or very large videos depend on your device's speed, and the tools say so instead of hanging.",
      "Everything is free with no account and no watermark. Results download straight to your device.",
    ],
    faq: [
      { q: "Are my photos and videos uploaded?", a: "No. They are processed in your browser and never sent to a server." },
      { q: "Can I compress an image to an exact size like 100 KB?", a: "Yes. Set a target size and the compressor lowers quality and dimensions until the file fits." },
      { q: "Why is a long video slow?", a: "Video work happens on your own device. Laptops handle longer clips faster than phones; shorter clips always finish quickly." },
      { q: "Do downloads have a watermark?", a: "Never." },
    ],
  },
  {
    id: "create",
    name: "Create",
    slug: "create",
    color: "var(--color-space-create)",
    tagline: "Design and visual thinking",
    description: "Design social posts, draw diagrams, sketch on a whiteboard and make QR codes and palettes.",
    categories: c(["design", "Design canvas"], ["diagrams", "Diagrams"], ["whiteboard", "Whiteboard"], ["qr-barcodes", "QR & barcodes"], ["social-sizes", "Social sizes"]),
    featured: ["design", "qr-code-generator", "diagram"],
    headline: "Design, diagrams and QR codes",
    about: [
      "Create is for visual work: social posts and posters, certificates, slide decks, diagrams and flowcharts, colour palettes, and QR codes and barcodes for print or packaging.",
      "Designs are built and exported in your browser. Use the templates as a starting point, change the text and colours, and download PNG, SVG or PDF without an account. The diagram tool can also draft a diagram from a plain-language description using AI.",
      "No watermarks, no premium templates and no sign-up wall.",
    ],
    faq: [
      { q: "Can I use the designs commercially?", a: "Yes. What you make is yours. The built-in templates and shapes are free to use." },
      { q: "Which formats can I export?", a: "PNG, JPG, SVG and PDF depending on the tool. QR codes export as PNG or SVG for sharp printing." },
      { q: "Do QR codes expire?", a: "No. The QR code encodes your link or text directly, so it works as long as that link works." },
      { q: "Is my work saved?", a: "Editors keep your work in this browser. Download a copy if you want to keep it elsewhere." },
    ],
  },
  {
    id: "dev",
    name: "Dev",
    slug: "dev",
    color: "var(--color-space-dev)",
    tagline: "Developer utilities",
    description: "Format JSON, test regex, decode JWTs, hash, encode and generate. Fast, keyboard-first and offline.",
    categories: c(["format-validate", "Format & validate"], ["encode-decode", "Encode & decode"], ["generators", "Generators"], ["web-seo", "Web & SEO"], ["docs-diagrams", "Docs & diagrams"]),
    featured: ["json-formatter", "regex-tester", "jwt-decoder"],
    headline: "Developer tools that stay local",
    about: [
      "Dev gathers the small utilities developers reach for all day: formatting and validating JSON, SQL, HTML and CSS, testing regular expressions, decoding JWTs, encoding Base64 and URLs, hashing, generating UUIDs and passwords, building cron expressions and checking colour contrast.",
      "They run entirely in your browser, which matters when you paste tokens, keys or customer data: nothing is sent anywhere. They also work offline once loaded and respond as you type.",
      "A few tools add optional AI help, such as explaining an error or drafting a regex. Those are clearly marked and use a free daily allowance.",
    ],
    faq: [
      { q: "Is it safe to paste a JWT or API response here?", a: "Yes. The local tools never send what you paste to a server." },
      { q: "Which tools use AI?", a: "Only tools marked as AI, such as the error explainer and regex builder. Everything else runs on your device." },
      { q: "Do these tools work offline?", a: "Yes, once the page has loaded." },
      { q: "Is there a keyboard shortcut to find tools?", a: "Press Ctrl + K (or Cmd + K on a Mac) anywhere to search." },
    ],
  },
  {
    id: "study",
    name: "Study",
    slug: "study",
    color: "var(--color-space-study)",
    tagline: "Learning and academic work",
    description: "Solve maths step by step, cite sources, make flashcards, plan study time and calculate grades.",
    categories: c(["maths", "Maths"], ["writing-citing", "Writing & citing"], ["exam-prep", "Exam prep"], ["planning", "Planning"], ["grades", "Grades"]),
    featured: ["equation-solver", "citation-generator", "gpa-calculator"],
    headline: "Study tools for school and university",
    about: [
      "Study helps with the work around learning: solving and checking equations, writing maths in LaTeX, citing sources in APA, MLA and Chicago, making flashcards and quizzes, planning study time and calculating your GPA.",
      "Most tools run on your device and keep your notes in this browser. AI-powered helpers, such as the math solver and notes generator in AI Studio, explain steps rather than just giving answers, and use a free daily allowance.",
      "Everything is free, with no account needed. Sign in only if you want favorites and history across devices.",
    ],
    faq: [
      { q: "Are the citation formats up to date?", a: "The generator follows APA 7, MLA 9 and Chicago author-date. Always check your institution's specific rules." },
      { q: "Can I use the math tools for homework?", a: "Yes. Use them to check your work and understand the steps, not to skip learning them." },
      { q: "Is my data saved?", a: "Flashcards, plans and quizzes are kept in this browser unless you download them." },
      { q: "Which GPA scale is used?", a: "The 4.0 scale by default, with options for other common scales." },
    ],
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
    featured: ["loan-calculator", "percentage-calculator", "bmi-calculator"],
    headline: "Calculators with the formula shown",
    about: [
      "Calc has everyday calculators for money, health, maths and units: loan and salary, tax, margins and ROI, percentages and statistics, BMI, age, and unit conversion.",
      "Each calculator shows the result clearly along with how it was worked out, so you can check it. Calculations happen instantly in your browser.",
      "Health and finance results are estimates for planning, not professional advice. Where a calculator depends on rules that vary by country, such as tax, it says which rules it uses.",
    ],
    faq: [
      { q: "How accurate are the results?", a: "The maths is exact for the inputs you give. Real-world figures such as tax and loan offers can differ, so treat results as estimates." },
      { q: "Which tax rules does the tax calculator use?", a: "It uses US federal brackets. Check your local rules for other countries." },
      { q: "Is my financial data stored?", a: "No. Inputs stay in your browser." },
      { q: "Can I share a result?", a: "Copy the result, or bookmark the page with your inputs." },
    ],
  },
  {
    id: "work",
    name: "Work",
    slug: "work",
    color: "var(--color-space-work)",
    tagline: "Writing, office and productivity",
    description: "Count and clean text, make invoices and resumes, write emails and keep tasks and habits on track.",
    categories: c(["text", "Text tools"], ["business-docs", "Business docs"], ["career", "Career"], ["productivity", "Productivity"]),
    featured: ["word-counter", "invoice-generator", "resume-builder"],
    headline: "Writing, office and productivity tools",
    about: [
      "Work covers everyday office jobs: counting and cleaning text, changing case, making invoices, quotes, proposals and contracts, building a resume and cover letter, and keeping on top of tasks, notes and habits.",
      "Documents are built in your browser and downloaded as PDF or text. Your to-dos, notes and habits are kept in this browser, so they are there next time without an account.",
      "Writing helpers such as the grammar checker and paraphraser use AI within a free daily allowance and are clearly marked.",
    ],
    faq: [
      { q: "Are invoices and resumes stored on a server?", a: "No. They are created in your browser and downloaded to your device." },
      { q: "Will my tasks and notes be there tomorrow?", a: "Yes, in the same browser. Clearing your browser data removes them, so export anything important." },
      { q: "Do invoices include taxes and discounts?", a: "Yes. Add tax and discount lines and the totals update automatically." },
      { q: "Which tools use AI?", a: "Tools marked AI, such as the grammar checker and paraphraser. The rest run on your device." },
    ],
  },
  {
    id: "ai",
    name: "AI Studio",
    slug: "ai",
    color: "var(--color-space-ai)",
    tagline: "Focused AI assistants",
    description: "Task-tuned AI apps for maths, farming, projects, planning, writing and careers. Free daily allowance.",
    categories: c(["learn", "Learn"], ["build", "Build"], ["plan", "Plan"], ["grow", "Grow"], ["everyday", "Everyday"]),
    featured: ["math-solver", "farm-advisor", "project-ideas"],
    headline: "AI Studio: focused AI assistants",
    about: [
      "AI Studio is a set of focused assistants rather than one general chat box: a math solver that explains each step, a farm advisor for crops and fertilizer, a project-ideas helper, a planner, notes and research help, and an everyday chat assistant.",
      "Each assistant has its own instructions and examples, so answers stay on task. Requests are sent to our AI provider to generate the reply; please don't include passwords or sensitive personal details.",
      "AI Studio is free within a daily allowance: 10 requests a day without an account and 40 when you sign in. Health, nutrition and farming answers are general guidance, not professional advice.",
    ],
    faq: [
      { q: "Is AI Studio free?", a: "Yes, within a daily allowance that resets at midnight UTC." },
      { q: "Which AI models do you use?", a: "Fast models from Google Gemini, with Groq as a backup. The best model is picked for each task." },
      { q: "Is my conversation private?", a: "Requests go to the AI provider to generate answers. We don't sell your data, but avoid sharing sensitive details." },
      { q: "Can the AI be wrong?", a: "Yes. Check important answers, especially for health, money or farming decisions." },
    ],
  },
];

export const SPACE_IDS = SPACES.map((s) => s.id);

export function getSpace(id: string): Space | undefined {
  return SPACES.find((s) => s.id === id || s.slug === id);
}
