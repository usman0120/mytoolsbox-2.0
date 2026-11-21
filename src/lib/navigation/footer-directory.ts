import { appPath, toolPath } from "@/config/legacy-tool-paths";
export interface FooterSection {
  title: string;
  href: string;
  links: { name: string; href: string }[];
}

const CATEGORY_SPACE: Record<string, string> = {
  documents: "/docs", images: "/media", video: "/media", audio: "/media", writing: "/work", calculators: "/calc",
  developer: "/dev", security: "/dev", misc: "/create", academic: "/study", productivity: "/work", design: "/create",
};

function tools(title: string, category: string, entries: [string, string][]): FooterSection {
  return { title, href: CATEGORY_SPACE[category] ?? "/tools", links: entries.map(([name, slug]) => ({ name, href: toolPath(slug) })) };
}

// Keep this compact: importing the full registries into the shared footer would
// ship every tool's descriptions, FAQs, and metadata on every page.
export const FOOTER_TOOL_SECTIONS: FooterSection[] = [
  tools("Documents & PDF", "documents", [["Merge PDF", "pdf-merger"], ["Split PDF", "pdf-splitter"], ["Compress PDF", "pdf-compressor"], ["Images to PDF", "images-to-pdf"]]),
  tools("Images & photos", "images", [["Compress images", "image-compressor"], ["Resize images", "image-resizer"], ["Convert images", "image-converter"], ["Crop images", "image-cropper"]]),
  tools("Video", "video", [["Compress video", "video-compressor"], ["Resize video", "video-resizer"], ["Video to GIF", "video-to-gif"], ["Merge videos", "merge-videos"]]),
  tools("Audio", "audio", [["Convert audio", "audio-converter"], ["Cut audio", "audio-cutter"], ["Extract audio", "extract-audio-from-video"], ["MP4 to MP3", "mp4-mp3-converter"]]),
  tools("Writing & text", "writing", [["Word counter", "word-counter"], ["Case converter", "case-converter"], ["Text cleaner", "text-cleaner"], ["Grammar checker", "grammar-checker"]]),
  tools("Calculators & finance", "calculators", [["Percentage calculator", "percentage-calculator"], ["Loan calculator", "loan-calculator"], ["Unit converter", "unit-converter"], ["BMI calculator", "bmi-calculator"]]),
  tools("Developer utilities", "developer", [["JSON formatter", "json-formatter"], ["Regex tester", "regex-tester"], ["Base64 encoder", "base64-encoder"], ["Diff checker", "diff-checker"]]),
  tools("Study & research", "academic", [["Citation generator", "citation-generator"], ["GPA calculator", "gpa-calculator"], ["Scientific calculator", "scientific-calculator"], ["Flashcards", "flashcard-creator"]]),
  tools("Productivity", "productivity", [["Pomodoro timer", "pomodoro-timer"], ["To-do list", "todo-list"], ["Daily planner", "daily-planner"], ["Notes", "notes-app"]]),
  tools("Design & color", "design", [["Color palettes", "color-palette"], ["Color contrast", "color-contrast"], ["Color converter", "color-converter"], ["Lorem ipsum", "lorem-ipsum"]]),
  tools("Security", "security", [["Password generator", "password-generator"], ["Hash generator", "hash-generator"], ["JWT decoder", "jwt-decoder"]]),
  tools("Everyday utilities", "misc", [["QR code generator", "qr-generator"], ["Barcode generator", "barcode-generator"], ["Random generator", "random-generator"]]),
];

export const FOOTER_PLATFORM_SECTIONS: FooterSection[] = [
  { title: "Editors", href: "/create", links: [
    ["Resume Builder", "resume-builder"], ["Invoice Maker", "invoice-maker"], ["Presentation Maker", "presentation-maker"],
    ["Diagram Maker", "ai-diagram-generator"], ["Image Editor", "image-editor"], ["Video Editor", "video-editor"], ["Budget Planner", "budget-planner"], ["Certificate Maker", "certificate-maker"],
  ].map(([name, slug]) => ({ name, href: appPath(slug) })) },
  { title: "AI Studio", href: "/ai", links: [
    ["Math Solver", "math-solver"], ["Study Planner", "study-planner"], ["Research Assistant", "research-assistant"],
    ["Quiz Maker", "quiz-maker"], ["Farm Advisor", "farmer-ai"], ["Fitness AI", "fitness-ai"], ["Nutrition AI", "nutrition-ai"], ["Habit Tracker", "habit-tracker"],
  ].map(([name, slug]) => ({ name, href: appPath(slug) })) },
  { title: "AI apps", href: appPath("ai-chat"), links: [
    { name: "AI Chat", href: appPath("ai-chat") },
    { name: "AI Notes Generator", href: appPath("ai-notes-generator") }, { name: "AI Planning", href: appPath("ai-planning") },
    { name: "AI Diagram Generator", href: appPath("ai-diagram-generator") },
    { name: "AI Project Ideas", href: appPath("ai-project-ideas") },
  ] },
  { title: "Workflows", href: "/flows", links: [
    { name: "Workflow builder", href: "/flows#builder" }, { name: "PDF images under 200 KB", href: "/flows/pdf-images-200kb" },
    { name: "Email-ready images", href: "/flows/image-email-pack" }, { name: "Photos to PDF", href: "/flows/photos-letter-pdf" },
    { name: "Text analysis reports", href: "/flows/text-analysis" }, { name: "CSV to JSON", href: "/flows/csv-json-pack" },
  ] },
  { title: "Guides", href: "/guides", links: [
    { name: "All guides", href: "/guides" }, { name: "PDF tools guide", href: "/guides/pdf-tools-guide" },
    { name: "Resize images without losing quality", href: "/guides/how-to-resize-images-without-losing-quality" },
    { name: "Regex for beginners", href: "/guides/regular-expressions-for-beginners-regex-guide" },
    { name: "Compound interest explained", href: "/guides/the-math-of-compound-interest-wealth-guide" },
  ] },
  { title: "Your workspace", href: "/me", links: [
    { name: "Account & settings", href: "/me?tab=settings" }, { name: "Saved favorites", href: "/me?tab=favorites" },
    { name: "Activity history", href: "/me?tab=history" }, { name: "Saved results", href: "/me?tab=saved" },
  ] },
  { title: "About & support", href: "/about", links: [
    { name: "About MyToolsBox", href: "/about" }, { name: "Contact & feedback", href: "/contact" },
    { name: "Privacy policy", href: "/privacy" }, { name: "Terms of service", href: "/terms" },
  ] },
];
