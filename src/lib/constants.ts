export const SITE_CONFIG = {
  name: "MyToolsBox",
  tagline: "Useful things for everyone",
  description: "One place for small jobs, daily work, learning, creation and problem solving.",
  domain: "mytoolsbox.me",
  url: "https://mytoolsbox.me",
} as const;

export const NAV_ITEMS = [
  { label: "Tools", href: "/tools" },
  { label: "Apps", href: "/apps" },
  { label: "Workflows", href: "/workflows" },
  { label: "AI", href: "/ai" },
  { label: "Hubs", href: "/hubs" },
  { label: "Resources", href: "/resources" },
] as const;

export const CATEGORIES = [
  { id: "documents", name: "Documents", icon: "FileText", description: "PDF, Word, text tools" },
  { id: "images", name: "Images", icon: "Image", description: "Compress, resize, convert images" },
  { id: "video", name: "Video", icon: "Video", description: "Trim, merge, convert video" },
  { id: "audio", name: "Audio", icon: "Music", description: "Convert, trim, extract audio" },
  { id: "writing", name: "Writing", icon: "PenLine", description: "Grammar, summarize, paraphrase" },
  { id: "calculators", name: "Calculators", icon: "Calculator", description: "Math, finance, health calculators" },
  { id: "developer", name: "Developer", icon: "Code", description: "JSON, regex, encoding tools" },
  { id: "academic", name: "Academic", icon: "GraduationCap", description: "Study, citation, research tools" },
  { id: "productivity", name: "Productivity", icon: "Timer", description: "Planners, timers, organizers" },
  { id: "design", name: "Design", icon: "Palette", description: "Color, layout, design tools" },
  { id: "security", name: "Security", icon: "Shield", description: "Password, encryption, security tools" },
  { id: "misc", name: "Misc", icon: "Wrench", description: "Other useful utilities" },
] as const;

export const AUDIENCES = [
  { id: "students", name: "Students", icon: "GraduationCap" },
  { id: "developers", name: "Developers", icon: "Code" },
  { id: "business", name: "Business", icon: "Briefcase" },
  { id: "designers", name: "Designers", icon: "Palette" },
  { id: "writers", name: "Writers", icon: "PenLine" },
  { id: "teachers", name: "Teachers", icon: "BookOpen" },
  { id: "researchers", name: "Researchers", icon: "Microscope" },
  { id: "farmers", name: "Farmers", icon: "Sprout" },
  { id: "everyone", name: "Everyone", icon: "Users" },
] as const;