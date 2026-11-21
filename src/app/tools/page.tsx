import type { Metadata } from "next";
import Link from "next/link";
import { SPACES } from "@/spaces";
import { SpaceGlyph } from "@/components/shell/space-glyph";
import { TOOL_MANIFESTS, toolUrl } from "@/tools/registry";
import { pageMetadata } from "@/lib/seo/manifest";

export const metadata: Metadata = pageMetadata({
  title: "All Tools A–Z",
  description: `Every MyToolsBox tool from A to Z: ${TOOL_MANIFESTS.length} free tools for PDFs, images, video, code, study, calculators and AI. Private and no sign-up.`.slice(0, 160),
  path: "/tools",
});

/** Crawlable A–Z index of every tool (blueprint S1: footer A–Z link). */
export default function AllToolsPage() {
  const tools = TOOL_MANIFESTS.filter((m) => m.status !== "soon").sort((a, b) => a.name.localeCompare(b.name, "en-US"));
  const groups = Object.entries(Object.groupBy(tools, (t) => (/[a-z]/i.test(t.name[0]) ? t.name[0].toUpperCase() : "#")));

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-10 md:px-6">
      <h1 className="text-[32px] leading-tight font-bold md:text-[44px]">All tools A–Z</h1>
      <p className="mt-3 text-muted-foreground">{tools.length} tools. Most run entirely on your device.</p>

      <nav aria-label="Spaces" className="mt-6 flex flex-wrap gap-1.5">
        {SPACES.map((s) => (
          <Link key={s.id} href={`/${s.slug}`} className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm hover:border-foreground/30">
            <span style={{ color: s.color }}>
              <SpaceGlyph space={s.id} className="size-3.5" />
            </span>
            {s.name}
          </Link>
        ))}
      </nav>

      <nav aria-label="Letters" className="mt-6 flex flex-wrap gap-1 font-mono text-sm">
        {groups.map(([letter]) => (
          <a key={letter} href={`#letter-${letter}`} className="flex size-8 items-center justify-center rounded-md hover:bg-muted">
            {letter}
          </a>
        ))}
      </nav>

      <div className="mt-8 columns-1 gap-8 sm:columns-2 lg:columns-3">
        {groups.map(([letter, items]) => (
          <section key={letter} id={`letter-${letter}`} className="mb-6 break-inside-avoid scroll-mt-24">
            <h2 className="mb-2 border-b pb-1 font-mono text-sm font-semibold text-muted-foreground">{letter}</h2>
            <ul className="space-y-0.5">
              {items!.map((t) => (
                <li key={t.id}>
                  <Link href={toolUrl(t)} className="block py-1 text-[15px] hover:underline hover:underline-offset-4">
                    {t.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
