"use client";

import Link from "next/link";
import { SITE_CONFIG } from "@/lib/constants";
import { useI18n } from "@/lib/i18n";
import { Shield, Lock, EyeOff, ServerOff, Database, Mail } from "lucide-react";

export function PrivacyPageClient() {
  const { t, localizePath } = useI18n();

  return (
    <div className="container mx-auto px-4 py-16 md:py-24 max-w-3xl">
      {/* Header */}
      <div className="text-center mb-16 animate-fade-in-up">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
          {t("privacy_page_title", "Privacy Policy")}
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          {t("privacy_page_subtitle", "Your privacy is the foundation of MyToolsBox. Everything runs client-side.")}
        </p>
      </div>

      <div className="prose prose-neutral dark:prose-invert max-w-none text-muted-foreground space-y-8">
        {/* Last updated */}
        <p className="text-sm text-muted-foreground animate-fade-in-up">
          {t("legal_last_updated", "Last updated: September 2026")}
        </p>

        {/* 1. Core Commitment */}
        <section className="animate-fade-in-up" style={{ animationDelay: "60ms" }}>
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            1. {t("about_privacy_title", "Privacy First Architecture")}
          </h2>
          <p>
            {SITE_CONFIG.name} {t("about_privacy_desc", "is designed from the ground up to protect your privacy. All processing happens client-side.")}
          </p>
          <p>
            {t("privacy_p1", "The vast majority of our tools process your data entirely within your browser — your files, text, images, and other content never leave your device and are never uploaded to our servers.")}
          </p>
        </section>

        {/* 2. Client Side Guarantee */}
        <section className="animate-fade-in-up" style={{ animationDelay: "120ms" }}>
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <ServerOff className="h-5 w-5 text-emerald-500" />
            2. {t("spec_in_browser", "100% In-Browser Execution")}
          </h2>
          <p>
            {t("privacy_p2", "We believe you shouldn't have to trade privacy for utility.")}
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>{t("badge_no_upload", "No Server Uploads")}:</strong> {t("feature_privacy_desc", "Files never leave your device.")}</li>
            <li><strong>{t("badge_no_signup", "No Registration Required")}:</strong> {t("spec_no_reg_desc", "Use instantly without creating an account or providing personal details.")}</li>
            <li><strong>{t("feature_offline_title", "Works Offline")}:</strong> {t("feature_offline_desc", "Most tools work without internet. Use them anywhere, anytime.")}</li>
          </ul>
        </section>

        {/* 3. Account Data */}
        <section className="animate-fade-in-up" style={{ animationDelay: "180ms" }}>
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Database className="h-5 w-5 text-blue-500" />
            3. {t("settings_tab_account", "Account Data & Authentication")}
          </h2>
          <p>
            {t("account_guest_notice", "Create an account or sign in to save favorites, track history, and sync your settings across devices.")}
          </p>
          <p>
            {t("settings_subtitle", "Manage your profile, preferences, and account security.")}
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
