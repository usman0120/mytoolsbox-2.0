"use client";

import { Suspense, useState, type ComponentType } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EngineLoading } from "@/components/common/engine-state";

export interface WorkspaceMode { id: string; label: string; component: ComponentType }
export function ConsolidatedWorkspace({ modes }: { modes: WorkspaceMode[] }) {
  return <Suspense fallback={<EngineLoading />}><WorkspaceModes modes={modes} /></Suspense>;
}
function WorkspaceModes({ modes }: { modes: WorkspaceMode[] }) {
  const params = useSearchParams();
  const router = useRouter();
  const mode = modes.find((item) => item.id === params.get("mode"))?.id ?? modes[0].id;
  const [visited, setVisited] = useState(() => new Set([mode]));
  return <Tabs value={mode} onValueChange={(value) => {
    setVisited((previous) => new Set([...previous, value]));
    const next = new URLSearchParams(params.toString()); next.set("mode", value);
    router.replace(`${window.location.pathname}?${next}`, { scroll: false });
  }} className="space-y-6">
    <TabsList className="h-auto flex-wrap gap-1">{modes.map((item) => <TabsTrigger value={item.id} key={item.id} className="px-4 py-2">{item.label}</TabsTrigger>)}</TabsList>
    {modes.map(({ id, component: Component }) => (visited.has(id) || mode === id) && <TabsContent key={id} value={id} keepMounted><Component /></TabsContent>)}
  </Tabs>;
}
