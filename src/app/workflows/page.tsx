import type { Metadata } from "next";
import { Suspense } from "react";
import { WorkflowsClient } from "@/features/workflows/workflows-client";
import { PageSkeleton } from "@/components/common/loading-skeleton";

export const metadata: Metadata = {
  title: "Workflows — Connect tools, process once",
  description: "Build and save private browser workflows. Convert PDF pages to images under 200 KB, prepare web images, analyze text and package outputs without re-uploading or server file storage.",
  alternates: { canonical: "/workflows" },
};
export default function WorkflowsPage() { return <Suspense fallback={<PageSkeleton label="Loading workflows" />}><WorkflowsClient /></Suspense>; }
