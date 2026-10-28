"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ChevronRight,
  FileText,
  FilePlus,
  ImageDown,
  Braces,
  QrCode,
  TextQuote,
  Percent,
  CaseSensitive,
  Maximize,
  Check,
  Plus,
  Minus,
  Sparkles,
  Layout,
  Code2,
  GraduationCap,
  Briefcase,
  Palette,
  PenTool,
  Microscope,
  ShieldCheck,
  Download,
  GitBranch,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchCommand } from "@/components/common/search-command";
import { ToolCard } from "@/components/common/tool-card";
import { UI_COPY } from "@/lib/ui-copy";
import type { ToolDefinition } from "@/types";

interface HomeClientProps {
  popularTools: ToolDefinition[];
  featuredApps: ToolDefinition[];
  featuredWorkflows?: { id: string; name: string; description: string }[];
  workflowCount?: number;
}

export function HomeClient({ popularTools, featuredApps, featuredWorkflows = [], workflowCount = 0 }: HomeClientProps) {
  const { t } = UI_COPY;
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const quickJobs = [
    { key: "job_merge_pdf" as const, label: "Merge PDFs", href: "/tools/pdf-merger", icon: FilePlus },
    { key: "job_compress_image" as const, label: "Compress Image", href: "/tools/image-compressor", icon: ImageDown },
    { key: "job_format_json" as const, label: "Format JSON", href: "/tools/json-formatter", icon: Braces },
    { key: "job_generate_qr" as const, label: "Generate QR", href: "/tools/qr-generator", icon: QrCode },
    { key: "job_count_words" as const, label: "Count Words", href: "/tools/word-counter", icon: TextQuote },
    { key: "job_calculate_percent" as const, label: "Calculate %", href: "/tools/percentage-calculator", icon: Percent },
    { key: "job_convert_case" as const, label: "Convert Case", href: "/tools/case-converter", icon: CaseSensitive },
    { key: "job_resize_image" as const, label: "Resize Image", href: "/tools/image-resizer", icon: Maximize },
  ];

  const valuePillars = [
    {
      num: "01",
      title: "The right workspace",
      desc: "Use a focused tool, open a dedicated app, or connect steps in a workflow.",
    },
    {
      num: "02",
      title: "Your data stays with you",
      desc: "Workflow files are processed locally. AI apps use configured online providers—check requirements before sharing sensitive data.",
    },
    {
      num: "03",
      title: "Finish the whole job",
      desc: "Pass actual outputs between local steps. Inspect final formats and file sizes before downloading.",
    },
  ];

  const workflowHubs = [
    { id: "developers", title: "Developers", desc: "JSON formatters, regex testers, Base64, hashing, diff tools", icon: Code2 },
    { id: "students", title: "Students", desc: "GPA solvers, citation formatters, PDF annotators, math tools", icon: GraduationCap },
    { id: "writers", title: "Writers", desc: "Word counters, text case converters, markdown previewers", icon: PenTool },
    { id: "designers", title: "Designers", desc: "Color palette studios, image resizers, converters, SVG tools", icon: Palette },
    { id: "business", title: "Business", desc: "Invoice creators, loan calculators, PDF signatures, splitters", icon: Briefcase },
    { id: "researchers", title: "Researchers", desc: "Data parsers, unit converters, scientific calculators", icon: Microscope },
  ];

  const capabilities = [
    {
      title: "Documents & PDF",
      desc: "Merge, compress, split, and edit PDFs without server uploads.",
      tag: "PDF utilities",
      link: "/tools?category=documents",
    },
    {
      title: "Images & Graphics",
      desc: "Resize, convert, crop and compress with explicit quality and size settings.",
      tag: "Instant Canvas",
      link: "/tools?category=images",
    },
    {
      title: "Developer & Code",
      desc: "Format JSON, test regular expressions, and inspect structured payloads.",
      tag: "Structured data",
      link: "/tools?category=developer",
    },
    {
      title: "Smart Calculators",
      desc: "Amortization schedules, financial projections, and math solvers.",
      tag: "Real-time Math",
      link: "/tools?category=calculators",
    },
  ];

  const faqs = [
    {
      q: "Is MyToolsBox really free to use?",
      a: "Browser-based workflows and many utilities are available without an account. Online AI requests require sign-in, configured providers, and available credits.",
    },
    {
      q: "Are my documents or files ever uploaded to a server?",
      a: "Workflow file content stays on your device and passes directly between local processors. Other features can use online services, including AI Chat. Review each feature’s processing requirements.",
    },
    {
      q: "Can I use these tools offline or on mobile devices?",
      a: "The interface works on modern mobile and desktop browsers. Initial module and PDF worker/font downloads require a connection; later offline availability depends on browser caching. Smaller batches are recommended on mobile.",
    },
    {
      q: "Do I need to create an account or sign in?",
      a: "Local workflows do not require an account. Sign-in is needed for account synchronization and online AI requests.",
    },
    {
      q: "Where can I report a bug or request a new tool?",
      a: "You can submit suggestions or report issues anytime through our Feedback & Contact page. We actively review and ship community requests.",
    },
  ];

  return (
    <div className="flex flex-col">
      {/* ===== 1. HERO SECTION (Mirroring Reference Image 3) ===== */}
      <section className="border-b border-border/60 bg-gradient-to-b from-background via-background to-muted/20">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Column: Editorial Headline & Actions */}
            <div className="lg:col-span-7 flex flex-col items-start">
              <span className="text-xs font-bold tracking-widest text-primary uppercase mb-3 px-2 py-0.5 rounded bg-primary/10 border border-primary/20">
                {t("hero_tag", "YOUR WORKFLOW STARTS HERE")}
              </span>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.1] mb-5">
                Tools for the task. <br />
                <span className="font-editorial italic font-normal text-primary">Workflows for the finish.</span>
              </h1>

              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl mb-8">
                Find tools for documents, images, code and everyday work—or connect them into a local workflow.
                Upload once, process multiple steps, and download the finished result.
              </p>

              {/* Central Search Box */}
              <div className="w-full max-w-xl mb-6">
                <SearchCommand />
              </div>

              {/* Quick Actions / Jobs Pills */}
              <div className="w-full">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">
                  Popular Quick Actions
                </div>
                <div className="flex flex-wrap gap-2">
                  {quickJobs.map((job) => (
                    <Link key={job.href} href={job.href}>
                      <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/80 bg-card hover:border-primary/40 hover:bg-muted/40 transition-colors text-xs font-medium text-foreground">
                        <job.icon className="h-3.5 w-3.5 text-primary" />
                        <span>{t(job.key, job.label)}</span>
                      </button>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Trust Subtext */}
              <div className="mt-8 pt-5 border-t border-border/50 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-primary" /> Local workflows need no account
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-primary" /> Workflow files stay on your device
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-primary" /> AI Chat is now an app
                </span>
              </div>
            </div>

            {/* Right Column: Live Mockup Card (Inspired by Image 1 & 3) */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-md rounded-3xl bg-primary/5 dark:bg-primary/10 border border-primary/20 p-6 sm:p-7 relative shadow-sm">
                <div className="preview-sheet rounded-2xl p-6 bg-card text-card-foreground">
                  {/* Mockup Header */}
                  <div className="flex items-center justify-between pb-4 mb-4 border-b border-border/60">
                    <div className="flex items-center gap-2">
                      <Image
                        src="/logo.png"
                        alt="MyToolsBox"
                        width={24}
                        height={24}
                        className="h-6 w-auto object-contain rounded"
                      />
                      <span className="text-xs font-semibold tracking-tight text-foreground">
                        Example workflow
                      </span>
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                      Client-Side
                    </span>
                  </div>

                  {/* Mockup Body Content */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-lg font-bold tracking-tight text-foreground">
                        PDF to a ready-to-share <span className="font-editorial italic font-normal text-primary">image pack.</span>
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        One input, connected processors, one final download.
                      </p>
                    </div>

                    <div className="rounded-xl border border-border/70 p-3.5 bg-muted/20 space-y-2">
                      <div className="flex items-center justify-between text-xs font-medium">
                        <span className="text-foreground">PDF → page images</span>
                        <span className="text-muted-foreground font-mono text-[11px]">Step 1</span>
                      </div>
                      <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full w-full" />
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                        <span>Compress each image below 200 KB</span>
                        <span className="text-primary font-medium">Then ZIP</span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <Link href="/workflows?preset=pdf-images-200kb">
                        <Button className="w-full rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground gap-2 font-medium h-10 text-xs">
                          <Download className="h-3.5 w-3.5" />
                          <span>Try this workflow</span>
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Handcrafted note below preview */}
                <p className="text-center text-xs font-editorial italic text-muted-foreground mt-4">
                  Local processing. Actual file-size checks. No intermediate uploads.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 2. THREE PILLARS (Inspired by Image 3) ===== */}
      <section className="border-b border-border/60 bg-card/40">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {valuePillars.map((pillar) => (
              <div key={pillar.num} className="flex items-start gap-4">
                <span className="text-xs font-bold text-primary px-2 py-1 rounded-md bg-primary/10 border border-primary/20 shrink-0">
                  {pillar.num}
                </span>
                <div>
                  <h3 className="text-sm font-semibold tracking-tight text-foreground mb-1">
                    {pillar.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 3. PLATFORM CAPABILITY SHOWCASE ===== */}
      <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6" aria-label="Connected workflows">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4"><div><p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary"><GitBranch className="size-4" />New: connected workflows</p><h2 className="text-3xl font-semibold tracking-tight">Upload once. <span className="font-editorial italic text-primary">Finish every step.</span></h2><p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">Connect local processors for documents, images, text and data. Start with {workflowCount} built-in workflows or build your own, save it on this device, and reuse it.</p></div><Link href="/workflows" className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground">Explore workflows<ArrowRight className="size-4" /></Link></div>
        <div className="grid gap-4 md:grid-cols-3">{featuredWorkflows.map((workflow) => <Link key={workflow.id} href={`/workflows?preset=${workflow.id}`} className="rounded-2xl border bg-card p-6 transition-colors hover:border-primary/40"><GitBranch className="mb-4 size-6 text-primary" /><h3 className="text-base font-semibold">{workflow.name}</h3><p className="mt-3 text-xs leading-6 text-muted-foreground">{workflow.description}</p><span className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-primary">Open workflow<ArrowRight className="size-3.5" /></span></Link>)}</div>
      </section>

      {/* Platform capability showcase */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold tracking-widest text-primary uppercase">
              DESIGNED FOR CLARITY
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mt-1">
              One platform. <span className="font-editorial italic font-normal text-primary">Every workflow.</span>
            </h2>
          </div>
          <Link href="/tools">
            <Button variant="ghost" className="gap-1.5 text-xs font-medium group">
              <span>Explore all tools</span>
              <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {capabilities.map((cap) => (
            <Link key={cap.title} href={cap.link} className="group">
              <div className="h-full p-5 rounded-2xl border border-border/70 bg-card hover:border-primary/40 hover:bg-card/90 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border/60">
                      {cap.tag}
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors mb-1.5">
                    {cap.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {cap.desc}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-border/40 text-xs font-medium text-primary">
                  Open category →
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ===== 4. WORKFLOW HUBS BY ROLE ===== */}
      <section className="border-t border-border/60 bg-muted/20 dark:bg-muted/10 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-8">
            <span className="text-xs font-bold tracking-widest text-primary uppercase">
              WORKFLOW HUBS
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mt-1">
              Curated for how you work.
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Find dedicated tools and shortcuts arranged specifically for your daily tasks.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {workflowHubs.map((hub) => (
              <Link key={hub.id} href={`/hubs/${hub.id}`} className="group">
                <div className="h-full p-4 rounded-xl border border-border/70 bg-card hover:border-primary/40 hover:bg-card/90 transition-all duration-200 hover:-translate-y-0.5 flex flex-col justify-between">
                  <div>
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary mb-3 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-200">
                      <hub.icon className="h-4.5 w-4.5" />
                    </div>
                    <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                      {hub.title}
                    </h3>
                    <p className="text-[11px] text-muted-foreground leading-relaxed mt-1 line-clamp-2">
                      {hub.desc}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 5. ESSENTIAL POPULAR TOOLS ===== */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold tracking-widest text-primary uppercase">
              CURATED ESSENTIALS
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mt-1">
              Popular daily tools
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Focused utilities for everyday documents, data and creative work.
            </p>
          </div>
          <Link href="/tools">
            <Button variant="outline" className="rounded-xl border-border/80 text-xs font-medium h-9 gap-1.5">
              <span>{t("action_all_tools", "All Tools")}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {popularTools.slice(0, 8).map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </section>

      {/* ===== 6. DEDICATED APPS ECOSYSTEM ===== */}
      <section className="border-t border-border/60 bg-card/40 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold tracking-widest text-primary uppercase">
                WEB APPS
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mt-1">
                Full-featured standalone apps
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Beyond single-purpose utilities: full workspaces for documents, formatting, and design.
              </p>
            </div>
            <Link href="/apps">
              <Button variant="outline" className="rounded-xl border-border/80 text-xs font-medium h-9 gap-1.5">
                <span>Browse all apps</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {featuredApps.slice(0, 3).map((app) => (
              <Link key={app.id} href={`/apps/${app.slug}`} className="group">
                <div className="h-full p-5 rounded-2xl border border-border/70 bg-card hover:border-primary/40 hover:bg-card/90 transition-all duration-200 hover:-translate-y-0.5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Layout className="h-4.5 w-4.5" />
                      </div>
                      {app.status === "beta" && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border/60">
                          Beta
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors mb-1.5">
                      {app.name}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                      {app.shortDescription}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-xs font-medium text-primary">
                    <span>Launch app</span>
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 7. PRIVACY BY DESIGN (Mirroring Reference Image 3 Sage Block) ===== */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="rounded-3xl bg-primary/5 dark:bg-primary/10 border border-primary/20 p-8 sm:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-5">
              <span className="text-xs font-bold tracking-widest text-primary uppercase">
                PRIVACY BY DESIGN
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mt-2 mb-3">
                Your files. <br />
                Your information.
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-6">
                Workflows keep file content on your device. Online AI and account features have different processing requirements, explained before use.
              </p>
              <Link href="/tools">
                <Button className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-medium h-10 px-5 gap-2">
                  <span>Use tools without an account</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>

            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-1.5">
                <h4 className="text-sm font-semibold text-foreground">
                   Local workflow processing
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                   The workflows module passes file outputs directly between browser processors, without uploading workflow file content to servers.
                </p>
              </div>

              <div className="space-y-1.5">
                <h4 className="text-sm font-semibold text-foreground">
                  You decide what is saved
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                   Save workflow definitions on this device, export them for backup, and download finished files. Account favorites and history use online synchronization.
                </p>
              </div>

              <div className="space-y-1.5">
                <h4 className="text-sm font-semibold text-foreground">
                  Honest about the limits
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  These tools are built for productivity, not encrypted long-term cloud vaults. Export your work, keep your originals, and enjoy total control.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 8. FAQ ACCORDION (Mirroring Reference Image 3) ===== */}
      <section className="border-t border-border/60 bg-muted/20 dark:bg-muted/10 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-4">
              <span className="text-xs font-bold tracking-widest text-primary uppercase">
                A FEW GOOD QUESTIONS
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mt-2 mb-2">
                Before you start.
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Simple answers. Clear policies, no hidden catches.
              </p>
            </div>

            <div className="lg:col-span-8 divide-y divide-border/60">
              {faqs.map((faq, index) => {
                const isOpen = openFaq === index;
                return (
                  <div key={faq.q} className="py-4 first:pt-0 last:pb-0">
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                      className="w-full flex items-center justify-between text-left text-sm font-semibold text-foreground hover:text-primary transition-colors py-1"
                    >
                      <span>{faq.q}</span>
                      <span className="ml-4 shrink-0 text-muted-foreground">
                        {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                      </span>
                    </button>
                    {isOpen && (
                      <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed pr-6 animate-fade-in">
                        {faq.a}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ===== 9. BOTTOM CALL TO ACTION (Mirroring Image 3) ===== */}
      <section className="border-t border-border/60 bg-background py-16 text-center">
        <div className="mx-auto max-w-2xl px-4">
          <span className="text-xs font-bold tracking-widest text-primary uppercase">
            BUILT FOR YOUR NEXT MOVE
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mt-2 mb-3">
            Let your productivity <br />
            <span className="font-editorial italic font-normal text-primary">do the talking.</span>
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mb-6">
            Jump into any tool right now. Zero sign-up, zero waiting.
          </p>
          <Link href="/tools">
            <Button className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium h-11 px-6 gap-2">
              <span>Explore All Tools</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
