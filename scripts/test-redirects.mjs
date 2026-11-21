// Checks every legacy URL in tests/fixtures/old-urls.txt resolves to 200 in at most one redirect.
// Usage: BASE_URL=https://preview-url.vercel.app npm run test:redirects   (defaults to http://localhost:3000)
import { readFileSync } from "node:fs";

const base = (process.env.BASE_URL || "http://localhost:3000").replace(/\/$/, "");
const paths = readFileSync(new URL("../tests/fixtures/old-urls.txt", import.meta.url), "utf8")
  .split(/\r?\n/)
  .map((l) => l.trim())
  .filter(Boolean);

async function check(path) {
  const first = await fetch(base + path, { redirect: "manual" });
  if (first.status === 200) return null;
  if (first.status >= 300 && first.status < 400) {
    const loc = first.headers.get("location");
    if (!loc) return `${path} → ${first.status} without Location`;
    const target = new URL(loc, base + path);
    const second = await fetch(target, { redirect: "manual" });
    return second.status === 200 ? null : `${path} → ${target.pathname} → ${second.status} (more than one hop or not 200)`;
  }
  return `${path} → ${first.status}`;
}

const failures = [];
const queue = [...paths];
await Promise.all(
  Array.from({ length: 8 }, async () => {
    while (queue.length) {
      const p = queue.shift();
      try {
        const err = await check(p);
        if (err) failures.push(err);
      } catch (e) {
        failures.push(`${p} → ${e.message}`);
      }
    }
  }),
);

if (failures.length) {
  console.error(`✗ ${failures.length}/${paths.length} legacy URLs failed:\n` + failures.sort().join("\n"));
  process.exit(1);
}
console.log(`✓ ${paths.length} legacy URLs resolve with at most one redirect (${base})`);
