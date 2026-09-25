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
import { useI18n } from "@/lib/i18n";

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
  const { t, localizePath, getToolName } = useI18n();
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
    <div className="container mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-10 animate-fade-in-up">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-emerald-500/10 to-teal-500/10 ring-1 ring-emerald-500/20 shadow-sm">
            <Compass className="h-6 w-6 text-emerald-500" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{t("hubs_title")}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {t("hubs_subtitle")} ({t("hubs_total_count").replace("{count}", String(allTools.length + allApps.length))})
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {HUBS.map((hub, i) => {
          const { tools, apps, total } = getHubItems(hub.audience);
          const localized = getLocalizedHub(hub);

          return (
            <Card
              key={hub.name}
              className="group card-lift border-border/50 hover:border-primary/30 overflow-hidden animate-fade-in-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <CardContent className="p-5">
                {/* Hub header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br ${hub.gradient} ${hub.ringColor} ring-1 group-hover:scale-110 transition-transform`}
                    >
                      <hub.icon className={`h-6 w-6 ${hub.iconColor}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-base group-hover:text-primary transition-colors">
                        {localized.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">{t("hubs_total_count").replace("{count}", String(total))}</p>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{localized.description}</p>

                {/* Tools preview */}
                {tools.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                      {t("hubs_tools_count").replace("{count}", String(tools.length))}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {tools.slice(0, 5).map((tool) => (
                        <Link key={tool.slug} href={localizePath(`/tools/${tool.slug}`)}>
                          <Badge
                            variant="secondary"
                            className="text-[10px] cursor-pointer hover:bg-primary/20 transition-colors rounded-full"
                          >
                            {getToolName(tool.slug, tool.name)}
                          </Badge>
                        </Link>
                      ))}
                      {tools.length > 5 && (
                        <Badge variant="outline" className="text-[10px] rounded-full">
                          +{tools.length - 5}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Apps preview */}
                {apps.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                      {t("hubs_apps_count").replace("{count}", String(apps.length))}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {apps.slice(0, 3).map((app) => (
                        <Link key={app.slug} href={localizePath(`/apps/${app.slug}`)}>
                          <Badge
                            variant="secondary"
                            className="text-[10px] cursor-pointer hover:bg-primary/20 transition-colors rounded-full"
                          >
                            <Sparkles className="h-2.5 w-2.5 mr-1" />
                            {getToolName(app.slug, app.name)}
                          </Badge>
                        </Link>
                      ))}
                      {apps.length > 3 && (
                        <Badge variant="outline" className="text-[10px] rounded-full">
                          +{apps.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                <Link href={localizePath(`/hubs/${hub.audience}`)} className="block">
                  <Button variant="ghost" size="sm" className="w-full justify-between group/btn rounded-xl">
                    <span>{t("hubs_explore_btn")}</span>
                    <ArrowRight className="h-3.5 w-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}