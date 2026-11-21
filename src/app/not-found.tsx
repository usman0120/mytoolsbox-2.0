import Link from "next/link";
import { Search } from "lucide-react";
import { SPACES } from "@/spaces";
import { SpaceGlyph } from "@/components/shell/space-glyph";
import { getManifestById, toolUrl } from "@/tools/registry";

const POPULAR = ["media.compress-image", "docs.merge-pdf", "docs.compress-pdf", "dev.json-formatter", "ai.math-solver", "calc.loan-calculator"];

/** 404 with search and popular tools (blueprint S16). */
export default function NotFound() {
  const popular = POPULAR.map(getManifestById).filter((m) => m !== undefined);
  return (
    <div className="mx-auto max-w-[760px] px-4 py-16 md:px-6">
      <p className="font-mono text-sm text-muted-foreground">404</p>
      <h1 className="mt-2 text-[32px] leading-tight font-bold md:text-[40px]">This page doesn&apos;t exist</h1>
      <p className="mt-2 text-muted-foreground">It may have moved when tools were reorganized into Spaces. Search for the job you came to do:</p>

      <form action="/search" role="search" className="mt-6 flex gap-2">
        <label className="relative flex-1">
          <span className="sr-only">Search tools</span>
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <input name="q" placeholder="e.g. merge PDF" className="h-11 w-full rounded-lg border bg-card pr-3 pl-9 outline-none focus-visible:border-foreground/30" />
        </label>
        <button type="submit" className="h-11 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground">
          Search
        </button>
      </form>

      <h2 className="mt-10 mb-3 font-sans text-sm font-semibold text-muted-foreground">Popular tools</h2>
      <ul className="grid gap-2 sm:grid-cols-2">
        {popular.map((m) => (
          <li key={m.id} className="min-w-0">
            <Link href={toolUrl(m)} className="block min-w-0 rounded-lg border bg-card px-4 py-3 transition-colors hover:border-foreground/20">
              <span className="block font-medium">{m.name}</span>
              <span className="block truncate text-sm text-muted-foreground">{m.tagline}</span>
            </Link>
          </li>
        ))}
      </ul>

      <h2 className="mt-10 mb-3 font-sans text-sm font-semibold text-muted-foreground">Spaces</h2>
      <div className="flex flex-wrap gap-1.5">
        {SPACES.map((s) => (
          <Link key={s.id} href={`/${s.slug}`} className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm hover:border-foreground/30">
            <span style={{ color: s.color }}>
              <SpaceGlyph space={s.id} className="size-3.5" />
            </span>
            {s.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
