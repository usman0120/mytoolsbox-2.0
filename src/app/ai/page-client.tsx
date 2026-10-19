"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";

const AIChat = dynamic(
  () => import("@/features/ai/ai-chat").then((mod) => mod.AIChat),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center">
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
  const { localizePath } = useI18n();

  return (
    <div className="h-[calc(100dvh-var(--app-header-height,3.75rem))] w-full overflow-hidden max-w-[1600px] mx-auto">
      <AIChat onOpenPromptLibrary={() => router.push(localizePath("/ai/prompts"))} />
    </div>
  );
}