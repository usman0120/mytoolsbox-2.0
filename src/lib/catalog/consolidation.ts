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
};
export const RETIRED_APPS: Record<string, string> = {
  "ai-quiz-generator": "/apps/quiz-maker?mode=ai",
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
