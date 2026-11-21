"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { listHistory, useWorkspace } from "@/lib/workspace/store";
import { SpaceGlyph } from "@/components/shell/space-glyph";
import type { SpaceId } from "@/spaces";

interface Entry {
  id: string;
  name: string;
  url: string;
  space: SpaceId;
  color: string;
}

/** Returning visitors: recent tools and favorites, shown above everything else (blueprint S1). */
export function JumpBackIn({ tools }: { tools: Entry[] }) {
  const { ready, uid, favorites } = useWorkspace();
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    if (!ready) return;
    let active = true;
    listHistory(uid, 20)
      .then((h) => active && setRecent([...new Set(h.map((e) => e.toolId))]))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [ready, uid]);

  const byId = new Map(tools.map((t) => [t.id, t]));
  const items = [...new Set([...recent, ...favorites])].map((id) => byId.get(id)).filter((t): t is Entry => !!t).slice(0, 6);
  if (!items.length) return null;

  return (
    <section aria-labelledby="jump-back-in" className="mx-auto max-w-[1200px] px-4 pt-6 md:px-6 lg:px-8">
      <div className="mb-3 flex items-center justify-between">
        <h2 id="jump-back-in" className="font-sans text-sm font-semibold text-muted-foreground">
          Jump back in
        </h2>
        <Link href="/me" className="text-sm text-muted-foreground hover:text-foreground">
          Your workspace
        </Link>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
        {items.map((t) => (
          <Link key={t.id} href={t.url} className="flex shrink-0 items-center gap-2.5 rounded-xl border bg-card py-2 pr-4 pl-2 text-sm font-medium transition-colors hover:border-foreground/20">
            <span className="flex size-7 items-center justify-center rounded-lg" style={{ color: t.color, background: `color-mix(in srgb, ${t.color} 14%, transparent)` }}>
              <SpaceGlyph space={t.space} className="size-4" />
            </span>
            {t.name}
          </Link>
        ))}
      </div>
    </section>
  );
}
