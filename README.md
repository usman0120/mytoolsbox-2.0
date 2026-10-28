# MyToolsBox

Tools for focused tasks, apps for deeper work, and **Workflows** for connected file processing.

Website: [mytoolsbox.me](https://mytoolsbox.me)

## Platform

- **`/tools`** — document, image, text, developer and calculation utilities.
- **`/apps`** — dedicated workspaces, including **AI Chat at `/apps/ai-chat`**.
- **`/workflows`** — a local pipeline builder with 36 presets and 25 supported operations.
- **`/hubs`, `/resources`, `/blog`** — role-based directories and practical guides.
- **`/settings`** — account, favorites and history tabs.

The interface is US English only. Language switching, translation catalogs, translation models and the prompt library have been removed. The old `/ai` entry redirects to `/apps/ai-chat`; the prompt-library route is no longer provided.

## Workflows

Choose input files once. Each step receives the previous step’s actual output; no intermediate downloads or re-uploads are necessary. Workflow file content is not uploaded to a server.

For example, **PDF → images under 200 KB** renders PDF pages, compresses each JPEG to **less than 200,000 bytes**, verifies the real output sizes, and packages the images into a ZIP.

### Supported operations

| Category | Operations |
| --- | --- |
| PDF | Render pages to images, merge, split, extract pages, watermark, images to PDF |
| Images | Resize, center-crop, convert, size-target compression, grayscale, watermark, rotate/flip |
| Text | Cleanup, case conversion, duplicate-line removal, natural line sorting, literal replacement, analysis reports |
| Data | CSV to JSON, JSON validation/formatting/key sorting, flat JSON records to spreadsheet-safe CSV |
| Files | Safe renaming, SHA-256 manifest generation, ZIP packaging |

Only the listed local processors are chainable. AI/cloud operations and executable scripts are deliberately excluded from workflows.

### Builder features

- Built-in presets, categorized search, and configurable step settings.
- Drag-to-reorder and keyboard-accessible move/delete controls.
- Input/output compatibility checks and validated options.
- File-order controls, direct text/JSON/CSV input and multiple-file processing.
- Actual processing progress, step reports, cancellation and rerunning retained inputs.
- Image previews, individual downloads and ZIP downloads.
- Save, edit, duplicate, delete, import and export workflow definitions.

Definitions save in this browser’s local storage, **not to an account or server**. Input files and outputs are not intentionally persisted across reloads. Keep an exported JSON backup; shared browsers share locally saved definitions. Storage errors are surfaced rather than reported as successful saves.

### Limits and output accuracy

- Up to 16 steps, 30 input files and 100 MB total input per run.
- Up to 100 output files and 256 MB of intermediate output.
- PDF page rendering: at most 100 pages per document; rendering resolution is bounded to protect browser memory.
- Text/data processing: at most 5 MB per file; CSV/line sorting has row-count limits.
- A run has a five-minute deadline. Some browser encodes finish before cancellation takes effect.
- JPEG encoding is lossy and flattens transparency onto white. The target compressor retains already-compliant JPEG/WebP bytes rather than recompressing them unnecessarily. Otherwise it may reduce quality and dimensions; if a target cannot be met within the configured limits, the workflow fails clearly. Use an explicit image-conversion step when re-encoding/metadata removal is needed.
- Requested MIME types are checked against actual canvas output, so unsupported WebP export is not silently mislabeled as successful.
- Rasterizing PDFs removes searchable text. PDF editing can invalidate signatures or affect interactive document features. Encrypted PDFs and unsupported codecs/fonts can fail.
- CSV values are preserved as strings. JSON-to-CSV accepts flat objects; null/missing cells become empty cells. Spreadsheet-safe mode prefixes common formula-like values.
- Text-analysis character counts use Unicode code points and also report UTF-16 code units; reading time is an estimate.

Inspect important outputs before sharing or relying on them. Browser support and available memory vary, especially on mobile.

### Implementation and references

Workflow code lives in `src/features/workflows/`: operation definitions and validation in `model.ts`, local processing in `runner.ts` / `image.ts`, presets in `presets.ts`, persistence in `storage.ts`, and the UI in `workflows-client.tsx`.

PDF rendering uses the pinned PDF.js dependency with a **same-origin browser module, worker, fonts and decoders**, reading file bytes rather than uploading URLs. The large browser-only runtime is loaded natively only when rendering, not evaluated in the server build graph. `scripts/copy-pdfjs-assets.mjs` prepares these assets automatically before development and production builds. Generated assets in `public/pdfjs/` are ignored by Git and recreated by the build hooks.

Implementation and preset research references:

- [PDF.js examples: documents, pages and canvas rendering](https://mozilla.github.io/pdf.js/examples/)
- [MDN: canvas `toBlob`, MIME fallback and lossy quality](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob)
- [pdf-lib](https://pdf-lib.js.org/)
- [JSZip](https://stuk.github.io/jszip/)

## Local development

Use Node.js 24 or a compatible Node.js version satisfying the pinned dependencies.

```sh
npm ci
npm run dev
```

Copy `.env.example` to `.env.local` if authentication or AI features are needed. Keep private credentials server-side and never commit environment files. Local workflows do not require Firebase sign-in or AI provider credentials.

```sh
npm test
npm run lint
npm run build
npm start
```

Production builds use `tsconfig.build.json` to check application/test code and fresh production route types without stale development-cache types. Type checking is not disabled.

## AI, accounts and privacy

AI Chat is an app and uses configured online providers. AI requests require sign-in, internet access and available credits. AI output can be inaccurate and needs independent verification. Conversation synchronization and account favorites/history use online services; local workflows do not transmit file content to these services.

`/admin` and privileged APIs authorize only the Firebase-verified email **akbarali69048@gmail.com** with verified email ownership. Account inactivity/deletion-request flags currently update stored status only; they do not revoke sessions or automatically erase accounts. Permanent removal requires contacting support.

Existing consolidated product links redirect to their canonical workspaces: resume/CV/AI resume tools to `/apps/resume-builder`, quiz tools/AI quiz to `/apps/quiz-maker`, AI presentation to `/apps/presentation-maker`, MP3 cutter to audio cutter, and the duplicate GIF maker to the remaining GIF tool. Existing draft and saved-item IDs are retained.
