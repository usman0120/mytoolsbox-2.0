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
| 2026-11-21 | Workspace data: users/{uid} holds profile, prefs and favorites (manifest ids); history/items/flows/collections are subcollections; signed-out favorites and history in localStorage, merged on sign-in | Blueprint section 14 (one read per session) |
| 2026-11-21 | Schema-2 data migrated client-side on first sign-in (favorites, preferences, saved → items); old docs stay readable/deletable until 2027-02-19 | No admin SDK or service account needed |
| 2026-11-21 | Account deletion runs in the browser (owner deletes own docs, then deleteUser) and requires a sign-in within the last 5 minutes before anything is removed | Avoids half-deleted accounts without firebase-admin |
| 2026-11-21 | Old /tools/[slug] and /apps/[slug] routes, loader maps and the catalog audit removed; /settings, /favorites, /history, /account, /dashboard redirect to /me | Every tool lives on manifest routes now |
| 2026-11-21 | Saved Flows stay in browser storage for now (shown in /me) | Account sync for Flows can follow; rules already allow it |
| 2026-11-21 | Blog posts and resource guides served as /guides (data moved to src/content/guides); hubs redirect to Spaces; /apps to /ai; /tools?category= to the Space | Blueprint section 25 URL rules |
| 2026-11-21 | Search and the Ask palette use a static /search-index.json built from manifests, fetched on first open | Keeps the shell light; works offline once cached |
| 2026-11-21 | Unknown /tools/{slug} URLs 307 to /search?q=… instead of 404 | Old content links to tools that never existed |
| 2026-11-21 | Hand-written copy for the 10 top generated tools; remaining generated copy to be tuned from Search Console data | Depth over count |
| 2026-11-21 | Hand-written service worker (public/sw.js) instead of Serwist | Serwist hooks into webpack; Next 16 builds with Turbopack. No build coupling, ~150 lines |
| 2026-11-21 | Share target stores shared files in the Tray IndexedDB inside the service worker; the server /share-target only redirects and never accepts files | Files never leave the device |
| 2026-11-21 | Install prompt after the 2nd completed task (a result saved to the Tray), snoozed 30 days on Not now | Blueprint section 17 |
| 2026-11-21 | Ask palette AI fallback (ask.intent) only on request when local search finds nothing; answer validated against real tool ids; Groq first with an 8 s per-model timeout | Keep AI optional and fast |
| 2026-11-22 | Security headers (HSTS, nosniff, frame DENY, Referrer-Policy, Permissions-Policy, COOP) on every route; CSP shipped Report-Only | Switch CSP to enforcing after a week of clean reports |
| 2026-11-22 | /api/ai only runs server-owned prompts chosen by promptKey (src/ai-apps/prompts/tools.ts) behind a server guard; client systemPrompt is ignored | Stops the browser from turning the gateway into a free general LLM |
| 2026-11-22 | Browser AI router talks only to the server gateway; provider adapters in src/lib/ai/adapters deleted | Keys never reach the client |
| 2026-11-22 | pdf.js loaded from local /pdfjs with isEvalSupported false instead of the CDN build | Fixes the pdf.js font-eval CVE and removes a CDN dependency |
| 2026-11-22 | Image to Text AI mode sends the image to the ocr.read vision task | Previous mode sent no image |
| 2026-11-22 | Legacy catalogs (content/tools, apps, hubs), old search/tool-card/offline components removed; 404 page shows search, popular tools and Spaces | Manifests are the single source |
| 2026-11-22 | next 16.4.6 (next/og RCE advisory), shadcn moved to devDependencies, npm audit fix applied | Dependency audit |
| 2026-11-22 | Background removal uses MODNet (Apache-2.0, 7 MB, people) and ORMBG (Apache-2.0, 44 MB, any object) via Transformers.js in a Web Worker, WASM + 8-bit models; RMBG-1.4 rejected (non-commercial licence) | Licence-safe, predictable download size; models cached by the browser after first use |
| 2026-11-22 | Models download from huggingface.co (allowed in CSP connect-src); ONNX runtime WASM from jsdelivr | Avoids putting 50 MB of models in the repo; images never leave the device |
| 2026-11-22 | Passport Photo Maker finds crown and chin from the person mask silhouette (no face-landmark model), fits head height to the preset's ICAO range, shows guides and a live head-size check; 300 DPI JPEG with JFIF DPI set, print sheet as PDF (exact size) or JPG | One 7 MB model serves both tools; manual size/position sliders cover edge cases |
| 2026-11-22 | Design Studio rebuilt on Fabric.js 7 (template data in templates.ts, 20 original templates, 10 self-hosted fontsource fonts), autosave to IndexedDB, project files, save to account (500 KB item limit) | Blueprint S9 |
| 2026-11-22 | Diagram Studio: Mermaid code tab (securityLevel strict + DOMPurify, htmlLabels off so PNG export works) with AI text-to-diagram (diagram.mermaid task, retried once with the parse error), and an Excalidraw whiteboard; "Edit as shapes" converts Mermaid into Excalidraw elements. The blueprint's separate "shapes + connectors" tab is served by the whiteboard | Blueprint S10 with one less editor to maintain |
| 2026-11-22 | Excalidraw fonts self-hosted under /public/excalidraw (copied at build); editor saved items open from /me via ?item=<id> | No third-party font CDN; Workspace can reopen designs and diagrams |
| 2026-11-22 | Pre-built "passport photo under 50 KB" Flow deferred: the passport tool's max-size field covers it; a Flow step would need the ML worker inside the runner | Follow-up |
