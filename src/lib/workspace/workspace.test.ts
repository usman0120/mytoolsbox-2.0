// @vitest-environment node
import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { idToPath, toManifestId } from "./ids";
import { proxy } from "@/proxy";

describe("toManifestId", () => {
  it("keeps manifest ids and maps old catalog slugs", () => {
    expect(toManifestId("docs.merge-pdf")).toBe("docs.merge-pdf");
    expect(toManifestId("pdf-merger")).toBe("docs.merge-pdf");
    expect(toManifestId("image-compressor")).toBe("media.compress-image");
    expect(toManifestId("farmer-ai")).toBe("ai.farm-advisor");
  });
  it("drops ids that no longer exist instead of guessing", () => {
    expect(toManifestId("no-such-tool")).toBeNull();
    expect(toManifestId("")).toBeNull();
  });
  it("builds paths from ids", () => expect(idToPath("calc.bmi-calculator")).toBe("/calc/bmi-calculator"));
});

describe("old account pages redirect to the Workspace", () => {
  const go = (path: string) => proxy(new NextRequest(`https://www.mytoolsbox.me${path}`));
  it.each([
    ["/settings", "/me?tab=settings"],
    ["/settings?tab=favorites", "/me?tab=favorites"],
    ["/settings?tab=history", "/me?tab=history"],
    ["/settings?tab=account", "/me?tab=settings"],
    ["/favorites", "/me?tab=favorites"],
    ["/history", "/me?tab=history"],
    ["/account", "/me?tab=settings"],
    ["/dashboard", "/me"],
  ])("%s → %s", (from, to) => {
    const res = go(from);
    expect(res.status).toBe(308);
    const location = new URL(res.headers.get("location")!);
    expect(location.pathname + location.search).toBe(to);
  });
});
