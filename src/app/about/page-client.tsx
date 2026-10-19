"use client";

import Link from "next/link";
import { SITE_CONFIG } from "@/lib/constants";
import { useI18n } from "@/lib/i18n";
import { Shield, Zap, Globe, Heart, ArrowRight } from "lucide-react";
import { PageShell, ToolHeader } from "@/components/common/workload-layouts";

export function AboutPageClient() {
  const { t, localizePath } = useI18n();

  const principles = [
    {
      title: t("about_privacy_title"),
      description: t("privacy_page_title", "Privacy Policy"),
      href: "/privacy",
      icon: Shield,
    },
    {
      title: t("nav_tools"),
      description: t("nav_tools"),
      href: "/tools",
      icon: Heart,
    },
    {
      title: t("feature_fast_title"),
      description: t("nav_apps"),
      href: "/apps",
      icon: Zap,
    },
    {
      title: t("nav_resources"),
      description: t("nav_resources"),
      href: "/resources",
      icon: Globe,
    },
  ];

  return (
    <PageShell className="max-w-3xl">
      {/* Header */}
      <ToolHeader title={t("about_title")} />

      {/* Mission */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">{t("about_mission_title")}</h2>
        <div className="prose prose-neutral dark:prose-invert max-w-none text-muted-foreground space-y-4">
          <p className="leading-relaxed">
            {SITE_CONFIG.name}: {t("nav_tools")}, {t("nav_apps")}, {t("nav_ai")}, {t("nav_resources")}.
          </p>
        </div>
      </section>

      {/* Principles */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-6">{t("features_title")}</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {principles.map((principle) => {
            const Icon = principle.icon;
            return (
              <Link
                key={principle.title}
                href={localizePath(principle.href)}
                className="flex items-center gap-3 py-3 border-b border-border/50 hover:text-primary transition-colors"
              >
                <div className="text-primary shrink-0">
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <span className="text-sm">
                  {principle.description}
                </span>
                <ArrowRight className="ml-auto h-4 w-4 shrink-0" />
              </Link>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <div className="pt-5 border-t border-border/50">
        <p className="text-muted-foreground mb-4">{t("contact_subtitle")}</p>
        <Link
          href={localizePath("/contact")}
          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          {t("contact_title")} <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </PageShell>
  );
}
