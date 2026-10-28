"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  GraduationCap,
  Code2,
  Briefcase,
  Palette,
  PenTool,
  Microscope,
  Sprout,
  Users,
  ArrowRight,
  Compass,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { getActiveTools, getToolsByAudience } from "@/content/tools/registry";
import { getActiveApps } from "@/content/apps/registry";
import type { ToolAudience } from "@/types";
import { UI_COPY } from "@/lib/ui-copy";
import { PageShell, ToolHeader } from "@/components/common/workload-layouts";

interface HubData {
  icon: LucideIcon;
  name: string;
  audience: ToolAudience;
  description: string;
  gradient: string;
  ringColor: string;
  iconColor: string;
  bgLight: string;
}

const HUBS: HubData[] = [
  {
    icon: GraduationCap,
    name: "Students",
    audience: "students",
    description: "Study tools, citation generators, math solvers, quiz makers, and writing aids for academic success.",
    gradient: "from-violet-500/10 to-purple-500/10",
    ringColor: "ring-violet-500/20",
    iconColor: "text-violet-600 dark:text-violet-400",
    bgLight: "bg-violet-500/10",
  },
  {
    icon: Code2,
    name: "Developers",
    audience: "developers",
    description: "Code formatters, diff checkers, API testers, regex tools, and dev utilities for your workflow.",
    gradient: "from-blue-500/10 to-cyan-500/10",
    ringColor: "ring-blue-500/20",
    iconColor: "text-blue-600 dark:text-blue-400",
    bgLight: "bg-blue-500/10",
  },
  {
    icon: Briefcase,
    name: "Business",
    audience: "business",
    description: "PDF tools, invoice makers, calculators, converters, and productivity apps for professionals.",
    gradient: "from-amber-500/10 to-orange-500/10",
    ringColor: "ring-amber-500/20",
    iconColor: "text-amber-600 dark:text-amber-400",
    bgLight: "bg-amber-500/10",
  },
  {
    icon: Palette,
    name: "Designers",
    audience: "designers",
    description: "Color palette generators, image editors, SVG optimizers, and asset tools for creatives.",
    gradient: "from-pink-500/10 to-rose-500/10",
    ringColor: "ring-pink-500/20",
    iconColor: "text-pink-600 dark:text-pink-400",
    bgLight: "bg-pink-500/10",
  },
  {
    icon: PenTool,
    name: "Writers",
    audience: "writers",
    description: "Word counters, grammar tools, text formatters, case converters, and citation tools for wordsmiths.",
    gradient: "from-emerald-500/10 to-teal-500/10",
    ringColor: "ring-emerald-500/20",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    bgLight: "bg-emerald-500/10",
  },
  {
    icon: Microscope,
    name: "Researchers",
    audience: "researchers",
    description: "Data analysis, unit converters, reference managers, research assistants, and scientific calculators.",
    gradient: "from-indigo-500/10 to-blue-500/10",
    ringColor: "ring-indigo-500/20",
    iconColor: "text-indigo-600 dark:text-indigo-400",
    bgLight: "bg-indigo-500/10",
  },
  {
    icon: Sprout,
    name: "Farmers",
    audience: "farmers",
    description: "Unit converters, weather tools, crop calculators, disease analysis, and agricultural planning aids.",
    gradient: "from-green-500/10 to-lime-500/10",
    ringColor: "ring-green-500/20",
    iconColor: "text-green-600 dark:text-green-400",
    bgLight: "bg-green-500/10",
  },
  {
    icon: Users,
    name: "Everyone",
    audience: "everyone",
    description: "Everyday tools for common tasks — no expertise needed. Image tools, calculators, QR codes, and more.",
    gradient: "from-sky-500/10 to-cyan-500/10",
    ringColor: "ring-sky-500/20",
    iconColor: "text-sky-600 dark:text-sky-400",
    bgLight: "bg-sky-500/10",
  },
];

export function HubsPageClient() {
  const { t, toolName: getToolName } = UI_COPY;
  const allTools = getActiveTools();
  const allApps = getActiveApps();

  const getLocalizedHub = (hub: HubData) => {
    switch (hub.audience) {
      case "students": return { name: t("aud_students"), description: t("aud_students_desc") };
      case "developers": return { name: t("aud_developers"), description: t("aud_developers_desc") };
      case "business": return { name: t("aud_business"), description: t("aud_business_desc") };
      case "designers": return { name: t("aud_designers"), description: t("aud_designers_desc") };
      case "writers": return { name: t("aud_writers"), description: t("aud_writers_desc") };
      case "researchers": return { name: t("aud_researchers"), description: t("aud_researchers_desc") };
      default: return { name: hub.name, description: hub.description };
    }
  };

  const getHubItems = (audience: ToolAudience) => {
    const tools = getToolsByAudience(audience);
    const apps = allApps.filter((a) => a.audiences.includes(audience));
    return { tools, apps, total: tools.length + apps.length };
  };

  return (
    <PageShell>
      <div className="mb-6 pb-4 border-b border-border/50">
        <span className="text-xs font-bold tracking-widest text-primary uppercase">
          WORKFLOW HUBS
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mt-1">
          Workflows & <span className="font-editorial italic font-normal text-primary">Role Hubs.</span>
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          {t("hubs_total_count").replace("{count}", String(allTools.length + allApps.length))}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {HUBS.map((hub) => {
          const { tools, apps, total } = getHubItems(hub.audience);
          const localized = getLocalizedHub(hub);

          return (
            <div
              key={hub.name}
              className="group rounded-2xl border border-border/70 bg-card hover:border-primary/40 hover:bg-card/90 transition-all duration-200 hover:-translate-y-0.5 p-5 flex flex-col justify-between"
            >
              <div>
                {/* Hub header */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-200 shrink-0">
                    <hub.icon className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base text-foreground group-hover:text-primary transition-colors">
                      {localized.name}
                    </h3>
                    <p className="text-[11px] text-muted-foreground">{t("hubs_total_count").replace("{count}", String(total))}</p>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground mb-4 leading-relaxed line-clamp-2">{localized.description}</p>

                {/* Tools preview */}
                {tools.length > 0 && (
                  <div className="mb-3">
                    <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider mb-1.5">
                      {t("hubs_tools_count").replace("{count}", String(tools.length))}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {tools.slice(0, 5).map((tool) => (
                        <Link key={tool.slug} href={`/tools/${tool.slug}`}>
                          <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors border border-border/60">
                            {getToolName(tool.slug, tool.name)}
                          </span>
                        </Link>
                      ))}
                      {tools.length > 5 && (
                        <span className="text-[10px] text-muted-foreground px-1.5 py-0.5">
                          +{tools.length - 5}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Apps preview */}
                {apps.length > 0 && (
                  <div className="mb-4">
                    <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider mb-1.5">
                      {t("hubs_apps_count").replace("{count}", String(apps.length))}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {apps.slice(0, 3).map((app) => (
                        <Link key={app.slug} href={`/apps/${app.slug}`}>
                          <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors border border-border/60">
                            {getToolName(app.slug, app.name)}
                          </span>
                        </Link>
                      ))}
                      {apps.length > 3 && (
                        <span className="text-[10px] text-muted-foreground px-1.5 py-0.5">
                          +{apps.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-border/40">
                <Link href={`/hubs/${hub.audience}`} className="block">
                  <Button variant="ghost" size="sm" className="w-full justify-between group/btn rounded-xl text-xs font-medium text-primary hover:text-primary">
                    <span>{t("hubs_explore_btn")}</span>
                    <ArrowRight className="h-3.5 w-3.5 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </PageShell>
  );
}
