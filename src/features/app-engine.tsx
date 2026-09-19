"use client";

import dynamic from "next/dynamic";
import { ToolDefinition } from "@/types";

const engineMap: Record<string, React.ComponentType<unknown>> = {
  "math-solver": dynamic(() => import("@/features/apps/math-solver-engine").then((m) => ({ default: m.MathSolverEngine })), { loading: EngineLoading }),
  "resume-builder": dynamic(() => import("@/features/apps/resume-builder-engine").then((m) => ({ default: m.ResumeBuilderEngine })), { loading: EngineLoading }),
  "invoice-maker": dynamic(() => import("@/features/apps/invoice-maker-engine").then((m) => ({ default: m.InvoiceMakerEngine })), { loading: EngineLoading }),
  "study-planner": dynamic(() => import("@/features/apps/study-planner-engine").then((m) => ({ default: m.StudyPlannerEngine })), { loading: EngineLoading }),
  "presentation-maker": dynamic(() => import("@/features/apps/presentation-maker-engine").then((m) => ({ default: m.PresentationMakerEngine })), { loading: EngineLoading }),
  "diagram-maker": dynamic(() => import("@/features/apps/diagram-maker-engine").then((m) => ({ default: m.DiagramMakerEngine })), { loading: EngineLoading }),
  "image-editor": dynamic(() => import("@/features/apps/image-editor-engine").then((m) => ({ default: m.ImageEditorEngine })), { loading: EngineLoading }),
  "video-editor": dynamic(() => import("@/features/apps/video-editor-engine").then((m) => ({ default: m.VideoEditorEngine })), { loading: EngineLoading }),
  "research-assistant": dynamic(() => import("@/features/apps/research-assistant-engine").then((m) => ({ default: m.ResearchAssistantEngine })), { loading: EngineLoading }),
  "farmer-ai": dynamic(() => import("@/features/apps/farmer-ai-engine").then((m) => ({ default: m.FarmerAIEngine })), { loading: EngineLoading }),
  "ai-quiz-generator": dynamic(() => import("@/features/apps/ai-quiz-generator-engine").then((m) => ({ default: m.AIQuizGeneratorEngine })), { loading: EngineLoading }),
  "ai-notes-generator": dynamic(() => import("@/features/apps/ai-notes-generator-engine").then((m) => ({ default: m.AINotesGeneratorEngine })), { loading: EngineLoading }),
  "ai-diagram-generator": dynamic(() => import("@/features/apps/ai-diagram-generator-engine").then((m) => ({ default: m.AIDiagramGeneratorEngine })), { loading: EngineLoading }),
  "ai-planning": dynamic(() => import("@/features/apps/ai-planning-engine").then((m) => ({ default: m.AIPlanningEngine })), { loading: EngineLoading }),
  "ai-project-ideas": dynamic(() => import("@/features/apps/ai-project-ideas-engine").then((m) => ({ default: m.AIProjectIdeasEngine })), { loading: EngineLoading }),
};

function EngineLoading() {
  return (
    <div className="text-center py-8">
      <div className="animate-spin h-8 w-8 border-4 border-cyan-500 border-t-transparent rounded-full mx-auto mb-3" />
      <p className="text-sm text-muted-foreground">Loading app...</p>
    </div>
  );
}

interface AppEngineProps {
  app: ToolDefinition;
}

export function AppEngine({ app }: AppEngineProps) {
  const Engine = engineMap[app.slug];

  if (!Engine) {
    return (
      <div className="border-2 border-dashed rounded-xl p-8 text-center">
        <p className="font-medium mb-1">Coming Soon</p>
        <p className="text-sm text-muted-foreground">
          The {app.name} app is under development. Check back soon!
        </p>
      </div>
    );
  }

  return <Engine />;
}