"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ToolDefinition } from "@/types";
import * as Icons from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

interface ToolCardProps {
  tool: ToolDefinition;
  className?: string;
}

export function ToolCard({ tool, className }: ToolCardProps) {
  const { getToolName, localizePath } = useI18n();
  const IconComponent = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[tool.icon] || Icons.Wrench;
  const displayName = getToolName(tool.slug, tool.name);
  const href = localizePath(`/${tool.productType}s/${tool.slug}`);

  return (
    <Link href={href} className="block group">
      <Card
        className={cn(
          "card-lift cursor-pointer h-full border-border/60 hover:border-brand/25 transition-all duration-200",
          className
        )}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            {/* Icon */}
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground group-hover:bg-brand-muted group-hover:text-brand transition-colors duration-200">
              <IconComponent className="size-4.5" />
            </div>
            <div className="flex gap-1.5">
              {tool.status === "beta" && (
                <Badge variant="secondary" className="text-[10px] h-5 px-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
                  Beta
                </Badge>
              )}
              {tool.status === "coming-soon" && (
                <Badge variant="outline" className="text-[10px] h-5 px-1.5">
                  Soon
                </Badge>
              )}
            </div>
          </div>
          <CardTitle className="text-sm font-medium mt-2.5 group-hover:text-brand transition-colors duration-200">
            {displayName}
          </CardTitle>
          <CardDescription className="text-xs line-clamp-2 leading-relaxed">
            {tool.shortDescription}
          </CardDescription>
        </CardHeader>
        {tool.requiresAuth && (
          <CardContent className="pt-0">
            <Badge variant="outline" className="text-[10px] h-5 px-1.5 border-border/50">
              Account required
            </Badge>
          </CardContent>
        )}
      </Card>
    </Link>
  );
}