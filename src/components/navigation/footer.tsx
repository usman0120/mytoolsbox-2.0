"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SITE_CONFIG } from "@/lib/constants";
import { Heart, Globe, ExternalLink, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { LanguageSwitcher } from "@/components/common/language-switcher";
import { useI18n } from "@/lib/i18n";

export function Footer() {
  const pathname = usePathname();
  const { user, isAnonymous } = useAuth();
  const { t, localizePath } = useI18n();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // When on AI workspace or logged in, hide footer completely
  if (pathname === "/ai" || (mounted && user && !isAnonymous)) {
    return null;
  }

  return (
    <footer className="border-t border-border/50 bg-card/30 backdrop-blur-sm" role="contentinfo">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href={localizePath("/")} className="inline-flex items-center gap-3 mb-4 group" aria-label={`${SITE_CONFIG.name} home`}>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-primary/20 to-primary/10 ring-1 ring-primary/25 group-hover:scale-105 transition-transform shadow-xs">
                <img
                  src="/mytoolsbox logo.png"
                  alt={SITE_CONFIG.name}
                  className="h-7 w-7 object-contain"
                />
              </div>
              <span className="font-bold text-base tracking-tight">{SITE_CONFIG.name}</span>
            </Link>
            <p className="text-xs text-muted-foreground leading-relaxed mb-4">
              {t("footer_tagline")}
            </p>
            <div className="flex items-center gap-2">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
                aria-label="GitHub"
              >
                <Globe className="h-4 w-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
                aria-label="Twitter"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Platform */}
          <nav aria-label="Platform links">
            <h4 className="font-semibold mb-4 text-xs uppercase tracking-wider text-muted-foreground">
              {t("footer_platform")}
            </h4>
            <div className="flex flex-col gap-2.5">
              <Link href={localizePath("/tools")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t("nav_tools")}
              </Link>
              <Link href={localizePath("/apps")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t("nav_apps")}
              </Link>
              <Link href={localizePath("/hubs")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t("nav_hubs")}
              </Link>
              <Link href={localizePath("/resources")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t("nav_resources")}
              </Link>
            </div>
          </nav>

          {/* AI Features */}
          <nav aria-label="AI Platform links">
            <h4 className="font-semibold mb-4 text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              {t("footer_ai_suite")}
            </h4>
            <div className="flex flex-col gap-2.5">
              <Link href={localizePath("/ai")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t("ai_new_chat")}
              </Link>
              <Link href={localizePath("/ai/prompts")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t("ai_prompt_library")}
              </Link>
              <Link href={localizePath("/ai/compare")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t("ai_compare_models")}
              </Link>
              <Link href={localizePath("/ai/personas")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t("ai_personas")}
              </Link>
            </div>
          </nav>

          {/* Categories */}
          <nav aria-label="Category links">
            <h4 className="font-semibold mb-4 text-xs uppercase tracking-wider text-muted-foreground">
              {t("footer_categories")}
            </h4>
            <div className="flex flex-col gap-2.5">
              <Link href={localizePath("/tools?category=documents")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t("cat_documents")}
              </Link>
              <Link href={localizePath("/tools?category=images")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t("cat_images")}
              </Link>
              <Link href={localizePath("/tools?category=developer")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t("cat_developer")}
              </Link>
              <Link href={localizePath("/tools?category=calculators")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t("cat_calculators")}
              </Link>
              <Link href={localizePath("/tools?category=writing")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t("cat_writing")}
              </Link>
            </div>
          </nav>

          {/* Legal & Info */}
          <nav aria-label="Legal links">
            <h4 className="font-semibold mb-4 text-xs uppercase tracking-wider text-muted-foreground">
              {t("footer_company")}
            </h4>
            <div className="flex flex-col gap-2.5">
              <Link href={localizePath("/about")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t("footer_about")}
              </Link>
              <Link href={localizePath("/contact")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t("footer_contact")}
              </Link>
              <Link href={localizePath("/privacy")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t("footer_privacy")}
              </Link>
              <Link href={localizePath("/terms")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t("footer_terms")}
              </Link>
            </div>
          </nav>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <LanguageSwitcher variant="footer" />
            <p>
              &copy; {new Date().getFullYear()} {SITE_CONFIG.name}. {t("footer_rights")}
            </p>
          </div>
          <p className="flex items-center gap-1">
            Built with <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500 inline" /> {t("footer_built_with")}
          </p>
        </div>
      </div>
    </footer>
  );
}