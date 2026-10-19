"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
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
  ArrowLeft,
  ChevronRight,
  Sparkles,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { HubDefinition } from "@/types";
import type { ToolDefinition } from "@/types";
import { useI18n } from "@/lib/i18n";
import { PageShell, ToolHeader } from "@/components/common/workload-layouts";

interface HubDetailClientProps {
  slug: string;
  hub: HubDefinition;
  tools: ToolDefinition[];
  apps: ToolDefinition[];
}

export function HubDetailClient({ slug, hub, tools, apps }: HubDetailClientProps) {
  const router = useRouter();
  const { t, localizePath, getToolName } = useI18n();

  const getLocalizedHub = () => {
    switch (slug) {
      case "students": return { name: t("aud_students"), description: t("aud_students_desc") };
      case "developers": return { name: t("aud_developers"), description: t("aud_developers_desc") };
      case "business": return { name: t("aud_business"), description: t("aud_business_desc") };
      case "designers": return { name: t("aud_designers"), description: t("aud_designers_desc") };
      case "writers": return { name: t("aud_writers"), description: t("aud_writers_desc") };
      case "researchers": return { name: t("aud_researchers"), description: t("aud_researchers_desc") };
      default: return { name: hub.name, description: hub.description };
    }
  };

  const localizedHub = getLocalizedHub();

  // Map icon string to Lucide icon
  const iconMap: Record<string, LucideIcon> = {
    GraduationCap, Code2, Briefcase, Palette, PenTool, Microscope, Sprout, Users,
  };
  const HubIcon = iconMap[hub.icon] ?? Users;

  // Visual config per audience — unified pine & sage styling
  const vis = {
    iconColor: "text-primary",
    bgLight: "bg-primary/10",
  };

  return (
    <PageShell>
      {/* Breadcrumb */}
      <div className="mb-6">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link href={localizePath("/")} className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href={localizePath("/hubs")} className="hover:text-foreground transition-colors">{t("nav_hubs")}</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground font-medium">{localizedHub.name}</span>
        </div>
      </div>

      {/* Hero */}
      <ToolHeader icon={<HubIcon className="size-5 text-primary" />} title={localizedHub.name} description={localizedHub.description} />

      {/* Tools Section */}
      {tools.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Zap className="h-3.5 w-3.5" />
            </div>
            <h2 className="text-base font-semibold">{t("hubs_tools_count").replace("{count}", String(tools.length))}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tools.map((tool) => (
              <Link key={tool.slug} href={localizePath(`/tools/${tool.slug}`)} className="group">
                <div className="h-full p-4 rounded-xl border border-border/70 bg-card hover:border-primary/40 hover:bg-card/90 transition-all duration-200 hover:-translate-y-0.5 flex items-start gap-3.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-200 shrink-0">
                    <Zap className="h-4.5 w-4.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors wrap-break-word">
                      {getToolName(tool.slug, tool.name)}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5 leading-relaxed">{tool.shortDescription}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all shrink-0 mt-0.5" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Apps Section */}
      {apps.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <h2 className="text-base font-semibold">{t("hubs_apps_count").replace("{count}", String(apps.length))}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {apps.map((app) => (
              <Link key={app.slug} href={localizePath(`/apps/${app.slug}`)} className="group">
                <div className="h-full p-4 rounded-xl border border-border/70 bg-card hover:border-primary/40 hover:bg-card/90 transition-all duration-200 hover:-translate-y-0.5 flex items-start gap-3.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-200 shrink-0">
                    <Sparkles className="h-4.5 w-4.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors wrap-break-word">
                      {getToolName(app.slug, app.name)}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5 leading-relaxed">{app.shortDescription}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all shrink-0 mt-0.5" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {tools.length === 0 && apps.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-4 animate-fade-in-up">
          <div className={`flex h-12 w-12 items-center justify-center ${vis.iconColor}`}>
            <HubIcon className={`h-10 w-10 ${vis.iconColor}`} />
          </div>
          <p className="text-lg font-medium">{t("search_no_results")}</p>
          <Button variant="outline" className="rounded-xl" onClick={() => router.push(localizePath("/hubs"))}>
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            {t("hubs_back")}
          </Button>
        </div>
      )}
    </PageShell>
  );
}