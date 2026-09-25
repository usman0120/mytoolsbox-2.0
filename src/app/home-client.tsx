"use client";

import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  Shield,
  Globe,
  ChevronRight,
  Star,
  TrendingUp,
  Layout,
  GraduationCap,
  Code2,
  Briefcase,
  Palette,
  PenTool,
  Microscope,
  Users,
  FileText,
  Braces,
  QrCode,
  Percent,
  TextQuote,
  FilePlus,
  ImageDown,
  Maximize,
  CaseSensitive,
  Zap,
  MessageSquare,
  Lightbulb,
  Cpu,
  Coins,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SearchCommand } from "@/components/common/search-command";
import { ToolCard } from "@/components/common/tool-card";
import { CATEGORIES } from "@/lib/constants";
import { useI18n } from "@/lib/i18n";
import type { ToolDefinition } from "@/types";

interface HomeClientProps {
  popularTools: ToolDefinition[];
  featuredApps: ToolDefinition[];
}

export function HomeClient({ popularTools, featuredApps }: HomeClientProps) {
  const { t, localizePath, getCategoryName } = useI18n();

  const quickJobs = [
    { key: "job_merge_pdf" as const, label: "Merge PDFs", href: "/tools/pdf-merger", icon: FilePlus, color: "text-rose-500", bgColor: "bg-rose-500/10" },
    { key: "job_compress_image" as const, label: "Compress Image", href: "/tools/image-compressor", icon: ImageDown, color: "text-emerald-500", bgColor: "bg-emerald-500/10" },
    { key: "job_format_json" as const, label: "Format JSON", href: "/tools/json-formatter", icon: Braces, color: "text-amber-500", bgColor: "bg-amber-500/10" },
    { key: "job_generate_qr" as const, label: "Generate QR", href: "/tools/qr-generator", icon: QrCode, color: "text-violet-500", bgColor: "bg-violet-500/10" },
    { key: "job_count_words" as const, label: "Count Words", href: "/tools/word-counter", icon: TextQuote, color: "text-sky-500", bgColor: "bg-sky-500/10" },
    { key: "job_calculate_percent" as const, label: "Calculate %", href: "/tools/percentage-calculator", icon: Percent, color: "text-pink-500", bgColor: "bg-pink-500/10" },
    { key: "job_convert_case" as const, label: "Convert Case", href: "/tools/case-converter", icon: CaseSensitive, color: "text-indigo-500", bgColor: "bg-indigo-500/10" },
    { key: "job_resize_image" as const, label: "Resize Image", href: "/tools/image-resizer", icon: Maximize, color: "text-teal-500", bgColor: "bg-teal-500/10" },
  ];

  const audienceCards = [
    { id: "students", nameKey: "aud_students" as const, descKey: "aud_students_desc" as const, icon: GraduationCap, color: "from-violet-500 to-purple-600", bgLight: "bg-violet-500/10", textColor: "text-violet-600 dark:text-violet-400" },
    { id: "developers", nameKey: "aud_developers" as const, descKey: "aud_developers_desc" as const, icon: Code2, color: "from-blue-500 to-cyan-600", bgLight: "bg-blue-500/10", textColor: "text-blue-600 dark:text-blue-400" },
    { id: "business", nameKey: "aud_business" as const, descKey: "aud_business_desc" as const, icon: Briefcase, color: "from-amber-500 to-orange-600", bgLight: "bg-amber-500/10", textColor: "text-amber-600 dark:text-amber-400" },
    { id: "designers", nameKey: "aud_designers" as const, descKey: "aud_designers_desc" as const, icon: Palette, color: "from-pink-500 to-rose-600", bgLight: "bg-pink-500/10", textColor: "text-pink-600 dark:text-pink-400" },
    { id: "writers", nameKey: "aud_writers" as const, descKey: "aud_writers_desc" as const, icon: PenTool, color: "from-emerald-500 to-teal-600", bgLight: "bg-emerald-500/10", textColor: "text-emerald-600 dark:text-emerald-400" },
    { id: "researchers", nameKey: "aud_researchers" as const, descKey: "aud_researchers_desc" as const, icon: Microscope, color: "from-indigo-500 to-blue-600", bgLight: "bg-indigo-500/10", textColor: "text-indigo-600 dark:text-indigo-400" },
  ];

  const features = [
    {
      icon: Shield,
      title: t("feature_privacy_title", "Privacy First"),
      description: t("feature_privacy_desc", "Everything runs in your browser. Files never leave your device."),
      gradient: "from-blue-500/10 to-cyan-500/10",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      icon: Zap,
      title: t("feature_fast_title", "Lightning Fast"),
      description: t("feature_fast_desc", "No uploads, no waiting. Instant results with client-side processing."),
      gradient: "from-amber-500/10 to-orange-500/10",
      iconColor: "text-amber-600 dark:text-amber-400",
    },
    {
      icon: Globe,
      title: t("feature_offline_title", "Works Offline"),
      description: t("feature_offline_desc", "Most tools work without internet. Use them anywhere, anytime."),
      gradient: "from-emerald-500/10 to-teal-500/10",
      iconColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
      icon: Sparkles,
      title: t("feature_free_title", "Always Free"),
      description: t("feature_free_desc", "Core tools free forever. No hidden fees, no premium tricks."),
      gradient: "from-violet-500/10 to-purple-500/10",
      iconColor: "text-violet-600 dark:text-violet-400",
    },
  ];

  return (
    <div className="flex flex-col">
      {/* ===== HERO — Utility OS Style ===== */}
      <section className="relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-linear-to-b from-primary/5 via-background to-background dark:from-primary/10 dark:via-background dark:to-background" />
        <div className="hero-glow size-31.25 bg-primary -top-32 -left-32" />
        <div className="hero-glow size-25 bg-violet-500 top-20 -right-20" />
        <div className="hero-glow size-18.75 bg-cyan-500 bottom-0 left-1/4" />

        <div className="container mx-auto px-4 pt-20 pb-16 md:pt-28 md:pb-24 relative">
          <div className="text-center max-w-3xl mx-auto animate-fade-in-up">
            {/* OS-style badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              {t("hero_tag")}
            </div>

            {/* Main heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-tight">
              {t("hero_title")}
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              {t("hero_subtitle")}
            </p>

            {/* Search — the centerpiece */}
            <div className="max-w-xl mx-auto mb-10">
              <SearchCommand />
            </div>

            {/* Quick Jobs — pill-style */}
            <div className="flex flex-wrap justify-center gap-2.5">
              {quickJobs.map((job) => (
                <Link key={job.href} href={localizePath(job.href)}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full gap-2 border-border/60 hover:border-primary/30 hover:bg-primary/5 transition-all duration-200 group"
                  >
                    <span className={`flex h-5 w-5 items-center justify-center rounded-full ${job.bgColor}`}>
                      <job.icon className={`h-3 w-3 ${job.color}`} />
                    </span>
                    {t(job.key, job.label)}
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== FEATURES — Compact strip ===== */}
      <section className="border-y bg-muted/30 dark:bg-muted/10">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group relative text-center p-5 rounded-2xl bg-linear-to-br from-card to-card/50 border border-border/50 hover:border-primary/20 transition-all duration-300 card-lift"
              >
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl bg-linear-to-br ${feature.gradient} mx-auto mb-3 ring-1 ring-border/50 group-hover:scale-110 transition-transform duration-300`}
                >
                  <feature.icon className={`h-5 w-5 ${feature.iconColor}`} />
                </div>
                <h3 className="font-semibold text-sm mb-1">{feature.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== WHAT ARE YOU WORKING ON? — Audience cards ===== */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Users className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-primary uppercase tracking-wider">{t("audience_tag")}</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-3">{t("audience_title")}</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            {t("audience_subtitle")}
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {audienceCards.map((aud, i) => (
            <Link key={aud.id} href={localizePath(`/hubs/${aud.id}`)}>
              <Card
                className="group card-lift cursor-pointer h-full border-border/50 hover:border-primary/30 overflow-hidden animate-fade-in-up"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <CardContent className="p-5 text-center">
                  <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${aud.bgLight} mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <aud.icon className={`h-7 w-7 ${aud.textColor}`} />
                  </div>
                  <h3 className="font-semibold text-sm mb-1">{t(aud.nameKey)}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{t(aud.descKey)}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* ===== AI SUITE PROMOTION ===== */}
      <section className="relative overflow-hidden border-t bg-linear-to-b from-violet-500/5 via-primary/5 to-background py-16 md:py-24">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="outline" className="text-xs px-2.5 py-0.5 rounded-full border-violet-500/30 text-violet-600 dark:text-violet-400 bg-violet-500/10 font-semibold gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  {t("nav_ai")}
                </Badge>
                <Badge variant="secondary" className="text-xs px-2.5 py-0.5 rounded-full gap-1 font-mono">
                  <Coins className="h-3 w-3 text-amber-500" />
                  {t("ai_credits_badge")}
                </Badge>
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                {t("ai_suite_title")}
              </h2>
              <p className="text-sm md:text-base text-muted-foreground mt-2 max-w-2xl leading-relaxed">
                {t("ai_suite_desc")}
              </p>
            </div>
            <Link href={localizePath("/ai")} className="shrink-0">
              <Button size="lg" className="rounded-2xl gap-2 font-medium shadow-md">
                <span>{t("ai_workspace_btn")}</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Card 1: Chat Workspace */}
            <Link href={localizePath("/ai")} className="group">
              <Card className="h-full border-border/60 hover:border-violet-500/50 bg-card/70 hover:bg-card/95 transition-all duration-300 card-lift rounded-2xl overflow-hidden p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-600 dark:text-violet-400 ring-1 ring-violet-500/20 group-hover:scale-105 transition-transform">
                      <MessageSquare className="h-6 w-6" />
                    </div>
                    <Badge variant="outline" className="text-[10px] font-mono rounded-full border-violet-500/30 text-violet-600 dark:text-violet-400">
                      Auto-Router
                    </Badge>
                  </div>
                  <h3 className="text-base font-semibold mb-1.5 group-hover:text-primary transition-colors">
                    {t("ai_new_chat")}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {t("ai_chat_desc")}
                  </p>
                </div>
                <div className="mt-5 flex items-center text-xs font-semibold text-primary gap-1 group-hover:translate-x-0.5 transition-transform">
                  <span>{t("action_start_chat")}</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </div>
              </Card>
            </Link>

            {/* Card 2: Prompt Library */}
            <Link href={localizePath("/ai/prompts")} className="group">
              <Card className="h-full border-border/60 hover:border-amber-500/50 bg-card/70 hover:bg-card/95 transition-all duration-300 card-lift rounded-2xl overflow-hidden p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/20 group-hover:scale-105 transition-transform">
                      <Lightbulb className="h-6 w-6" />
                    </div>
                    <Badge variant="outline" className="text-[10px] font-mono rounded-full border-amber-500/30 text-amber-600 dark:text-amber-400">
                      160+ Prompts
                    </Badge>
                  </div>
                  <h3 className="text-base font-semibold mb-1.5 group-hover:text-primary transition-colors">
                    {t("ai_prompt_library")}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {t("ai_prompts_desc")}
                  </p>
                </div>
                <div className="mt-5 flex items-center text-xs font-semibold text-primary gap-1 group-hover:translate-x-0.5 transition-transform">
                  <span>{t("action_browse_prompts")}</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </div>
              </Card>
            </Link>

            {/* Card 3: Model Arena */}
            <Link href={localizePath("/ai/compare")} className="group">
              <Card className="h-full border-border/60 hover:border-blue-500/50 bg-card/70 hover:bg-card/95 transition-all duration-300 card-lift rounded-2xl overflow-hidden p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 ring-1 ring-blue-500/20 group-hover:scale-105 transition-transform">
                      <Cpu className="h-6 w-6" />
                    </div>
                    <Badge variant="outline" className="text-[10px] font-mono rounded-full border-blue-500/30 text-blue-600 dark:text-blue-400">
                      Arena
                    </Badge>
                  </div>
                  <h3 className="text-base font-semibold mb-1.5 group-hover:text-primary transition-colors">
                    {t("ai_compare_models")}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {t("ai_compare_desc")}
                  </p>
                </div>
                <div className="mt-5 flex items-center text-xs font-semibold text-primary gap-1 group-hover:translate-x-0.5 transition-transform">
                  <span>{t("action_compare_models")}</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </div>
              </Card>
            </Link>

            {/* Card 4: Personas & Tools */}
            <Link href={localizePath("/ai/personas")} className="group">
              <Card className="h-full border-border/60 hover:border-emerald-500/50 bg-card/70 hover:bg-card/95 transition-all duration-300 card-lift rounded-2xl overflow-hidden p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/20 group-hover:scale-105 transition-transform">
                      <Sparkles className="h-6 w-6" />
                    </div>
                    <Badge variant="outline" className="text-[10px] font-mono rounded-full border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
                      Expert Roles
                    </Badge>
                  </div>
                  <h3 className="text-base font-semibold mb-1.5 group-hover:text-primary transition-colors">
                    {t("ai_personas")}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {t("ai_personas_desc")}
                  </p>
                </div>
                <div className="mt-5 flex items-center text-xs font-semibold text-primary gap-1 group-hover:translate-x-0.5 transition-transform">
                  <span>{t("action_view_personas")}</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </div>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== POPULAR TOOLS ===== */}
      <section className="bg-muted/30 dark:bg-muted/10 border-y">
        <div className="container mx-auto px-4 py-20">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium text-primary uppercase tracking-wider">{t("popular_tag")}</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold">{t("popular_title")}</h2>
              <p className="text-muted-foreground mt-1.5">{t("popular_desc")}</p>
            </div>
            <Link href={localizePath("/tools")}>
              <Button variant="ghost" className="gap-1.5 group">
                {t("action_all_tools", "View all tools")}
                <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {popularTools.map((tool, i) => (
              <div key={tool.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 50}ms` }}>
                <ToolCard tool={tool} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== EXPLORE APPS ===== */}
      <section className="container mx-auto px-4 py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Layout className="h-5 w-5 text-cyan-500" />
              <span className="text-sm font-medium text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">{t("apps_tag")}</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold">{t("apps_page_title", "Explore Apps")}</h2>
            <p className="text-muted-foreground mt-1.5">{t("apps_desc")}</p>
          </div>
          <Link href={localizePath("/apps")}>
            <Button variant="ghost" className="gap-1.5 group">
              {t("action_view_all")}
              <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {featuredApps.map((app, i) => {
            const IconComponent = Layout;
            return (
              <Link key={app.id} href={localizePath(`/apps/${app.slug}`)}>
                <Card
                  className="group card-lift cursor-pointer h-full border-border/50 hover:border-primary/30 overflow-hidden animate-fade-in-up"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-cyan-500/10 to-blue-500/10 ring-1 ring-cyan-500/20 group-hover:scale-110 transition-transform shrink-0">
                        <IconComponent className="h-6 w-6 text-cyan-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">{app.name}</h3>
                          {app.status === "beta" && (
                            <Badge className="text-[10px] h-4 px-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 rounded-full">{t("badge_beta", "Beta")}</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{app.shortDescription}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {app.features.slice(0, 3).map((f: string) => (
                            <Badge key={f} variant="secondary" className="text-[10px] h-4 px-1.5 rounded-full">{f}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ===== BROWSE BY CATEGORY ===== */}
      <section className="bg-muted/30 dark:bg-muted/10 border-y">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Star className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-primary uppercase tracking-wider">{t("categories_tag")}</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-3">{t("categories_title", "Browse by Category")}</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              {t("categories_subtext")}
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {CATEGORIES.map((cat, i) => {
              const IconComponent = FileText;
              const localizedCatName = getCategoryName(cat.id, cat.name);
              return (
                <Link key={cat.id} href={localizePath(`/tools?category=${cat.id}`)}>
                  <Card
                    className="group card-lift cursor-pointer h-full border-border/50 hover:border-primary/30 overflow-hidden animate-fade-in-up"
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    <CardContent className="p-5 text-center">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-primary/10 to-primary/5 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 ring-1 ring-primary/10">
                        <IconComponent className="h-7 w-7" />
                      </div>
                      <h3 className="font-semibold text-sm mb-1">{localizedCatName}</h3>
                      <p className="text-xs text-muted-foreground">
                        {t("action_explore", "Explore")}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-r from-primary/5 via-primary/10 to-violet-500/5" />
        <div className="hero-glow size-64 bg-primary -bottom-20 -right-20" />
        <div className="container mx-auto px-4 py-20 text-center relative">
          <div className="max-w-lg mx-auto animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              <Sparkles className="h-3.5 w-3.5" />
              {t("badge_no_signup")}
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-4">{t("cta_title", "Ready to get things done?")}</h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              {t("cta_desc", "Start using any tool instantly. Everything runs in your browser — private, fast, and free.")}
            </p>
            <div className="flex gap-3 justify-center">
              <Link href={localizePath("/tools")}>
                <Button size="lg" className="gap-2 rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all">
                  {t("hero_cta_tools", "Explore All Tools")}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href={localizePath("/ai")}>
                <Button variant="outline" size="lg" className="rounded-xl gap-2">
                  <Sparkles className="h-4 w-4" />
                  {t("hero_cta_ai", "Try AI Assistant")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
