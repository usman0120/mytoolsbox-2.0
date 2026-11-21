import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { SPACES, getSpace } from "@/spaces";
import { manifestsInSpace, toolUrl } from "@/tools/registry";
import { SpaceChip } from "@/components/shell/space-glyph";
import { ManifestCard } from "@/components/tools/manifest-card";
import { ToolArt } from "@/components/tools/port-art";
import { FaqList } from "@/components/tools/faq-list";
import { breadcrumbLd, faqLd, jsonLd, pageMetadata } from "@/lib/seo/manifest";

export const dynamicParams = false;

/** Only Spaces whose tools have moved to manifests get a page; the rest follow in later phases. */
export function generateStaticParams() {
  return SPACES.filter((s) => manifestsInSpace(s.id).length > 0).map((s) => ({ space: s.slug }));
}

type Props = { params: Promise<{ space: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const space = getSpace((await params).space);
  if (!space) return {};
  return pageMetadata({ title: space.headline ?? `${space.name} tools`, description: space.description, path: `/${space.slug}`, category: space.name });
}

const FLOWS: Record<string, { title: string; steps: string[]; href: string }[]> = {
  media: [
    { title: "Email-ready images", steps: ["Photos", "Resize", "Compress", "ZIP"], href: "/flows/image-email-pack" },
    { title: "Photos to one PDF", steps: ["Photos", "Resize", "PDF"], href: "/flows/photos-letter-pdf" },
  ],
  docs: [
    { title: "PDF to JPG under 200 KB", steps: ["PDF", "Images", "Compress", "ZIP"], href: "/flows/pdf-images-200kb" },
    { title: "Photos to one PDF", steps: ["Photos", "Resize", "PDF"], href: "/flows/photos-letter-pdf" },
  ],
};

export default async function SpacePage({ params }: Props) {
  const space = getSpace((await params).space);
  if (!space) notFound();
  const tools = manifestsInSpace(space.id);
  const featured = space.featured.map((slug) => tools.find((t) => t.slug === slug)).filter((t) => t !== undefined);
  const groups = space.categories.map((c) => ({ ...c, tools: tools.filter((t) => t.category === c.id) })).filter((g) => g.tools.length > 0);
  const flows = FLOWS[space.id] ?? [];

  return (
    <div style={{ "--space": space.color } as React.CSSProperties}>
      <div className="h-1 bg-[var(--space)]" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd([breadcrumbLd([{ name: "Home", path: "/" }, { name: space.name, path: `/${space.slug}` }]), ...(space.faq ? [faqLd(space.faq)] : [])]) }} />

      <section className="mx-auto max-w-[1200px] px-4 pt-10 pb-8 md:px-6 md:pt-14 lg:px-8">
        <div className="flex items-center gap-2.5 text-sm font-medium">
          <SpaceChip space={space.id} color={space.color} className="size-8" />
          {space.name}
        </div>
        <h1 className="mt-4 max-w-2xl text-[32px] leading-[1.1] font-bold md:text-[44px]">{space.headline ?? space.name}</h1>
        <p className="mt-3 max-w-xl text-base text-muted-foreground md:text-lg">{space.description}</p>
        <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          {(space.id === "ai" ? ["Free daily allowance", "No sign-up", "Focused assistants"] : ["Files stay on your device", "No sign-up", "No watermark"]).map((item, i) => (
            <span key={item} className="inline-flex items-center gap-1.5">
              {i === 0 && <ShieldCheck className="size-4 text-success" />}
              {item}
            </span>
          ))}
        </p>

        {featured.length > 0 && (
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {featured.map((t) => (
              <Link
                key={t.id}
                href={toolUrl(t)}
                className="group relative flex items-center gap-4 overflow-hidden rounded-2xl border bg-card p-4 sm:flex-col sm:items-start sm:gap-5 sm:p-5 transition-[border-color,box-shadow] hover:border-foreground/20 hover:shadow-md"
              >
                <ToolArt tool={t} className="h-12 w-[120px] shrink-0 sm:h-16 sm:w-40" />
                <span className="min-w-0 flex-1 sm:w-full">
                  <span className="flex items-center justify-between font-heading text-lg font-semibold sm:text-xl">
                    {t.name}
                    <ArrowRight className="size-5 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                  </span>
                  <span className="mt-1 block text-sm text-muted-foreground">{t.tagline}</span>
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <nav aria-label={`${space.name} categories`} className="sticky top-[var(--shell-header-height)] z-30 border-y bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1200px] gap-1 overflow-x-auto px-4 py-2 md:px-6 lg:px-8 [scrollbar-width:none]">
          {groups.map((g) => (
            <a key={g.id} href={`#${g.id}`} className="shrink-0 rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
              {g.name} <span className="tabular text-xs opacity-60">{g.tools.length}</span>
            </a>
          ))}
        </div>
      </nav>

      <div className="mx-auto max-w-[1200px] space-y-12 px-4 py-10 md:px-6 lg:px-8">
        {groups.map((g) => (
          <section key={g.id} id={g.id} className="scroll-mt-32">
            <div className="mb-4 flex items-baseline justify-between gap-4">
              <h2 className="text-2xl font-semibold">{g.name}</h2>
              <Link href={`/${space.slug}/c/${g.id}`} className="text-sm text-muted-foreground hover:text-foreground">
                View all
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 lg:grid-cols-4">
              {g.tools.map((t) => (
                <ManifestCard key={t.id} tool={t} />
              ))}
            </div>
          </section>
        ))}

        {flows.length > 0 && (
          <section>
            <h2 className="mb-1 text-2xl font-semibold">Popular Flows</h2>
            <p className="mb-4 text-sm text-muted-foreground">Chain tools together. Each step passes its result to the next, with no re-uploads.</p>
            <div className="grid gap-3 md:grid-cols-2">
              {flows.map((f) => (
                <Link key={f.href} href={f.href} className="flex flex-col gap-3 rounded-xl border bg-card p-4 transition-colors hover:border-foreground/20">
                  <span className="font-medium">{f.title}</span>
                  <span className="flex flex-wrap items-center gap-1.5 text-xs">
                    {f.steps.map((s, i) => (
                      <span key={s} className="inline-flex items-center gap-1.5">
                        {i > 0 && <ArrowRight className="size-3 text-muted-foreground" />}
                        <span className="rounded-md border bg-muted px-2 py-1 font-mono">{s}</span>
                      </span>
                    ))}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {(space.about || space.faq) && (
          <section className="grid gap-10 border-t pt-10 lg:grid-cols-2">
            {space.about && (
              <div className="max-w-prose space-y-4 text-[15px] leading-7 text-muted-foreground">
                <h2 className="text-xl font-semibold text-foreground">About {space.name}</h2>
                {space.about.map((p) => (
                  <p key={p.slice(0, 24)}>{p}</p>
                ))}
              </div>
            )}
            {space.faq && (
              <div>
                <h2 className="mb-3 text-xl font-semibold">Questions</h2>
                <FaqList items={space.faq} />
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
