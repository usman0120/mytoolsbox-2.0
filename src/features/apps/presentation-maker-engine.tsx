"use client";
import dynamic from "next/dynamic";
import { ConsolidatedWorkspace } from "./consolidated-workspace";
import { EngineLoading } from "@/components/common/engine-state";

const modes = [
  { id: "editor", label: "Slide editor", component: dynamic(() => import("./presentation-editor").then((module) => module.PresentationEditor), { loading: EngineLoading }) },
  { id: "ai", label: "AI assistance", component: dynamic(() => import("./presentation-ai-assistant").then((module) => module.PresentationAIAssistant), { loading: EngineLoading }) },
];
export function PresentationMakerEngine() { return <ConsolidatedWorkspace modes={modes} />; }
