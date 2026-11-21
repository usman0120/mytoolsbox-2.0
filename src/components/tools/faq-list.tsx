/** Accessible, no-JS FAQ accordion (native <details>). */
export function FaqList({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="divide-y rounded-xl border bg-card">
      {items.map((f) => (
        <details key={f.q} className="group px-4 py-3 [&_summary::-webkit-details-marker]:hidden">
          <summary className="flex min-h-8 cursor-pointer list-none items-center justify-between gap-4 font-medium">
            {f.q}
            <span className="text-lg leading-none text-muted-foreground transition-transform duration-150 group-open:rotate-45" aria-hidden="true">
              +
            </span>
          </summary>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{f.a}</p>
        </details>
      ))}
    </div>
  );
}
