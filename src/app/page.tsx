import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Link2, ShieldCheck, Sparkles } from "lucide-react";
import { SPACES } from "@/spaces";
import { SITE_CONFIG } from "@/config/site";
import { WORKFLOW_PRESETS } from "@/flows/presets";
import { OPERATIONS } from "@/flows/model";
import { getManifestById, manifestsInSpace, TOOL_MANIFESTS, toolUrl } from "@/tools/registry";
import { SpaceChip } from "@/components/shell/space-glyph";
import { ManifestCard } from "@/components/tools/manifest-card";
import { HomeAsk } from "@/components/home/home-ask";
import { JumpBackIn } from "@/components/home/jump-back-in";
import { jsonLd, pageMetadata } from "@/lib/seo/manifest";

export const metadata: Metadata = {
  ...pageMetadata({
    title: `${SITE_CONFIG.name} – Get Small Jobs Done. Free & Private`,
    description: "Free tools for PDFs, images, video, code, calculators, study and AI. Files are processed on your device. No sign-up, no ads, no watermarks.",
    path: "",
  }),
  title: { absolute: `${SITE_CONFIG.name} – Get Small Jobs Done. Free, Private, No Sign-up` },
};

const POPULAR = [
  "media.compress-image", "docs.merge-pdf", "docs.compress-pdf", "media.resize-image", "ai.math-solver", "dev.json-formatter",
  "docs.pdf-to-jpg", "calc.loan-calculator", "create.qr-code-generator", "media.video-to-gif", "work.word-counter", "docs.jpg-to-pdf",
];
const FEATURED_FLOWS = ["pdf-images-200kb", "image-email-pack", "photos-letter-pdf", "text-analysis"];

const WHY = [
  { icon: ShieldCheck, title: "Private by design", body: "Files are processed in your browser. Nothing is uploaded, so nothing can leak, and most tools work offline." },
  { icon: Link2, title: "Connected", body: "Every result waits in your Tray. Send it to the next tool, or chain steps into a Flow, without uploading twice." },
  { icon: Sparkles, title: "Free, really", body: "No ads, no paywalls and no watermarks. AI help is free within a generous daily allowance." },
];

export default function Home() {
  const popular = POPULAR.map(getManifestById).filter((m) => m !== undefined);
  const flows = FEATURED_FLOWS.map((id) => WORKFLOW_PRESETS.find((f) => f.id === id)).filter((f) => f !== undefined);
  const jumpIndex = TOOL_MANIFESTS.map((m) => ({ id: m.id, name: m.name, url: toolUrl(m), space: m.space, color: SPACES.find((s) => s.id === m.space)!.color }));
  const ld = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: SITE_CONFIG.name,
      url: SITE_CONFIG.url,
      potentialAction: { "@type": "SearchAction", target: `${SITE_CONFIG.url}/search?q={search_term_string}`, "query-input": "required name=search_term_string" },
    },
    { "@context": "https://schema.org", "@type": "Organization", name: SITE_CONFIG.name, url: SITE_CONFIG.url, logo: `${SITE_CONFIG.url}/logo.png` },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(ld) }} />

      <section className="mx-auto flex max-w-[1200px] flex-col items-start px-4 pt-12 pb-6 md:px-6 md:pt-20 lg:px-8">
        <h1 className="max-w-3xl text-[40px] leading-[1.05] font-bold md:text-[60px]">Get small jobs done.</h1>
        <p className="mt-4 max-w-xl text-lg text-muted-foreground md:text-xl">
          Shrink a PDF, resize a photo, solve an equation, format JSON. {TOOL_MANIFESTS.length} free tools that run on your device.
        </p>
        <HomeAsk />
        <p className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="size-4 text-success" /> Files stay on your device
          </span>
          <span>No sign-up</span>
          <span>No ads</span>
          <span>Free</span>
        </p>
      </section>

      <JumpBackIn tools={jumpIndex} />

      <section aria-labelledby="spaces" className="mx-auto max-w-[1200px] px-4 py-12 md:px-6 lg:px-8">
        <h2 id="spaces" className="mb-5 text-2xl font-semibold md:text-[32px]">
          Pick a Space
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {SPACES.map((s) => {
            const top = s.featured.map((slug) => manifestsInSpace(s.id).find((m) => m.slug === slug)).filter((m) => m !== undefined);
            return (
              <div key={s.id} className="group relative flex flex-col overflow-hidden rounded-2xl border bg-card transition-[border-color,box-shadow] hover:border-foreground/20 hover:shadow-md">
                <div className="h-1" style={{ background: s.color }} />
                <div className="flex flex-1 flex-col p-5">
                  <Link href={`/${s.slug}`} className="flex items-center gap-3 after:absolute after:inset-0">
                    <SpaceChip space={s.id} color={s.color} />
                    <span>
                      <span className="block font-heading text-lg font-semibold">{s.name}</span>
                      <span className="block text-sm text-muted-foreground">{s.tagline}</span>
                    </span>
                  </Link>
                  <div className="relative z-10 mt-4 flex flex-wrap gap-1.5">
                    {top.map((m) => (
                      <Link key={m.id} href={toolUrl(m)} className="rounded-full border bg-background px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground">
                        {m.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="popular" className="mx-auto max-w-[1200px] px-4 pb-12 md:px-6 lg:px-8">
        <div className="mb-5 flex items-baseline justify-between gap-4">
          <h2 id="popular" className="text-2xl font-semibold md:text-[32px]">
            Popular right now
          </h2>
          <Link href="/tools" className="text-sm text-muted-foreground hover:text-foreground">
            All tools A–Z
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 lg:grid-cols-4">
          {popular.map((m) => (
            <ManifestCard key={m.id} tool={m} />
          ))}
        </div>
      </section>

      <section aria-labelledby="flows" className="border-y bg-card">
        <div className="mx-auto max-w-[1200px] px-4 py-12 md:px-6 lg:px-8">
          <div className="max-w-xl">
            <h2 id="flows" className="text-2xl font-semibold md:text-[32px]">
              Chain tools into Flows
            </h2>
            <p className="mt-2 text-muted-foreground">Each step hands its result to the next, on your device. Upload once, download the finished result.</p>
          </div>
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {flows.map((f) => (
              <Link key={f.id} href={`/flows/${f.id}`} className="group flex flex-col gap-3 rounded-xl border bg-background p-4 transition-colors hover:border-foreground/20">
                <span className="flex items-center justify-between gap-2 font-medium">
                  {f.name}
                  <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </span>
                <span className="flex flex-wrap items-center gap-1.5 text-xs">
                  {f.steps.map((step, i) => (
                    <span key={step.id} className="inline-flex items-center gap-1.5">
                      {i > 0 && <ArrowRight className="size-3 text-muted-foreground" />}
                      <span className="rounded-md border bg-muted px-2 py-1">{OPERATIONS.find((o) => o.id === step.operation)?.name ?? step.operation}</span>
                    </span>
                  ))}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="why" className="mx-auto max-w-[1200px] px-4 py-14 md:px-6 lg:px-8">
        <h2 id="why" className="text-2xl font-semibold md:text-[32px]">
          Why {SITE_CONFIG.name}
        </h2>
        <div className="mt-6 grid gap-8 md:grid-cols-3">
          {WHY.map((w) => (
            <div key={w.title}>
              <w.icon className="size-6" strokeWidth={1.75} />
              <h3 className="mt-3 font-sans text-base font-semibold tracking-normal">{w.title}</h3>
              <p className="mt-1.5 text-[15px] leading-relaxed text-muted-foreground">{w.body}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
