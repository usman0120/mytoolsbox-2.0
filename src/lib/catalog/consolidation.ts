import { LEGACY_APP_PATHS, LEGACY_TOOL_PATHS } from "@/config/legacy-tool-paths";

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
  smallpdf: "/docs",
  "foxit-pdf": "/docs",
  "nitro-pro": "/docs",
  "soda-pdf": "/docs",
  pdfelement: "/docs",
  "onlyoffice-editor": "/docs/word-to-pdf",
  "edit-pdf": "/docs",
  "jpg-to-pdf-merger": "/docs/jpg-to-pdf",
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
export const REMOVED_AI_PATHS = ["/ai/compare", "/ai/personas", "/ai/prompts"];

/** Follows a retired target through the migrated-tool map so every old URL is one hop. */
function resolveTarget(target: string): string {
  const match = /^\/(tools|apps)\/([a-z0-9-]+)(\?.*)?$/.exec(target);
  if (!match) return target;
  const map = match[1] === "tools" ? LEGACY_TOOL_PATHS : LEGACY_APP_PATHS;
  return Object.hasOwn(map, match[2]) ? map[match[2]] + (match[3] ?? "") : target;
}

export function consolidatedPath(pathname: string): string | undefined {
  const [, , slug] = pathname.split("/");
  if (pathname === `/tools/${slug}` && Object.hasOwn(LEGACY_TOOL_PATHS, slug)) return LEGACY_TOOL_PATHS[slug];
  if (pathname === `/tools/${slug}` && Object.hasOwn(RETIRED_TOOLS, slug)) return resolveTarget(RETIRED_TOOLS[slug]);
  if (pathname === `/apps/${slug}` && Object.hasOwn(LEGACY_APP_PATHS, slug)) return LEGACY_APP_PATHS[slug];
  if (pathname === `/apps/${slug}` && Object.hasOwn(RETIRED_APPS, slug)) return resolveTarget(RETIRED_APPS[slug]);
  if (REMOVED_AI_PATHS.includes(pathname)) return "/ai/chat";
}

export function canonicalAppId(id: string): string {
  const target = Object.hasOwn(RETIRED_APPS, id) ? RETIRED_APPS[id] : undefined;
  return target ? target.split("?")[0].split("/")[2] : id;
}
