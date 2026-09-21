import type { Metadata } from "next";
import { WorkflowBuilderPageClient } from "./page-client";

export const metadata: Metadata = {
  title: "Workflow Builder — Create Custom Pipelines",
  description:
    "Build your own custom workflow by chaining tools together. Create pipelines that process data through multiple steps automatically.",
};

export default function WorkflowBuilderPage() {
  return <WorkflowBuilderPageClient />;
}