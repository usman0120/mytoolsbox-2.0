import type { Metadata } from "next";
import { WorkflowsPageClient } from "./page-client";

export const metadata: Metadata = {
  title: "Workflows — Chain Tools Together",
  description:
    "Chain multiple tools together to accomplish complex tasks. Turn documents into study notes, images into math solutions, ideas into diagrams, and more.",
};

export default function WorkflowsPage() {
  return <WorkflowsPageClient />;
}