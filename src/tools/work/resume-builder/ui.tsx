"use client";
import dynamic from "next/dynamic";
import { ConsolidatedWorkspace } from "@/features/apps/consolidated-workspace";
import { EngineLoading } from "@/components/common/engine-state";

const modes = [
  { id: "resume", label: "Resume editor", component: dynamic(() => import("@/features/apps/resume-editor").then((module) => module.ResumeEditor), { loading: EngineLoading }) },
  { id: "cv", label: "Academic CV", component: dynamic(() => import("@/features/apps/cv-editor").then((module) => module.CVEditor), { loading: EngineLoading }) },
  { id: "ai", label: "AI assistance", component: dynamic(() => import("@/features/apps/resume-ai-assistant").then((module) => module.ResumeAIAssistant), { loading: EngineLoading }) },
];
export function ResumeBuilderEngine() { return <ConsolidatedWorkspace modes={modes} />; }
