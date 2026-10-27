export interface FooterSection {
  title: string;
  href: string;
  links: { name: string; href: string }[];
}

function tools(title: string, category: string, entries: [string, string][]): FooterSection {
  return { title, href: `/tools?category=${category}`, links: entries.map(([name, slug]) => ({ name, href: `/tools/${slug}` })) };
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
  tools("Study & research", "academic", [["Citation generator", "citation-generator"], ["GPA calculator", "gpa-calculator"], ["Scientific calculator", "scientific-calculator"], ["Flashcard generator", "flashcard-generator"]]),
  tools("Productivity", "productivity", [["Pomodoro timer", "pomodoro-timer"], ["To-do list", "todo-list"], ["Daily planner", "daily-planner"], ["Online notepad", "online-notepad"]]),
  tools("Design & color", "design", [["Color palettes", "color-palette"], ["Color contrast", "color-contrast"], ["Color converter", "color-converter"], ["Lorem ipsum", "lorem-ipsum"]]),
  tools("Security", "security", [["Password generator", "password-generator"], ["Hash generator", "hash-generator"], ["JWT decoder", "jwt-decoder"]]),
  tools("Everyday utilities", "misc", [["QR code generator", "qr-generator"], ["Barcode generator", "barcode-generator"], ["Random generator", "random-generator"]]),
];

export const FOOTER_PLATFORM_SECTIONS: FooterSection[] = [
  { title: "Creative & business apps", href: "/apps", links: [
    ["Resume Builder", "resume-builder"], ["Invoice Maker", "invoice-maker"], ["Presentation Maker", "presentation-maker"],
    ["Diagram Maker", "diagram-maker"], ["Image Editor", "image-editor"], ["Video Editor", "video-editor"], ["Budget Planner", "budget-planner"], ["Certificate Maker", "certificate-maker"],
  ].map(([name, slug]) => ({ name, href: `/apps/${slug}` })) },
  { title: "Learning & everyday apps", href: "/apps", links: [
    ["Math Solver", "math-solver"], ["Study Planner", "study-planner"], ["Research Assistant", "research-assistant"],
    ["Quiz Maker", "quiz-maker"], ["Farmer AI", "farmer-ai"], ["Fitness AI", "fitness-ai"], ["Nutrition AI", "nutrition-ai"], ["Habit Tracker", "habit-tracker"],
  ].map(([name, slug]) => ({ name, href: `/apps/${slug}` })) },
  { title: "AI workspace", href: "/ai", links: [
    { name: "AI Chat", href: "/ai" }, { name: "Prompt Library", href: "/ai/prompts" },
    { name: "AI Notes Generator", href: "/apps/ai-notes-generator" }, { name: "AI Planning", href: "/apps/ai-planning" },
    { name: "AI Diagram Generator", href: "/apps/ai-diagram-generator" },
    { name: "AI Project Ideas", href: "/apps/ai-project-ideas" },
  ] },
  { title: "Workflow hubs", href: "/hubs", links: ["Students", "Developers", "Business", "Designers", "Writers", "Researchers", "Farmers", "Everyone"].map((name) => ({ name, href: `/hubs/${name.toLowerCase()}` })) },
  { title: "Your workspace", href: "/settings", links: [
    { name: "Account & settings", href: "/settings?tab=account" }, { name: "Saved favorites", href: "/settings?tab=favorites" },
    { name: "Activity history", href: "/settings?tab=history" }, { name: "Resources & templates", href: "/resources" },
    { name: "Blog & guides", href: "/blog" },
  ] },
  { title: "About & support", href: "/about", links: [
    { name: "About MyToolsBox", href: "/about" }, { name: "Contact & feedback", href: "/contact" },
    { name: "Privacy policy", href: "/privacy" }, { name: "Terms of service", href: "/terms" },
  ] },
];
