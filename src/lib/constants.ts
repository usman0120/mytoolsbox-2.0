export const SITE_CONFIG = {
  name: "MyToolsBox",
  tagline: "Useful things for everyone",
  description: "One place for small jobs, daily work, learning, creation and problem solving.",
  domain: "mytoolsbox.me",
  url: "https://mytoolsbox.me",
  defaultLocale: "en",
} as const;

export const NAV_ITEMS = [
  { label: "Tools", href: "/tools" },
  { label: "Apps", href: "/apps" },
  { label: "AI", href: "/ai" },
  { label: "Hubs", href: "/hubs" },
  { label: "Blog", href: "/blog" },
  { label: "Resources", href: "/resources" },
] as const;

// ---------------------------------------------------------------------------
// Internationalization & Geo-Targeting Constants
// ---------------------------------------------------------------------------
export const SUPPORTED_LOCALES = [
  { code: "en", hreflang: "en", name: "English", flag: "🇺🇸", dir: "ltr" },
  { code: "es", hreflang: "es", name: "Español", flag: "🇪🇸", dir: "ltr" },
  { code: "fr", hreflang: "fr", name: "Français", flag: "🇫🇷", dir: "ltr" },
  { code: "de", hreflang: "de", name: "Deutsch", flag: "🇩🇪", dir: "ltr" },
  { code: "pt", hreflang: "pt", name: "Português", flag: "🇧🇷", dir: "ltr" },
  { code: "it", hreflang: "it", name: "Italiano", flag: "🇮🇹", dir: "ltr" },
  { code: "hi", hreflang: "hi", name: "हिन्दी", flag: "🇮🇳", dir: "ltr" },
  { code: "ar", hreflang: "ar", name: "العربية", flag: "🇸🇦", dir: "rtl" },
  { code: "ja", hreflang: "ja", name: "日本語", flag: "🇯🇵", dir: "ltr" },
  { code: "zh", hreflang: "zh", name: "中文", flag: "🇨🇳", dir: "ltr" },
] as const;

export const HREFLANG_LANGUAGES: Record<string, string> = {
  "x-default": "https://mytoolsbox.me",
  en: "https://mytoolsbox.me",
  es: "https://mytoolsbox.me?lang=es",
  fr: "https://mytoolsbox.me?lang=fr",
  de: "https://mytoolsbox.me?lang=de",
  pt: "https://mytoolsbox.me?lang=pt",
  it: "https://mytoolsbox.me?lang=it",
  hi: "https://mytoolsbox.me?lang=hi",
  ar: "https://mytoolsbox.me?lang=ar",
  ja: "https://mytoolsbox.me?lang=ja",
  zh: "https://mytoolsbox.me?lang=zh",
};

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
