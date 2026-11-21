// One discoverable product per workflow. Old bookmarks and saved records keep
// working through redirects; no user's stored IDs or draft storage are deleted.
export const RETIRED_TOOLS: Record<string, string> = {
  "resume-builder": "/apps/resume-builder?mode=resume",
  "cv-maker": "/apps/resume-builder?mode=cv",
  "ai-resume-maker": "/apps/resume-builder?mode=ai",
  "quiz-maker": "/apps/quiz-maker",
  "quiz-generator": "/apps/quiz-maker?mode=editor",
  "ai-presentation-maker": "/apps/presentation-maker?mode=ai",
  "mp3-cutter": "/tools/audio-cutter",
  "video-to-gif-maker": "/tools/video-to-gif",
  // Pages named after other companies' products → generic tools (blueprint section 25)
  canva: "/tools/design-studio",
  photopea: "/apps/image-editor",
  snagit: "/tools/screen-recorder",
  "awesome-screenshot": "/tools/screen-recorder",
  runway: "/apps/video-editor",
  "julius-ai": "/apps/ai-chat",
  photolemur: "/tools/auto-enhance-photo",
  "perfectly-clear": "/tools/auto-enhance-photo",
  "softcolor-auto-enhance": "/tools/auto-enhance-photo",
  smallpdf: "/tools/edit-pdf",
  "foxit-pdf": "/tools/edit-pdf",
  "nitro-pro": "/tools/edit-pdf",
  "soda-pdf": "/tools/edit-pdf",
  pdfelement: "/tools/edit-pdf",
  "onlyoffice-editor": "/tools/word-to-pdf-converter",
  "rfp-monkey": "/tools/proposal-generator",
  // Duplicates → one canonical product each
  "invoice-generator": "/apps/invoice-maker",
  "habit-tracker": "/apps/habit-tracker",
  "flashcard-generator": "/tools/flashcard-creator",
  "online-notepad": "/tools/notes-app",
  "paragraph-rewriter": "/tools/paraphrase-tool",
  "ai-summary-tool": "/tools/text-summarizer",
  // Tools that cannot work honestly client-side and free
  "url-shortener": "/tools/api-request-builder",
  "webhook-tester": "/tools/api-request-builder",
  "plagiarism-checker": "/tools/grammar-checker",
  "ai-image-generator": "/apps/ai-chat",
};
export const RETIRED_APPS: Record<string, string> = {
  "ai-quiz-generator": "/apps/quiz-maker?mode=ai",
  "diagram-maker": "/apps/ai-diagram-generator",
};
export const REMOVED_AI_PATHS = ["/ai/compare", "/ai/personas"];

export function consolidatedPath(pathname: string): string | undefined {
  if (pathname === "/ai") return "/apps/ai-chat";
  const [, , slug] = pathname.split("/");
  if (pathname === `/tools/${slug}` && Object.hasOwn(RETIRED_TOOLS, slug)) return RETIRED_TOOLS[slug];
  if (pathname === `/apps/${slug}` && Object.hasOwn(RETIRED_APPS, slug)) return RETIRED_APPS[slug];
  if (REMOVED_AI_PATHS.includes(pathname)) return "/apps/ai-chat";
}

export function canonicalAppId(id: string): string {
  const target = Object.hasOwn(RETIRED_APPS, id) ? RETIRED_APPS[id] : undefined;
  return target ? target.split("?")[0].split("/")[2] : id;
}
