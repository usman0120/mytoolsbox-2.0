"use client";

import Link from "next/link";
import { SITE_CONFIG } from "@/lib/constants";
import { useI18n } from "@/lib/i18n";
import { Shield, Zap, Sparkles, Globe, Heart, Lock, CheckCircle2, ArrowRight } from "lucide-react";

export function AboutPageClient() {
  const { t, localizePath } = useI18n();

  const principles = [
    {
      title: t("about_privacy_title"),
      description: t("about_privacy_desc"),
      icon: Shield,
    },
    {
      title: t("about_free_title"),
      description: t("about_free_desc"),
      icon: Heart,
    },
    {
      title: t("feature_fast_title"),
      description: t("feature_fast_desc"),
      icon: Zap,
    },
    {
      title: t("about_offline_title"),
      description: t("about_offline_desc"),
      icon: Globe,
    },
  ];

  return (
    <div className="container mx-auto px-4 py-16 md:py-24 max-w-3xl">
      {/* Header */}
      <div className="text-center mb-16 animate-fade-in-up">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
          {t("about_title")}
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          {t("footer_tagline")}
        </p>
      </div>

      {/* Mission */}
      <section className="mb-16 animate-fade-in-up" style={{ animationDelay: "60ms" }}>
        <h2 className="text-xl font-semibold mb-4">{t("about_mission_title")}</h2>
        <div className="prose prose-neutral dark:prose-invert max-w-none text-muted-foreground space-y-4">
          <p className="leading-relaxed">
            {t("about_mission_desc")}
          </p>
        </div>
      </section>

      {/* Principles */}
      <section className="mb-16 animate-fade-in-up" style={{ animationDelay: "120ms" }}>
        <h2 className="text-xl font-semibold mb-6">{t("features_title")}</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {principles.map((principle) => {
            const Icon = principle.icon;
            return (
              <div
                key={principle.title}
                className="p-5 rounded-2xl border border-border/50 bg-card/50 hover:border-primary/30 transition-colors"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary mb-3">
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <h3 className="font-semibold text-sm mb-1.5">{principle.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {principle.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <div className="text-center pt-8 border-t border-border/50 animate-fade-in-up" style={{ animationDelay: "180ms" }}>
        <p className="text-muted-foreground mb-4">{t("contact_subtitle")}</p>
        <Link
          href={localizePath("/contact")}
          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          {t("contact_title")} <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
