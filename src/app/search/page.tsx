import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import { SPACES, type SpaceId } from "@/spaces";
import { SpaceGlyph } from "@/components/shell/space-glyph";
import { searchTools } from "@/tools/search";
import { buildSearchDocs } from "@/tools/search-docs";

export const metadata: Metadata = {
  title: "Search",
  description: "Find the right tool for your job.",
  robots: { index: false, follow: true },
};

type Props = { searchParams: Promise<{ q?: string }> };

export default async function SearchPage({ searchParams }: Props) {
  const q = ((await searchParams).q ?? "").slice(0, 120);
  const results = q.trim() ? searchTools(buildSearchDocs(), q, 30) : [];

  return (
    <div className="mx-auto max-w-[800px] px-4 py-8 md:px-6">
      <h1 className="text-[28px] leading-tight font-bold">Search</h1>
      <form action="/search" className="mt-4 flex gap-2" role="search">
        <label className="relative flex-1">
          <span className="sr-only">What do you need to do?</span>
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            name="q"
            defaultValue={q}
            placeholder="e.g. compress a photo to 100 KB"
            className="h-11 w-full rounded-lg border bg-card pr-3 pl-9 text-[15px] outline-none focus-visible:border-foreground/30"
          />
        </label>
        <button type="submit" className="h-11 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground">
          Search
        </button>
      </form>

      {q && (
        <p className="mt-6 text-sm text-muted-foreground">
          {results.length ? `${results.length} ${results.length === 1 ? "result" : "results"} for “${q}”` : `Nothing matches “${q}”. Try fewer or different words, or browse a Space.`}
        </p>
      )}

      {results.length > 0 && (
        <ul className="mt-3 divide-y rounded-xl border bg-card">
          {results.map((r) => {
            const space = SPACES.find((s) => s.id === r.space);
            return (
              <li key={r.id}>
                <Link href={r.url} className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/60">
                  <span style={{ color: space?.color }}>
                    <SpaceGlyph space={r.space as SpaceId} className="size-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium">{r.name}</span>
                    <span className="block truncate text-sm text-muted-foreground">{r.tagline}</span>
                  </span>
                  <span className="text-xs text-muted-foreground">{r.ai ? "AI" : space?.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      {(!q || !results.length) && (
        <div className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {SPACES.map((s) => (
            <Link key={s.id} href={`/${s.slug}`} className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2.5 text-sm hover:border-foreground/20">
              <span style={{ color: s.color }}>
                <SpaceGlyph space={s.id} className="size-4" />
              </span>
              {s.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
