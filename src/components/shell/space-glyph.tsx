import type { SpaceId } from "@/spaces";
import { cn } from "@/lib/utils";

// Eight custom Space glyphs on a 24px grid, 1.75 stroke (matches Lucide weight).
const PATHS: Record<SpaceId, React.ReactNode> = {
  docs: (
    <>
      <path d="M6 3.5h8l4 4v13H6z" />
      <path d="M14 3.5v4h4" />
      <path d="M9 12.5h6M9 16h4" />
    </>
  ),
  media: (
    <>
      <rect x="3.5" y="5.5" width="13" height="10" rx="2" />
      <path d="M7.5 19.5h11a2 2 0 0 0 2-2v-8" />
      <path d="M8.5 8.5v4l3.5-2z" />
    </>
  ),
  create: (
    <>
      <path d="M4 19c4-1 5.5-4.5 7-8s3.5-6 9-7" />
      <rect x="2.75" y="17.25" width="3.5" height="3.5" rx="0.75" />
      <rect x="17.75" y="2.75" width="3.5" height="3.5" rx="0.75" />
      <path d="M11 11h5" />
    </>
  ),
  dev: (
    <>
      <path d="M8 7l-4.5 5L8 17" />
      <path d="M16 7l4.5 5L16 17" />
      <path d="M13.5 5l-3 14" />
    </>
  ),
  study: (
    <>
      <path d="M3.5 6.5c3-1.5 6-1.5 8.5 0v13c-2.5-1.5-5.5-1.5-8.5 0z" />
      <path d="M20.5 6.5c-3-1.5-6-1.5-8.5 0v13c2.5-1.5 5.5-1.5 8.5 0z" />
    </>
  ),
  calc: (
    <>
      <rect x="4" y="3.5" width="16" height="17" rx="2.5" />
      <path d="M8 8h8" />
      <path d="M8.5 13v4M6.5 15h4" />
      <path d="M13.5 14h3.5M13.5 16.5h3.5" />
    </>
  ),
  work: (
    <>
      <path d="M4 6.5l1.5 1.5 3-3" />
      <path d="M11.5 6.5H20" />
      <path d="M4 12.5l1.5 1.5 3-3" />
      <path d="M11.5 12.5H20" />
      <path d="M4.5 18.5h3M11.5 18.5H17" />
    </>
  ),
  ai: (
    <>
      <path d="M11 3.5c.6 3.9 2.6 5.9 6.5 6.5-3.9.6-5.9 2.6-6.5 6.5-.6-3.9-2.6-5.9-6.5-6.5 3.9-.6 5.9-2.6 6.5-6.5z" />
      <path d="M18.5 15.5c.3 1.6 1 2.3 2.5 2.5-1.5.2-2.2.9-2.5 2.5-.3-1.6-1-2.3-2.5-2.5 1.5-.2 2.2-.9 2.5-2.5z" />
    </>
  ),
};

export function SpaceGlyph({ space, className }: { space: SpaceId; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cn("size-5 shrink-0", className)}
    >
      {PATHS[space]}
    </svg>
  );
}

/** Small tinted chip holding a Space glyph: the only place a Space colour fills an area. */
export function SpaceChip({ space, color, className }: { space: SpaceId; color: string; className?: string }) {
  return (
    <span
      className={cn("inline-flex size-9 shrink-0 items-center justify-center rounded-[10px]", className)}
      style={{ color, backgroundColor: `color-mix(in srgb, ${color} 14%, transparent)` }}
    >
      <SpaceGlyph space={space} className="size-[18px]" />
    </span>
  );
}
