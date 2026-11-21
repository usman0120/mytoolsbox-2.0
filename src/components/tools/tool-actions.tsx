"use client";

import { useEffect, useState } from "react";
import { Link2, Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useWorkspace } from "@/lib/workspace/store";
import { cn } from "@/lib/utils";

/** Favorite star and copy-link for a tool page; also records the visit in history. */
export function ToolActions({ toolId, name }: { toolId: string; name: string }) {
  const favorite = useWorkspace((s) => s.favorites.includes(toolId));
  const ready = useWorkspace((s) => s.ready);
  const toggleFavorite = useWorkspace((s) => s.toggleFavorite);
  const recordVisit = useWorkspace((s) => s.recordVisit);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (ready) recordVisit(toolId);
  }, [ready, toolId, recordVisit]);

  const toggle = async () => {
    setBusy(true);
    try {
      const on = await toggleFavorite(toolId);
      toast.success(on ? `${name} added to favorites` : `${name} removed from favorites`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't update favorites. Try again.");
    } finally {
      setBusy(false);
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href.split(/[?#]/)[0]);
      toast.success("Link copied");
    } catch {
      toast.error("Couldn't copy the link");
    }
  };

  return (
    <div className="flex items-center gap-1">
      <Button variant="ghost" size="icon" onClick={copyLink} aria-label="Copy link to this tool">
        <Link2 className="size-[18px]" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={toggle}
        disabled={busy || !ready}
        aria-pressed={favorite}
        aria-label={favorite ? `Remove ${name} from favorites` : `Add ${name} to favorites`}
      >
        <Star className={cn("size-[18px]", favorite && "fill-current text-[var(--color-space-calc)]")} />
      </Button>
    </div>
  );
}
