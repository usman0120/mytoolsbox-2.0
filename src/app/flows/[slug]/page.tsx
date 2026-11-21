import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { WORKFLOW_PRESETS } from "@/flows/presets";
import { OPERATIONS } from "@/flows/model";
import { Breadcrumbs } from "@/components/tools/breadcrumbs";
import { FaqList } from "@/components/tools/faq-list";
import { breadcrumbLd, faqLd, jsonLd, pageMetadata } from "@/lib/seo/manifest";

export const dynamicParams = false;

export function generateStaticParams() {
  return WORKFLOW_PRESETS.map((f) => ({ slug: f.id }));
}

type Props = { params: Promise<{ slug: string }> };

const plain = (name: string) => name.replace(/\s*→\s*/g, " to ");

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const flow = WORKFLOW_PRESETS.find((f) => f.id === slug);
  if (!flow) return {};
  const title = `${plain(flow.name)} – Free Flow`.slice(0, 60);
  const description = `${flow.description} Runs in your browser; files are never uploaded.`.slice(0, 160);
  return pageMetadata({ title, description, path: `/flows/${flow.id}`, category: "Flows" });
}

/** Pre-built Flow page (blueprint S12, read-only view) with "Use this Flow". */
export default async function FlowPage({ params }: Props) {
  const { slug } = await params;
  const flow = WORKFLOW_PRESETS.find((f) => f.id === slug);
  if (!flow) notFound();
  const steps = flow.steps.map((s) => OPERATIONS.find((o) => o.id === s.operation)).filter((o) => o !== undefined);
  const related = WORKFLOW_PRESETS.filter((f) => f.category === flow.category && f.id !== flow.id).slice(0, 4);
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Flows", path: "/flows" },
    { name: plain(flow.name), path: `/flows/${flow.id}` },
  ];
  const faq = [
    { q: "Are my files uploaded?", a: "No. Every step runs in your browser, and each step's result is passed straight to the next without leaving your device." },
    { q: "Can I change the settings of a step?", a: "Yes. Open the Flow, select a step and adjust its options before you run it." },
    { q: "Can I save my own version?", a: "Yes. Edit the steps and save the Flow in this browser, or export it as a file to share." },
    { q: "Is it free?", a: "Yes. Flows are free, with no sign-up and no watermark." },
  ];

  return (
    <div className="mx-auto max-w-[1000px] px-4 py-8 md:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd([breadcrumbLd(crumbs), faqLd(faq)]) }} />
      <Breadcrumbs items={crumbs} />
      <p className="mt-6 text-sm font-medium text-muted-foreground">{flow.category} Flow</p>
      <h1 className="mt-1 text-[32px] leading-tight font-bold md:text-[40px]">{flow.name}</h1>
      <p className="mt-3 max-w-2xl text-lg text-muted-foreground">{flow.description}</p>

      <ol className="relative mt-8 space-y-3 before:absolute before:top-4 before:bottom-4 before:left-[15px] before:w-px before:bg-border">
        {steps.map((op, i) => (
          <li key={`${op.id}-${i}`} className="relative flex gap-4">
            <span className="tabular relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border bg-card text-sm font-semibold">{i + 1}</span>
            <div className="flex-1 rounded-xl border bg-card px-4 py-3">
              <p className="font-medium">{op.name}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">{op.description}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <Link
          href={`/flows?preset=${flow.id}`}
          className="inline-flex h-11 items-center gap-2 rounded-lg bg-lime px-5 font-medium text-lime-foreground transition-[filter] hover:brightness-95"
        >
          Use this Flow <ArrowRight className="size-4" />
        </Link>
        <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
          <ShieldCheck className="size-4 text-success" /> Runs on your device
        </span>
      </div>

      <section className="mt-14">
        <h2 className="mb-4 text-2xl font-semibold">Questions</h2>
        <FaqList items={faq} />
      </section>

      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 text-2xl font-semibold">More {flow.category} Flows</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {related.map((f) => (
              <Link key={f.id} href={`/flows/${f.id}`} className="rounded-xl border bg-card p-4 transition-colors hover:border-foreground/20">
                <span className="block font-medium">{f.name}</span>
                <span className="mt-1 line-clamp-2 block text-sm text-muted-foreground">{f.description}</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
