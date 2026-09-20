import type { Metadata } from "next";
import { WorkflowDetailPageClient } from "./page-client";
import { getWorkflowById } from "@/lib/workflow/registry";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const workflow = getWorkflowById(id);

  if (!workflow) {
    return { title: "Workflow Not Found" };
  }

  return {
    title: `${workflow.name} — Workflow`,
    description: workflow.shortDescription,
  };
}

export default function WorkflowDetailPage() {
  return <WorkflowDetailPageClient />;
}