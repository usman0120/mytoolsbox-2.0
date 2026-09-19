import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ToolDefinition } from "@/types";
import * as Icons from "lucide-react";
import { cn } from "@/lib/utils";

interface ToolCardProps {
  tool: ToolDefinition;
  className?: string;
}

export function ToolCard({ tool, className }: ToolCardProps) {
  const IconComponent = (Icons as any)[tool.icon] || Icons.Wrench;

  return (
    <Link href={`/${tool.productType}s/${tool.slug}`}>
      <Card
        className={cn(
          "group card-lift cursor-pointer h-full border-border/50 hover:border-primary/30 overflow-hidden",
          className
        )}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent text-primary ring-1 ring-primary/10 group-hover:scale-110 transition-transform duration-300">
              <IconComponent className="h-5 w-5" />
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
          <CardTitle className="text-base mt-3 group-hover:text-primary transition-colors">
            {tool.name}
          </CardTitle>
          <CardDescription className="text-sm line-clamp-2 leading-relaxed">
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