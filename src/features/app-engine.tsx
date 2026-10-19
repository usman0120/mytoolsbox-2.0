"use client";

import dynamic from "next/dynamic";
import { ToolDefinition } from "@/types";
import { EngineBoundary, EngineLoading, EngineUnavailable } from "@/components/common/engine-state";

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
  "quiz-maker": dynamic(() => import("@/features/apps/quiz-maker-engine").then((m) => ({ default: m.QuizMakerEngine })), { loading: EngineLoading }),
  "budget-planner": dynamic(() => import("@/features/apps/budget-planner-engine").then((m) => ({ default: m.BudgetPlannerEngine })), { loading: EngineLoading }),
  "habit-tracker": dynamic(() => import("@/features/apps/habit-tracker-engine").then((m) => ({ default: m.HabitTrackerEngine })), { loading: EngineLoading }),
  "certificate-maker": dynamic(() => import("@/features/apps/certificate-maker-engine").then((m) => ({ default: m.CertificateMakerEngine })), { loading: EngineLoading }),
  "fitness-ai": dynamic(() => import("@/features/apps/fitness-ai-engine").then((m) => ({ default: m.FitnessAIEngine })), { loading: EngineLoading }),
  "nutrition-ai": dynamic(() => import("@/features/apps/nutrition-ai-engine").then((m) => ({ default: m.NutritionAIEngine })), { loading: EngineLoading }),
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