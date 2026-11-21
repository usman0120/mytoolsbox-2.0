import type { Metadata } from "next";
import { Suspense } from "react";
import { WorkflowsClient } from "@/flows/workflows-client";
import { PageSkeleton } from "@/components/common/loading-skeleton";

export const metadata: Metadata = {
  title: "Flows – Chain Tools Without Re-uploading",
  description: "Chain tools into a Flow: PDF to images under 200 KB, email-ready photos, clean text packs. Runs on your device; free, private, no sign-up.",
  alternates: { canonical: "/flows" },
};
export default function WorkflowsPage() { return <Suspense fallback={<PageSkeleton label="Loading workflows" />}><WorkflowsClient /></Suspense>; }
