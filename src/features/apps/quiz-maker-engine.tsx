"use client";
import dynamic from "next/dynamic";
import { ConsolidatedWorkspace } from "./consolidated-workspace";
import { EngineLoading } from "@/components/common/engine-state";

const modes = [
  { id: "editor", label: "Quiz editor & notes", component: dynamic(() => import("./quiz-editor").then((module) => module.QuizEditor), { loading: EngineLoading }) },
  { id: "ai", label: "AI assistance", component: dynamic(() => import("./quiz-ai-assistant").then((module) => module.QuizAIAssistant), { loading: EngineLoading }) },
];
export function QuizMakerEngine() { return <ConsolidatedWorkspace modes={modes} />; }
