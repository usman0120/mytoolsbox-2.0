import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SPACES, getSpace } from "@/spaces";
import { manifestsInSpace } from "@/tools/registry";
import { ManifestCard } from "@/components/tools/manifest-card";
import { Breadcrumbs } from "@/components/tools/breadcrumbs";
import { breadcrumbLd, jsonLd, pageMetadata } from "@/lib/seo/manifest";
import { cn } from "@/lib/utils";

export const dynamicParams = false;

/** One page per non-empty category; empty categories are not published (no thin pages). */
export function generateStaticParams() {
  return SPACES.flatMap((s) => {
    const tools = manifestsInSpace(s.id);
    return s.categories.filter((c) => tools.some((t) => t.category === c.id)).map((c) => ({ space: s.slug, category: c.id }));
  });
}

type Props = { params: Promise<{ space: string; category: string }> };

async function resolve(params: Props["params"]) {
  const { space: slug, category: id } = await params;
  const space = getSpace(slug);
  const category = space?.categories.find((c) => c.id === id);
  if (!space || !category) return null;
  const tools = manifestsInSpace(space.id).filter((t) => t.category === id);
  return tools.length ? { space, category, tools } : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const r = await resolve(params);
  if (!r) return {};
  const names = r.tools.slice(0, 4).map((t) => t.name).join(", ");
  return pageMetadata({
    title: `${r.category.name} – ${r.space.name} tools`,
    description: `${r.tools.length} free ${r.category.name.toLowerCase()} tools: ${names}. Private, no sign-up; files are processed on your device.`.slice(0, 160),
    path: `/${r.space.slug}/c/${r.category.id}`,
    category: r.space.name,
  });
}

export default async function CategoryPage({ params }: Props) {
  const r = await resolve(params);
  if (!r) notFound();
  const { space, category, tools } = r;
  const all = manifestsInSpace(space.id);
  const siblings = space.categories.filter((c) => all.some((t) => t.category === c.id));
  const crumbs = [
    { name: "Home", path: "/" },
    { name: space.name, path: `/${space.slug}` },
    { name: category.name, path: `/${space.slug}/c/${category.id}` },
  ];

  return (
    <div style={{ "--space": space.color } as React.CSSProperties}>
      <div className="h-1 bg-[var(--space)]" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbLd(crumbs)) }} />
      <div className="mx-auto max-w-[1200px] px-4 py-8 md:px-6 lg:px-8">
        <Breadcrumbs items={crumbs} />
        <h1 className="mt-4 text-[32px] leading-tight font-bold">
          {category.name} <span className="text-muted-foreground">· {space.name}</span>
        </h1>
        <p className="mt-2 text-muted-foreground">
          {tools.length} {tools.length === 1 ? "tool" : "tools"}. All free, all processed on your device.
        </p>

        <nav aria-label="Categories" className="mt-6 flex flex-wrap gap-1.5">
          {siblings.map((c) => (
            <Link
              key={c.id}
              href={`/${space.slug}/c/${c.id}`}
              aria-current={c.id === category.id ? "page" : undefined}
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm transition-colors",
                c.id === category.id ? "border-foreground bg-foreground text-background" : "text-muted-foreground hover:border-foreground/30 hover:text-foreground",
              )}
            >
              {c.name}
            </Link>
          ))}
        </nav>

        <div className="mt-6 grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 lg:grid-cols-4">
          {tools.map((t) => (
            <ManifestCard key={t.id} tool={t} />
          ))}
        </div>
      </div>
    </div>
  );
}
