"use client";
import dynamic from "next/dynamic";
import { ConsolidatedWorkspace } from "./consolidated-workspace";
import { EngineLoading } from "@/components/common/engine-state";

const modes = [
  { id: "resume", label: "Resume editor", component: dynamic(() => import("./resume-editor").then((module) => module.ResumeEditor), { loading: EngineLoading }) },
  { id: "cv", label: "Academic CV", component: dynamic(() => import("./cv-editor").then((module) => module.CVEditor), { loading: EngineLoading }) },
  { id: "ai", label: "AI assistance", component: dynamic(() => import("./resume-ai-assistant").then((module) => module.ResumeAIAssistant), { loading: EngineLoading }) },
];
export function ResumeBuilderEngine() { return <ConsolidatedWorkspace modes={modes} />; }
