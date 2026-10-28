export const NAV_MENUS = [
  { label: "Tools", href: "/tools", sections: [
    { title: "Browse categories", links: [{ label: "Documents & PDF", href: "/tools?category=documents" }, { label: "Images", href: "/tools?category=images" }, { label: "Video & audio", href: "/tools?category=video" }, { label: "Writing & text", href: "/tools?category=writing" }, { label: "Developer utilities", href: "/tools?category=developer" }, { label: "Calculators", href: "/tools?category=calculators" }] },
    { title: "Popular utilities", links: [{ label: "Merge PDFs", href: "/tools/pdf-merger" }, { label: "Compress images", href: "/tools/image-compressor" }, { label: "Format JSON", href: "/tools/json-formatter" }, { label: "Count words", href: "/tools/word-counter" }, { label: "Generate QR codes", href: "/tools/qr-generator" }, { label: "All tools", href: "/tools" }] },
  ] },
  { label: "Apps", href: "/apps", sections: [
    { title: "Work & create", links: [{ label: "AI Chat", href: "/apps/ai-chat" }, { label: "Resume Builder", href: "/apps/resume-builder" }, { label: "Presentation Maker", href: "/apps/presentation-maker" }, { label: "Image Editor", href: "/apps/image-editor" }] },
    { title: "Learn & plan", links: [{ label: "Math Solver", href: "/apps/math-solver" }, { label: "Quiz Maker", href: "/apps/quiz-maker" }, { label: "Study Planner", href: "/apps/study-planner" }, { label: "Explore all apps", href: "/apps" }] },
  ] },
  { label: "Workflows", href: "/workflows", sections: [
    { title: "Upload once, finish the job", links: [{ label: "PDF → images under 200 KB", href: "/workflows?preset=pdf-images-200kb" }, { label: "Email-ready image pack", href: "/workflows?preset=image-email-pack" }, { label: "Photos → Letter PDF", href: "/workflows?preset=photos-letter-pdf" }, { label: "Files → verification archive", href: "/workflows?preset=files-verified" }] },
    { title: "Your workflow workspace", links: [{ label: "Browse built-in workflows", href: "/workflows" }, { label: "Build, save & edit locally", href: "/workflows#builder" }, { label: "CSV → formatted JSON", href: "/workflows?preset=csv-json-pack" }, { label: "Text → analysis reports", href: "/workflows?preset=text-analysis" }] },
  ] },
  { label: "Explore", href: "/resources", sections: [
    { title: "Find your workspace", links: [{ label: "Role-based hubs", href: "/hubs" }, { label: "Blog & guides", href: "/blog" }, { label: "Resources & templates", href: "/resources" }, { label: "Search everything", href: "/search" }] },
    { title: "MyToolsBox", links: [{ label: "About the platform", href: "/about" }, { label: "Contact & feedback", href: "/contact" }, { label: "Privacy policy", href: "/privacy" }, { label: "Your account", href: "/settings" }] },
  ] },
];
