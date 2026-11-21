// Manifest validator behind `npm run check:tools` (blueprint section 11, step 4 and section 16).
import { SPACES } from "@/spaces";
import { PORT_TYPES, type ToolManifest } from "./types";

export interface Issue {
  id: string;
  level: "error" | "warning";
  message: string;
}

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const BRAND_WORDS = /\b(canva|photopea|snagit|runway|julius|photolemur|smallpdf|foxit|nitro|soda pdf|pdfelement|ilovepdf|tinywow|onlyoffice)\b/i;

export function validateManifests(manifests: ToolManifest[]): Issue[] {
  const issues: Issue[] = [];
  const err = (id: string, message: string) => issues.push({ id, level: "error", message });
  const warn = (id: string, message: string) => issues.push({ id, level: "warning", message });
  const ids = new Set<string>();
  const paths = new Set<string>();
  const legacy = new Map<string, string>();
  const all = new Set(manifests.map((m) => m.id));

  for (const m of manifests) {
    const space = SPACES.find((s) => s.id === m.space);
    if (ids.has(m.id)) err(m.id, "duplicate id");
    ids.add(m.id);
    if (m.id !== `${m.space}.${m.slug}`) err(m.id, `id must be "${m.space}.${m.slug}"`);
    if (!space) err(m.id, `unknown space "${m.space}"`);
    else if (!space.categories.some((c) => c.id === m.category)) err(m.id, `unknown category "${m.category}" in ${m.space}`);
    if (!SLUG.test(m.slug)) err(m.id, `slug "${m.slug}" is not kebab-case`);
    const path = `/${m.space}/${m.slug}`;
    if (paths.has(path)) err(m.id, `duplicate path ${path}`);
    paths.add(path);

    for (const slug of m.legacySlugs ?? []) {
      const owner = legacy.get(slug);
      if (owner) err(m.id, `legacy slug "${slug}" already claimed by ${owner}`);
      legacy.set(slug, m.id);
    }

    for (const port of [...m.input, ...m.output]) {
      if (!PORT_TYPES.includes(port.type)) err(m.id, `invalid port type "${port.type}"`);
    }
    if (m.template === "file" && m.input.length === 0) err(m.id, "file tools need at least one input port");
    if (m.engine === "ai" && !m.aiTask) err(m.id, "AI tools need an aiTask");

    const { title, description, h1 } = m.seo;
    if (!title || title.length > 60) err(m.id, `SEO title must be 1–60 chars (has ${title?.length ?? 0})`);
    if (description.length < 140 || description.length > 160) err(m.id, `meta description must be 140–160 chars (has ${description.length})`);
    if (!h1) err(m.id, "missing h1");
    if (/mytoolsbox/i.test(title)) err(m.id, "SEO title must not contain the brand (the layout adds it)");
    const text = [m.name, title, description, ...m.keywords, ...m.faq.flatMap((f) => [f.q, f.a])].join(" ");
    if (BRAND_WORDS.test(text)) err(m.id, "names another company's product");

    if (m.faq.length < 4) err(m.id, `FAQ needs at least 4 items (has ${m.faq.length})`);
    if (m.faq.length > 8) warn(m.id, `FAQ has ${m.faq.length} items; 4–8 reads best`);
    if (m.keywords.length === 0) err(m.id, "missing keywords");
    if (m.jobs.length === 0) warn(m.id, "no job phrases for search");
    for (const r of m.related) if (!all.has(r)) err(m.id, `related tool "${r}" does not exist`);
    if (m.related.length < 3) warn(m.id, "fewer than 3 related tools");
  }
  return issues;
}
