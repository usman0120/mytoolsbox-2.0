"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button";
import { PageShell } from "@/components/common/workload-layouts";
import { AlertTriangle, RefreshCw, Home, Wrench } from "lucide-react";

interface ErrorPageProps {
  error: Error & { digest?: string };
  retry: () => void;
}

export default function ErrorPage({ error, retry }: ErrorPageProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("[ErrorBoundary]", error);
  }, [error]);

  return (
    <PageShell className="max-w-2xl py-16">
      <div className="text-center space-y-6">
        {/* Icon */}
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-destructive/10 text-destructive mx-auto">
          <AlertTriangle className="h-8 w-8" />
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Something went wrong
          </h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            An unexpected error occurred while loading this page. This is likely temporary — try refreshing the page or navigating home.
          </p>
          {error.digest && (
            <p className="text-[11px] text-muted-foreground/70 font-mono mt-2">
              Error reference: {error.digest}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Button
             onClick={retry}
            className="rounded-xl gap-2 text-xs font-medium"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Try Again
          </Button>
          <Link href="/" className={buttonVariants({ variant: "outline", size: "default", className: "rounded-xl gap-2 text-xs" })}>
            <Home className="h-3.5 w-3.5" />
            Go Home
          </Link>
          <Link href="/tools" className={buttonVariants({ variant: "ghost", size: "default", className: "rounded-xl gap-2 text-xs text-muted-foreground" })}>
            <Wrench className="h-3.5 w-3.5" />
            Browse Tools
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
