import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { GUIDES, getGuide } from "@/content/guides";
import { Prose } from "@/components/content/prose";
import { Breadcrumbs } from "@/components/tools/breadcrumbs";
import { FaqList } from "@/components/tools/faq-list";
import { breadcrumbLd, faqLd, jsonLd, pageMetadata } from "@/lib/seo/manifest";
import { SITE_CONFIG } from "@/config/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const g = getGuide((await params).slug);
  if (!g) return {};
  return { ...pageMetadata({ title: g.metaTitle.slice(0, 60), description: g.metaDescription.slice(0, 160), path: `/guides/${g.slug}`, category: "Guide" }), keywords: g.keywords };
}

export default async function GuidePage({ params }: Props) {
  const g = getGuide((await params).slug);
  if (!g) notFound();
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Guides", path: "/guides" },
    { name: g.title, path: `/guides/${g.slug}` },
  ];
  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: g.title,
    description: g.metaDescription,
    ...(g.date ? { datePublished: g.date, dateModified: g.date } : {}),
    author: { "@type": "Organization", name: SITE_CONFIG.name, url: SITE_CONFIG.url },
    publisher: { "@type": "Organization", name: SITE_CONFIG.name, url: SITE_CONFIG.url },
    mainEntityOfPage: `${SITE_CONFIG.url}/guides/${g.slug}`,
  };
  const more = GUIDES.filter((x) => x.category === g.category && x.slug !== g.slug).slice(0, 3);

  return (
    <article className="mx-auto max-w-[720px] px-4 py-8 md:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd([article, breadcrumbLd(crumbs), ...(g.faqs.length ? [faqLd(g.faqs)] : [])]) }} />
      <Breadcrumbs items={crumbs} />
      <p className="mt-6 text-sm font-medium text-muted-foreground">{g.category}</p>
      <h1 className="mt-1 text-[30px] leading-tight font-bold md:text-[40px]">{g.title}</h1>
      <p className="mt-3 text-lg text-muted-foreground">{g.description}</p>
      <p className="mt-3 text-sm text-muted-foreground">
        {g.readTime}
        {g.date && <> · {new Date(g.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</>}
      </p>

      {g.takeaways.length > 0 && (
        <aside className="mt-8 rounded-xl border bg-card p-5">
          <p className="font-sans text-sm font-semibold">Key takeaways</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-[15px] text-muted-foreground">
            {g.takeaways.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </aside>
      )}

      {g.sections.length > 2 && (
        <nav aria-label="On this page" className="mt-8 border-l pl-4 text-sm">
          <p className="mb-2 font-medium">On this page</p>
          <ol className="space-y-1 text-muted-foreground">
            {g.sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="hover:text-foreground">
                  {s.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      )}

      <div className="mt-10 space-y-12">
        {g.sections.map((s) => (
          <section key={s.id} id={s.id} className="scroll-mt-24">
            <h2 className="mb-4 text-2xl font-semibold">{s.title}</h2>
            <Prose text={s.content} />
            {s.code && (
              <pre className="mt-4 overflow-x-auto rounded-lg border bg-muted p-4 text-[13px]">
                <code>{s.code}</code>
              </pre>
            )}
            {s.tool && (
              <Link href={s.tool.href} className="mt-6 flex items-center gap-4 rounded-xl border bg-card p-4 transition-colors hover:border-foreground/20">
                <span className="min-w-0 flex-1">
                  <span className="block font-medium">{s.tool.name}</span>
                  <span className="block text-sm text-muted-foreground">{s.tool.description}</span>
                </span>
                <span className="inline-flex shrink-0 items-center gap-1 text-sm font-medium">
                  Open <ArrowRight className="size-4" />
                </span>
              </Link>
            )}
          </section>
        ))}
      </div>

      {g.faqs.length > 0 && (
        <section className="mt-14">
          <h2 className="mb-4 text-2xl font-semibold">Questions</h2>
          <FaqList items={g.faqs} />
        </section>
      )}

      {g.tools.length > 0 && (
        <section className="mt-14">
          <h2 className="mb-4 text-2xl font-semibold">Tools for this job</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {g.tools.map((t) => (
              <Link key={t.href} href={t.href} className="rounded-xl border bg-card p-4 transition-colors hover:border-foreground/20">
                <span className="block font-medium">{t.name}</span>
                <span className="mt-1 line-clamp-2 block text-sm text-muted-foreground">{t.description}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {more.length > 0 && (
        <section className="mt-14 border-t pt-8">
          <h2 className="mb-4 text-xl font-semibold">More guides</h2>
          <ul className="space-y-2">
            {more.map((m) => (
              <li key={m.slug}>
                <Link href={`/guides/${m.slug}`} className="font-medium underline-offset-4 hover:underline">
                  {m.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
