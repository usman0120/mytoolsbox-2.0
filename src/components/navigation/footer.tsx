"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SITE_CONFIG } from "@/lib/constants";
import { LanguageSwitcher } from "@/components/common/language-switcher";
import { useI18n } from "@/lib/i18n";

export function Footer() {
  const pathname = usePathname();
  const { t, localizePath } = useI18n();

  if (pathname.replace(/^\/(es|ur|fr|de|pt|hi|ar)(?=\/|$)/, "") === "/ai") {
    return null;
  }

  return (
    <footer className="border-t border-border/60 bg-card/40 backdrop-blur-sm" role="contentinfo">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href={localizePath("/")} className="inline-flex items-center gap-2.5 mb-3 group" aria-label={`${SITE_CONFIG.name} home`}>
              <div className="flex h-7.5 w-7.5 items-center justify-center rounded-lg bg-primary text-primary-foreground font-semibold text-xs tracking-tight shadow-xs">
                tb.
              </div>
              <span className="font-semibold text-base tracking-tight">{SITE_CONFIG.name}</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded border border-border/80 text-muted-foreground bg-muted/40">
                PRO
              </span>
            </Link>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Every tool you need. Clean, private, and instant in your browser.
            </p>
          </div>

          {/* Platform */}
          <nav aria-label="Platform links">
            <h4 className="font-semibold mb-3.5 text-xs uppercase tracking-wider text-muted-foreground">
              {t("footer_platform")}
            </h4>
            <div className="flex flex-col gap-2.5">
              <Link href={localizePath("/tools")} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                {t("nav_tools")}
              </Link>
              <Link href={localizePath("/apps")} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                {t("nav_apps")}
              </Link>
              <Link href={localizePath("/hubs")} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                {t("nav_hubs")}
              </Link>
              <Link href={localizePath("/blog")} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Blog & Guides
              </Link>
              <Link href={localizePath("/resources")} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                {t("nav_resources")}
              </Link>
            </div>
          </nav>

          {/* AI Features */}
          <nav aria-label="AI Platform links">
            <h4 className="font-semibold mb-3.5 text-xs uppercase tracking-wider text-muted-foreground">
              {t("footer_ai_suite")}
            </h4>
            <div className="flex flex-col gap-2.5">
              <Link href={localizePath("/ai")} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                {t("ai_new_chat")}
              </Link>
              <Link href={localizePath("/ai/prompts")} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                {t("ai_prompt_library")}
              </Link>
              <Link href={localizePath("/ai/compare")} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                {t("ai_compare_models")}
              </Link>
              <Link href={localizePath("/ai/personas")} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                {t("ai_personas")}
              </Link>
            </div>
          </nav>

          {/* Categories */}
          <nav aria-label="Category links">
            <h4 className="font-semibold mb-3.5 text-xs uppercase tracking-wider text-muted-foreground">
              {t("footer_categories")}
            </h4>
            <div className="flex flex-col gap-2.5">
              <Link href={localizePath("/tools?category=documents")} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                {t("cat_documents")}
              </Link>
              <Link href={localizePath("/tools?category=images")} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                {t("cat_images")}
              </Link>
              <Link href={localizePath("/tools?category=developer")} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                {t("cat_developer")}
              </Link>
              <Link href={localizePath("/tools?category=calculators")} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                {t("cat_calculators")}
              </Link>
              <Link href={localizePath("/tools?category=writing")} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                {t("cat_writing")}
              </Link>
            </div>
          </nav>

          {/* Legal & Info */}
          <nav aria-label="Legal links">
            <h4 className="font-semibold mb-3.5 text-xs uppercase tracking-wider text-muted-foreground">
              {t("footer_company")}
            </h4>
            <div className="flex flex-col gap-2.5">
              <Link href={localizePath("/about")} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                {t("footer_about")}
              </Link>
              <Link href={localizePath("/contact")} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                {t("footer_contact")}
              </Link>
              <Link href={localizePath("/privacy")} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                {t("footer_privacy")}
              </Link>
              <Link href={localizePath("/terms")} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                {t("footer_terms")}
              </Link>
            </div>
          </nav>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-5 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <LanguageSwitcher variant="footer" />
            <span>&copy; {new Date().getFullYear()} {SITE_CONFIG.name}. {t("footer_rights")}</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>Local in-browser processing</span>
            <span>•</span>
            <Link href={localizePath("/privacy")} className="hover:text-foreground transition-colors">
              Privacy & safety
            </Link>
            <span>•</span>
            <Link href={localizePath("/contact")} className="hover:text-foreground transition-colors">
              Feedback ↗
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}