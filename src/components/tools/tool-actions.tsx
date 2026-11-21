"use client";

import { useCallback, useEffect, useState } from "react";
import { Link2, Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { addFavorite, addHistoryEntry, getFavorites, isFavorited, removeFavorite } from "@/lib/firebase/user-service";
import { useShell } from "@/components/shell/shell-store";
import { cn } from "@/lib/utils";
import type { ToolCategory } from "@/types";

interface Props {
  /** Id used for favorites/history. Migrated tools keep their old catalog id until the M6 data migration. */
  storageId: string;
  name: string;
  category: ToolCategory;
}

/** Favorite star, copy-link and a one-time history entry for signed-in users. */
export function ToolActions({ storageId, name, category }: Props) {
  const { user } = useAuth();
  const setSignIn = useShell((s) => s.setSignIn);
  const [favorite, setFavorite] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user || user.isAnonymous) return;
    let active = true;
    isFavorited(user.uid, storageId).then((v) => active && setFavorite(v)).catch(() => {});
    addHistoryEntry(user.uid, {
      toolId: storageId,
      toolName: name,
      toolSlug: storageId,
      category,
      productType: "tool",
      action: "viewed",
      details: `Opened ${name}`,
    }).catch(() => {});
    return () => {
      active = false;
    };
  }, [user, storageId, name, category]);

  const toggle = useCallback(async () => {
    if (!user || user.isAnonymous) {
      setSignIn(true);
      return;
    }
    setBusy(true);
    try {
      if (favorite) {
        const match = (await getFavorites(user.uid)).find((f) => f.toolId === storageId);
        if (match) await removeFavorite(user.uid, match.id);
        setFavorite(false);
      } else {
        await addFavorite(user.uid, { toolId: storageId, toolName: name, toolSlug: storageId, category, productType: "tool" });
        setFavorite(true);
        toast.success(`${name} added to favorites`);
      }
    } catch {
      toast.error("Couldn't update favorites. Try again.");
    } finally {
      setBusy(false);
    }
  }, [user, favorite, storageId, name, category, setSignIn]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href.split("#")[0]);
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
        disabled={busy}
        aria-pressed={favorite}
        aria-label={favorite ? `Remove ${name} from favorites` : `Add ${name} to favorites`}
      >
        <Star className={cn("size-[18px]", favorite && "fill-current text-[var(--color-space-calc)]")} />
      </Button>
    </div>
  );
}
