"use client";

import Link from "next/link";
import { UI_COPY } from "@/lib/ui-copy";
import { buttonVariants } from "@/components/ui/button";
import { PageShell } from "@/components/common/workload-layouts";
import { Home, Search, FileText, Image as ImageIcon, Code2, Calculator } from "lucide-react";
import { SearchCommand } from "@/components/common/search-command";
import { BrandLogo } from "@/components/common/brand-logo";

const QUICK_LINKS = [
  { label: "Document Tools", href: "/tools?category=documents", icon: FileText },
  { label: "Image Utilities", href: "/tools?category=images", icon: ImageIcon },
  { label: "Developer Tools", href: "/tools?category=developer", icon: Code2 },
  { label: "Calculators", href: "/tools?category=calculators", icon: Calculator },
];

export default function NotFound() {
  const { t } = UI_COPY;

  return (
    <PageShell className="max-w-2xl py-16">
      <div className="text-center space-y-8">
        {/* Visual number */}
        <div className="relative inline-block">
          <span className="text-[96px] font-black tracking-tighter leading-none text-primary/10 select-none pointer-events-none">
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10 text-primary">
              <BrandLogo className="h-12" />
            </div>
          </div>
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {t("not_found_title", "Page Not Found")}
          </h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            {t(
              "not_found_desc",
              "The page you're looking for doesn't exist or has been moved. Try searching for a tool or navigate back home."
            )}
          </p>
        </div>

        {/* Search */}
        <div className="flex justify-center">
          <div className="w-full max-w-sm">
            <SearchCommand variant="navbar" />
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Popular tool categories
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {QUICK_LINKS.map(({ label, href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex flex-col items-center gap-2 px-3 py-4 rounded-xl border border-border/60 bg-card/60 hover:bg-muted/60 hover:border-primary/30 transition-all text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                <Icon className="h-5 w-5 text-primary/60" />
                {label}
              </Link>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link href="/" className={buttonVariants({ className: "h-11 rounded-xl gap-2 px-5" })}>
              <Home className="h-3.5 w-3.5" />
              {t("not_found_btn", "Back to Home")}
            </Link>
            <Link href="/tools" className={buttonVariants({ variant: "outline", className: "h-11 rounded-xl gap-2 px-5" })}>
              <Search className="h-3.5 w-3.5" />
              {t("nav_tools", "Explore All Tools")}
            </Link>
        </div>
      </div>
    </PageShell>
  );
}
