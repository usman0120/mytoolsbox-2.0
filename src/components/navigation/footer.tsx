"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SITE_CONFIG, CATEGORIES } from "@/lib/constants";
import { FOOTER_TOOL_SECTIONS, FOOTER_PLATFORM_SECTIONS, type FooterSection } from "@/lib/navigation/footer-directory";
import { BrandLogo } from "@/components/common/brand-logo";

export function Footer() {

  const renderSection = (section: FooterSection) => <nav key={section.title} aria-label={section.title}>
    <h3 className="mb-4 text-sm font-semibold text-foreground">{section.title}</h3>
    <ul className="space-y-1.5">
      {section.links.map((link) => <li key={link.href}>
        <Link prefetch={false} href={link.href} className="inline-block py-1 text-sm leading-6 text-muted-foreground transition-colors hover:text-primary focus-visible:rounded focus-visible:outline-2 focus-visible:outline-primary">{link.name}</Link>
      </li>)}
    </ul>
    <Link prefetch={false} href={section.href} className="mt-4 inline-flex items-center gap-1 py-1 text-xs font-semibold text-primary hover:underline">
      Explore all <ArrowUpRight className="size-3.5" />
    </Link>
  </nav>;

  return <footer className="w-full border-t bg-linear-to-b from-primary/5 via-card to-card" role="contentinfo">
    <div className="mx-auto max-w-[1440px] px-5 py-12 sm:px-8 lg:px-12 lg:py-16">
      <div className="flex flex-col justify-between gap-8 border-b pb-10 lg:flex-row lg:items-center">
        <div className="max-w-xl">
          <Link href="/" className="mb-5 inline-flex items-center gap-3" aria-label="MyToolsBox home">
            <BrandLogo className="h-12" /><span className="text-xl font-semibold tracking-tight">{SITE_CONFIG.name}</span>
          </Link>
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Find your next useful thing.</h2>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">Tools for small tasks. Apps for bigger projects. Workflows that connect the steps—without intermediate uploads.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {[{ name: "Explore tools", href: "/tools" }, { name: "Discover apps", href: "/apps" }, { name: "Build workflows", href: "/workflows" }].map((link) => <Link prefetch={false} key={link.href} href={link.href} className="inline-flex items-center gap-2 rounded-xl border bg-background px-4 py-3 text-sm font-medium transition-colors hover:border-primary/40 hover:bg-primary/5">{link.name}<ArrowUpRight className="size-4 text-primary" /></Link>)}
        </div>
      </div>

      <div className="py-10">
        <p className="mb-6 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Tools for every kind of task</p>
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-6">{FOOTER_TOOL_SECTIONS.map(renderSection)}</div>
      </div>

      <div className="border-t py-10">
        <p className="mb-6 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Apps, modules & your workspace</p>
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">{FOOTER_PLATFORM_SECTIONS.map(renderSection)}</div>
      </div>

      <nav aria-label="All tool categories" className="flex flex-wrap gap-2 rounded-2xl border bg-muted/25 p-5">
        {CATEGORIES.map((category) => <Link prefetch={false} key={category.id} href={`/tools?category=${category.id}`} className="rounded-lg border bg-background px-3 py-2 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary">{category.name}</Link>)}
      </nav>

      <div className="mt-10 flex flex-col justify-between gap-5 border-t pt-7 text-xs text-muted-foreground sm:flex-row sm:items-center">
        <div className="space-y-2"><p>&copy; {new Date().getFullYear()} {SITE_CONFIG.name}. All rights reserved.</p><p className="max-w-xl leading-6">Workflows process files locally. AI Chat uses configured online providers. Check processing requirements before sharing sensitive data.</p></div>
      </div>
    </div>
  </footer>;
}
