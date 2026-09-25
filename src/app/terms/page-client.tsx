"use client";

import Link from "next/link";
import { SITE_CONFIG } from "@/lib/constants";
import { useI18n } from "@/lib/i18n";
import { CheckCircle2, Shield, Sparkles, Scale, AlertCircle, Mail } from "lucide-react";

export function TermsPageClient() {
  const { t, localizePath } = useI18n();

  return (
    <div className="container mx-auto px-4 py-16 md:py-24 max-w-3xl">
      {/* Header */}
      <div className="text-center mb-16 animate-fade-in-up">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
          {t("terms_page_title", "Terms of Service")}
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          {t("terms_page_subtitle", "Simple, fair, and transparent terms for using MyToolsBox.")}
        </p>
      </div>

      <div className="prose prose-neutral dark:prose-invert max-w-none text-muted-foreground space-y-8">
        <p className="text-sm text-muted-foreground animate-fade-in-up">
          {t("legal_last_updated", "Last updated: September 2026")}
        </p>

        {/* 1. Acceptance */}
        <section className="animate-fade-in-up" style={{ animationDelay: "60ms" }}>
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            1. Acceptance of Terms
          </h2>
          <p>
            By accessing or using {SITE_CONFIG.name}, you agree to be bound by these Terms of Service. If you do not agree, please do not use the service.
          </p>
        </section>

        {/* 2. Description of Service */}
        <section className="animate-fade-in-up" style={{ animationDelay: "120ms" }}>
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            2. Description of Service
          </h2>
          <p>
            {SITE_CONFIG.name} {t("about_mission_desc", "provides browser-based utilities and AI tools. All processing happens client-side.")}
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>{t("about_free_desc", "Core tools are 100% free with no hidden fees or forced subscriptions.")}</li>
            <li>{t("spec_in_browser_desc", "Zero server uploads. Client-side privacy and memory efficiency.")}</li>
            <li>{t("about_offline_desc", "Calculators, converters, text tools, and utilities are available anywhere, anytime without an internet connection.")}</li>
          </ul>
        </section>

        {/* 3. Your Content */}
        <section className="animate-fade-in-up" style={{ animationDelay: "180ms" }}>
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Scale className="h-5 w-5 text-amber-500" />
            3. Intellectual Property & Your Content
          </h2>
          <p>
            <strong>Your content remains strictly yours.</strong> Any files, text, or data you process through our tools belong to you. Since processing happens entirely in your browser, we never see, store, or copy your data.
          </p>
        </section>

        {/* 4. Contact */}
        <section className="animate-fade-in-up border-t pt-8" style={{ animationDelay: "240ms" }}>
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            4. {t("contact_title", "Contact Us")}
          </h2>
          <p>
            {t("contact_subtitle", "Have questions or need assistance? Reach out directly.")}
          </p>
          <p className="mt-2">
            <Link href={localizePath("/contact")} className="text-primary hover:underline font-medium">
              {t("contact_title", "Contact Support")} &rarr;
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}
