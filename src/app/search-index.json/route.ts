import { buildSearchDocs } from "@/tools/search-docs";

export const dynamic = "force-static";

/** Static search index for the Ask palette (built at deploy time). */
export function GET() {
  return Response.json(buildSearchDocs(), { headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" } });
}
