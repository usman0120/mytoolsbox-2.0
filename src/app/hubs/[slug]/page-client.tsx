"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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
  ArrowLeft,
  ChevronRight,
  Sparkles,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { HubDefinition } from "@/types";
import type { ToolDefinition } from "@/types";

interface HubDetailClientProps {
  slug: string;
  hub: HubDefinition;
  tools: ToolDefinition[];
  apps: ToolDefinition[];
}

export function HubDetailClient({ slug, hub, tools, apps }: HubDetailClientProps) {
  const router = useRouter();

  // Map icon string to Lucide icon
  const iconMap: Record<string, LucideIcon> = {
    GraduationCap, Code2, Briefcase, Palette, PenTool, Microscope, Sprout, Users,
  };
  const HubIcon = iconMap[hub.icon] ?? Users;

  // Visual config per audience
  const visualConfig: Record<string, { gradient: string; ringColor: string; iconColor: string; bgLight: string }> = {
    students: { gradient: "from-violet-500/10 to-purple-500/10", ringColor: "ring-violet-500/20", iconColor: "text-violet-600 dark:text-violet-400", bgLight: "bg-violet-500/10" },
    developers: { gradient: "from-blue-500/10 to-cyan-500/10", ringColor: "ring-blue-500/20", iconColor: "text-blue-600 dark:text-blue-400", bgLight: "bg-blue-500/10" },
    business: { gradient: "from-amber-500/10 to-orange-500/10", ringColor: "ring-amber-500/20", iconColor: "text-amber-600 dark:text-amber-400", bgLight: "bg-amber-500/10" },
    designers: { gradient: "from-pink-500/10 to-rose-500/10", ringColor: "ring-pink-500/20", iconColor: "text-pink-600 dark:text-pink-400", bgLight: "bg-pink-500/10" },
    writers: { gradient: "from-emerald-500/10 to-teal-500/10", ringColor: "ring-emerald-500/20", iconColor: "text-emerald-600 dark:text-emerald-400", bgLight: "bg-emerald-500/10" },
    researchers: { gradient: "from-indigo-500/10 to-blue-500/10", ringColor: "ring-indigo-500/20", iconColor: "text-indigo-600 dark:text-indigo-400", bgLight: "bg-indigo-500/10" },
    farmers: { gradient: "from-green-500/10 to-lime-500/10", ringColor: "ring-green-500/20", iconColor: "text-green-600 dark:text-green-400", bgLight: "bg-green-500/10" },
    everyone: { gradient: "from-sky-500/10 to-cyan-500/10", ringColor: "ring-sky-500/20", iconColor: "text-sky-600 dark:text-sky-400", bgLight: "bg-sky-500/10" },
  };
  const vis = visualConfig[slug] ?? visualConfig.everyone;

  return (
    <div className="container mx-auto px-4 py-10">
      {/* Breadcrumb */}
      <div className="mb-6 animate-fade-in-up">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/hubs" className="hover:text-foreground transition-colors">Hubs</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground font-medium">{hub.name}</span>
        </div>
      </div>

      {/* Hero */}
      <div className="mb-10 animate-fade-in-up">
        <div className="flex items-start gap-4">
          <div className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br ${vis.gradient} ${vis.ringColor} ring-1 shadow-sm shrink-0`}>
            <HubIcon className={`h-8 w-8 ${vis.iconColor}`} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{hub.name} Hub</h1>
            <p className="text-muted-foreground mt-1.5 leading-relaxed max-w-2xl">{hub.description}</p>
            <div className="flex items-center gap-3 mt-3">
              <Badge variant="secondary" className="rounded-full text-xs">
                {tools.length} tools
              </Badge>
              <Badge variant="secondary" className="rounded-full text-xs">
                {apps.length} apps
              </Badge>
              <Badge variant="outline" className="rounded-full text-xs">
                {tools.length + apps.length} total
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Tools Section */}
      {tools.length > 0 && (
        <div className="mb-10 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          <div className="flex items-center gap-2 mb-5">
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${vis.bgLight}`}>
              <Zap className={`h-4 w-4 ${vis.iconColor}`} />
            </div>
            <h2 className="text-lg font-semibold">Tools ({tools.length})</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {tools.map((tool, i) => (
              <Link key={tool.slug} href={`/tools/${tool.slug}`}>
                <Card
                  className="group card-lift border-border/50 hover:border-primary/30 overflow-hidden animate-fade-in-up"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${vis.bgLight} ring-1 ring-border/50 group-hover:scale-110 transition-transform shrink-0`}>
                        <Zap className={`h-5 w-5 ${vis.iconColor}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm group-hover:text-primary transition-colors truncate">
                          {tool.name}
                        </h3>
                        <p className="text-xs text-muted-foreground truncate">{tool.shortDescription}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Apps Section */}
      {apps.length > 0 && (
        <div className="mb-10 animate-fade-in-up" style={{ animationDelay: "150ms" }}>
          <div className="flex items-center gap-2 mb-5">
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${vis.bgLight}`}>
              <Sparkles className={`h-4 w-4 ${vis.iconColor}`} />
            </div>
            <h2 className="text-lg font-semibold">Apps ({apps.length})</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {apps.map((app, i) => (
              <Link key={app.slug} href={`/apps/${app.slug}`}>
                <Card
                  className="group card-lift border-border/50 hover:border-primary/30 overflow-hidden animate-fade-in-up"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${vis.bgLight} ring-1 ring-border/50 group-hover:scale-110 transition-transform shrink-0`}>
                        <Sparkles className={`h-5 w-5 ${vis.iconColor}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm group-hover:text-primary transition-colors truncate">
                          {app.name}
                        </h3>
                        <p className="text-xs text-muted-foreground truncate">{app.shortDescription}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {tools.length === 0 && apps.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-4 animate-fade-in-up">
          <div className={`flex h-20 w-20 items-center justify-center rounded-2xl bg-linear-to-br ${vis.gradient} ${vis.ringColor} ring-1`}>
            <HubIcon className={`h-10 w-10 ${vis.iconColor}`} />
          </div>
          <p className="text-lg font-medium">No items yet</p>
          <p className="text-sm max-w-sm text-center">
            We&apos;re working on adding tools and apps for {hub.name.toLowerCase()}. Check back soon!
          </p>
          <Button variant="outline" className="rounded-xl" onClick={() => router.push("/hubs")}>
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back to Hubs
          </Button>
        </div>
      )}
    </div>
  );
}