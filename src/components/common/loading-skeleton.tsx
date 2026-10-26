export function ListSkeleton({ label = "Loading items" }: { label?: string }) {
  return (
    <div role="status" aria-label={label} className="space-y-3">
      <span className="sr-only">{label}…</span>
      <div aria-hidden="true" className="space-y-3 motion-safe:animate-pulse">
        {[0, 1, 2].map((item) => <div key={item} className="flex gap-4 rounded-xl border p-4">
          <div className="size-10 rounded-lg bg-muted" />
          <div className="flex-1 space-y-2"><div className="h-4 w-2/3 rounded bg-muted" /><div className="h-3 w-1/3 rounded bg-muted" /></div>
        </div>)}
      </div>
    </div>
  );
}

export function PageSkeleton({ label = "Loading page" }: { label?: string }) {
  return <div className="mx-auto max-w-5xl space-y-8 px-4 py-12 sm:px-6">
    <div aria-hidden="true" className="space-y-3 motion-safe:animate-pulse">
      <div className="h-8 w-2/3 max-w-sm rounded-lg bg-muted" />
      <div className="h-4 w-3/4 max-w-lg rounded bg-muted" />
      <div className="h-11 w-full max-w-md rounded-xl bg-muted" />
    </div>
    <ListSkeleton label={label} />
  </div>;
}

export function NavigationSkeleton() {
  return <div role="status" aria-label="Loading navigation" className="h-[var(--shell-header-height)] border-b">
    <span className="sr-only">Loading navigation…</span>
    <div aria-hidden="true" className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 motion-safe:animate-pulse">
      <div className="h-8 w-36 rounded-lg bg-muted" /><div className="h-8 w-20 rounded-lg bg-muted" />
    </div>
  </div>;
}
