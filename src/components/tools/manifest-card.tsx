import Link from "next/link";
import type { ToolManifest } from "@/tools/types";
import { toolUrl } from "@/tools/registry";
import { cn } from "@/lib/utils";
import { ToolArt } from "./port-art";

/** Tool card for the Space and category grids. Server component. */
export function ManifestCard({ tool, className }: { tool: ToolManifest; className?: string }) {
  return (
    <Link
      href={toolUrl(tool)}
      className={cn(
        "group flex flex-col gap-3 rounded-xl border bg-card p-4 transition-[border-color,box-shadow] duration-150 hover:border-foreground/20 hover:shadow-md focus-visible:outline-2",
        className,
      )}
    >
      <ToolArt tool={tool} className="-ml-1" />
      <span>
        <span className="block font-medium leading-snug">{tool.name}</span>
        <span className="mt-1 line-clamp-2 block text-sm text-muted-foreground">{tool.tagline}</span>
      </span>
    </Link>
  );
}
