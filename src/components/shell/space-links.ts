import type { SpaceId } from "@/spaces";

/** Every Space has its own home page at /{space}. */
export function spaceHref(id: SpaceId): string {
  return `/${id}`;
}
