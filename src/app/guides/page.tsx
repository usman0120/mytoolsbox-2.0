import type { Metadata } from "next";
import Link from "next/link";
import { CHEAT_SHEETS, GUIDES } from "@/content/guides";
import { pageMetadata } from "@/lib/seo/manifest";

export const metadata: Metadata = pageMetadata({
  title: "Guides – How to Do Everyday Jobs with Free Tools",
  description: "Step-by-step guides for PDFs, images, code, study and money: how to shrink files, format data, stay private online and more. Free and practical.",
  path: "/guides",
});

const SHEET_NAMES: Record<string, string> = { regex: "Regular expressions", http: "HTTP status codes", markdown: "Markdown", mime: "MIME types", git: "Git" };

export default function GuidesPage() {
  const categories = [...new Set(GUIDES.map((g) => g.category))];
  const sheets = Object.entries(Object.groupBy(CHEAT_SHEETS, (s) => s.category));

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-10 md:px-6">
      <h1 className="max-w-2xl text-[32px] leading-tight font-bold md:text-[44px]">Guides</h1>
      <p className="mt-3 max-w-xl text-lg text-muted-foreground">Practical, plain-language help for the jobs people use MyToolsBox for.</p>

      <nav aria-label="Guide topics" className="mt-6 flex flex-wrap gap-1.5">
        {categories.map((c) => (
          <a key={c} href={`#${c.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`} className="rounded-full border px-3 py-1.5 text-sm text-muted-foreground hover:border-foreground/30 hover:text-foreground">
            {c}
          </a>
        ))}
        <a href="#cheat-sheets" className="rounded-full border px-3 py-1.5 text-sm text-muted-foreground hover:border-foreground/30 hover:text-foreground">
          Cheat sheets
        </a>
      </nav>

      <div className="mt-10 space-y-12">
        {categories.map((c) => (
          <section key={c} id={c.toLowerCase().replace(/[^a-z0-9]+/g, "-")} className="scroll-mt-24">
            <h2 className="mb-4 text-2xl font-semibold">{c}</h2>
            <div className="grid gap-3 md:grid-cols-2">
              {GUIDES.filter((g) => g.category === c).map((g) => (
                <Link key={g.slug} href={`/guides/${g.slug}`} className="group rounded-xl border bg-card p-5 transition-colors hover:border-foreground/20">
                  <span className="block font-heading text-lg leading-snug font-semibold group-hover:underline group-hover:underline-offset-4">{g.title}</span>
                  <span className="mt-2 line-clamp-2 block text-sm text-muted-foreground">{g.description}</span>
                  <span className="mt-3 block text-xs text-muted-foreground">{g.readTime}</span>
                </Link>
              ))}
            </div>
          </section>
        ))}

        <section id="cheat-sheets" className="scroll-mt-24">
          <h2 className="mb-4 text-2xl font-semibold">Cheat sheets</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {sheets.map(([cat, items]) => (
              <div key={cat} className="rounded-xl border bg-card">
                <h3 className="border-b px-4 py-3 font-sans text-sm font-semibold">{SHEET_NAMES[cat] ?? cat}</h3>
                <dl className="divide-y text-sm">
                  {items!.map((s) => (
                    <div key={s.id} className="grid grid-cols-[minmax(0,40%)_1fr] gap-3 px-4 py-2.5">
                      <dt className="truncate font-mono text-[13px]" title={s.syntax}>
                        {s.syntax}
                      </dt>
                      <dd className="text-muted-foreground">{s.explanation}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
