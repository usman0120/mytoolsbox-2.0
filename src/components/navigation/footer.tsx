"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { SITE_CONFIG } from "@/lib/constants";
import { LanguageSwitcher } from "@/components/common/language-switcher";
import { useI18n } from "@/lib/i18n";
import { ShieldCheck, Cpu, ArrowUpRight, Lock, Sparkles } from "lucide-react";

export function Footer() {
  const pathname = usePathname();
  const { t, localizePath } = useI18n();

  // Hide full footer on full-screen AI chat page
  if (pathname.replace(/^\/(es|ur|fr|de|pt|hi|ar)(?=\/|$)/, "") === "/ai") {
    return null;
  }

  const documentTools = [
    { name: "PDF Merger", href: "/tools/pdf-merger" },
    { name: "PDF Splitter", href: "/tools/pdf-splitter" },
    { name: "PDF Compressor", href: "/tools/pdf-compressor" },
    { name: "PDF to Images", href: "/tools/pdf-to-images" },
    { name: "Word to PDF", href: "/tools/word-to-pdf" },
    { name: "PDF Watermark", href: "/tools/pdf-watermark" },
    { name: "Sign PDF", href: "/tools/sign-pdf" },
  ];

  const imageTools = [
    { name: "Image Compressor", href: "/tools/image-compressor" },
    { name: "Image Resizer", href: "/tools/image-resizer" },
    { name: "Image Converter", href: "/tools/image-converter" },
    { name: "Image Cropper", href: "/tools/image-cropper" },
    { name: "Video to GIF", href: "/tools/video-to-gif" },
    { name: "SVG Optimizer", href: "/tools/svg-optimizer" },
    { name: "Favicon Generator", href: "/tools/favicon-generator" },
  ];

  const developerTools = [
    { name: "JSON Formatter", href: "/tools/json-formatter" },
    { name: "Base64 Encoder", href: "/tools/base64-encoder" },
    { name: "JWT Decoder", href: "/tools/jwt-decoder" },
    { name: "Regex Tester", href: "/tools/regex-tester" },
    { name: "Hash Generator", href: "/tools/hash-generator" },
    { name: "URL Encoder", href: "/tools/url-encoder" },
    { name: "Diff Checker", href: "/tools/diff-checker" },
  ];

  const calculatorTools = [
    { name: "Percentage Calculator", href: "/tools/percentage-calculator" },
    { name: "Loan Amortization", href: "/tools/loan-calculator" },
    { name: "Discount Calculator", href: "/tools/discount-calculator" },
    { name: "Tip Calculator", href: "/tools/tip-calculator" },
    { name: "Unit Converter", href: "/tools/unit-converter" },
    { name: "Age Calculator", href: "/tools/age-calculator" },
  ];

  const appsAndAi = [
    { name: "Markdown Studio", href: "/apps/markdown-studio" },
    { name: "Resume Builder", href: "/apps/resume-builder" },
    { name: "Color Palette Studio", href: "/apps/color-palette" },
    { name: "AI Chat Assistant", href: "/ai" },
    { name: "AI Prompt Library", href: "/ai/prompts" },
    { name: "Model Comparison", href: "/ai/compare" },
    { name: "AI Personas", href: "/ai/personas" },
  ];

  const workflowHubs = [
    { name: "For Software Engineers", href: "/hubs/developers" },
    { name: "For Students & Academics", href: "/hubs/students" },
    { name: "For Technical Writers", href: "/hubs/writers" },
    { name: "For Product Designers", href: "/hubs/designers" },
    { name: "For Business & Operations", href: "/hubs/business" },
    { name: "For Researchers", href: "/hubs/researchers" },
  ];

  const companyLinks = [
    { name: "About MyToolsBox", href: "/about" },
    { name: "Blog & Tutorials", href: "/blog" },
    { name: "Privacy Architecture", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Contact & Feedback", href: "/contact" },
  ];

  return (
    <footer className="border-t border-border/60 bg-card/60 backdrop-blur-md" role="contentinfo">
      {/* Top Value Banner */}
      <div className="border-b border-border/40 bg-muted/20">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Cpu className="h-4.5 w-4.5" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Client-First Execution</p>
                <p className="mt-0.5 leading-relaxed">Processing runs directly in your browser via WebAssembly.</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Lock className="h-4.5 w-4.5" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Zero Cloud Storage</p>
                <p className="mt-0.5 leading-relaxed">Your files and sensitive documents never touch our servers.</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Sparkles className="h-4.5 w-4.5" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Unified Productive Workspace</p>
                <p className="mt-0.5 leading-relaxed">Over 230 tools, full offline support, and zero ads.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Multi-Column Directory */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-8 lg:gap-6">
          {/* Brand Intro (Spans 2 columns on tablet/desktop) */}
          <div className="col-span-2 sm:col-span-3 md:col-span-4 lg:col-span-2 pr-0 lg:pr-6">
            <Link
              href={localizePath("/")}
              className="inline-flex items-center gap-2.5 mb-4 group"
              aria-label={`${SITE_CONFIG.name} home`}
            >
              <Image
                src="/logo.png"
                alt={SITE_CONFIG.name}
                width={36}
                height={36}
                className="h-8 w-auto object-contain rounded-md"
              />
              <span className="font-semibold text-lg tracking-tight text-foreground">
                {SITE_CONFIG.name}
              </span>
            </Link>
            <p className="text-xs text-muted-foreground leading-relaxed mb-5 max-w-sm">
              The premier open utility toolbox. Fast, private, client-first developer utilities,
              document engines, creative tools, and workflow hubs designed for focused productivity.
            </p>
            <div className="space-y-2.5 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="font-medium text-foreground">All systems operational</span>
              </div>
              <p className="text-[11px] text-muted-foreground/90">
                100% in-browser processing • No telemetry trackers
              </p>
            </div>
          </div>

          {/* Column 1: Document Tools */}
          <nav aria-label="Document and PDF tools">
            <h4 className="font-semibold mb-3.5 text-xs uppercase tracking-wider text-foreground">
              Documents & PDF
            </h4>
            <ul className="flex flex-col gap-2.5">
              {documentTools.map((tool) => (
                <li key={tool.href}>
                  <Link
                    href={localizePath(tool.href)}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {tool.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href={localizePath("/tools?category=documents")}
                  className="text-xs font-medium text-primary hover:underline inline-flex items-center gap-1 mt-1"
                >
                  All Documents <ArrowUpRight className="h-3 w-3" />
                </Link>
              </li>
            </ul>
          </nav>

          {/* Column 2: Image & Media */}
          <nav aria-label="Image and media tools">
            <h4 className="font-semibold mb-3.5 text-xs uppercase tracking-wider text-foreground">
              Image & Media
            </h4>
            <ul className="flex flex-col gap-2.5">
              {imageTools.map((tool) => (
                <li key={tool.href}>
                  <Link
                    href={localizePath(tool.href)}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {tool.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href={localizePath("/tools?category=images")}
                  className="text-xs font-medium text-primary hover:underline inline-flex items-center gap-1 mt-1"
                >
                  All Image Tools <ArrowUpRight className="h-3 w-3" />
                </Link>
              </li>
            </ul>
          </nav>

          {/* Column 3: Developer Utilities */}
          <nav aria-label="Developer utilities">
            <h4 className="font-semibold mb-3.5 text-xs uppercase tracking-wider text-foreground">
              Developer
            </h4>
            <ul className="flex flex-col gap-2.5">
              {developerTools.map((tool) => (
                <li key={tool.href}>
                  <Link
                    href={localizePath(tool.href)}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {tool.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href={localizePath("/tools?category=developer")}
                  className="text-xs font-medium text-primary hover:underline inline-flex items-center gap-1 mt-1"
                >
                  All Dev Tools <ArrowUpRight className="h-3 w-3" />
                </Link>
              </li>
            </ul>
          </nav>

          {/* Column 4: Calculators & Converters */}
          <nav aria-label="Calculators and math tools">
            <h4 className="font-semibold mb-3.5 text-xs uppercase tracking-wider text-foreground">
              Calculators
            </h4>
            <ul className="flex flex-col gap-2.5">
              {calculatorTools.map((tool) => (
                <li key={tool.href}>
                  <Link
                    href={localizePath(tool.href)}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {tool.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href={localizePath("/tools?category=calculators")}
                  className="text-xs font-medium text-primary hover:underline inline-flex items-center gap-1 mt-1"
                >
                  All Calculators <ArrowUpRight className="h-3 w-3" />
                </Link>
              </li>
            </ul>
          </nav>

          {/* Column 5: Standalone Apps & AI */}
          <nav aria-label="Apps and AI suite">
            <h4 className="font-semibold mb-3.5 text-xs uppercase tracking-wider text-foreground">
              Apps & AI
            </h4>
            <ul className="flex flex-col gap-2.5">
              {appsAndAi.map((tool) => (
                <li key={tool.href}>
                  <Link
                    href={localizePath(tool.href)}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {tool.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href={localizePath("/apps")}
                  className="text-xs font-medium text-primary hover:underline inline-flex items-center gap-1 mt-1"
                >
                  Explore Apps <ArrowUpRight className="h-3 w-3" />
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        {/* Secondary Hubs & Platform Row */}
        <div className="mt-14 pt-10 border-t border-border/40 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h5 className="font-semibold text-xs uppercase tracking-wider text-foreground mb-3">
              Role Workflows
            </h5>
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
              {workflowHubs.map((hub) => (
                <Link
                  key={hub.href}
                  href={localizePath(hub.href)}
                  className="hover:text-foreground transition-colors"
                >
                  {hub.name}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h5 className="font-semibold text-xs uppercase tracking-wider text-foreground mb-3">
              Company & Legal
            </h5>
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
              {companyLinks.map((link) => (
                <Link
                  key={link.href}
                  href={localizePath(link.href)}
                  className="hover:text-foreground transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h5 className="font-semibold text-xs uppercase tracking-wider text-foreground mb-3">
              Explore Everything
            </h5>
            <div className="flex flex-wrap gap-2">
              <Link
                href={localizePath("/tools")}
                className="text-xs px-2.5 py-1 rounded-md bg-muted/60 hover:bg-muted text-foreground transition-colors"
              >
                Browse All 230+ Tools
              </Link>
              <Link
                href={localizePath("/apps")}
                className="text-xs px-2.5 py-1 rounded-md bg-muted/60 hover:bg-muted text-foreground transition-colors"
              >
                Full-Featured Apps
              </Link>
              <Link
                href={localizePath("/hubs")}
                className="text-xs px-2.5 py-1 rounded-md bg-muted/60 hover:bg-muted text-foreground transition-colors"
              >
                Workflow Hubs
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <LanguageSwitcher variant="footer" />
            <span>&copy; {new Date().getFullYear()} {SITE_CONFIG.name}. {t("footer_rights")}</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              100% Client-Side Processing
            </span>
            <span>•</span>
            <Link href={localizePath("/privacy")} className="hover:text-foreground transition-colors">
              Privacy Architecture
            </Link>
            <span>•</span>
            <Link href={localizePath("/terms")} className="hover:text-foreground transition-colors">
              Terms of Use
            </Link>
            <span>•</span>
            <Link href={localizePath("/contact")} className="hover:text-foreground transition-colors">
              Feedback & Support ↗
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
