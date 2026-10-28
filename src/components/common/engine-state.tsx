"use client";

import { Component, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { UI_COPY } from "@/lib/ui-copy";

export function EngineLoading() {
  const { t } = UI_COPY;
  return (
    <div role="status" className="flex min-h-32 items-center justify-center gap-3 text-sm text-muted-foreground">
      <span aria-hidden="true" className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      {t("engine_loading", "Loading workspace…")}
    </div>
  );
}

export function EngineUnavailable({ name }: { name: string }) {
  return (
    <div role="status" className="py-8 text-center">
      <h2 className="text-sm font-medium">{name} is unavailable</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        This workspace could not be loaded. No processing has taken place. Choose another tool or try again later.
      </p>
    </div>
  );
}

export class EngineBoundary extends Component<
  { children: ReactNode; name: string },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div role="alert" className="py-8 text-center">
        <h2 className="text-sm font-medium">Unable to open {this.props.name}</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          The workspace encountered an error. Retry to reset it; unsaved input may be lost.
        </p>
        <Button className="mt-4" variant="outline" onClick={() => this.setState({ failed: false })}>
          Retry workspace
        </Button>
      </div>
    );
  }
}
