import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { getSpace } from "@/spaces";
import { TOOL_MANIFESTS, getManifest, getManifestById, toolUrl } from "@/tools/registry";
import { ToolUi } from "@/tools/ui-registry";
import { Breadcrumbs } from "@/components/tools/breadcrumbs";
import { FaqList } from "@/components/tools/faq-list";
import { ManifestCard } from "@/components/tools/manifest-card";
import { ToolActions } from "@/components/tools/tool-actions";
import { SurfaceHint, ToolSurface } from "@/components/tools/tool-surface";
import { compactCatalog } from "@/tools/catalog";
import { getToolBySlug } from "@/content/tools/registry";
import { breadcrumbLd, faqLd, jsonLd, toolLd, toolMetadata } from "@/lib/seo/manifest";

export const dynamicParams = false;

export function generateStaticParams() {
  return TOOL_MANIFESTS.filter((m) => m.status !== "soon").map((m) => ({ space: m.space, tool: m.slug }));
}

type Props = { params: Promise<{ space: string; tool: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { space, tool } = await params;
  const m = getManifest(space, tool);
  const s = getSpace(space);
  return m && s ? toolMetadata(m, s) : {};
}

/** File/text tool template (blueprint S5): working tool above the fold, help and links below. */
export default async function ToolPage({ params }: Props) {
  const { space: spaceSlug, tool: slug } = await params;
  const tool = getManifest(spaceSlug, slug);
  const space = getSpace(spaceSlug);
  if (!tool || !space) notFound();

  const storageId = tool.legacySlugs?.[0] ?? tool.id;
  const category = space.categories.find((c) => c.id === tool.category);
  const related = tool.related.map(getManifestById).filter((m) => m !== undefined);
  const crumbs = [
    { name: "Home", path: "/" },
    { name: space.name, path: `/${space.slug}` },
    ...(category ? [{ name: category.name, path: `/${space.slug}/c/${category.id}` }] : []),
    { name: tool.name, path: toolUrl(tool) },
  ];

  return (
    <div style={{ "--space": space.color } as React.CSSProperties}>
      <div className="h-1 bg-[var(--space)]" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd([...toolLd(tool), faqLd(tool.faq), breadcrumbLd(crumbs)]) }}
      />

      <div className="mx-auto max-w-[1400px] px-4 pt-5 md:px-6 lg:px-8">
        <Breadcrumbs items={crumbs} />
        <header className="mt-4 flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
          <div className="min-w-0">
            <h1 className="text-[28px] leading-tight font-bold md:text-[32px]">{tool.seo.h1}</h1>
            <p className="mt-1.5 text-muted-foreground">{tool.tagline}</p>
          </div>
          <div className="flex items-center gap-2">
            {tool.engine === "client" && (
              <span className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium text-muted-foreground">
                <ShieldCheck className="size-3.5 text-success" />
                Processed on your device
              </span>
            )}
            <ToolActions storageId={storageId} name={tool.name} category={getToolBySlug(storageId)?.category ?? "misc"} />
          </div>
        </header>
      </div>

      <section aria-label={tool.name} className="tool-surface mx-auto mt-5 max-w-[1400px] px-4 md:px-6 lg:px-8">
        <ToolSurface toolId={tool.id} next={compactCatalog()}>
          <ToolUi id={tool.id} name={tool.name} />
        </ToolSurface>
        {tool.template === "file" && <SurfaceHint />}
      </section>

      <div className="mx-auto mt-16 max-w-[1200px] space-y-14 px-4 pb-16 md:px-6 lg:px-8">
        {tool.howTo && (
          <section>
            <h2 className="mb-5 text-2xl font-semibold">{tool.seo.h1 === tool.name ? `How to use ${tool.name}` : `How to ${tool.seo.h1.charAt(0).toLowerCase()}${tool.seo.h1.slice(1)}`}</h2>
            <ol className="grid gap-4 md:grid-cols-3">
              {tool.howTo.map((step, i) => (
                <li key={step} className="flex gap-3 rounded-xl border bg-card p-4">
                  <span className="tabular flex size-7 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--space)_16%,transparent)] text-sm font-semibold">
                    {i + 1}
                  </span>
                  <span className="text-[15px] leading-6">{step}</span>
                </li>
              ))}
            </ol>
          </section>
        )}

        <section className="grid gap-8 lg:grid-cols-[1fr_minmax(0,380px)]">
          <div>
            <h2 className="mb-4 text-2xl font-semibold">Questions</h2>
            <FaqList items={tool.faq} />
          </div>
          <aside className="space-y-3 text-sm text-muted-foreground lg:pt-12">
            <p className="flex gap-2">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-success" />
              {tool.engine === "ai"
                ? "Your request is sent to our AI provider to write the answer. Don't include passwords or sensitive personal details."
                : "Your files are opened and processed in this browser tab. They are not uploaded, stored or seen by anyone."}
            </p>
            <p>
              {tool.engine === "ai" ? "Free within a daily AI allowance, no sign-up needed." : "Free with no sign-up, no watermark and no daily limit."}{" "}
              <Link href={`/${space.slug}`} className="font-medium text-foreground underline-offset-4 hover:underline">
                More {space.name} tools
              </Link>
            </p>
          </aside>
        </section>

        {related.length > 0 && (
          <section>
            <h2 className="mb-4 text-2xl font-semibold">Related tools</h2>
            <div className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 lg:grid-cols-4">
              {related.map((r) => (
                <ManifestCard key={r.id} tool={r} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
