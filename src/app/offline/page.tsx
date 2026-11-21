import type { Metadata } from "next";
import Link from "next/link";
import { WifiOff } from "lucide-react";
import { SPACES } from "@/spaces";
import { TOOL_MANIFESTS, toolUrl } from "@/tools/registry";

export const metadata: Metadata = { title: "You're offline", robots: { index: false, follow: false } };

/** Shown by the service worker when a page isn't cached and there's no connection. */
export default function OfflinePage() {
  const local = TOOL_MANIFESTS.filter((m) => m.offline && m.status !== "soon");
  return (
    <div className="mx-auto max-w-[900px] px-4 py-12 md:px-6">
      <WifiOff className="size-8 text-muted-foreground" strokeWidth={1.75} />
      <h1 className="mt-4 text-[32px] leading-tight font-bold">You&apos;re offline</h1>
      <p className="mt-2 max-w-xl text-muted-foreground">
        Pages you&apos;ve opened before still work, and so do tools that run entirely on your device. AI features need a connection.
      </p>
      <div className="mt-8 space-y-6">
        {SPACES.filter((s) => local.some((m) => m.space === s.id)).map((s) => (
          <section key={s.id}>
            <h2 className="mb-2 font-sans text-sm font-semibold">{s.name}</h2>
            <ul className="flex flex-wrap gap-1.5">
              {local
                .filter((m) => m.space === s.id)
                .map((m) => (
                  <li key={m.id}>
                    <Link href={toolUrl(m)} className="inline-block rounded-full border px-3 py-1.5 text-sm hover:border-foreground/30">
                      {m.name}
                    </Link>
                  </li>
                ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
