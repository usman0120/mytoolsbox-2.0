import type { Metadata } from "next";
import { Suspense } from "react";
import { toolIndex } from "@/tools/catalog";
import { SPACES } from "@/spaces";
import { WorkspaceClient } from "./workspace-client";

export const metadata: Metadata = {
  title: "Your workspace",
  description: "Favorites, history, saved results and settings.",
  robots: { index: false, follow: false },
};

export default function WorkspacePage() {
  return (
    <Suspense>
      <WorkspaceClient tools={toolIndex()} spaces={SPACES.map((s) => ({ id: s.id, name: s.name, color: s.color }))} />
    </Suspense>
  );
}
