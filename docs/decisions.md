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
