"use client";
import dynamic from "next/dynamic";
import { EngineLoading } from "@/components/common/engine-state";
const AIChat = dynamic(() => import("@/features/ai/ai-chat").then((module) => module.AIChat), { ssr: false, loading: EngineLoading });
export function AIChatEngine() { return <div className="flex h-[75dvh] min-h-[540px] flex-col overflow-hidden rounded-xl border"><AIChat /></div>; }
