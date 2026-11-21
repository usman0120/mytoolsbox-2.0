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

## Decisions log
See docs/decisions.md.
