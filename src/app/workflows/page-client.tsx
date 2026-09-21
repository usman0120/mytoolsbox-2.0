// ---------------------------------------------------------------------------
// Workflows Page — Browse and run workflow pipelines
// ---------------------------------------------------------------------------

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Sparkles, Plus, History, Wand2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageShell, ToolHeader } from "@/components/common/workload-layouts";
import { WorkflowCard, WorkflowHistoryList } from "@/features/workflows/workflow-components";
import { workflowRegistry, getFeaturedWorkflows } from "@/lib/workflow/registry";
import { getWorkflowHistory, clearWorkflowHistory } from "@/lib/workflow/history";
import type { WorkflowDefinition } from "@/types/workflow";
import type { WorkflowRunRecord } from "@/lib/workflow/history";

const ALL_CATEGORIES = [
  "All",
  "documents",
  "images",
  "academic",
  "developer",
  "productivity",
  "writing",
  "business",
  "design",
  "ai",
  "security",
  "custom",
];

export function WorkflowsPageClient() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [history, setHistory] = useState<WorkflowRunRecord[]>([]);

  useEffect(() => {
    setHistory(getWorkflowHistory());
  }, []);

  const featured = getFeaturedWorkflows();

  const filtered = workflowRegistry.filter((w) => {
    const matchesSearch =
      !search ||
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.shortDescription.toLowerCase().includes(search.toLowerCase()) ||
      w.keywords.some((k) => k.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory =
      activeCategory === "All" || w.categories.includes(activeCategory);

    return matchesSearch && matchesCategory;
  });

  const handleClearHistory = () => {
    clearWorkflowHistory();
    setHistory([]);
  };

  return (
    <PageShell>
      <ToolHeader
        icon={<Sparkles className="h-5 w-5" />}
        title="Workflows"
        description="Chain multiple tools together to accomplish complex tasks in one go."
      />

      {/* Action bar */}
      <div className="flex items-center gap-3 mb-6">
        <Button
          onClick={() => router.push("/workflows/builder")}
          className="gap-2"
          size="sm"
        >
          <Wand2 className="h-4 w-4" />
          Build Custom Workflow
        </Button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search workflows..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            aria-label="Search workflows"
          />
        </div>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by category">
          {ALL_CATEGORIES.map((cat) => (
            <Badge
              key={cat}
              variant={activeCategory === cat ? "default" : "outline"}
              className="cursor-pointer text-[11px] h-6 px-2.5 transition-colors"
              onClick={() => setActiveCategory(cat)}
              role="button"
              tabIndex={0}
              aria-pressed={activeCategory === cat}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setActiveCategory(cat);
                }
              }}
            >
              {cat === "All" ? "All" : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </Badge>
          ))}
        </div>
      </div>

      {/* Workflow History */}
      {history.length > 0 && !search && activeCategory === "All" && (
        <section className="mb-10" aria-labelledby="history-heading">
          <WorkflowHistoryList
            runs={history}
            onRunClick={(runId) => {
              const run = history.find((r) => r.id === runId);
              if (run) {
                router.push(`/workflows/${run.workflowId}`);
              }
            }}
            onClear={handleClearHistory}
          />
        </section>
      )}

      {/* Featured Workflows */}
      {featured.length > 0 && !search && activeCategory === "All" && (
        <section className="mb-10" aria-labelledby="featured-heading">
          <h2 id="featured-heading" className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-brand" />
            Featured Workflows
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featured.map((wf) => (
              <WorkflowCard
                key={wf.id}
                workflow={wf}
                onClick={() => router.push(`/workflows/${wf.id}`)}
              />
            ))}
          </div>
        </section>
      )}

      {/* All Workflows */}
      <section aria-labelledby="all-workflows-heading">
        <h2 id="all-workflows-heading" className="text-sm font-semibold mb-4">
          {search || activeCategory !== "All" ? "Results" : "All Workflows"}
        </h2>
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-sm">No workflows found matching your criteria.</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3 gap-2"
              onClick={() => router.push("/workflows/builder")}
            >
              <Plus className="h-3.5 w-3.5" />
              Build your own
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((wf) => (
              <WorkflowCard
                key={wf.id}
                workflow={wf}
                onClick={() => router.push(`/workflows/${wf.id}`)}
              />
            ))}
          </div>
        )}
      </section>
    </PageShell>
  );
}