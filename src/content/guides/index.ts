// Guides (blueprint section 16): former blog posts and resource guides in one shape at /guides/{slug}.
import { toolPath } from "@/config/legacy-tool-paths";
import { TOOL_MANIFESTS, toolUrl } from "@/tools/registry";
import { BLOG_POSTS } from "./articles";
import { RESOURCE_GUIDES } from "./reference";

const ALIASES: Record<string, string> = { "cron-generator": "cron-builder" };

/** Resolves a tool slug used in guide content: old catalog slug, then current slug, then a search. */
export function guideToolHref(slug: string): string {
  const legacy = toolPath(slug);
  if (!legacy.startsWith("/tools/")) return legacy;
  const current = TOOL_MANIFESTS.find((m) => m.slug === (ALIASES[slug] ?? slug));
  return current ? toolUrl(current) : `/search?q=${encodeURIComponent(slug.replace(/-/g, " "))}`;
}

export interface GuideLink {
  name: string;
  href: string;
  description: string;
}

export interface Guide {
  slug: string;
  title: string;
  description: string;
  metaTitle: string;
  metaDescription: string;
  category: string;
  readTime: string;
  /** ISO date, when known. */
  date?: string;
  keywords: string[];
  takeaways: string[];
  sections: { id: string; title: string; content: string; code?: string; tool?: GuideLink }[];
  faqs: { q: string; a: string }[];
  tools: GuideLink[];
}

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const REFERENCE_CATEGORY: Record<string, string> = {
  "getting-started": "Getting started",
  multimedia: "Images & media",
  developer: "Developer",
  productivity: "Productivity",
  security: "Security",
  writing: "Writing",
};

const fromArticles: Guide[] = BLOG_POSTS.map((p) => ({
  slug: p.slug,
  title: p.title,
  description: p.excerpt,
  metaTitle: p.metaTitle.replace(/\s*[|–-]\s*MyToolsBox.*$/i, ""),
  metaDescription: p.metaDescription,
  category: p.category,
  readTime: p.readTime,
  date: p.isoDate,
  keywords: p.keywords,
  takeaways: [],
  sections: p.sections.map((s) => ({
    id: s.id,
    title: s.title,
    content: s.content,
    tool: s.toolCallout ? { name: s.toolCallout.name, href: guideToolHref(s.toolCallout.slug), description: s.toolCallout.description } : undefined,
  })),
  faqs: p.faqs.map((f) => ({ q: f.question, a: f.answer })),
  tools: p.relatedTools.map((t) => ({ name: t.name, href: guideToolHref(t.slug), description: t.description })),
}));

const fromReference: Guide[] = RESOURCE_GUIDES.map((g) => ({
  slug: g.slug,
  title: g.title,
  description: g.description,
  metaTitle: g.title,
  metaDescription: g.description,
  category: REFERENCE_CATEGORY[g.category] ?? "Guides",
  readTime: g.readTime,
  keywords: [],
  takeaways: g.takeaways,
  sections: g.sections.map((s) => ({ id: slugify(s.title), title: s.title, content: s.content, code: s.codeSnippet })),
  faqs: [],
  tools: g.recommendedTools.map((t) => ({ name: t.name, href: guideToolHref(t.slug), description: t.description })),
}));

export const GUIDES: Guide[] = [...fromReference, ...fromArticles];

export function getGuide(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug);
}

export { CHEAT_SHEETS } from "./reference";
