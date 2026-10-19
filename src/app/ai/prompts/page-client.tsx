"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { AISubnav } from "@/features/ai/components/ai-subnav";
import { useChatStore } from "@/features/ai/chat-store";
import { useI18n } from "@/lib/i18n";

const PromptLibrary = dynamic(
  () =>
    import("@/features/ai/components/prompt-library").then(
      (mod) => mod.PromptLibrary
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-96 w-full items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-xs font-medium">Loading Prompt Library...</p>
        </div>
      </div>
    ),
  }
);

export function PromptsPageClient() {
  const router = useRouter();
  const { t, localizePath } = useI18n();
  const { setPendingPrompt } = useChatStore();

  const handleUsePrompt = (promptText: string) => {
    setPendingPrompt(promptText);
    router.push(localizePath("/ai"));
  };

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 max-w-7xl">
      <AISubnav
        title={t("ai_prompt_library", "Prompt Library")}
      />
      <div className="mt-2">
        <PromptLibrary onUsePrompt={handleUsePrompt} />
      </div>
    </div>
  );
}
