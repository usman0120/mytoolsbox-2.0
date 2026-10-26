"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { AlertTriangle, X } from "lucide-react";
import Link from "next/link";

export function RequestNotice() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  if (params.get("blocked") !== "true") return null;
  return <div role="alert" className="border-b border-amber-500/30 bg-amber-500/10 px-4 py-4">
    <div className="mx-auto flex max-w-7xl items-start gap-3 text-sm">
      <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-600" />
      <div className="flex-1"><p className="font-semibold">Your request was temporarily blocked</p><p className="mt-1 text-muted-foreground">Wait a moment before trying again. If this keeps happening, <Link href="/contact" className="underline">contact support</Link>.</p></div>
      <button aria-label="Dismiss warning" className="rounded-lg p-2 hover:bg-muted" onClick={() => { const next = new URLSearchParams(params.toString()); next.delete("blocked"); router.replace(`${pathname}${next.size ? `?${next}` : ""}`, { scroll: false }); }}><X className="size-4" /></button>
    </div>
  </div>;
}
