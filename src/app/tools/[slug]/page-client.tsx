"use client";

import Link from "next/link";
import { ArrowLeft, Shield, Zap, Info, Clock, Users, Tag, ChevronRight, Star, Heart, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ToolCard } from "@/components/common/tool-card";
import { ToolEngine } from "@/features/tool-engine";
import { ToolDefinition } from "@/types";
import { getToolsByCategory } from "@/content/tools/registry";
import * as Icons from "lucide-react";

interface ToolPageClientProps {
  tool: ToolDefinition;
}

export function ToolPageClient({ tool }: ToolPageClientProps) {
  const IconComponent = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[tool.icon] || Icons.Wrench;
  const relatedTools = tool.relatedTools
    .map((slug) => getToolsByCategory(tool.category).find((t) => t.slug === slug))
    .filter(Boolean) as ToolDefinition[];

  return (
    <div className="container mx-auto px-4 py-10">
      {/* Breadcrumb */}
      <div className="mb-6 animate-fade-in-up">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/tools" className="hover:text-foreground transition-colors">Tools</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground font-medium truncate">{tool.name}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Header */}
          <div className="animate-fade-in-up">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-primary/10 to-primary/5 ring-1 ring-primary/20 shadow-sm shrink-0">
                <IconComponent className="h-7 w-7 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{tool.name}</h1>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <Badge variant="secondary" className="text-xs capitalize rounded-full">
                    {tool.category}
                  </Badge>
                  {tool.processingMode === "client" && (
                    <Badge variant="outline" className="text-xs gap-1 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20">
                      <Shield className="h-3 w-3" />
                      Client-side
                    </Badge>
                  )}
                  {tool.requiresPro && (
                    <Badge className="text-xs gap-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
                      <Star className="h-3 w-3 fill-current" />
                      Pro
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg">
                  <Heart className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <p className="text-muted-foreground leading-relaxed">{tool.description}</p>
          </div>

          {/* Tool Workspace */}
          <Card className="border-border/50 overflow-hidden animate-fade-in-up" style={{ animationDelay: "100ms" }}>
            <CardContent className="p-6">
              <ToolEngine tool={tool} />
            </CardContent>
          </Card>

          {/* Features */}
          <Card className="border-border/50 animate-fade-in-up" style={{ animationDelay: "150ms" }}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {tool.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm p-2 rounded-lg hover:bg-accent/40 transition-colors">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 shrink-0 mt-0.5">
                      <Zap className="h-3 w-3 text-primary" />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* FAQ */}
          {tool.faq.length > 0 && (
            <Card className="border-border/50 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Info className="h-5 w-5 text-primary" />
                  Frequently Asked Questions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {tool.faq.map((item, i) => (
                  <div key={i} className="p-3 rounded-lg hover:bg-accent/40 transition-colors">
                    <h4 className="font-medium text-sm mb-1.5">{item.question}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.answer}</p>
                    {i < tool.faq.length - 1 && <Separator className="mt-3" />}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          {/* Info */}
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">About this tool</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10 shrink-0">
                  <Shield className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="font-medium text-xs">
                    {tool.processingMode === "client" ? "Browser Processing" : "Server Processing"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {tool.processingMode === "client"
                      ? "Your data stays on your device"
                      : "Processed on our secure servers"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 shrink-0">
                  <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="font-medium text-xs">No Account Required</p>
                  <p className="text-xs text-muted-foreground">Use instantly without signing up</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10 shrink-0">
                  <Tag className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <p className="font-medium text-xs capitalize">{tool.category}</p>
                  <p className="text-xs text-muted-foreground">Category</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Related Tools */}
          {relatedTools.length > 0 && (
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Related Tools</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {relatedTools.map((rt) => (
                  <ToolCard key={rt.id} tool={rt} />
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}