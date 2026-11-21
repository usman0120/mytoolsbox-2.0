# MyToolsBox — Product & Technical Blueprint (Claude Code Handover)

Nov 21, 2026 · @Usman Ahmad

## 1. Executive summary and locked decisions

MyToolsBox is a free, ad-free web workspace for everyday small jobs: files, calculations, code, study, design and AI help. It ships as one Next.js app on mytoolsbox.me and runs on free tiers for year 1. Most processing happens in the user's browser, so files never leave the device and there are no server costs.

What makes it different from the 50+ tool sites already out there is three things, not a longer list of tools:

1. **Flows.** The output of one tool becomes the input of the next (PDF → images → compress under 200 KB → ZIP) with no re-uploads. Flows can be saved and shared, and each popular flow gets its own SEO page.
2. **Spaces.** Tools are grouped into eight focused sub-platforms (Docs, Media, Create, Dev, Study, Calc, Life & Work, AI Studio), each with its own landing page, identity colour and AI assistant. This makes the site feel like a suite rather than a directory.
3. **Private by default.** Files are processed locally with WebAssembly, so the site works offline as a PWA and can make an honest "your file never leaves your device" promise.

### Locked decisions

| Area | Decision |
| --- | --- |
| Platform | One responsive web app plus an installable PWA. No native app and no Android permissions in v1 |
| Repo | Single Next.js app, no monorepo |
| Stack | Next.js (App Router) + React + TypeScript + Tailwind + shadcn/ui |
| Auth & data | Firebase Auth + Cloud Firestore on the free Spark plan |
| File storage | None on servers. Files live in the browser (OPFS/IndexedDB) and are never uploaded |
| Heavy processing | In-browser WebAssembly and WebCodecs (ffmpeg.wasm, pdf.js, image codecs, ONNX models) |
| AI | Server-side calls behind one provider interface. Gemini, Groq and OpenRouter free tiers to start; new providers can be added later |
| Accounts | Optional. Everything works signed out. Signing in unlocks favourites, history, saved Flows, saved outputs and higher AI limits |
| Money | Free for year 1: no ads, no paywall. Payment hooks are built in but switched off. Provider chosen later (see section 18) |
| Launch scope | All eight Spaces live at launch, each with a curated core set of tools (about 150), then deepened every two weeks |
| Brand | "MyToolsBox" in UI copy, kept in one config file so a rebrand is a single change plus redirects |

**A note on scope.** You asked for every category at launch. That is doable because each tool is a small module on a shared engine. The trade-off is depth: launch each Space with its best 12–25 tools rather than 100 thin ones. Thin pages hurt SEO and trust more than missing pages do.

### Decisions added after review

| Area | Decision |
| --- | --- |
| Codebase | **Evolve the existing repo** (`mytoolsbox-V2.0`, live at www.mytoolsbox.me) into this blueprint. No rewrite from scratch. Sections 24–25 hold the audit and the migration plan; for this repo they take priority over the build-from-scratch steps in sections 21–22 |
| Language | English (US) only. No Urdu or other languages, no i18n library |
| Admin | No admin panel. Feedback lands in Firestore and is read in the Firebase console |
| Contact | The Contact link points to your external central-hub contact form via `CONTACT_URL` in `src/config/site.ts` (add it when ready) |
| Mobile | Installable PWA only. Play Store listing waits until after the rebrand |
| Priority AI apps | Math Solver, Farm Advisor and Project Ideas AI get the most prompt-tuning (see section 13) |
| Canonical host | `https://www.mytoolsbox.me` (the apex already redirects there) |

## 2. Product vision and positioning

**Positioning line:** *"Get small jobs done. Free, private, no sign-up."* MyToolsBox is the tab people keep open all day, not a site they find once through Google and never come back to.

### Who it serves

| Persona | Typical jobs | What brings them back |
| --- | --- | --- |
| Student | Compress an assignment PDF, solve or check a maths problem, cite sources, make a timetable, GPA | Study Space, saved history, AI tutor that explains steps |
| Developer | Format JSON, test regex, decode a JWT, draw a diagram, generate README/docs | Fast, keyboard-first, offline, no ads, Command palette |
| Office / freelancer | Merge and sign PDFs, resize images for a portal, invoice, convert Word/Excel | Flows ("passport photo under 50 KB"), templates |
| Creator / small business | Social posts, thumbnails, background removal, QR codes, captions | Design canvas, brand kit saved to account |
| Everyday person | Loan/BMI/age/zakat calculators, unit converters, letter writing | Clean answers, plain-language explanations |
| Professionals (health, farming, engineering) | Dosage/BMI/eGFR, crop and fertiliser planning, physics/electrical calculators | Domain AI assistants with careful prompts and disclaimers |

### Product principles

1. **Job first, not tool first.** Users search "reduce photo size to 100 KB", not "image compressor". Pages, names and search are written around the job.
2. **Zero friction.** No sign-up wall, no waiting rooms, no "upgrade to download". A tool must be usable within 3 seconds of landing.
3. **Local first.** If it can run in the browser, it runs in the browser. Servers only handle AI calls and account sync.
4. **One engine, many surfaces.** Every tool is a module with typed inputs and outputs. That one contract powers the tool page, Flows, the command palette, AI suggestions and SEO pages.
5. **Depth over count.** A tool ships only if it does the job better than the top 3 Google results: faster, cleaner, or more private.
6. **Calm and professional.** Strong visual identity per Space, but no clutter, no dark patterns, no fake timers.

### Rebrand-ready by design

The word "tools" appears in the domain only. Inside the product, the language is **Spaces, Flows and Workspace**, so a future name (for example a short brandable .com) fits without rewriting the UX.

- Brand name, logo, colours, domain, social handles and legal entity name live in `src/config/site.ts`.
- All URLs are brand-neutral (`/pdf/compress`, not `/mytoolsbox-pdf-compress`).
- A future domain move is a 301 redirect map plus a Google Search Console change of address. Rankings carry over.
- Avoid putting the brand name in tool slugs, image filenames or structured-data IDs.

## 3. Competitor landscape

The market splits three ways: deep specialists (iLovePDF, Smallpdf), wide ad-funded toolboxes (TinyWow, 1tools) and calculator libraries (Omni, Calculator.net). None of them connects tools together, keeps work across tools, or feels like one product. That gap is MyToolsBox's opening.

| Platform | Focus | What they do well | Weak spots | What we take |
| --- | --- | --- | --- | --- |
| [iLovePDF](https://www.ilovepdf.com) | PDF | Clear one-job pages, batch, trust | Free limits, uploads to server, premium paywalls (OCR) | Clean single-task UI, batch mode |
| [Smallpdf](https://smallpdf.com) | PDF + e-sign | Best-in-class UX, polished flows | \~$12/mo, daily task cap | Polish, progress states, "what next?" suggestions |
| [TinyWow](https://tinywow.com) | 200+ mixed tools | Wide, free, no sign-up | Heavy ads, uneven quality, server uploads | Breadth across file types, no-sign-up promise |
| [10015.io](https://10015.io) | Mixed dev/text/CSS tools | Pretty, ad-light, fast | No accounts, no chaining, few file tools | Visual quality bar, client-side speed |
| [IT-Tools](https://it-tools.tech) | Developer utilities | Open source, offline, favourites | Dev-only, plain look | Favourites, local-first dev tools |
| [Omni Calculator](https://www.omnicalculator.com) | 3,000+ calculators | Massive SEO, explanations and formulas under each calculator | Ads, dated interactions | Calculator page template: inputs, result, formula, worked example, FAQ |
| [Calculator.net](https://www.calculator.net) | Calculators | Top rankings for finance/health | Old UI, ads | Finance and health coverage list |
| [Photopea](https://www.photopea.com) / [Canva](https://www.canva.com) | Design | Real canvas editing, templates | Photopea is complex; Canva needs an account and pushes Pro | Layered canvas, templates, simple export |
| [Excalidraw](https://excalidraw.com) / [draw.io](https://www.drawio.com) | Diagrams | Free, fast, hand-drawn or formal | Separate apps, no AI generation | Embed open-source engines, add AI "text to diagram" |
| [Photomath](https://photomath.com) / [Mathway](https://www.mathway.com) | Math solving | Photo-to-solution, steps | Steps behind paywall | Free step-by-step AI Math Solver with a CAS check |
| [CloudConvert](https://cloudconvert.com) / [FreeConvert](https://www.freeconvert.com) | File conversion | Hundreds of formats | Server-side, daily limits, upsells | Format coverage targets |
| [Zapier](https://zapier.com) / [n8n](https://n8n.io) | Automation | Chaining apps | Not for files or casual users | The chaining idea, simplified for small jobs |

### What they all share (table stakes we must match)

- One page per job with a clear H1, drop zone, settings, result and download.
- No sign-up for basic use. Batch processing. Mobile-friendly. Dark mode.
- Explanatory content under the tool (how to, FAQ) for SEO.

### What none of them has (our unique set)

1. **Flows:** chain tools with no re-upload, save and share as a link, and pre-built SEO flows ("PDF to JPG under 200 KB").
2. **File Tray:** a persistent, local tray of files and results that follows the user from tool to tool ("send to…").
3. **Spaces:** focused sub-platforms with their own AI assistant and home page, instead of one giant grid.
4. **Local-first privacy as a feature:** a visible "processed on your device" badge, and an offline-capable PWA.
5. **Ask bar:** type the job in plain words ("make this photo 50 KB passport size") and get the right tool or a ready Flow.
6. **No ads and no paywalls in year 1:** a trust and word-of-mouth advantage that ad-heavy competitors cannot copy without losing revenue.

## 4. Information architecture: Spaces and launch catalog

The site has **8 Spaces**. Each one is a sub-platform with its own home page, colour, AI assistant and SEO cluster. A tool lives in one Space but can be cross-listed (for example, AI Math Solver sits in AI Studio and appears in Study). Navigation is never deeper than **Home → Space → Category → Tool**.

### URL scheme

| Page type | Pattern | Example |
| --- | --- | --- |
| Space home | `/{space}` | `/docs` |
| Category | `/{space}/c/{category}` | `/calc/c/finance` |
| Tool | `/{space}/{tool-slug}` | `/docs/compress-pdf`, `/calc/bmi-calculator` |
| Tool variant (SEO intent) | `/{space}/{tool-slug}/{variant}` | `/media/compress-image/to-100kb` |
| Pre-built Flow | `/flows/{flow-slug}` | `/flows/pdf-to-jpg-under-200kb` |
| AI sub-platform | `/ai/{app}` | `/ai/math-solver` |
| Guides | `/guides/{slug}` | `/guides/how-to-reduce-pdf-size` |
| Shared item | `/s/{id}` (noindex) | a shared Flow or diagram |

### The 8 Spaces

| Space (slug) | Identity colour | Purpose | Launch categories |
| --- | --- | --- | --- |
| **Docs** (`/docs`) | Coral | PDFs and office files | Organise, Convert, Edit & Sign, Secure, OCR |
| **Media** (`/media`) | Violet | Images, video, audio | Image edit, Image convert, Video, Audio, AI image |
| **Create** (`/create`) | Pink | Design and visual thinking | Design canvas, Diagrams, Whiteboard, QR & barcodes, Social sizes |
| **Dev** (`/dev`) | Emerald | Developer utilities | Format & validate, Encode/decode, Generators, Web/SEO, Docs & diagrams |
| **Study** (`/study`) | Sky blue | Learning and academic work | Maths, Writing & citing, Exam prep, Planning, Grades |
| **Calc** (`/calc`) | Amber | Calculators and converters | Finance, Health, Maths, Physics, Chemistry, Engineering, Date & time, Units, Agriculture |
| **Work** (`/work`) | Slate/indigo | Writing, office and productivity | Text tools, Business docs, Career, Productivity |
| **AI Studio** (`/ai`) | Gradient (brand) | Branded AI mini-apps | Learn, Build, Plan, Grow, Everyday |

### Launch catalog (about 150 tools)

Engine key: **C** = runs in the browser, **AI** = calls the AI gateway, **C+AI** = local processing plus optional AI.

| Space | Launch tools | Count | Engine |
| --- | --- | --- | --- |
| Docs | Merge, Split, Compress, Rotate, Reorder/Delete pages, Extract pages, PDF→JPG/PNG, JPG/PNG→PDF, PDF→Text, Word→PDF (DOCX render), PDF→Word (text-layer, basic), Excel/CSV→PDF, Add page numbers, Watermark, Sign PDF, Fill form, Protect/Unlock (password you know), Redact, OCR scanned PDF, Chat with PDF, Summarise PDF | 22 | C, OCR = C (Tesseract), Chat/Summarise = AI |
| Media — image | Compress (to target KB), Resize (px/cm/DPI), Crop, Convert (JPG/PNG/WebP/AVIF/HEIC), Remove background, Passport/ID photo maker, Upscale 2×, Blur/pixelate faces, Image→Text (OCR), Add text/watermark, Collage, Colour picker/palette from image, Metadata remover, Favicon generator | 14 | C (ONNX models in browser) |
| Media — video & audio | Trim, Compress, Convert (MP4/WebM/GIF), Video→GIF, Extract audio, Mute, Resize/crop for socials, Merge clips, Audio trim, Audio convert, Voice recorder, Speech→text (Whisper in browser) | 12 | C (WebCodecs/ffmpeg.wasm) |
| Create | Design Studio (layered canvas + templates), Diagram Studio (Excalidraw + Mermaid + AI text→diagram), Whiteboard, Mind map, Flowchart, QR code (styled), Barcode, Social image resizer, Thumbnail maker, Meme/quote card, Color palette generator, Gradient & shadow builder | 12 | C, AI for generation |
| Dev | JSON formatter/validator, JSON↔CSV/YAML/XML, Regex tester, JWT decoder, Base64/URL/HTML encode, Hash (MD5/SHA), UUID/ULID, Password generator, Cron builder, Diff checker, SQL formatter, Markdown editor/preview, README generator (AI), Code explainer (AI), Timestamp converter, Color converter, Meta tag & OG generator, robots.txt/sitemap builder, API request tester (CORS-safe), Lorem ipsum | 20 | C, two AI |
| Study | AI Math Solver (photo/typed, steps), Graphing calculator, Equation solver (CAS), Citation generator (APA/MLA/Chicago/Harvard), Essay outline (AI), Paraphrase & grammar (AI), Flashcards with spaced repetition, Quiz from notes (AI), GPA/CGPA calculator, Study timetable planner, Pomodoro, Notes summariser (AI), Periodic table, Formula sheets | 14 | C + AI |
| Calc | Finance: loan/EMI, mortgage, compound interest, SIP, salary/tax (PK first), zakat, discount, profit margin, currency (cached rates). Health: BMI, BMR/TDEE, body fat, due date, ideal weight, water intake, eGFR, dose-by-weight (pro disclaimer). Maths: percentage, fraction, scientific, statistics, matrix. Physics: Ohm's law, kinematics, force/energy, projectile. Chemistry: molar mass, dilution, gas laws. Engineering: unit converter (all), resistor colour, wire gauge, concrete/brick estimator. Date: age, date difference, time zones. Agriculture: fertiliser need, seed rate, yield, land area | 40 | C (formula engine) |
| Work | Word/character counter, Case converter, Text cleaner, Find & replace, Invoice generator, Quotation, Receipt, Resume builder, Cover letter (AI), Email writer (AI), Letter/application templates, Meeting notes → actions (AI), To-do & Kanban (local), Habit tracker | 14 | C + AI |
| AI Studio | Math Solver, Study Tutor, Project Ideas AI, Planner AI (trips, weeks, events), Farm Advisor AI, Health Explainer AI (education only), Code Helper, Career Coach, Business & Marketing AI, Writing Studio | 10 apps | AI |

**Deliberately left out of v1:** YouTube/Instagram downloaders (legal risk and frequently blocked), AI "humanizers" and detectors (unreliable, reputational risk), paid-API conversions (high-fidelity PDF→Word/Excel, needs a server), generative video (cost).

## 5. Signature features

Four features turn a pile of tools into a product: **Flows**, the **File Tray**, the **Workspace** and the **Ask bar**. All four are built on the same tool contract (section 11), so each new tool automatically works in all of them.

### 5.1 Flows (tool chaining)

A Flow is a saved recipe of steps where each step's output feeds the next. Files are never re-uploaded because nothing is uploaded in the first place: intermediate results stay in the browser's private file system (OPFS).

**How users meet Flows**

1. **"Continue with…" on every result.** After PDF→JPG finishes, the result card shows compatible next tools (Compress, Resize, ZIP). One click passes the output along. This is the main entry point.
2. **Flow Builder** at `/flows/new`: pick a starting input, then "+ Add step". The picker only lists tools whose input type matches the previous output.
3. **Pre-built Flows** such as "PDF to JPG under 200 KB", "Passport photo 35×45 mm under 50 KB", "Scan to searchable PDF", "Video to GIF under 5 MB", "Lecture audio → notes → flashcards". Each is an indexable SEO page.
4. **Ask bar:** "convert my pdf to images and make each under 200kb" is parsed into a Flow draft for the user to confirm.

**Rules**

- Steps are typed: `pdf → image[] → image[] → zip`. An array output runs the next step once per item ("for each"), in a worker pool.
- v1 Flows are linear chains (up to 10 steps) with per-item fan-out. Branching graphs come later on the same data model.
- Target constraints ("under 200 KB", "exactly 600×600") are step options. The compressor binary-searches quality and dimensions until the target is met, then reports the result.
- Every step shows progress, a preview, and can be re-run with new settings without redoing earlier steps (results are cached by step hash).
- AI steps are allowed (for example, extract text → summarise) and count against the AI quota.
- Saving: signed-out users get a share link that encodes the recipe in the URL. Signed-in users save Flows to their account. **Recipes only; files are never saved.**

### 5.2 File Tray

A slim drawer on the right (bottom sheet on mobile) that holds every file the user dropped in and every result produced in this browser.

- Drag from the Tray into any tool, or use "Send to…" on a file.
- Stored in OPFS with an IndexedDB index. Auto-clears after 24 hours unless pinned; a size meter shows usage (soft cap 2 GB, depending on the browser's quota).
- Bulk actions: download as ZIP, clear, pin.
- It never syncs to the cloud, and the UI says so plainly.

### 5.3 Workspace (signed-in)

| Feature | What is stored | Where |
| --- | --- | --- |
| Favourites | Tool IDs, order | Firestore |
| History | Tool ID, time, settings, file names and sizes (never file contents) | Firestore, last 200 entries |
| Saved Flows | Recipe JSON | Firestore |
| Saved outputs | Text and JSON results under 500 KB: AI answers, notes, citations, designs and diagrams as scene JSON, calculator results | Firestore |
| Collections | Named groups of favourites, Flows and outputs | Firestore |
| Preferences | Theme, language, units, default Space, AI tone | Firestore + local cache |
| Brand kit | Colours, fonts, logo (as small data URL under 200 KB) | Firestore |

Signed-out users get favourites and history in localStorage. On first sign-in they are merged into the account.

### 5.4 Ask bar and command palette

- Opened with `Ctrl/⌘ + K` or the search field in the header and on the home page.
- Step 1 is a local fuzzy search (FlexSearch) over tool names, synonyms and job phrases. It is instant and works offline.
- Step 2, only if there is no confident match and the user presses Enter: an AI intent call returns `{ toolId | flowRecipe, prefilledOptions }`.
- It also runs actions: "dark mode", "open history", "new diagram".

### 5.5 AI layer

- Each Space has an **assistant panel** that knows that Space's tools. It can answer questions and open a tool with options pre-filled ("resize to Instagram story").
- AI Studio apps are full sub-platforms with their own landing page, examples, history and a task-specific system prompt (section 13).
- AI output always has Copy, Save, Regenerate and "Send to…" (for example, an outline to Docs export, or Mermaid code to Diagram Studio).

## 6. Design system and UX principles

The look is **"calm workshop"**: warm neutral surfaces, one confident colour per Space, real previews instead of generic icons, and quick motion. It should feel like Linear or Raycast crossed with Canva's friendliness, not like a template. The template look comes from purple gradients everywhere, glass cards, emoji icons and stock 3D blobs, so all of those are banned.

### Foundations

| Token | Value / rule |
| --- | --- |
| Base neutrals | Tailwind `stone` scale (warm grey). Light bg `stone-50`, surface white, dark bg `#0E0E10`, dark surface `#17171A` |
| Brand | Ink black + a signature electric lime accent (`#C6F432`) used sparingly for primary CTAs, focus rings and the "done" moment |
| Space colours | Docs coral `#F2545B`, Media violet `#7C5CFF`, Create pink `#FF5FA2`, Dev emerald `#10B981`, Study sky `#38BDF8`, Calc amber `#F59E0B`, Work indigo `#6366F1`, AI Studio brand gradient (lime → sky) |
| Colour use | A Space colour appears only as a 4 px top bar, the icon chip, active tab and progress bar. Never as full-page backgrounds |
| Type | Display: **Bricolage Grotesque** (headings, 600–700). UI/body: **Geist Sans**. Code/numbers: **Geist Mono** with tabular figures for calculators. Self-hosted via `next/font` |
| Type scale | 12 / 14 / 16 (body) / 20 / 24 / 32 / 44 / 60 |
| Radius | 8 (inputs), 12 (cards), 16 (panels), full (chips) |
| Spacing | 4-pt grid; page gutters 16 mobile, 24 tablet, 32 desktop; content max 1200 px, tool workspace max 1400 px |
| Elevation | Borders first (`1px stone-200` / `white/8%`), one soft shadow for floating layers only |
| Icons | Lucide (1.75 stroke) + 8 custom Space glyphs drawn on the same grid |
| Motion | Motion library; 150 ms for hover/press, 220 ms for panels, spring for drag. Respect `prefers-reduced-motion` |
| Components | shadcn/ui (Radix) themed with the tokens above, Sonner for toasts, Vaul for mobile drawers, cmdk for the palette |

### Making it not boring

- **Live tool cards.** Each card shows a tiny before → after illustration (a PDF turning into images, a 2.4 MB → 180 KB badge), drawn as small SVGs per category, not icons in boxes.
- **The "done" moment.** Results animate in with the size saved ("−92%, 2.4 MB → 186 KB"), a lime check and the "Continue with…" row. This is the emotional peak of every tool.
- **Space home pages feel like apps.** Each has a hero with the 3 most-used tools as large interactive tiles, a "popular Flows" strip and recent items, not a flat grid of 40 links.
- **Personal home.** Returning users see "Jump back in" (recent tools, pinned Flows) above everything else.
- **Micro-copy with a human voice.** "Drop a PDF here, or paste one" and "Your file stays on this device" instead of "Upload file".
- **Empty states with examples.** Every tool offers "Try with a sample file" so users can see value before committing their own file.

### UX rules

1. Drop zone or input is above the fold on every tool page, on every device.
2. Settings use smart defaults; advanced options sit behind "More options".
3. Paste works everywhere (images, text, files from the clipboard). Keyboard shortcuts are listed in a `?` overlay.
4. Every long task shows determinate progress plus a cancel button. Nothing blocks the main thread.
5. Errors explain the fix ("This PDF is password-protected. Enter the password to continue.").
6. Accessibility: WCAG 2.2 AA contrast, full keyboard use, visible focus, labelled controls, 44 px touch targets.
7. Mobile is first-class: bottom navigation (Home, Spaces, Ask, Tray, Me), file pickers that open the camera for scans.

## 7. Screen-by-screen UI requirements

Every screen shares one shell: a header (logo, Spaces menu, Ask bar, Tray button, theme, account), a footer (Spaces, legal, language), and on mobile a bottom nav. Below are the 16 screen types; every one of the \~150 tools uses one of the four tool templates (S5–S8).

### S1. Home `/`

- **Hero:** headline "Get small jobs done.", large Ask bar with rotating example prompts, trust row ("No sign-up · Files stay on your device · Free").
- **Returning user:** "Jump back in" row (last 6 tools, pinned Flows) replaces the hero copy.
- **Spaces grid:** 8 large cards, each with its colour bar, glyph, one-line purpose and 3 top tools as chips.
- **Popular right now:** 12 tool cards with live before→after art.
- **Flows showcase:** 4 pre-built Flows shown as step chains.
- **Why MyToolsBox:** 3 short points (private, connected, free). No testimonials until they are real.
- Footer with an A–Z tool index link (crawlable).

### S2. Space home `/{space}`

- Space hero with colour bar, title, one-liner and a Space-scoped search.
- 3 featured tools as large interactive tiles (for example, the Docs hero tile is a live drop zone that routes the file to the best tool).
- Category tabs → tool grid. "Popular Flows in this Space" strip. Space assistant button (bottom-right).
- SEO block: 200–400 words on what the Space covers, FAQ.

### S3. Category `/{space}/c/{category}`

Filterable grid, sort by Popular/A–Z/New, short intro, breadcrumb.

### S4. Search results / Ask bar overlay

Grouped results: Tools, Flows, AI apps, Guides, Actions. Keyboard navigable. "Ask AI" row at the bottom when nothing fits.

### S5. File tool template (Docs, Media)

1. **Header:** breadcrumb, H1 (job phrasing, e.g. "Compress PDF"), one-line promise, favourite star, "Processed on your device" badge.
2. **Input:** big drop zone (click, drag, paste, "From Tray", "Sample file"). Accepts multiple files where relevant.
3. **Work area:** file list with thumbnails, reorder, remove. Settings panel on the right (bottom sheet on mobile) with presets ("Recommended", "Smallest", "Best quality") and "More options".
4. **Run:** primary button with keyboard hint; determinate progress per file; cancel.
5. **Result card:** previews, size before/after, Download / Download all (ZIP), Copy (for images), **Continue with…** chips, Save to Workspace, Start over.
6. **Below the fold (SEO):** How it works (3 steps), options explained, FAQ (5–8), related tools, related Flows.

### S6. Text/data tool template (Dev, Work text tools)

Split view: input editor (CodeMirror for code) on the left, output on the right, options bar on top, live updates as you type (debounced). Copy, Download, Share-as-link (state in the URL hash, so nothing hits a server). Stacks vertically on mobile.

### S7. Calculator template (Calc)

- Inputs card with unit toggles and inline validation; result card with big tabular numbers, a chart where helpful (amortisation, growth), and "Explain this result".
- Formula block (KaTeX), worked example, assumptions, references, FAQ.
- Health calculators carry a fixed disclaimer and cite sources (WHO, NIH and similar).
- Share result link (inputs in the query string), Save to Workspace.

### S8. AI app template (AI Studio + AI tools)

- Left: app intro, example prompt chips, input (text, image, file, voice), options (level, tone, language, length).
- Centre: streamed answer with Markdown, maths (KaTeX), code highlighting, Mermaid rendering.
- Actions: Copy, Save, Regenerate, Send to…, thumbs up/down. Quota meter ("7 of 20 free AI uses left today").
- History sidebar (signed-in). Disclaimer line for health and farming apps.

### S9. Design Studio `/create/design`

Full-screen editor: top bar (file name, undo/redo, zoom, export), left rail (Templates, Elements, Text, Uploads from Tray, Brand kit, AI image/background removal), canvas centre, right Properties panel (position, colour, font, effects, layers). Export PNG/JPG/WebP/SVG/PDF. Autosave to IndexedDB; Save to account as JSON.

### S10. Diagram Studio `/create/diagram`

Tabs for Whiteboard (Excalidraw), Diagram (shapes + connectors), and Code (Mermaid editor with live preview). An "AI: describe your diagram" box generates Mermaid, which can be converted into editable shapes. Export PNG/SVG/Mermaid source.

### S11. Video/audio editor `/media/video-editor`

Preview player, timeline with trim handles and clip list, text overlay, aspect presets (9:16, 1:1, 16:9), export with size target. Shows an honest note: "Large videos depend on your device's speed."

### S12. Flow Builder `/flows/new` and Flow run

Vertical step list (cards connected by a line). Each card: tool, options, status, preview. "+ Add step" opens a picker filtered by compatible type. Run all / Run from step N. Save, Share link, Duplicate. Pre-built Flow pages use the same view in read-only mode with "Use this Flow".

### S13. File Tray drawer

Thumbnails, name, size, origin tool, age; select-many; Send to…, Download, Pin, Delete; storage meter; "Files never leave your device" note.

### S14. Workspace `/me`

Tabs: Overview (recent, pinned), Favourites, Flows, Saved, History, Collections, Settings (profile, theme, language, units, AI preferences, data export, delete account).

### S15. Auth modal

Google sign-in, GitHub sign-in, email magic link. Shown in a modal only when the user tries a signed-in feature, explaining the benefit ("Sign in to save this Flow"). Never a full-page wall.

### S16. Static and system pages

About, Privacy, Terms, Contact (links to your external contact hub), Changelog, Suggest a tool (public board), Status, 404 (with search and popular tools), offline page (lists tools that work offline).

## 8. System architecture

The architecture is **"thick browser, thin server"**. The browser does all file processing in Web Workers. The server is a handful of Next.js route handlers that hold secrets (AI keys), enforce quotas and render SEO pages. Firestore is reached directly from the browser for user-owned data, guarded by security rules, which keeps server load near zero.

&#91;embedded content: system architecture · browser, Vercel, free-tier services\]

The browser holds every file and does all processing; Vercel serves static pages and the AI gateway; Firestore is reached directly under owner-only rules.

### Layers

| Layer | Runs where | Responsibilities |
| --- | --- | --- |
| Pages (RSC) | Vercel CDN, statically generated + ISR | Home, Spaces, every tool/calculator/Flow/guide page with full HTML, metadata, JSON-LD. Tool UIs hydrate as client islands |
| Tool runtime | Browser, Web Workers | Loads the tool module on demand, runs it in a worker, streams progress, writes outputs to OPFS |
| Flow engine | Browser | Validates step types, runs steps in sequence with per-item fan-out, caches step results by hash |
| File store | Browser (OPFS + IndexedDB) | File Tray, intermediate results, autosaves for editors |
| Sync | Browser → Firestore (Firebase JS SDK) | Favourites, history, Flows, saved outputs, preferences. Rules restrict every document to its owner |
| AI gateway | Vercel route handlers (Node runtime) | Verifies the Firebase ID token or anonymous fingerprint, checks quota, picks provider by task preset, streams the response, logs usage |
| Quota & rate limit | Upstash Redis (free tier) + Firestore | Per-IP and per-user counters with sliding windows. Server-only writes |
| Edge utilities | Vercel route handlers | Dynamic OG images, currency-rate cache (refreshed every 6 h), sitemap generation |
| PWA | Service worker (Serwist) | Precache app shell + tool code, offline page, install prompt |

### Key request paths

1. **File tool (no server):** page HTML from CDN → tool module chunk loaded → file read locally → worker processes it → result written to OPFS → download. The server never sees the file.
2. **AI request:** client → `POST /api/ai/{task}` with ID token (or anonymous device ID) → rate-limit check (Redis) → quota check → provider adapter → streamed tokens back → usage written to Firestore.
3. **Saving work:** client writes directly to `users/{uid}/...` in Firestore. Rules validate owner, shape and size.
4. **Flow run:** entirely in the browser. AI steps call path 2.

### Why this scales without rewrites

- Every external service sits behind an interface in `src/server/providers/` (AI, storage, payments, rate limit, email). Switching Firestore to Supabase, or adding R2 storage, means writing one adapter.
- File processing scales with users' devices, so 10× traffic does not mean 10× cost.
- Pages are static, so traffic spikes from SEO are served by the CDN.
- When a server-side job is needed later (for example high-fidelity Office conversion), it plugs in as a "remote engine" for that tool without changing the tool contract (section 12).

## 9. Tech stack and accounts to create

Everything below is free or open source (MIT/Apache/BSD) at launch scale. Pin exact versions in `package.json` when the project is scaffolded; Claude Code should install the latest stable release of each.

### Core

| Concern | Choice | Why |
| --- | --- | --- |
| Framework | Next.js (latest stable, App Router) + React + TypeScript (strict) | SSG/ISR for SEO, route handlers for the AI gateway, one app |
| Styling | Tailwind CSS v4 + shadcn/ui (Radix) + Motion | Fast to build, accessible, themeable |
| UI helpers | cmdk (palette), Vaul (drawers), Sonner (toasts), Lucide (icons) | Small, proven |
| State | Zustand (client), URL state via `nuqs`, Zod for every schema | Simple; schemas shared by forms, tools and API |
| i18n | None: English only, all UI copy in one copy file | No translation overhead |
| Auth & DB | Firebase Auth (Google, GitHub, email link) + Cloud Firestore; `firebase-admin` on the server | Free Spark tier, your choice |
| AI SDK | Vercel AI SDK (`ai`) with `@ai-sdk/google`, `@ai-sdk/groq`, OpenAI-compatible adapter for OpenRouter | One API across providers, streaming |
| Rate limiting | `@upstash/ratelimit` + Upstash Redis | Free tier, serverless-friendly |
| Bot protection | Cloudflare Turnstile (invisible) on anonymous AI calls | Free, privacy-friendly |
| PWA | Serwist | Maintained successor to next-pwa |
| Testing | Vitest (units for every tool engine), Playwright (E2E per template) |  |
| Quality | ESLint + Prettier, Husky + lint-staged, TypeScript `noUncheckedIndexedAccess` |  |

### Processing libraries (all in-browser)

| Domain | Libraries |
| --- | --- |
| PDF | `pdf-lib` (edit/merge/split/sign/watermark), `pdfjs-dist` (render/text), `@cantoo/pdf-lib` for encryption, `fflate` (ZIP) |
| Office | `mammoth` + `docx-preview` (DOCX render → PDF via print pipeline), SheetJS CE (xlsx), PapaParse (CSV), `docx` (generate DOCX) |
| Images | jSquash codecs (MozJPEG, WebP, AVIF, OxiPNG), `libheif-js` (HEIC), Pica (high-quality resize), Canvas/OffscreenCanvas |
| ML in browser | Transformers.js + ONNX Runtime Web (WebGPU → WASM fallback): background removal, upscaling, Whisper speech-to-text, face detection for blur |
| OCR | Tesseract.js (lazy-loaded language packs) |
| Video/audio | Mediabunny (WebCodecs, fast trim/convert/compress), `@ffmpeg/ffmpeg` (wasm) as fallback for unsupported codecs, Web Audio API |
| Design canvas | Fabric.js (layers, text, images, filters, SVG export) |
| Diagrams | Excalidraw, Mermaid, `@xyflow/react` (later: visual Flow graph) |
| Maths & science | Math.js, Cortex Compute Engine (CAS checks), KaTeX, function-plot (graphing), Recharts |
| Code | CodeMirror 6, Shiki (highlighting), `sql-formatter`, `js-yaml`, `fast-xml-parser` |
| Search | FlexSearch over the tool registry |

### Accounts to create (in this order)

| # | Service | Use | Cost |
| --- | --- | --- | --- |
| 1 | Brand email (Cloudflare Email Routing → your Gmail) | hello@ / support@mytoolsbox.me | Free |
| 2 | GitHub (private repo `mytoolsbox-web`) | Code, CI | Free |
| 3 | Cloudflare | DNS (move Namecheap nameservers here), Email Routing, Turnstile, Web Analytics, Workers AI (optional AI provider) | Free |
| 4 | Vercel (Hobby) | Hosting, preview deploys from GitHub | Free (see section 19) |
| 5 | Firebase project `mytoolsbox-prod` (+ `mytoolsbox-dev`) | Auth + Firestore, Spark plan | Free |
| 6 | Google AI Studio | Gemini API key (default AI provider) | Free tier |
| 7 | Groq | Fast open models (Llama/Qwen) for chat-like tasks | Free tier |
| 8 | OpenRouter | Fallback + access to free models | Free models |
| 9 | Upstash | Redis for rate limits | Free tier |
| 10 | Sentry | Error tracking (client + server) | Free tier |
| 11 | PostHog (EU or US cloud) | Product analytics, funnels, feature flags (cookieless mode) | Free tier |
| 12 | Google Search Console + Bing Webmaster Tools | Indexing, sitemaps, keyword data | Free |
| 13 | Social handles (@mytoolsbox on X, Instagram, YouTube, LinkedIn, Product Hunt) | Launch and growth | Free |

Free-tier limits change often. Check each provider's pricing page on sign-up and record the numbers in `docs/limits.md`.

## 10. Project structure (single Next.js app)

One repository and one app, organised by feature. The key idea: **a tool is a folder**. Adding a tool means adding one folder and one line to the registry, and routing, SEO, search, Flows and the sitemap pick it up automatically.

```
mytoolsbox-web/
├─ src/
│  ├─ app/
│  │  ├─ (marketing)/            # home, about, privacy, terms, changelog
│  │  ├─ [space]/                # space home
│  │  │  ├─ page.tsx
│  │  │  ├─ c/[category]/page.tsx
│  │  │  └─ [tool]/[[...variant]]/page.tsx   # generic tool page (SSG)
│  │  ├─ ai/[app]/page.tsx       # AI Studio apps
│  │  ├─ create/design/page.tsx  # full-screen editors get their own routes
│  │  ├─ create/diagram/page.tsx
│  │  ├─ media/video-editor/page.tsx
│  │  ├─ flows/                  # builder, pre-built flows, runner
│  │  ├─ guides/[slug]/page.tsx  # MDX guides
│  │  ├─ me/                     # workspace (client, noindex)
│  │  ├─ s/[id]/page.tsx         # shared items (noindex)
│  │  ├─ api/
│  │  │  ├─ ai/[task]/route.ts   # AI gateway
│  │  │  ├─ intent/route.ts      # Ask bar AI fallback
│  │  │  ├─ rates/route.ts       # cached currency rates
│  │  │  └─ og/route.tsx         # dynamic OG images
│  │  ├─ sitemap.ts, robots.ts, manifest.ts
│  │  └─ layout.tsx, not-found.tsx, offline/
│  ├─ tools/                      # ONE FOLDER PER TOOL
│  │  ├─ registry.ts             # imports every manifest (metadata only)
│  │  ├─ docs/compress-pdf/
│  │  │  ├─ manifest.ts          # id, space, slugs, IO types, SEO, FAQ
│  │  │  ├─ engine.ts            # pure processing fn (runs in worker)
│  │  │  ├─ ui.tsx               # options panel (optional; template used otherwise)
│  │  │  ├─ content.mdx          # how-to + FAQ copy
│  │  │  └─ engine.test.ts
│  │  └─ calc/bmi-calculator/ ...
│  ├─ ai-apps/                    # AI Studio app definitions (prompt presets, UI config)
│  ├─ flows/                      # pre-built flow recipes (JSON) + engine
│  ├─ spaces/                     # space configs: colour, glyph, categories, copy
│  ├─ components/
│  │  ├─ ui/                     # shadcn primitives
│  │  ├─ shell/                  # header, nav, footer, palette, tray
│  │  └─ templates/              # FileTool, TextTool, Calculator, AiApp
│  ├─ runtime/
│  │  ├─ worker-pool.ts          # comlink-based worker pool
│  │  ├─ workers/                # pdf.worker.ts, image.worker.ts, media.worker.ts, ml.worker.ts
│  │  ├─ file-store.ts           # OPFS + IndexedDB
│  │  └─ flow-engine.ts
│  ├─ lib/
│  │  ├─ firebase/client.ts, firebase/admin.ts
│  │  ├─ seo/                    # metadata + JSON-LD builders
│  │  └─ analytics.ts, utils.ts
│  ├─ server/
│  │  ├─ providers/
│  │  │  ├─ ai/ (types.ts, gemini.ts, groq.ts, openrouter.ts, workers-ai.ts, router.ts)
│  │  │  ├─ storage/ (types.ts, none.ts)        # r2.ts later
│  │  │  ├─ payments/ (types.ts, disabled.ts)   # lemonsqueezy.ts / paddle.ts later
│  │  │  └─ ratelimit/ (types.ts, upstash.ts)
│  │  ├─ quota.ts, auth.ts, entitlements.ts
│  ├─ config/site.ts, config/limits.ts, config/features.ts
│  ├─ i18n/
│  └─ styles/globals.css
├─ public/  (icons, og defaults, sample files, wasm assets)
├─ content/guides/*.mdx
├─ firestore.rules, firestore.indexes.json, firebase.json
├─ docs/  (CLAUDE.md, architecture.md, adding-a-tool.md, limits.md)
└─ tests/e2e/
```

**Conventions:** server-only code imports `server-only`; tool engines are pure functions with no React or DOM imports so they run in workers and tests; manifests contain no heavy imports so the registry stays tiny; heavy libraries are loaded with dynamic `import()` inside workers only.

## 11. Tool module system

Every tool, calculator and AI app implements one TypeScript contract. This is the most important code in the project: write it first, keep it stable, and grow features around it.

### Data types that flow between tools

```ts
// src/tools/types.ts
export type PortType =
  | 'pdf' | 'image' | 'video' | 'audio' | 'docx' | 'xlsx' | 'csv'
  | 'zip' | 'text' | 'markdown' | 'json' | 'code' | 'table'
  | 'number' | 'mermaid' | 'design-scene' | 'any-file';

export interface Port { type: PortType; many?: boolean; accept?: string[] } // accept = MIME list

export interface Artifact {          // what travels between steps
  id: string;                        // OPFS key
  type: PortType;
  name: string; mime: string; size: number;
  meta?: Record<string, unknown>;    // pages, width/height, duration
}
```

### The manifest (metadata, no heavy imports)

```ts
export interface ToolManifest<O extends z.ZodTypeAny = z.ZodTypeAny> {
  id: string;                        // 'docs.compress-pdf'
  space: SpaceId; category: string;
  slug: string;                      // 'compress-pdf'
  name: string; tagline: string;
  keywords: string[]; synonyms: string[]; jobs: string[]; // power search + SEO
  template: 'file' | 'text' | 'calculator' | 'ai' | 'editor';
  input: Port[]; output: Port[];
  options: O;                        // Zod schema -> auto-generated settings UI
  presets?: { id: string; label: string; values: z.infer<O> }[];
  engine: 'client' | 'ai' | 'remote';// 'remote' reserved for future server engines
  aiTask?: AiTaskId;                 // when engine === 'ai'
  load: () => Promise<ToolEngine<O>>;// dynamic import of engine.ts
  ui?: () => Promise<{ default: React.ComponentType }>;
  seo: { title: string; description: string; h1: string;
         variants?: { slug: string; title: string; h1: string; presetId: string }[] };
  faq: { q: string; a: string }[];
  related: string[];                 // tool ids
  limits?: { maxFileMB?: number; maxFiles?: number };
  status: 'live' | 'beta' | 'soon';
  offline: boolean;                  // works without network
}

export interface ToolEngine<O> {
  run(ctx: {
    inputs: Artifact[]; options: z.infer<O>;
    store: FileStore;                // read/write OPFS blobs
    progress: (pct: number, note?: string) => void;
    signal: AbortSignal;
  }): Promise<Artifact[]>;
}
```

### What the registry powers

| Consumer | Uses |
| --- | --- |
| Routing | `generateStaticParams` builds every `/{space}/{slug}` and variant page |
| Settings UI | Zod `options` schema → form fields (number, select, slider, toggle, colour) automatically |
| Flows | `input`/`output` ports decide which tools can follow which |
| Search & Ask bar | `name`, `keywords`, `synonyms`, `jobs` indexed into FlexSearch at build time |
| SEO | `seo`, `faq`, `related` → metadata, JSON-LD, internal links, sitemap |
| Offline | `offline: true` tools are precached by the service worker |
| Feature flags | `status` hides `soon` tools from listings but keeps a "Notify me" page |

### Calculators are data, not components

Most of the 40+ calculators share one engine: a manifest declares input fields (with units), a pure `compute(inputs)` function, an optional chart spec and a KaTeX formula. One generic Calculator template renders them all, so a new calculator is roughly 60 lines.

### Adding a tool (the checklist Claude Code follows)

1. Create `src/tools/{space}/{slug}/` with `manifest.ts`, `engine.ts`, `content.mdx`, `engine.test.ts`.
2. Register the manifest in `registry.ts`.
3. Unit-test the engine with a fixture in `tests/fixtures/`.
4. Run `npm run check:tools`, which validates slugs are unique, SEO fields are within length, ports are valid, and FAQ has at least 4 items.
5. Preview the page; confirm Lighthouse ≥ 95 on Performance and SEO.

## 12. Heavy processing without servers

The user's device is the server. Modern browsers can run WebAssembly, WebCodecs (hardware video encode/decode) and WebGPU, which covers almost every "small job" at zero cost to you and with better privacy than upload-based sites.

| Job | Approach in the browser | Practical limit (mid-range phone / laptop) | Future server option if needed |
| --- | --- | --- | --- |
| PDF merge/split/compress/sign | pdf-lib + pdf.js in a worker; compress = re-render pages to JPEG at chosen DPI or strip/re-encode images | 200 MB / 500 MB | Ghostscript on a container for "strong" compression |
| PDF → Word (layout-faithful) | Basic text-layer extraction only in v1 (clearly labelled) | Simple documents | Gotenberg/LibreOffice on Cloud Run or a paid conversion API |
| Word/Excel → PDF | mammoth/SheetJS → HTML → print-to-PDF pipeline | Simple layouts | Same as above |
| Image compress/convert/resize | jSquash codecs in workers, binary search for target KB | 50 MP images, batches of 100 | Not needed |
| Background removal, upscale, face blur | Transformers.js / ONNX Runtime Web, WebGPU with WASM fallback; models (\~40–180 MB) cached after first use | 1 image every 1–5 s | Hosted inference (Replicate, Workers AI) for low-end devices |
| Video trim/convert/compress | Mediabunny on WebCodecs (fast, hardware); ffmpeg.wasm single-thread fallback | \~1 GB / 10 min on laptops; \~300 MB on phones | Cloud transcoding (Cloudflare Stream, Mux) as a paid perk |
| OCR | Tesseract.js, language pack loaded on demand | \~2–5 s per page | Gemini vision for handwriting (AI quota) |
| Speech → text | Whisper (tiny/base) via Transformers.js on WebGPU | \~1× real time on laptops | Groq Whisper API (fast, free tier) as an AI task |

### Rules that keep it reliable

1. **Capability check first.** On tool load, detect WebGPU, WebCodecs, SharedArrayBuffer, OPFS and memory (`navigator.deviceMemory`). Pick the best engine and show a gentle note if the device is likely to be slow.
2. **Workers only.** No heavy work on the main thread. A comlink-based pool sized to `hardwareConcurrency - 1`.
3. **Stream, don't load.** Read big files in chunks and write outputs to OPFS, not memory, to avoid tab crashes.
4. **Cross-origin isolation only where needed.** Multi-threaded ffmpeg needs COOP/COEP headers, which break some third-party embeds. Apply those headers only on `/media/*` editor routes.
5. **Model and WASM caching.** Large assets are served from `public/` with long cache headers (or a free CDN such as jsDelivr for npm-hosted models) and stored by the service worker after first use.
6. **Remote engine slot.** The manifest's `engine: 'remote'` value is reserved. When a server path becomes worth paying for, a tool can switch to it behind a feature flag without UI changes.

## 13. AI architecture

All AI goes through one server gateway that knows **tasks**, not models. A task preset bundles the system prompt, model choice, fallbacks, output schema and cost. Swapping or adding a provider changes configuration, not features.

**About "fine-tuned" keys:** true fine-tuning costs money and is rarely needed here. What you want is *task-tuned presets*: a carefully written system prompt, few-shot examples, output format and the best-fit model per task. That gives 90% of the benefit for free, and real fine-tuning can be added later as just another model ID.

### Provider interface

```ts
// src/server/providers/ai/types.ts
export interface AiProvider {
  id: 'gemini' | 'groq' | 'openrouter' | 'workers-ai' | string;
  models: Record<string, { vision?: boolean; json?: boolean; ctx: number }>;
  stream(req: AiRequest): Promise<ReadableStream>;   // via Vercel AI SDK
  generateObject?<T>(req: AiRequest, schema: z.ZodType<T>): Promise<T>;
}

export interface AiTaskPreset {
  id: AiTaskId;                       // 'math.solve', 'pdf.summarise', 'diagram.mermaid'
  system: string;                     // versioned prompt in src/ai-apps/prompts/*.md
  examples?: { user: string; assistant: string }[];
  route: { provider: string; model: string }[];      // first = primary, rest = fallbacks
  output: 'markdown' | 'json' | 'mermaid' | 'code';
  schema?: z.ZodTypeAny;              // when output === 'json'
  maxInputTokens: number; maxOutputTokens: number;
  cost: number;                       // quota units: 1 text, 2 with image, 3 long docs
  temperature: number;
  safety?: 'health' | 'finance' | 'agri' | 'general'; // adds disclaimers + guardrails
}
```

### Routing plan (initial)

| Task family | Primary | Fallback | Notes |
| --- | --- | --- | --- |
| Maths solving (text + photo) | Gemini Flash (vision) | OpenRouter free reasoning model | Answer is cross-checked with Compute Engine when an expression can be extracted |
| Study tutor, writing, email, cover letters | Groq (fast Llama/Qwen) | Gemini Flash-Lite | Low latency matters most |
| PDF chat/summarise | Gemini Flash (long context) | Groq with chunking | Text extracted in the browser; only text is sent, never the file |
| Diagram/Mermaid, README, code explain | Gemini Flash | OpenRouter coder model | JSON/Mermaid validated, retried once on parse error |
| Ask bar intent | Gemini Flash-Lite (JSON) | Local keyword fallback | Must answer in under 1.5 s |
| Farm, health, career, business apps | Gemini Flash | Groq | Safety preset adds disclaimers, refuses diagnosis/prescriptions |

Use the exact model IDs shown in each provider's console when you build; they change several times a year. Keep them in `src/config/ai-models.ts` only.

**Priority apps for prompt-tuning:** (1) **Math Solver**, the largest student search demand and a CAS check to keep answers right; (2) **Farm Advisor**, an underserved niche with local relevance and little competition; (3) **Project Ideas AI**, which serves both students and developers and links naturally to Flows, diagrams and README generation. Each gets a 20-case test set, few-shot examples and a weekly review of thumbs-down answers.

### Quotas and protection

| User | Daily AI units | Extras |
| --- | --- | --- |
| Anonymous (device ID + IP) | 10 | Turnstile check after the 3rd request |
| Signed-in | 40 | History of AI answers |
| Global safety cap | Set below the providers' free daily limits | When reached: friendly "AI is busy, try again in X" and non-AI tools keep working |

- Sliding-window rate limit: 6 requests/minute per identity (Upstash).
- Input caps per task (characters and image size). Images are downscaled in the browser before sending.
- Response cache: identical (task + normalised input) requests within 24 h are served from cache (Upstash), which saves quota on popular prompts.
- Provider failover: on a 429/5xx, try the next route entry; open a circuit breaker for 60 s on repeated failures.
- Prompt injection: user content is wrapped in delimiters; system prompts tell the model to ignore instructions inside user files; JSON outputs are schema-validated.
- **Privacy disclosure:** free tiers of some providers may use prompts to improve their products. The privacy policy and a line under AI inputs say so, and tell users not to submit sensitive personal data. Moving the main tasks to a paid tier later removes this caveat.

## 14. Firestore data model

The schema is designed around the Spark plan's daily read/write limits: one user document holds everything read on every visit (profile, preferences, favourites), lists are paginated, and counters live in Redis rather than Firestore. Files are never stored.

### Collections

| Path | Purpose | Key fields | Written by |
| --- | --- | --- | --- |
| `users/{uid}` | Profile + everything needed on page load (1 read per session) | `displayName`, `photoURL`, `createdAt`, `prefs {theme, locale, units, defaultSpace, aiTone}`, `favorites: string[]` (≤100 tool IDs), `pinnedFlows: string[]`, `plan: 'free'`, `brandKit {colors[], fonts[], logoDataUrl}` | Client (owner), except `plan` |
| `users/{uid}/history/{id}` | Recent activity | `toolId`, `at`, `optionsHash`, `optionsSummary`, `inputs: {name,size,type}[]`, `outputSummary` | Client (owner); trimmed to 200 by a client-side batch |
| `users/{uid}/flows/{id}` | Saved Flows | `name`, `steps: {toolId, options}[]`, `inputType`, `createdAt`, `updatedAt`, `runs` | Client (owner) |
| `users/{uid}/items/{id}` | Saved outputs | \`kind: 'ai' | 'design' |
| `users/{uid}/collections/{id}` | Folders | `name`, `color`, `order` | Client (owner) |
| `users/{uid}/aiHistory/{id}` | AI conversations | `appId`, `task`, `messages[]` (last 20), `updatedAt` | Server (gateway) |
| `shares/{shareId}` | Public share links | `ownerUid`, `kind`, `snapshot` (≤ 500 KB), `createdAt`, `expiresAt`, `views` | Client create; public read by ID; no listing |
| `feedback/{id}` | Feedback and bug reports | `uid?`, `toolId?`, `message`, `rating`, `ua`, `at` | Client create-only |
| `toolRequests/{id}` | Public "suggest a tool" board | `title`, `description`, `votes`, `status`, `createdBy` | Client create; votes via server |
| `meta/usage_{yyyymmdd}` | Daily AI totals for the dashboard | `units`, `byTask {}`, `byProvider {}` | Server, one batched write per hour |

**Reserved for later (do not build now, keep names free):** `subscriptions/{uid}`, `credits/{uid}/ledger/{id}`, `payments/{eventId}`, `orgs/{orgId}`, `files/{id}` (when cloud storage arrives).

### Security rules (core)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{db}/documents {
    function signedIn() { return request.auth != null; }
    function isOwner(uid) { return signedIn() && request.auth.uid == uid; }
    // Rules cannot measure document bytes: enforce <= 500 KB in the client, check field lengths here

    match /users/{uid} {
      allow read: if isOwner(uid);
      allow create, update: if isOwner(uid)
        && !request.resource.data.diff(resource == null ? {} : resource.data)
             .affectedKeys().hasAny(['plan', 'entitlements'])
        && request.resource.data.favorites.size() <= 100;
      allow delete: if isOwner(uid);

      match /{sub}/{id} {
        allow read, delete: if isOwner(uid);
        allow create, update: if isOwner(uid) && sub in ['history','flows','items','collections'];
      }
    }
    match /shares/{id} {
      allow get: if true;              // by exact ID only
      allow list: if false;
      allow create: if signedIn() && request.resource.data.ownerUid == request.auth.uid;
      allow delete: if signedIn() && resource.data.ownerUid == request.auth.uid;
    }
    match /feedback/{id}   { allow create: if true; }
    match /toolRequests/{id} { allow read: if true; allow create: if signedIn(); }
    match /{document=**}   { allow read, write: if false; }
  }
}
```

Add field-level validation (string lengths, array sizes, allowed `kind` values) to each subcollection rule as features land, and cover the rules with the Firebase emulator test suite.

### Indexes

`history` by `at desc`; `items` by `kind + updatedAt desc` and `collectionIds array-contains + updatedAt desc`; `toolRequests` by `votes desc`.

## 15. Auth and security design

The biggest security win is structural: user files never reach a server, so there is no file data to leak. The remaining surface is accounts, the AI gateway (cost abuse) and the browser (XSS, malicious files).

### Authentication

- Providers: Google, GitHub, email magic link (passwordless). No passwords to store or reset.
- Signed-out users get a random `deviceId` (UUID in localStorage) used only for AI quota. Firebase Anonymous Auth is not used, to save MAUs and keep things simple.
- On first sign-in: create `users/{uid}`, merge local favourites/history, then clear local copies.
- Server routes verify the Firebase ID token with `firebase-admin` (`verifyIdToken`, checking revocation for sensitive actions). Tokens are sent as `Authorization: Bearer`, never stored in cookies, so no CSRF exposure.
- Authorised domains in Firebase: `mytoolsbox.me`, `www.mytoolsbox.me`, preview domain for staging only.
- Account settings: export my data (JSON download), delete account (deletes all subcollections via a server route, then the Auth user).

### Threats and controls

| Threat | Control |
| --- | --- |
| AI cost/quota abuse, scripted calls | Turnstile on anonymous AI, Upstash sliding-window limits per IP + device + uid, per-task input caps, global daily cap, circuit breaker |
| Leaked API keys | All AI keys server-side only (`server-only` imports, no `NEXT_PUBLIC_`), stored in Vercel env vars, rotated quarterly; GitHub secret scanning on |
| Firestore data access | Owner-only rules, deny-by-default, no list on `shares`, emulator tests in CI |
| XSS via AI output or user Markdown | Render Markdown with `react-markdown` + `rehype-sanitize`; Mermaid in `securityLevel: 'strict'`; no `dangerouslySetInnerHTML` except sanitised SVG via DOMPurify |
| Malicious files (PDF/SVG/DOCX) | Parsed in workers, never executed; SVG sanitised with DOMPurify before display; pdf.js with `isEvalSupported: false` |
| Clickjacking, mixed content | CSP with `frame-ancestors 'none'`, HSTS (preload), `X-Content-Type-Options`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` limiting camera/mic to tools that need them |
| Supply chain | Lockfile committed, Dependabot, `npm audit` in CI, pin wasm/model asset versions with integrity hashes |
| Prompt injection in uploaded text | Delimited user content, "ignore embedded instructions" system rule, no tools/agents with side effects in v1 |
| Shared links exposing private data | Shares are explicit snapshots, unguessable 22-char IDs, optional expiry, `noindex`, owner can revoke |
| Spam on feedback/tool requests | Turnstile + length limits + rate limit |

### Content Security Policy (starting point)

```
default-src 'self';
script-src 'self' 'wasm-unsafe-eval' https://challenges.cloudflare.com https://apis.google.com;
worker-src 'self' blob:;
connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://identitytoolkit.googleapis.com
            https://securetoken.googleapis.com https://*.posthog.com https://*.sentry.io https://cdn.jsdelivr.net;
img-src 'self' data: blob: https:;
media-src 'self' blob:;
style-src 'self' 'unsafe-inline';
frame-src https://challenges.cloudflare.com https://*.firebaseapp.com;
frame-ancestors 'none';
```

Use a per-request nonce for inline scripts via Next.js middleware once the app is stable; start with the policy above in report-only mode for a week.

### Privacy and compliance

- Privacy policy states: files are processed locally; AI inputs are sent to named providers; analytics are cookieless; what is stored for signed-in users; how to delete it.
- No cookie banner needed if analytics stay cookieless and no ads are served (re-check when monetising).
- GDPR/CCPA basics: data export, deletion, contact address. Minimum age 13 in Terms (16 in the EU without parental consent).

## 16. SEO strategy

SEO is the main growth channel, and the registry makes it systematic: every tool, variant, Flow, calculator and AI app is a fast, static, fully rendered page with unique copy, structured data and dense internal links. Target: **\~600 quality indexable pages at launch** (about 150 tools, about 300 intent variants, about 40 Flows, about 60 guides and hubs), growing to 2,000+ in year 1.

### Page-level checklist (enforced by `check:tools`)

| Element | Rule |
| --- | --- |
| Title | ≤ 60 chars, job phrase first: "Compress PDF to 100KB Online – Free, No Upload |
| Meta description | 140–160 chars with the benefit + "free, private, no sign-up" |
| H1 | One per page, matches the search intent |
| Above the fold | The working tool. Content goes below it (Google rewards fast task completion) |
| Body copy | 300–800 unique words per tool: how-to steps, options explained, use cases, FAQ. Written per tool, never spun templates |
| Structured data | `WebApplication`/`SoftwareApplication` (free offer), `HowTo` where applicable, `FAQPage`, `BreadcrumbList`; `Organization` + `WebSite` with `SearchAction` on home |
| Canonical | Self-canonical; variants canonical to themselves only when their copy and preset differ meaningfully |
| Internal links | Breadcrumbs, 6 related tools, 2–3 related Flows, parent Space, contextual links inside copy |
| Images | Custom OG image per page from `/api/og` (tool name + Space colour); real before/after screenshots |
| Performance | LCP < 2.0 s, INP < 200 ms, CLS < 0.05 on mobile; tool JS loaded after first paint |

### Keyword clusters to own

1. **Target-size intent (high volume, weak competition):** "compress image to 20kb / 50kb / 100kb / 200kb", "resize photo 35x45 mm", "PDF under 1 MB" → variant pages with presets. Government and exam portals in South Asia generate huge demand here.
2. **Format pairs:** "HEIC to JPG", "PDF to PNG", "MP4 to GIF", "JSON to CSV".
3. **Calculators with local angles:** "salary tax calculator Pakistan 2026", "zakat calculator", "CGPA to percentage", "EMI calculator".
4. **Student intent:** "APA citation generator", "math problem solver with steps", "GPA calculator".
5. **Developer intent:** "JSON formatter", "regex tester", "JWT decoder", "cron expression generator".
6. **Flows (unique to us):** "convert PDF to JPG and compress", "scan to searchable PDF".

### Site-level

- `sitemap.ts` generates segmented sitemaps (tools, variants, flows, guides, spaces) with `lastmod` from the registry.
- `robots.ts` blocks `/me`, `/s/`, `/api/`.
- English only (lang en-US); no hreflang or translated pages.
- Guides (MDX) answer "how to" questions and link to tools: "How to reduce PDF size for email", "How to make a passport photo at home".
- A public changelog and "new tools" page give fresh, linkable content.
- Submit to Search Console and Bing on day one; use IndexNow for Bing/Yandex.
- Off-site: Product Hunt launch, AlternativeTo, Reddit (helpful answers, not spam), student communities, GitHub "awesome" lists for dev tools, a few free embeddable widgets (calculators) that link back.

### What not to do

No thousands of near-duplicate pages ("compress image to 37 KB"), no AI-spun filler, no keyword-stuffed footers. Google's helpful-content and scaled-content policies punish exactly that, and recovery takes months.

## 17. PWA, performance and accessibility

### PWA (installable, no app store)

- `manifest.ts`: name, short name, maskable icons (192/512), theme colours (light/dark), `display: standalone`, shortcuts to Compress Image, Merge PDF, Ask, Tray.
- **Share target:** the installed app appears in the phone's share sheet, so a user can share a photo or PDF straight into MyToolsBox and land in the Tray with suggested tools. This is a strong retention feature that most competitors lack.
- **File handlers** (desktop Chrome/Edge): open PDFs/images with MyToolsBox from the OS.
- Serwist service worker: precache shell + `offline: true` tools; runtime cache for WASM/model assets; offline page lists available tools.
- Install prompt shown after a user's 2nd successful task, never on first visit.
- **Android permissions:** none at install. Camera, microphone and file access are requested by the browser only when a tool needs them (scanner, recorder), with a pre-prompt explaining why. If you later publish to Google Play as a Trusted Web Activity, the same applies; the TWA needs only `INTERNET`.

### Performance budgets

| Metric | Budget |
| --- | --- |
| First-load JS (tool page) | ≤ 120 KB gzip before the tool engine loads |
| LCP (mobile, 4G) | < 2.0 s |
| INP | < 200 ms |
| CLS | < 0.05 |
| Lighthouse (Perf / A11y / SEO / Best practices) | ≥ 95 / 100 / 100 / 100 on templates |

Techniques: RSC for all static content, client islands only for the tool area, `next/font`, AVIF/WebP images, route-level code splitting, engines and WASM loaded on first interaction (or on hover/idle prefetch), no third-party scripts except analytics loaded after idle.

### Accessibility

WCAG 2.2 AA. Radix primitives for focus management; every tool operable by keyboard (drop zone has a button alternative); live regions announce progress and results; colour is never the only signal; captions and alt text in generated media where possible. Automated axe checks in Playwright on every template.

### Language

- English (US) only. No i18n library and no locale routing.
- All UI copy lives in `src/content/copy.ts`, so wording stays consistent and a rebrand is a small change.
- Numbers, currency, dates and units still use `Intl` with the `en-US` locale; metric/imperial is a user preference.

## 18. Monetization: free in year 1, then a fair model

Year 1 is completely free: no ads, no paywalls, no tips. That keeps the project clearly non-commercial (important for the free hosting tier, section 19) and builds the trust and traffic that make later revenue possible. The code ships with an **entitlements layer** so switching monetization on later is configuration, not a rebuild.

### Built now, switched off

- `src/server/entitlements.ts` answers `can(user, feature)` and `limit(user, resource)` from `config/limits.ts`. Today every user resolves to the `free` plan.
- `src/server/providers/payments/` has a `PaymentProvider` interface (`createCheckout`, `handleWebhook`, `getCustomerPortal`) with a `disabled` implementation.
- `features.ts` flag `payments: false`. The UI has no price mentions anywhere until it flips.

### Principles for the future model (year 2)

1. **Everything that runs on the user's device stays free forever.** It costs you nothing, so charging for it would be the "$10 for a free tool" pattern you want to avoid.
2. **Charge only for what costs you money:** AI usage above the free daily amount, cloud storage/sync of files, server-side conversions, team features.
3. **Tiny, regional prices.** Purchasing-power pricing so a student in Lahore and a freelancer in London both feel it is cheap.
4. **No ads**, or at most one clearly labelled sponsor slot per Space if numbers demand it. Ads would undermine the main differentiator.

### Candidate offer (to validate in year 2)

| Offer | What you get | Indicative price (US / PK) |
| --- | --- | --- |
| Free (forever) | All local tools, Flows, 40 AI units/day signed in, saved Flows and outputs | $0 |
| AI credit pack | +500 AI units, never expire | $1 / PKR 150 |
| Plus | 300 AI units/day, 10 GB cloud file sync, server conversions, priority models, no daily caps on Flows | $2.49/mo or $19/yr / PKR 299/mo |
| Lifetime supporter (limited) | Plus forever, badge, early features | $39 one-time (early adopters) |
| Teams/Education (later) | Shared Flows and brand kits, admin, invoices | Per seat, quote-based |
| Developer API (later) | Selected tools as an API | Usage-based |

### Payment provider shortlist (decide later)

Because Stripe does not onboard Pakistani sellers directly, use a **Merchant of Record** that handles global cards, PayPal, VAT and sales tax, and pays out to a channel available in Pakistan. Before choosing, confirm the payout method (Payoneer or a local bank) in each provider's current docs.

| Option | Strength | Check before choosing |
| --- | --- | --- |
| Paddle | Mature MoR, subscriptions + one-time, global tax | Approval process for small/new products; payout to Payoneer/bank |
| Lemon Squeezy | Simple setup, good for credits and licence-style products | Current payout countries and methods |
| Local add-on: Safepay / JazzCash / Easypaisa | PKR payments, higher local conversion | Business registration requirements |

When you enable payments: move hosting to a commercial plan, register a business entity (sole proprietorship is fine to start), update Terms/Privacy, and add a pricing page.

## 19. Budget

**Year 1 cash cost: $0.** The domain is covered by your Namecheap student offer and every service runs on a free tier. Plan a small reserve of about **$10–25/month** that you switch on only if traffic outgrows a free tier.

| Item | Year 1 | When it starts costing | Likely cost then |
| --- | --- | --- | --- |
| Domain mytoolsbox.me | $0 (student offer) | Renewal after 12 months | Roughly $15–25/yr (check Namecheap's renewal price now and set a reminder) |
| Hosting — Vercel Hobby | $0 | When you monetise (Hobby is [non-commercial only](https://vercel.com/docs/limits/fair-use-guidelines)) or exceed Hobby usage | Vercel Pro $20/mo, or move to Cloudflare Workers paid ($5/mo) |
| Firebase Auth + Firestore (Spark) | $0 | Beyond \~50K reads / 20K writes per day or 1 GiB stored ([pricing](https://firebase.google.com/pricing)) | Blaze pay-as-you-go: usually $1–10/mo at that point; set a budget alert |
| AI (Gemini, Groq, OpenRouter free tiers) | $0 | When daily caps are hit regularly | $5–30/mo on Flash-Lite-class models with caching |
| Upstash, Sentry, PostHog, Cloudflare | $0 | Large scale only | $0–10/mo |
| File storage | $0 (none, by design) | Only if you add cloud sync (Plus plan) | Cloudflare R2 ≈ $0.015/GB-month, no egress fees |

### Guardrails

- Never attach a card to Firebase until needed. When you upgrade to Blaze, set a $5 budget alert the same day.
- The global AI cap in `config/limits.ts` is set below the providers' free daily limits, so AI can never create a surprise bill.
- Review `docs/limits.md` monthly against real usage from the providers' dashboards.

### Your time (the real budget)

Working about 20–25 focused hours a week with Claude Code, the plan in section 21 reaches public launch in about 12 weeks. Free tiers that change their terms are the main risk; the provider interfaces keep any switch to a day or two of work.

## 20. Analytics and monitoring

Measure whether people finish jobs and come back. Track events, never file contents or AI prompt text.

| Event | Properties | Answers |
| --- | --- | --- |
| `tool_view` | toolId, space, source (search/internal/direct) | Which pages attract traffic |
| `tool_run` / `tool_success` / `tool_error` | toolId, engine, duration ms, input size bucket, error code | Completion rate and reliability per tool |
| `continue_with` | fromTool, toTool | Which Flows to pre-build |
| `flow_run` / `flow_saved` / `flow_shared` | stepCount, toolIds | Flow adoption |
| `ai_request` | task, provider, latency, cached, quota left | AI cost and speed |
| `search` / `ask_ai` | query length, matched (y/n), chosen result | Missing tools (unmatched queries = roadmap) |
| `sign_in`, `pwa_install`, `share_target_used` | method | Retention drivers |

### North-star and launch targets

| Metric | 3 months after launch | 12 months |
| --- | --- | --- |
| Monthly users | 10K | 150K |
| Tool completion rate (success / run) | ≥ 90% | ≥ 95% |
| Returning users (30-day) | 15% | 25% |
| Signed-in share of weekly actives | 5% | 12% |
| Indexed pages (Search Console) | 500 | 2,000 |

### Monitoring

- **Sentry:** client and server errors with release tags; alert on new issues and error spikes per tool.
- **Vercel:** function logs and usage; **Firebase:** usage dashboard; **Upstash:** command counts.
- **Uptime:** a free monitor (UptimeRobot or Better Stack free plan) on `/`, `/api/health` and one AI task.
- **Weekly review (30 minutes):** top unmatched searches, tools with the lowest completion rate, AI spend vs cap, Search Console queries with high impressions and low CTR (rewrite titles).

## 21. Step-by-step implementation plan

The plan is eight phases over about 12 weeks to public launch. The order is deliberate: the contract and templates first, then the cheap high-traffic tools, then AI, then the complex editors and Flows. Every phase ends deployed to production behind a `status: 'soon'` flag, so nothing waits for a "big bang".

&#91;embedded content: build roadmap · 8 phases over 12 weeks\]

About 110 local tools are live by week 6, so SEO indexing starts early while AI, Flows and the editors are built.

### Phase 0 — Setup (2–3 days)

1. Create the accounts in section 9 in order. Move Namecheap nameservers to Cloudflare; add Vercel DNS records (proxy off); set up email routing.
2. Create the GitHub repo, two Firebase projects (dev, prod), and Vercel project linked to `main` (prod) and PRs (preview).
3. Put this document in `docs/blueprint.md` and the CLAUDE.md from section 22 in the repo root.

**Done when:** `mytoolsbox.me` serves a "coming soon" page over HTTPS from Vercel.

### Phase 1 — Foundation (weeks 1–2)

1. Scaffold Next.js + TS strict + Tailwind v4 + shadcn/ui; ESLint, Prettier, Husky, Vitest, Playwright; GitHub Actions CI (lint, typecheck, test, build).
2. Design tokens, fonts, light/dark theme, Space colours; shell (header, footer, mobile bottom nav), 404, legal page stubs.
3. `src/tools/types.ts`, registry, `check:tools` validator, Space configs.
4. Generic routes: Space home, category, tool page with `generateStaticParams`; SEO builders (metadata, JSON-LD, OG route, sitemap, robots).
5. Firebase client/admin, auth modal (Google, GitHub, email link), `users/{uid}` creation, security rules + emulator tests.
6. Command palette with local search over the registry.

**Done when:** a dummy tool renders at `/dev/example` with full SEO, sign-in works, Lighthouse ≥ 95.

### Phase 2 — File engine, Docs and Images (weeks 3–4)

1. Worker pool (comlink), OPFS file store, capability detection, File Tray drawer, "Send to…".
2. File tool template (S5) with drop zone, presets, progress, result card, "Continue with…" (wired to registry ports).
3. Docs: all 22 tools (OCR and AI ones can follow in phase 4).
4. Media — image: all 14 tools including target-KB compression, passport photo, background removal (ONNX).
5. Content: write `content.mdx` (how-to + FAQ) for each tool as it lands.

**Done when:** 36 file tools pass unit tests with fixtures and E2E smoke tests; the Tray works across tools.

### Phase 3 — Dev, Calc and Work text tools (weeks 5–6)

1. Text/data template (S6) with CodeMirror, URL-hash sharing.
2. Dev: 18 local tools (README and code explainer wait for phase 4).
3. Calculator engine + template (S7): KaTeX formulas, charts, share links. Build all 40 calculators; health ones with sources and disclaimers.
4. Work: text tools, invoice/quotation/receipt (PDF export), resume builder, local to-do/Kanban, habit tracker.

**Done when:** \~110 tools are live; Search Console verified and sitemaps submitted (soft-index the first pages early).

### Phase 4 — AI gateway, Study and AI Studio (weeks 7–8)

1. AI provider interface + Gemini, Groq, OpenRouter adapters; task presets; Upstash rate limits; Turnstile; quotas; response cache; usage logging.
2. AI app template (S8) with streaming Markdown/KaTeX/Mermaid, quota meter, history.
3. Study Space (Math Solver with photo input + CAS check, citation generator, flashcards, quiz, GPA, planner).
4. AI Studio: 10 apps with versioned prompts in `src/ai-apps/prompts/` and safety presets.
5. AI tools in other Spaces (Chat/Summarise PDF, README, code explainer, cover letter, email writer); Ask bar AI intent.

**Done when:** every AI task has a prompt test set (5 inputs with expected qualities) and fails over correctly when the primary provider is blocked.

### Phase 5 — Flows, Create and Video (weeks 9–10)

1. Flow engine (typed steps, fan-out, step cache), Flow Builder (S12), save/share, 15 pre-built Flow pages.
2. Design Studio (Fabric.js): templates (20 to start: social posts, thumbnails, posters, certificates), text, shapes, images from Tray, background removal, export.
3. Diagram Studio: Excalidraw + Mermaid + AI text-to-diagram; QR, barcode, palette and other Create tools.
4. Video/audio tools with Mediabunny (ffmpeg.wasm fallback) and the simple video editor; Whisper speech-to-text.

**Done when:** "PDF → JPG → compress under 200 KB → ZIP" runs end-to-end on a mid-range Android phone.

### Phase 6 — Workspace, PWA and content (week 11)

1. Workspace (S14): favourites, history, saved Flows, saved outputs, collections, settings, data export, account deletion.
2. PWA: manifest, Serwist, offline page, share target, file handlers, install prompt logic.
3. 20 guides written; home page and Space pages polished with real usage art.

### Phase 7 — Hardening and launch (week 12)

1. Security headers + CSP (report-only → enforce), dependency audit, rules review, rate-limit load test.
2. Performance pass on every template; accessibility audit (axe + manual keyboard run).
3. Privacy policy, Terms, About, Contact; analytics events verified; Sentry alerts.
4. Soft launch to friends, student groups and Reddit for a week; fix the top issues.
5. Public launch: Product Hunt, AlternativeTo, LinkedIn/X posts, dev communities.

### After launch: 2-week release cycle

Each cycle: 8–15 new tools or variants chosen from unmatched searches and Search Console data, 2 new Flows, 4 guides, one quality improvement to the top 10 tools. Months 4–6: visual Flow graph, more templates. Months 6–12: optional cloud sync design, payment provider decision, rebrand decision.

## 22. Claude Code handover

You are **updating the existing repo** (`D:\self_skills\officialProjects\mytoolsbox-V2.0`), not starting a new one. Export this doc as Markdown to `docs/blueprint.md` in the repo, replace the current one-line `CLAUDE.md` with the file below, then run the prompts one at a time. Review the diff and the Vercel preview after each prompt before moving on.

### CLAUDE.md (copy into the repo root)

```markdown
@AGENTS.md

# MyToolsBox — project rules for Claude Code

## Context
Live site: https://www.mytoolsbox.me (Vercel, Firebase). This is an EXISTING codebase being
restructured into the blueprint in docs/blueprint.md. Read sections 24 (audit) and 25 (migration
plan) first, then the section relevant to the task. Work on branch restructure/v3 unless told otherwise.

## Non-negotiables
- Evolve, don't rewrite: git mv existing engines/logic; only rewrite what the audit flags.
- No URL may 404: every old path gets one 308 redirect via src/config/redirects.ts
  (generated from manifest legacySlugs). tests/fixtures/old-urls.txt must stay green.
- Files are processed in the browser (Web Workers + WASM). Never upload user files.
- Free product: no ads, no payments, no credits, no price copy. features.payments = false.
- No admin panel. Contact links to CONTACT_URL in src/config/site.ts.
- English (US) only. No i18n library. UI copy in src/content/copy.ts.
- Never name a page, tool, title or keyword after another company's product.
- Every tool implements src/tools/types.ts and is registered in src/tools/registry.ts.
- Engines are pure TS (no React/DOM), runnable in workers and Vitest. Manifests import nothing heavy.
- External services only via src/server/providers/* (ai, storage, payments, ratelimit).
- Secrets are server-only (import 'server-only'); never read NEXT_PUBLIC_*_API_KEY.
- Canonical host is https://www.mytoolsbox.me; brand/domain only from src/config/site.ts.

## Stack
Next.js 16 (App Router, proxy.ts), React 19, TypeScript strict, Tailwind v4, shadcn (Base UI),
Zustand, Zod 4, Firebase Auth + Firestore, pdf-lib, pdfjs-dist, Vitest, Playwright.
To add per blueprint: Vercel AI SDK, Upstash ratelimit, Turnstile, Serwist, comlink, FlexSearch.

## Conventions
- src/tools/{space}/{slug}/{manifest.ts,engine.ts,ui.tsx?,content.mdx,engine.test.ts}
- Spaces: docs, media, create, dev, study, calc, work, ai
- Server Components by default; 'use client' only for interactive islands.
- Design tokens only (blueprint section 6). Accessible by default.
- Conventional Commits. One concern per PR.

## Commands
npm run dev | build | lint | test | test:e2e (add: typecheck, check:tools, test:redirects, test:rules)

## Definition of done
- build, lint, typecheck, tests, check:tools and test:redirects pass
- New/moved tool: fixture test, content.mdx (how-to + 4–8 FAQs), related tools, legacySlugs
- No console errors; Lighthouse ≥ 95 perf/SEO on the affected template
- Update docs/ and docs/decisions.md when behaviour or structure changes
```

### First prompts (run in order)

1. **M0:** *"Read CLAUDE.md and docs/blueprint.md sections 24–25. Create branch restructure/v3. Run the build and tests and report failures. Fetch https://www.mytoolsbox.me/sitemap.xml, save every URL path to tests/fixtures/old-urls.txt, and add a test:redirects script that checks each path returns 200 within one redirect (against a preview URL passed as an env var). Delete the root helper scripts (analyze\_orphans.js, check\_hub\_coverage.js, compare\_slugs.js, count\_errors.js, find\_missing\_engines.js). Do not change features yet."*
2. **M1a:** *"Following section 24 findings 4, 5, 6, 9 and 10: remove admin, payments, credits, affiliates and cloud-upload code and their tests; remove the admin email from README.md; remove all NEXT\_PUBLIC\_*\_API\_KEY reads; keep only Gemini and Groq active in the AI router (leave other adapters in place but disabled); let signed-in users use AI with a fixed daily cap stored server-side. Show me the list of deleted files before deleting."\*
3. **M1b:** *"Fix findings 2, 3 and 7: create src/config/site.ts with SITE\_URL https://www.mytoolsbox.me and CONTACT\_URL (empty for now, so /contact shows a short placeholder); use it for metadataBase, canonicals, sitemap, robots and JSON-LD; remove the brand from seoTitle values so titles show it once; strip proxy.ts down to redirects only."*
4. **M1c:** *"Rename the 15 brand-named tools and merge duplicates per the section 25 table. Keep them under /tools/{new-slug} for now, add 308 redirects from the old slugs, rewrite their titles, descriptions, FAQs and keywords so no other company's product is named. Run test:redirects."* Then merge M1 to main and deploy.
5. **M2:** *"Implement blueprint sections 6 and 11 foundations in place: design tokens and fonts, the new app shell (Spaces menu, Ask bar placeholder, Tray button, mobile bottom nav), src/tools/types.ts, src/spaces/* configs and the check:tools validator. Do not move tools yet."\*
6. **M3:** *"Write scripts/codemod-registry.ts that splits src/content/tools/registry.ts and apps registry into src/tools/{space}/{slug}/manifest.ts files using the section 25 mapping, with legacySlugs. Run it, then move each tool's pure logic to engine.ts with git mv. Add generic routes /\[space\], /\[space\]/c/\[category\], /\[space\]/\[tool\], generated redirects and a new sitemap. Start with the Docs space only and show me the result before doing the others."*
7. **M4–M8:** one prompt per subsystem, e.g. *"Do M4 from section 25: worker pool, OPFS file store, File Tray and Continue with…, then convert src/features/workflows into the Flow engine with an importer for saved localStorage definitions."*

### Tips for working with Claude Code on this project

- Start each session with "Read CLAUDE.md and blueprint section X".
- Ask for a plan first on anything bigger than one tool, approve it, then let it build.
- Keep `docs/decisions.md`: one line per decision (date, choice, reason) so later sessions stay consistent.
- Test on a real mid-range Android phone every week; the browser does the heavy lifting, so device speed matters.

## 23. Risks, legal and future roadmap

### Top risks

| Risk | Likelihood | Impact | Mitigation |
| --- | --- | --- | --- |
| Scope too wide; launch slips or tools are shallow | High | High | Curated \~150 tools, phase gates, `status: 'soon'` flags, depth over count |
| Free AI tiers shrink or change terms | High | Medium | Multi-provider routing, caching, global cap, AI is additive (core tools need no AI) |
| Low-end devices struggle with video/ML | Medium | Medium | Capability detection, size guidance, WebCodecs first, honest messaging, remote engine slot |
| SEO takes 4–9 months to build | High | Medium | Target-size and local long-tail keywords first, communities, Product Hunt, embeddable calculators |
| Firestore Spark limits hit by growth | Medium | Low | Read-light schema, Redis counters, upgrade to Blaze with budget alert (costs stay small) |
| Hosting terms (non-commercial Hobby plan) | Low in year 1 | Medium | No revenue in year 1; move to a commercial plan before any payments |
| Wrong health/finance/farming advice | Medium | High | Sourced formulas, disclaimers, safety presets, no diagnosis or prescriptions, "consult a professional" |
| Copyright misuse (downloaders, watermark removal) | Medium | High | Not offered; Terms prohibit infringing use |

### Legal checklist

- Terms of Service, Privacy Policy, acceptable use, AI disclaimer, health/finance disclaimers on relevant pages.
- Open-source licence compliance: a `/licenses` page generated from dependencies (MIT/Apache attributions). Avoid AGPL/GPL libraries in client bundles; check model licences (some background-removal models are non-commercial — pick permissively licensed ones before monetising).
- Fonts: Bricolage Grotesque and Geist are under the SIL Open Font License.
- Templates and icons in Design Studio: only CC0/MIT assets or your own.
- Trademark: search "MyToolsBox" before investing in branding; plan the rebrand name with a .com available.

### Future roadmap (after launch)

| When | Theme | Highlights |
| --- | --- | --- |
| Months 1–3 | Depth and traffic | Weekly tools from search data, 40 more Flows, 60 guides |
| Months 4–6 | Power features | Visual branching Flow graph, Flow templates gallery, more Design Studio templates, collaborative share-to-edit for diagrams |
| Months 6–9 | Platform | Browser extension (right-click → send to MyToolsBox), public tool request board |
| Months 9–12 | Business readiness | Payment provider decision, credits + Plus pilot, optional cloud file sync (R2), rebrand decision |
| Year 2 | Scale | Play Store listing (TWA) after the rebrand, Teams/Education, developer API, server engines for high-fidelity Office conversion, more industry Spaces (Health Pro, Farm, Engineering) if data supports them |

### Open questions for you

- [ ] Do you want Urdu in the first language wave, or English-only until month 3?
- [ ] Which 3 AI Studio apps matter most to you personally? They should get the most prompt-tuning time.
- [ ] Is a Play Store listing a goal for year 1, or only after the rebrand?

**Answered (Nov 21):** English only, with no other languages planned. The priority AI apps are Claude's choice: Math Solver, Farm Advisor and Project Ideas AI. Play Store comes after the rebrand.

## 24. Audit of the existing site and code

**Verdict: keep the engine work and re-home it. Don't rewrite.** The repo has about 140 working client-side tool engines, 22 apps, a solid local Workflows engine (36 presets) and a correct PDF.js setup. That is months of value. The problems are structure and a few risky choices: duplicate products, pages named after other companies' brands, paid-plan code that contradicts the free model, and SEO host mismatches. Audited on Nov 21, 2026 from `D:\self_skills\officialProjects\mytoolsbox-V2.0` and the live site.

### What exists today

| Area | Current state |
| --- | --- |
| Stack | Next.js 16.3, React 19.2, TypeScript strict, Tailwind v4, shadcn (Base UI), Zustand, Zod 4, Firebase 12, pdf-lib, pdfjs-dist 6, Tesseract.js, JSZip, Vitest, Playwright. Matches the blueprint well |
| Routes | `/tools/[slug]` (147 tools), `/apps/[slug]` (22 apps), `/workflows`, `/hubs/[slug]` (8 role hubs), `/blog/[slug]`, `/resources/[slug]`, `/search`, `/settings` (account/favourites/history tabs), `/dashboard`, `/admin`, plus legal pages |
| Catalog | One 190 KB `content/tools/registry.ts` + `content/apps/registry.ts` + `content/hubs/registry.ts`; engines mapped by hand in `features/engine-registry.ts` and `features/app-engine.tsx` |
| Engines | `src/features/{documents,images,tools,apps}/` with a `*-engine.tsx` (UI) and often a pure `*.ts` (logic) per tool. The pure files are reusable as blueprint `engine.ts` files |
| Workflows | `src/features/workflows/` (model, runner, image, presets, storage, UI). Local-only, typed steps, size-target compression, ZIP. This is the seed of Flows |
| AI | `/api/ai` with Gemini, Groq, OpenAI, Claude, DeepSeek, Mistral adapters; sign-in plus a credits system required |
| Accounts | Firebase Auth; favourites/history/saved/credits/usage as subcollections under `users/{uid}` |
| Sitemap | 217 URLs, host `https://mytoolsbox.me` |

### Findings, ranked

| # | Severity | Finding | Fix |
| --- | --- | --- | --- |
| 1 | Critical (legal) | 15 tool pages are named after other companies' products: `canva`, `photopea`, `snagit`, `awesome-screenshot`, `runway`, `julius-ai`, `photolemur`, `perfectly-clear`, `softcolor-auto-enhance`, `smallpdf`, `foxit-pdf`, `nitro-pro`, `soda-pdf`, `pdfelement`, `rfp-monkey`. Titles like "Free Canva Design Studio" and FAQs describing the real products are trademark and consumer-deception risks, and Google treats them as misleading | Rename to generic tools, merge duplicates, 301 the old URLs (map in section 25) |
| 2 | High (SEO) | Canonicals and sitemap use `https://mytoolsbox.me`, but the apex 308-redirects to `www`. Every canonical points at a redirect | Set `SITE_URL = https://www.mytoolsbox.me` everywhere (metadataBase, canonical, sitemap, robots, JSON-LD) |
| 3 | High (SEO) | Titles repeat the brand: "Free PDF Merger … \| MyToolsBox \| MyToolsBox" (the template adds it twice) | Remove the brand from `seoTitle` values; let the layout template add it once |
| 4 | High (model) | Stripe, credit packs, affiliates, organisations, `requiresPro`, "1,000 free credits" copy, and AI locked behind sign-in + credits | Delete payments/credits code; replace with the quota system in section 13 (anonymous users get a small daily AI allowance) |
| 5 | High (security) | AI provider config falls back to `NEXT_PUBLIC_GEMINI_API_KEY` / `NEXT_PUBLIC_GROQ_API_KEY`, which would ship keys to the browser if set | Server-only keys; remove all `NEXT_PUBLIC_*_API_KEY` reads |
| 6 | High (security) | Firestore rules let users write their own `credits` and `usage` docs | Rules rewritten to section 14; counters move to the server |
| 7 | Medium | `proxy.ts` runs an in-memory abuse check on every page and API call (ineffective on serverless, adds latency) and gates pages on a `__session` cookie the Firebase client never sets | Strip `proxy.ts` to redirects only; rate-limit just the AI routes with Upstash |
| 8 | Medium | Duplicate products: invoice-generator vs invoice-maker, habit-tracker tool vs app, flashcard-generator vs flashcard-creator, diagram-maker vs ai-diagram-generator, quiz tools, notes-app vs online-notepad, video-to-gif vs video-to-gif-maker | One canonical product each; redirects for the rest |
| 9 | Medium | Admin panel and admin API with a hard-coded admin email (also printed in README.md) | Delete `/admin`, `/api/admin`, `lib/auth/admin-*`, related tests; remove the email from README |
| 10 | Medium | Cloud upload scaffolding (`lib/processing/cloud/*`) contradicts "files never leave the device" | Delete for now; the `storage` provider interface replaces it later |
| 11 | Medium | Tools that can't work honestly client-side or for free: `url-shortener` (needs a database), `webhook-tester` (needs a server), `plagiarism-checker` (no reliable free method), `ai-image-generator` (cost) | Retire or mark `soon`; 301 to related tools |
| 12 | Low | Root clutter: `analyze_orphans.js`, `check_hub_coverage.js`, `compare_slugs.js`, `count_errors.js`, `find_missing_engines.js`; `CLAUDE.md` only imports `AGENTS.md`; tests live in one 33-file `src/__tests__` folder | Move useful scripts to `scripts/`, delete the rest, colocate tests with tools, write the real CLAUDE.md |
| 13 | Low | GA4 sets cookies (a consent banner is needed for EU visitors) | Switch to PostHog cookieless + Cloudflare Web Analytics, or add consent mode |
| 14 | Low | Hubs, blog and resources overlap with Spaces and guides | Hubs → Space redirects; blog and resources → `/guides` (keep the content) |

### Worth keeping as-is or nearly

Workflows runner and size-target compression; PDF.js same-origin asset setup (`scripts/copy-pdfjs-assets.mjs`); pure logic files (`*.ts` next to engines) and their tests; math engine (`lib/math`), farming engine (`lib/farming`), citation, GPA, finance and unit logic; the AI adapter pattern (keep Gemini and Groq active, OpenAI/Claude adapters disabled for later); shadcn UI primitives; OG image route.

## 25. Migration plan for the existing repo

The repo becomes the blueprint in nine phases (M0–M8, about 8 weeks). The site stays live throughout: work happens on a `restructure/v3` branch with Vercel preview deploys, and each phase merges once it builds, passes tests and keeps every old URL working. M1 (cleanup) ships to production first because it removes the legal and security risks.

### Ground rules for Claude Code

1. **Move, don't rewrite.** Use `git mv` for engines and logic so history is kept. Rewrite only what the audit flags.
2. **No URL dies.** Every old path returns a single permanent redirect (308) to a live page. Redirects live in `src/config/redirects.ts`, built from each manifest's `legacySlugs`, and are served by `next.config.ts` `redirects()`.
3. **Old URL test.** Before any change, save the current sitemap URL list to `tests/fixtures/old-urls.txt`. A test asserts each one resolves to 200 in at most one redirect.
4. **Small PRs.** One concern per PR (one Space category, one subsystem). Build, lint, typecheck and tests green before merge.
5. **Keep users' local data.** Saved workflow definitions (localStorage) and drafts must load after the migration (an importer converts them).

### Where current code goes

| Current location | New home (section 10 structure) |
| --- | --- |
| `src/content/tools/registry.ts` + `features/engine-registry.ts` | One `manifest.ts` per tool in `src/tools/{space}/{slug}/`, collected by `src/tools/registry.ts` (generated once by a codemod script, then hand-edited) |
| `src/features/{documents,images,tools}/*.ts` (pure logic) | `src/tools/{space}/{slug}/engine.ts` |
| `src/features/**/*-engine.tsx` (UIs) | `src/tools/{space}/{slug}/ui.tsx`; simple tools move to the shared File/Text/Calculator templates and lose their custom UI |
| `src/content/apps/registry.ts` + `features/apps/*` | AI apps → `src/ai-apps/{app}/`; editors (resume, invoice, presentation, diagram, image, video, certificate, budget) → `src/tools/{space}/{slug}/` with `template: 'editor'` |
| `src/features/workflows/*` | `src/runtime/flow-engine.ts` (runner), `src/flows/` (presets as recipes), `src/app/flows/` (pages) |
| `src/lib/processing/client/*` | `src/runtime/workers/*` |
| `src/lib/ai/*`, `app/api/ai/*` | `src/server/providers/ai/*`, `src/ai-apps/prompts/*`, `src/app/api/ai/[task]/route.ts` |
| `src/lib/math`, `src/lib/farming`, `src/lib/documents` | `src/lib/math`, `src/lib/farming`, `src/lib/documents` (unchanged) |
| `src/lib/constants.ts`, `src/lib/ui-copy.ts` | `src/config/site.ts`, `src/content/copy.ts` |
| `src/content/blog/*`, `features/resources/*` | `content/guides/*.mdx` |
| `src/__tests__/*`, `e2e/` | Tests colocated as `*.test.ts`; `tests/e2e/` |
| **Deleted:** `app/admin`, `app/api/admin`, `lib/auth/admin-*`, `lib/payments/*`, `lib/credits/*`, `app/api/ai/credits`, `lib/processing/cloud/*`, `content/hubs`, `app/dashboard`, root `*.js` helper scripts, admin/credit/payment tests | Fresh `src/server/providers/payments/` interface with a `disabled` implementation |

### URL redirect rules

| Old URL | New URL |
| --- | --- |
| `/tools/{slug}` | `/{space}/{new-slug}` from the manifest's `legacySlugs` (e.g. `/tools/pdf-merger` → `/docs/merge-pdf`, `/tools/image-compressor` → `/media/compress-image`, `/tools/bmi-calculator` → `/calc/bmi-calculator`) |
| `/tools?category={c}` | Matching Space or category (`documents` → `/docs`, `images`/`video`/`audio` → `/media`, `developer`/`security` → `/dev`, `calculators` → `/calc`, `academic` → `/study`, `writing`/`productivity` → `/work`, `design` → `/create`) |
| `/apps/{slug}` | `/ai/{app}` for AI apps, `/{space}/{slug}` for editors |
| `/workflows`, `/workflows?preset={p}` | `/flows`, `/flows/{p}` |
| `/hubs/{role}` | `students` → `/study`, `developers` → `/dev`, `business` and `writers` → `/work`, `designers` → `/create`, `researchers` → `/study`, `farmers` → `/ai/farm-advisor`, `everyone` → `/` |
| `/blog/{slug}`, `/resources/{slug}` | `/guides/{slug}` |
| `/settings` (any tab), `/dashboard`, `/favorites`, `/history`, `/account` | `/me` with the matching tab |
| `/contact` | `CONTACT_URL` (temporary 307 until you add the link) |

### Brand-named, duplicate and retired pages

| Old slug(s) | Becomes |
| --- | --- |
| `canva` | `/create/design` (Design Studio) |
| `photopea`, app `image-editor` | `/media/photo-editor` |
| `snagit`, `awesome-screenshot`, `screen-recorder` | `/media/screen-recorder` (capture + annotate) |
| `runway`, app `video-editor` | `/media/video-editor` |
| `photolemur`, `perfectly-clear`, `softcolor-auto-enhance` | `/media/auto-enhance-photo` |
| `smallpdf`, `foxit-pdf`, `nitro-pro`, `soda-pdf`, `pdfelement` | `/docs/edit-pdf` (annotate, add text, sign) |
| `onlyoffice-editor` | `/docs/word-to-pdf` (drop OnlyOffice: AGPL and server-based) |
| `rfp-monkey`, `proposal-generator` | `/work/proposal-generator` |
| `julius-ai` | `/ai/chat` |
| `invoice-generator`, app `invoice-maker` | `/work/invoice-generator` |
| `habit-tracker` (tool and app) | `/work/habit-tracker` |
| `flashcard-generator`, `flashcard-creator` | `/study/flashcards` |
| app `diagram-maker`, app `ai-diagram-generator` | `/create/diagram` |
| `quiz-generator`, `quiz-maker`, app `ai-quiz-generator` | `/study/quiz-maker` |
| `notes-app`, `online-notepad` | `/work/notepad` |
| `paraphrase-tool`, `paragraph-rewriter` | `/work/paraphraser` |
| `text-summarizer`, `ai-summary-tool` | `/work/summarizer` |
| `resume-builder`, `cv-maker`, `ai-resume-maker` | `/work/resume-builder` |
| `url-shortener`, `webhook-tester`, `plagiarism-checker`, `ai-image-generator` | Retired: redirect to `/dev/api-request-tester`, `/dev`, `/work/grammar-checker`, `/ai` respectively |

### Firestore data migration

- Deploy the section 14 rules together with read access to the old subcollections (`profile`, `preferences`, `favorites`, `saved`) for one release.
- On sign-in, a one-time client step copies old favourites and preferences into the `users/{uid}` document, `saved` into `items`, maps old tool IDs to new IDs, and sets `schemaVersion: 3`.
- `credits` and `usage` become server-only (rules deny client writes). Old `ai_conversations` stay readable; new ones go to `aiHistory`.
- After 90 days, remove the compatibility rules.

### Phases

1. **M0 — Baseline (1–2 days).** Create the branch; run build and tests; save `old-urls.txt` from the live sitemap and a Lighthouse baseline; replace CLAUDE.md (section 22); delete root helper scripts.
2. **M1 — Risk cleanup, ships to production (2–3 days).** Delete admin, payments, credits, cloud upload and their tests; remove the admin email from README; remove `NEXT_PUBLIC_*_API_KEY` reads and disable OpenAI/Claude/DeepSeek/Mistral in the router; strip `proxy.ts` to redirects; set the canonical host to `www`; fix double-brand titles; rename the 15 brand pages to generic names with redirects (still under `/tools` for now); free AI for signed-in users with a simple daily cap until M5.
3. **M2 — Foundations (week 1–2).** `src/config/site.ts`, design tokens and fonts (section 6), new shell (Spaces menu, Ask bar, Tray button, mobile bottom nav), tool contract `src/tools/types.ts`, Space configs, `check:tools`.
4. **M3 — Catalog to Spaces (weeks 2–4).** Codemod splits the registry into per-tool manifests with `legacySlugs`; pure logic moves to `engine.ts`; generic `/{space}/[tool]` routes, Space and category pages; generated redirects and sitemap; old-URL test green. Simple tools adopt templates; complex tools keep `ui.tsx`.
5. **M4 — Runtime and Flows (weeks 4–5).** Worker pool, OPFS store, File Tray, "Continue with…"; Workflows becomes Flows with an importer for saved definitions; pre-built Flow pages.
6. **M5 — AI gateway (weeks 5–6).** Section 13: task presets, quotas, Upstash, Turnstile, anonymous allowance, caching, failover; AI apps re-homed under `/ai`; the three priority apps tuned with test sets.
7. **M6 — Workspace and data (week 6).** `/me` (favourites, history, Flows, saved, settings, export, delete account); Firestore migration and new rules with emulator tests.
8. **M7 — Content and SEO (week 7).** Blog and resources to `/guides`; Space page copy; fill FAQ/how-to gaps; structured data; submit the new sitemap; watch Search Console for 404s and redirect errors for 4 weeks.
9. **M8 — Blueprint gaps (week 8 onward).** Build what the repo lacks, in this order: PWA (Serwist, share target), Ask bar with AI fallback, passport photo + background removal (ONNX), Design Studio (Fabric.js), Diagram Studio (Excalidraw + Mermaid), Mediabunny video path, Whisper speech-to-text, calculators to 40, remaining Study tools. Then switch to the 2-week release cycle (section 21).

## Sources

- [Vercel fair use guidelines (Hobby is non-commercial)](https://vercel.com/docs/limits/fair-use-guidelines)
- [Firebase pricing (Spark limits)](https://firebase.google.com/pricing)
- [Cloud Storage for Firebase requires the Blaze plan](https://firebase.google.com/docs/storage/faqs-storage-changes-announced-sept-2024)
- [Gemini API pricing and free tier](https://ai.google.dev/gemini-api/docs/pricing) · [rate limits](https://ai.google.dev/gemini-api/docs/rate-limits)
- Competitor details from each product's public site (linked in section 3). Free-tier numbers change often; re-check them at sign-up.
