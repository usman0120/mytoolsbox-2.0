"use client";

import { AISubnav } from "@/features/ai/components/ai-subnav";
import { ModelCompare } from "@/features/ai/components/model-compare";
import { useI18n } from "@/lib/i18n";

export function ComparePageClient() {
  const { t } = useI18n();
  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 max-w-7xl">
      <AISubnav
        title={t("ai_compare_models", "Compare Models")}
      />
      <div className="mt-2">
        <ModelCompare />
      </div>
    </div>
  );
}
