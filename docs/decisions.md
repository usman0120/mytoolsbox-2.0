# Decisions

| Date | Decision | Reason |
| --- | --- | --- |
| 2026-11-21 | Work on branch restructure/v3; stop for review after each phase | User choice |
| 2026-11-21 | Only Gemini + Groq keys exist; Upstash, Turnstile, Sentry, PostHog built behind interfaces with no-op fallback when env is missing | User choice |
| 2026-11-21 | Anonymous users get AI (10/day), signed-in 40/day, global cap 1200/day; counters in Upstash if configured, else in-memory | Blueprint section 13; M5 adds Turnstile and response cache |
| 2026-11-21 | Duplicates kept by stronger engine: apps invoice-maker, habit-tracker, ai-diagram-generator; tools flashcard-creator, notes-app, paraphrase-tool, text-summarizer | Final /{space} slugs come in M3 |
| 2026-11-21 | Root audit scripts compare_slugs/count_errors kept as scripts/catalog-audit.cjs and scripts/lint-summary.cjs | Used by catalog integrity tests until check:tools exists |
| 2026-11-21 | Fonts self-hosted from npm (geist, @fontsource-variable/bricolage-grotesque) instead of next/font/google | No build-time dependency on fonts.gstatic.com; blueprint asks for self-hosting |
| 2026-11-21 | Primary = ink (stone-900 / near-white in dark); lime #C6F432 only as --lime accent; focus ring lime-700 in light for 3:1 contrast | Lime text on white fails WCAG |
| 2026-11-21 | Shell links to Spaces point at existing /tools?category= listings until M3 adds /{space} routes (src/components/shell/space-links.ts) | No link may 404 |
| 2026-11-21 | Migration bridge: old catalog entries stay as data for search/hubs/listings; toolPath() sends links to /{space}/{slug}; src/config/legacy-tool-paths.ts maps old slugs (verified by check:tools) | Move one Space at a time without breaking links |
| 2026-11-21 | New tool pages load UIs from src/tools/ui-registry.tsx (manifest id). Old features/tool-engine.tsx keeps repointed entries only for the legacy audit until all Spaces move | Transitional; delete both old maps after M3 |
| 2026-11-21 | Former "Edit PDF" engine (compress/watermark/rotate/to Word/text) published as Rotate PDF; brand PDF slugs redirect to /docs until a real edit/sign-text tool exists | Copy must match what the tool does |
| 2026-11-21 | Five unused engines published: Sign PDF, Watermark PDF, PDF to Text, Compare PDFs, PDF to Markdown; Repair PDF deleted | Working code with no route; repair claims were not credible |
| 2026-11-21 | Remaining 121 tools/apps moved by scripts/codemod-registry.mjs; manifest copy derived from the old catalog (titles, descriptions, FAQs) plus standard privacy/cost/device answers, then validated; 16 descriptions hand-written | Fast, honest baseline; top tools get hand-tuned copy in M7 |
| 2026-11-21 | /ai is now the AI Studio home; /apps/{slug} 308s to /{space}/{slug} via LEGACY_APP_PATHS | Blueprint URL scheme |
| 2026-11-21 | AI Notes Generator and Quiz AI assistant were template fillers with a fake delay; now call the AI gateway (src/lib/ai/study-generators.ts) | No fake AI |
| 2026-11-21 | File Tray stores blobs in IndexedDB (not OPFS) with 24 h expiry unless pinned | Works in every browser today; OPFS can replace it behind src/runtime/file-store.ts |
| 2026-11-21 | ToolSurface bridge connects all existing tool UIs to the Tray: captures picked files and blob downloads, feeds files via the tool own file input (?tray=id, drop, paste), shows Continue with | Gives every tool Tray/Continue-with now; per-tool rewrites to the engine template can follow gradually |
| 2026-11-21 | Worker pool and engine contract execution deferred | No engine uses the contract yet; adding the pool now would be dead code |
| 2026-11-21 | /workflows → /flows, presets get SEO pages at /flows/{id}; saved Flows keep the same localStorage key, so no importer was needed | Existing saved definitions load unchanged |
| 2026-11-21 | Priority AI apps use server-side task presets (/api/ai/{task}): prompts in src/ai-apps/prompts, JSON tasks schema-validated with one retry, Markdown tasks streamed, 24 h response cache | Blueprint section 13; prompts never come from the browser for these apps |
| 2026-11-21 | Generic /api/ai stays for the remaining AI tools but always prepends a server guard and caps client prompts at 6k chars | Avoids an open general-purpose proxy until those tools move to tasks |
| 2026-11-21 | Math answers are checked on-device by substituting claimed roots (src/lib/math/verify.ts) | Blueprint CAS check without a heavy CAS dependency |
| 2026-11-21 | Model routes verified against the account model list; writing tasks prefer Groq, maths/farm/vision prefer Gemini; every provider call has a timeout | Old fallback models were retired; Gemini free quota and 503 overloads seen in testing |
| 2026-11-21 | Fake crop-photo analysis and non-functional maths photo OCR replaced with Gemini vision tasks | No simulated AI |
