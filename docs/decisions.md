# Decisions

| Date | Decision | Reason |
| --- | --- | --- |
| 2026-11-21 | Work on branch restructure/v3; stop for review after each phase | User choice |
| 2026-11-21 | Only Gemini + Groq keys exist; Upstash, Turnstile, Sentry, PostHog built behind interfaces with no-op fallback when env is missing | User choice |
| 2026-11-21 | Anonymous users get AI (10/day), signed-in 40/day, global cap 1200/day; counters in Upstash if configured, else in-memory | Blueprint section 13; M5 adds Turnstile and response cache |
| 2026-11-21 | Duplicates kept by stronger engine: apps invoice-maker, habit-tracker, ai-diagram-generator; tools flashcard-creator, notes-app, paraphrase-tool, text-summarizer | Final /{space} slugs come in M3 |
| 2026-11-21 | Root audit scripts compare_slugs/count_errors kept as scripts/catalog-audit.cjs and scripts/lint-summary.cjs | Used by catalog integrity tests until check:tools exists |
