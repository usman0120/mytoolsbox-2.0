import type { SpaceId } from "@/spaces";

// Space pages arrive in M3. Until then each Space links to its closest existing listing,
// so no link in the shell can 404.
const CURRENT_SPACE_HREF: Record<SpaceId, string> = {
  docs: "/docs",
  media: "/tools?category=images",
  create: "/tools?category=design",
  dev: "/tools?category=developer",
  study: "/tools?category=academic",
  calc: "/tools?category=calculators",
  work: "/tools?category=productivity",
  ai: "/apps",
};

export function spaceHref(id: SpaceId): string {
  return CURRENT_SPACE_HREF[id];
}
