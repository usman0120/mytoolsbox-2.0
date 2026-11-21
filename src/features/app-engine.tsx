"use client";

import dynamic from "next/dynamic";
import { ToolDefinition } from "@/types";
import { EngineBoundary, EngineLoading, EngineUnavailable } from "@/components/common/engine-state";

const engineMap: Record<string, React.ComponentType<unknown>> = {
  "ai-chat": dynamic(() => import("@/tools/ai/chat/ui").then((module) => ({ default: module.AIChatEngine })), { loading: EngineLoading }),
  "math-solver": dynamic(() => import("@/tools/ai/math-solver/ui").then((m) => ({ default: m.MathSolverEngine })), { loading: EngineLoading }),
  "resume-builder": dynamic(() => import("@/tools/work/resume-builder/ui").then((m) => ({ default: m.ResumeBuilderEngine })), { loading: EngineLoading }),
  "invoice-maker": dynamic(() => import("@/tools/work/invoice-generator/ui").then((m) => ({ default: m.InvoiceMakerEngine })), { loading: EngineLoading }),
  "study-planner": dynamic(() => import("@/tools/study/study-planner/ui").then((m) => ({ default: m.StudyPlannerEngine })), { loading: EngineLoading }),
  "presentation-maker": dynamic(() => import("@/tools/create/presentation-maker/ui").then((m) => ({ default: m.PresentationMakerEngine })), { loading: EngineLoading }),
  "image-editor": dynamic(() => import("@/tools/media/photo-editor/ui").then((m) => ({ default: m.ImageEditorEngine })), { loading: EngineLoading }),
  "video-editor": dynamic(() => import("@/tools/media/video-editor/ui").then((m) => ({ default: m.VideoEditorEngine })), { loading: EngineLoading }),
  "research-assistant": dynamic(() => import("@/tools/ai/research-assistant/ui").then((m) => ({ default: m.ResearchAssistantEngine })), { loading: EngineLoading }),
  "farmer-ai": dynamic(() => import("@/tools/ai/farm-advisor/ui").then((m) => ({ default: m.FarmerAIEngine })), { loading: EngineLoading }),
  "ai-notes-generator": dynamic(() => import("@/tools/ai/notes-generator/ui").then((m) => ({ default: m.AINotesGeneratorEngine })), { loading: EngineLoading }),
  "ai-diagram-generator": dynamic(() => import("@/tools/create/diagram/ui").then((m) => ({ default: m.AIDiagramGeneratorEngine })), { loading: EngineLoading }),
  "ai-planning": dynamic(() => import("@/tools/ai/planner/ui").then((m) => ({ default: m.AIPlanningEngine })), { loading: EngineLoading }),
  "ai-project-ideas": dynamic(() => import("@/tools/ai/project-ideas/ui").then((m) => ({ default: m.AIProjectIdeasEngine })), { loading: EngineLoading }),
  "quiz-maker": dynamic(() => import("@/tools/study/quiz-maker/ui").then((m) => ({ default: m.QuizMakerEngine })), { loading: EngineLoading }),
  "budget-planner": dynamic(() => import("@/tools/calc/budget-planner/ui").then((m) => ({ default: m.BudgetPlannerEngine })), { loading: EngineLoading }),
  "habit-tracker": dynamic(() => import("@/tools/work/habit-tracker/ui").then((m) => ({ default: m.HabitTrackerEngine })), { loading: EngineLoading }),
  "certificate-maker": dynamic(() => import("@/tools/create/certificate-maker/ui").then((m) => ({ default: m.CertificateMakerEngine })), { loading: EngineLoading }),
  "fitness-ai": dynamic(() => import("@/tools/ai/fitness-coach/ui").then((m) => ({ default: m.FitnessAIEngine })), { loading: EngineLoading }),
  "nutrition-ai": dynamic(() => import("@/tools/ai/nutrition-guide/ui").then((m) => ({ default: m.NutritionAIEngine })), { loading: EngineLoading }),
};

export const appEngineSlugs = Object.keys(engineMap);

interface AppEngineProps {
  app: ToolDefinition;
}

export function AppEngine({ app }: AppEngineProps) {
  const Engine = engineMap[app.slug];

  if (!Engine) return <EngineUnavailable name={app.name} />;

  return <EngineBoundary key={app.slug} name={app.name}><Engine /></EngineBoundary>;
}
