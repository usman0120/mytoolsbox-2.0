"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

const AIChat = dynamic(
  () => import("@/features/ai/ai-chat").then((mod) => mod.AIChat),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center rounded-none sm:rounded-2xl md:rounded-3xl border-0 sm:border border-border/60 bg-card/40">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-xs font-medium">Loading Chat Workspace...</p>
        </div>
      </div>
    ),
  }
);

export function AIPageClient() {
  const router = useRouter();

  return (
    <div className="h-[calc(100dvh-3.75rem)] w-full overflow-hidden p-0 sm:p-2 md:p-2.5 max-w-[1600px] mx-auto">
      <AIChat onOpenPromptLibrary={() => router.push("/ai/prompts")} />
    </div>
  );
}