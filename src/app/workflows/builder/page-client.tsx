// ---------------------------------------------------------------------------
// Workflow Builder Page — Create custom workflow pipelines
// ---------------------------------------------------------------------------

"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Sparkles } from "lucide-react";
import { PageShell, ToolHeader } from "@/components/common/workload-layouts";
import { WorkflowBuilder } from "@/features/workflows/workflow-builder";
import { saveWorkflow } from "@/lib/workflow/history";
import type { WorkflowDefinition } from "@/types/workflow";

export function WorkflowBuilderPageClient() {
  const router = useRouter();

  const handleSave = useCallback((workflow: WorkflowDefinition) => {
    saveWorkflow({
      id: workflow.id,
      definition: workflow,
      savedAt: Date.now(),
      customName: workflow.name,
    });
  }, []);

  const handleRun = useCallback(
    (workflow: WorkflowDefinition) => {
      // Save first, then navigate to run it
      saveWorkflow({
        id: workflow.id,
        definition: workflow,
        savedAt: Date.now(),
        customName: workflow.name,
      });
      router.push(`/workflows/${workflow.id}`);
    },
    [router]
  );

  return (
    <PageShell>
      {/* Back button */}
      <button
        onClick={() => router.push("/workflows")}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Workflows
      </button>

      <ToolHeader
        icon={<Sparkles className="h-5 w-5" />}
        title="Workflow Builder"
        description="Create custom pipelines by chaining tools together. Each tool's output feeds into the next."
      />

      <div className="mt-6">
        <WorkflowBuilder onSave={handleSave} onRun={handleRun} />
      </div>
    </PageShell>
  );
}