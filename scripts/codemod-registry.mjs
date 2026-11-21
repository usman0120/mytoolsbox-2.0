// One-time codemod (blueprint section 25, M3): split the old tool/app registries into
// src/tools/{space}/{slug}/{manifest.ts,ui.tsx,engine.ts?} with legacySlugs, moving files with git mv.
// Usage: node scripts/codemod-registry.mjs            (skips tools that already have a manifest)
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1")), "..");
const rel = (p) => path.join(root, p);

// old slug → [space, category, new slug, kind]   kind: t = tool catalog, a = app catalog
const MAP = `
t image-compressor media image-edit compress-image
t image-resizer media image-edit resize-image
t image-cropper media image-edit crop-image
t image-rotator media image-edit rotate-image
t image-watermarker media image-edit watermark-image
t image-grayscale media image-edit grayscale-image
t image-blur-sharpen media image-edit blur-sharpen-image
t image-text-overlay media image-edit add-text-to-image
t auto-enhance-photo media image-edit auto-enhance-photo
t image-converter media image-convert convert-image
t image-to-text-ocr media image-convert image-to-text
t background-remover media ai-image remove-background
t video-to-gif media video video-to-gif
t video-compressor media video compress-video
t video-resizer media video resize-video
t merge-videos media video merge-videos
t screen-recorder media video screen-recorder
t audio-cutter media audio audio-cutter
t audio-converter media audio audio-converter
t mp4-mp3-converter media audio mp4-to-mp3
t extract-audio-from-video media audio extract-audio
t text-to-speech media audio text-to-speech
t speech-to-text media audio speech-to-text
a image-editor media image-edit photo-editor
a video-editor media video video-editor
t design-studio create design design
t color-palette create design color-palette-generator
a presentation-maker create design presentation-maker
a certificate-maker create design certificate-maker
a ai-diagram-generator create diagrams diagram
t qr-generator create qr-barcodes qr-code-generator
t barcode-generator create qr-barcodes barcode-generator
t barcode-scanner create qr-barcodes barcode-scanner
t json-formatter dev format-validate json-formatter
t json-validator dev format-validate json-validator
t regex-tester dev format-validate regex-tester
t sql-formatter dev format-validate sql-formatter
t html-formatter dev format-validate html-formatter
t css-formatter dev format-validate css-formatter
t diff-checker dev format-validate diff-checker
t base64-encoder dev encode-decode base64-encoder
t url-encoder dev encode-decode url-encoder
t hash-generator dev encode-decode hash-generator
t jwt-decoder dev encode-decode jwt-decoder
t timestamp-converter dev encode-decode timestamp-converter
t uuid-generator dev generators uuid-generator
t password-generator dev generators password-generator
t cron-helper dev generators cron-builder
t lorem-ipsum dev generators lorem-ipsum
t random-generator dev generators random-generator
t ai-regex-builder dev generators ai-regex-builder
t ai-sql-assistant dev generators ai-sql-assistant
t color-contrast dev web-seo color-contrast-checker
t color-converter dev web-seo color-converter
t http-status dev web-seo http-status-codes
t mime-types dev web-seo mime-types
t user-agent-parser dev web-seo user-agent-parser
t api-request-builder dev web-seo api-request-tester
t markdown-preview dev docs-diagrams markdown-editor
t ai-doc-generator dev docs-diagrams code-doc-generator
t ai-error-explainer dev docs-diagrams error-explainer
t ai-api-doc-generator dev docs-diagrams api-doc-generator
t equation-solver study maths equation-solver
t equation-to-latex-converter study maths latex-equation-editor
t citation-generator study writing-citing citation-generator
t pdf-highlighter-notes study writing-citing pdf-highlighter
t flashcard-creator study exam-prep flashcards
a quiz-maker study exam-prep quiz-maker
t gpa-calculator study grades gpa-calculator
t pomodoro-timer study planning pomodoro-timer
t study-timer study planning study-timer
a study-planner study planning study-planner
t loan-calculator calc finance loan-calculator
t currency-converter calc finance currency-converter
t profit-calculator calc finance profit-calculator
t margin-calculator calc finance margin-calculator
t tax-calculator calc finance tax-calculator
t salary-calculator calc finance salary-calculator
t roi-calculator calc finance roi-calculator
t break-even-calculator calc finance break-even-calculator
a budget-planner calc finance budget-planner
t bmi-calculator calc health bmi-calculator
t percentage-calculator calc maths percentage-calculator
t scientific-calculator calc maths scientific-calculator
t statistics-calculator calc maths statistics-calculator
t matrix-calculator calc maths matrix-calculator
t age-calculator calc date-time age-calculator
t unit-converter calc units unit-converter
t word-counter work text word-counter
t case-converter work text case-converter
t text-cleaner work text text-cleaner
t text-annotator work text text-annotator
t grammar-checker work text grammar-checker
t paraphrase-tool work text paraphraser
t text-summarizer work text summarizer
a invoice-maker work business-docs invoice-generator
t quotation-generator work business-docs quotation-generator
t proposal-generator work business-docs proposal-generator
t contract-generator work business-docs contract-generator
t business-name-generator work business-docs business-name-generator
t social-media-content-generator work business-docs social-media-post-generator
a resume-builder work career resume-builder
t cover-letter-generator work career cover-letter-generator
t todo-list work productivity todo-list
t kanban-board work productivity kanban-board
t notes-app work productivity notepad
t daily-planner work productivity daily-planner
t stopwatch work productivity stopwatch
t countdown-timer work productivity countdown-timer
t file-organizer work productivity file-organizer
a habit-tracker work productivity habit-tracker
a math-solver ai learn math-solver
a research-assistant ai learn research-assistant
a ai-notes-generator ai learn notes-generator
a ai-project-ideas ai build project-ideas
a ai-planning ai plan planner
a farmer-ai ai grow farm-advisor
a ai-chat ai everyday chat
t ai-text-generator ai everyday writer
a fitness-ai ai everyday fitness-coach
a nutrition-ai ai everyday nutrition-guide
`.trim().split("\n").map((l) => l.trim().split(/\s+/));

function loadCatalog(file, exportName) {
  const src = fs.readFileSync(rel(file), "utf8");
  const out = ts.transpileModule(src, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const mod = { exports: {} };
  const stub = () => new Proxy({ RETIRED_TOOLS: {}, RETIRED_APPS: {}, LEGACY_TOOL_PATHS: {}, LEGACY_APP_PATHS: {}, canonicalAppId: (x) => x }, { get: (t, k) => (k in t ? t[k] : () => undefined) });
  new Function("exports", "module", "require", out)(mod.exports, mod, stub);
  return mod.exports[exportName];
}

function loaders(file) {
  const s = fs.readFileSync(rel(file), "utf8");
  const map = {};
  for (const m of s.matchAll(/"([a-z0-9-]+)": dynamic\(\(\) => import\("@\/([^"]+)"\)\.then\(\((\w+)\) => \(\{ default: \3\.([A-Za-z0-9_]+) \}\)\)/g)) map[m[1]] = { target: m[2], component: m[4] };
  return map;
}

const tools = Object.fromEntries(loadCatalog("src/content/tools/registry.ts", "toolRegistry").map((t) => [t.slug, t]));
const apps = Object.fromEntries(loadCatalog("src/content/apps/registry.ts", "appRegistry").map((t) => [t.slug, t]));
const toolLoaders = loaders("src/features/tool-engine.tsx");
const appLoaders = loaders("src/features/app-engine.tsx");
const newId = Object.fromEntries(MAP.map(([k, old, space, , slug]) => [`${k}:${old}`, `${space}.${slug}`]));

const BRANDS = /\b(canva|photopea|snagit|runway|julius|photolemur|smallpdf|foxit|nitro|pdfelement|ilovepdf|tinywow|onlyoffice|chatgpt|grammarly|quillbot|notion|trello|todoist)\b/gi;
const clean = (s = "") => s.replace(BRANDS, "").replace(/\s{2,}/g, " ").replace(/\s+([,.])/g, "$1").trim();

const MIME = (m) =>
  m === "application/pdf" ? "pdf" : m.startsWith("image/") ? "image" : m.startsWith("video/") ? "video" : m.startsWith("audio/") ? "audio"
  : /wordprocessingml|msword|opendocument\.text|rtf/.test(m) ? "docx" : /spreadsheetml|ms-excel/.test(m) ? "xlsx" : m === "text/csv" ? "csv"
  : /zip/.test(m) ? "zip" : m === "text/markdown" ? "markdown" : m === "application/json" ? "json" : m.startsWith("text/") ? "text" : "any-file";
const ports = (list = []) => {
  const types = [...new Set(list.map(MIME))];
  return types.length ? [{ type: types[0], accept: list.filter((m) => MIME(m) === types[0]) }] : [];
};

function fitDescription(base, suffixes) {
  const sentences = clean(base).replace(/^Free\s+/i, "").split(/(?<=[.!?])\s+/).filter(Boolean).map((x) => (/[.!?]$/.test(x) ? x : x + "."));
  let out = "";
  for (const s of sentences) if ((out + " " + s).trim().length <= 160 - 26) out = (out + " " + s).trim();
  if (!out) out = sentences[0].slice(0, 120).replace(/\s+\S*$/, "") + ".";
  for (const s of suffixes) if (out.length < 140 && (out + " " + s).length <= 160) out += " " + s;
  return out;
}

function fitTitle(seoTitle, name) {
  const base = clean(seoTitle || name).replace(/^Free\s+/i, "").replace(/\s*\|.*$/, "");
  if (base.length <= 60) return base.replace(/\s+-\s+/, " – ");
  const first = base.split(/\s+[-–]\s+/)[0];
  return first.length <= 60 ? first : name.slice(0, 60);
}

const HOW = {
  file: ["Add your file, or drop it on the page.", "Adjust the options if you need to.", "Download the result."],
  text: ["Paste or type your input.", "Pick the options you need.", "Copy or download the result."],
  calculator: ["Enter your values.", "Read the result and how it was worked out.", "Change any value to compare."],
  ai: ["Describe what you need, or start from an example.", "Generate the answer.", "Copy it, refine your request or regenerate."],
  editor: ["Start from a template or a blank page.", "Edit the content and layout.", "Export or save your work."],
};

const generatedFaq = (name, engine) =>
  engine === "ai"
    ? [
        { q: "Where is my text sent?", a: `${name} sends your request to our AI provider to write the answer. Do not include passwords or sensitive personal details.` },
        { q: "Is it free?", a: "Yes. AI features are free within a daily allowance: 10 requests a day without an account and 40 when you sign in." },
        { q: "Can AI answers be wrong?", a: "Yes. Treat answers as a helpful draft and check important facts before you rely on them." },
        { q: "Does it work on my phone?", a: "Yes. It works in any modern browser on phones, tablets and computers." },
      ]
    : [
        { q: "Is my data uploaded?", a: `No. ${name} runs in your browser, so your files and text stay on your device.` },
        { q: "Is it free?", a: "Yes. There is no sign-up, no watermark and no daily limit." },
        { q: "Does it work on my phone?", a: "Yes. It works in any modern browser on phones, tablets and computers." },
        { q: "Does it work offline?", a: "Once the page has loaded, the tool keeps working without an internet connection." },
      ];

const moved = {};
const manifests = {};
for (const [kind, old, space, category, slug] of MAP) {
  const dir = `src/tools/${space}/${slug}`;
  if (fs.existsSync(rel(`${dir}/manifest.ts`))) continue;
  const item = (kind === "a" ? apps : tools)[old];
  const loader = (kind === "a" ? appLoaders : toolLoaders)[old];
  if (!item || !loader) {
    console.warn(`skip ${kind}:${old} (catalog ${!!item}, loader ${!!loader})`);
    continue;
  }
  fs.mkdirSync(rel(dir), { recursive: true });
  const uiFrom = `src/${loader.target}.tsx`;
  const uiSrc = fs.readFileSync(rel(uiFrom), "utf8");
  execFileSync("git", ["mv", uiFrom, `${dir}/ui.tsx`], { cwd: root });
  moved[`@/${loader.target}`] = `@/tools/${space}/${slug}/ui`;
  moved[path.dirname(uiFrom)] = path.dirname(uiFrom); // dir of origin (for relative-import fixups)
  const logic = `src/${loader.target.replace(/-engine$/, "")}.ts`;
  if (logic !== `src/${loader.target}.ts` && fs.existsSync(rel(logic))) {
    execFileSync("git", ["mv", logic, `${dir}/engine.ts`], { cwd: root });
    moved[`@/${loader.target.replace(/-engine$/, "")}`] = `@/tools/${space}/${slug}/engine`;
  }
  const isAi = /@\/lib\/ai\b|\/api\/ai|completeViaServer|useAiQuota/.test(uiSrc);
  const template = isAi ? "ai" : kind === "a" ? "editor" : space === "calc" || /calculator|solver/.test(slug) ? "calculator" : ports(item.inputTypes).some((p) => p.type !== "text") ? "file" : "text";
  const name = clean(item.name).replace(/^Free\s+/i, "");
  const oldFaq = (item.faq ?? []).map((f) => ({ q: clean(f.question), a: clean(f.answer) })).filter((f) => f.q && f.a);
  const faq = [...oldFaq];
  for (const g of generatedFaq(name, isAi ? "ai" : "client")) if (faq.length < 4 && !faq.some((f) => f.q.toLowerCase() === g.q.toLowerCase())) faq.push(g);
  const related = [...new Set((item.relatedTools ?? []).map((r) => newId[`t:${r}`] ?? newId[`a:${r}`]).filter(Boolean))].filter((r) => r !== `${space}.${slug}`);
  const input = template === "file" ? ports(item.inputTypes) : [];
  manifests[`${space}.${slug}`] = {
    id: `${space}.${slug}`, space, category, slug, name,
    tagline: clean(item.shortDescription || item.description).replace(/\.?$/, "."),
    keywords: [...new Set((item.keywords ?? []).map((k) => clean(k).toLowerCase()).filter(Boolean))].slice(0, 8),
    synonyms: (item.keywords ?? []).slice(1, 4).map((k) => clean(k).toLowerCase()).filter(Boolean),
    jobs: (item.features ?? []).slice(0, 3).map((f) => clean(f).toLowerCase()),
    template, input: input.length ? input : template === "file" ? [{ type: "any-file" }] : [],
    output: ports(item.outputTypes), engine: isAi ? "ai" : "client", ...(isAi ? { aiTask: "general" } : {}),
    seo: {
      title: fitTitle(item.seoTitle, name),
      description: fitDescription(item.seoDescription || item.description, isAi ? ["Free daily AI allowance, no sign-up.", "Works on any device."] : ["Free, private, no sign-up.", "Runs in your browser.", "Works on any device."]),
      h1: name,
    },
    howTo: HOW[template], faq: faq.slice(0, 8), related, legacySlugs: [old], status: "live", offline: !isAi,
    _kind: kind,
  };
}

// Fix up imports across the codebase for moved files.
const files = execFileSync("git", ["ls-files", "src"], { cwd: root, encoding: "utf8" }).split("\n").filter((f) => /\.(ts|tsx)$/.test(f));
for (const f of files) {
  let s = fs.readFileSync(rel(f), "utf8");
  let t = s;
  for (const [a, b] of Object.entries(moved)) if (a.startsWith("@/")) t = t.split(`"${a}"`).join(`"${b}"`);
  if (t !== s) fs.writeFileSync(rel(f), t);
}
// Relative imports inside moved UI/engine files now need absolute aliases.
for (const id of Object.keys(manifests)) {
  const [space, slug] = id.split(".");
  for (const fname of ["ui.tsx", "engine.ts"]) {
    const f = rel(`src/tools/${space}/${slug}/${fname}`);
    if (!fs.existsSync(f)) continue;
    const origin = Object.entries(moved).find(([, b]) => b === `@/tools/${space}/${slug}/${fname.replace(/\.tsx?$/, "")}`)?.[0];
    if (!origin) continue;
    const originDir = path.posix.dirname(origin.slice(2));
    let s = fs.readFileSync(f, "utf8");
    s = s.replace(/from "(\.{1,2}\/[^"]+)"/g, (m, p) => {
      if (p === "./engine" || p === "./ui") return m;
      const abs = "@/" + path.posix.normalize(path.posix.join(originDir, p));
      return `from "${moved[abs] ?? abs}"`;
    });
    fs.writeFileSync(f, s);
  }
}

for (const [id, m] of Object.entries(manifests)) {
  const { _kind, ...data } = m;
  fs.writeFileSync(rel(`src/tools/${m.space}/${m.slug}/manifest.ts`), `import type { ToolManifest } from "@/tools/types";\n\nconst manifest: ToolManifest = ${JSON.stringify(data, null, 2)};\n\nexport default manifest;\n`);
}
fs.writeFileSync(rel("scripts/.codemod-out.json"), JSON.stringify(Object.fromEntries(Object.entries(manifests).map(([id, m]) => [id, { kind: m._kind, old: m.legacySlugs[0] }])), null, 2));
console.log(`wrote ${Object.keys(manifests).length} manifests`);
