// Site-wide smoke tests for the restructured site (Spaces, tools, guides, Flows, Workspace).
import { randomBytes } from "node:crypto";
import { expect, test, type Page } from "@playwright/test";

const CHUNKS = 8;

test.beforeEach(async ({ page }) => {
  // A fresh IP per test so the AI quota and rate limits never interfere; block real third-party calls.
  const id = randomBytes(12);
  const suffix = Array.from({ length: 6 }, (_, i) => id.readUInt16BE(i * 2).toString(16)).join(":");
  await page.setExtraHTTPHeaders({ "x-forwarded-for": `2001:db8:${suffix}` });
  await page.route(/https:\/\/(identitytoolkit|securetoken|firestore|generativelanguage)\.googleapis\.com\//, (r) => r.abort());
  await page.route(/https:\/\/(api\.groq\.com|huggingface\.co|[a-z0-9-]+\.hf\.co)\//, (r) => r.abort());
});

async function sitemapPaths(page: Page): Promise<string[]> {
  const xml = await (await page.request.get("/sitemap.xml")).text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
}

const noOverflow = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1);

for (let chunk = 0; chunk < CHUNKS; chunk++) {
  test(`every sitemap page renders (part ${chunk + 1} of ${CHUNKS})`, async ({ page }) => {
    test.setTimeout(10 * 60_000);
    const paths = (await sitemapPaths(page)).filter((_, i) => i % CHUNKS === chunk);
    expect(paths.length).toBeGreaterThan(10);
    const failures: string[] = [];
    for (const path of paths) {
      const errors: string[] = [];
      const onError = (e: Error) => errors.push(e.message);
      const onConsole = (m: { type(): string; text(): string }) => {
        if (m.type() === "error" && /hydration|Minified React error/i.test(m.text())) errors.push(m.text());
      };
      page.on("pageerror", onError);
      page.on("console", onConsole);
      const res = await page.goto(path, { waitUntil: "domcontentloaded" });
      if (res?.status() !== 200) failures.push(`${path}: HTTP ${res?.status()}`);
      else if (!(await page.locator("h1").first().waitFor({ state: "visible", timeout: 10_000 }).then(() => true, () => false))) failures.push(`${path}: no visible h1`);
      await page.waitForTimeout(150);
      if (errors.length) failures.push(`${path}: ${errors[0].slice(0, 160)}`);
      page.off("pageerror", onError);
      page.off("console", onConsole);
    }
    expect(failures, failures.join("\n")).toEqual([]);
  });
}

test("key templates fit a phone screen", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  for (const path of ["/", "/media", "/docs/merge-pdf", "/calc/mortgage-calculator", "/create/design", "/study/periodic-table", "/me", "/guides"]) {
    await page.goto(path);
    await expect(page.locator("h1").first()).toBeVisible();
    expect(await noOverflow(page), `${path} scrolls sideways`).toBe(true);
  }
});

test("unknown pages offer search and popular tools", async ({ page }) => {
  const res = await page.goto("/this-page-does-not-exist");
  expect(res?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "This page doesn't exist" })).toBeVisible();
  await expect(page.getByRole("search")).toBeVisible();
  await expect(page.getByRole("main").getByRole("link", { name: /Merge PDF/ }).first()).toBeVisible();
});

test("an unknown old tool URL lands on search", async ({ page }) => {
  await page.goto("/tools/not-a-tool");
  await expect(page).toHaveURL(/\/search\?q=not/);
});

test("mobile sign-in and sign-up are usable", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/?signin=true");
  const dialog = page.getByRole("dialog", { name: "Welcome back" });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Sign Up", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "Create your account" })).toBeVisible();
  await page.getByLabel("Confirm password", { exact: true }).fill("wrong");
  await page.getByRole("button", { name: "Create Account", exact: true }).click();
  await expect(page.getByText("Email is required.", { exact: true })).toBeVisible();
  expect(await noOverflow(page)).toBe(true);
});

test("habit tracker brings over habits from the old tracker and keeps them", async ({ page }) => {
  test.setTimeout(60_000);
  // Data in the format of the old /tools/habit-tracker (its URL now redirects to /work/habit-tracker).
  const habits = [{ id: "legacy-habit", name: "Saved habit", emoji: "H", color: "#3b82f6", createdAt: 1700000000000 }];
  const entries = [{ habitId: "legacy-habit", date: "2024-01-01", done: true }];
  await page.goto("/privacy");
  await page.evaluate(({ habits, entries }) => {
    localStorage.setItem("mytoolsbox-habits-v2", JSON.stringify(habits));
    localStorage.setItem("mytoolsbox-habit-entries-v2", JSON.stringify(entries));
  }, { habits, entries });
  await page.goto("/tools/habit-tracker");
  await expect(page).toHaveURL(/\/work\/habit-tracker/);
  await expect(page.getByText(/Saved habit/).first()).toBeVisible({ timeout: 15_000 });
  const stored = () => page.evaluate(() => JSON.parse(localStorage.getItem("mytoolsbox-habit-tracker-v2") ?? "[]"));
  await expect.poll(async () => (await stored())[0]?.completions?.["2024-01-01"]).toBe(true);
  await page.reload();
  await expect(page.getByText(/Saved habit/).first()).toBeVisible({ timeout: 15_000 });
});

test("todo list keeps saved tasks across reloads", async ({ page }) => {
  const todos = [{ id: "legacy-task", text: "Saved task", completed: true, priority: "high", createdAt: 1700000000000, dueDate: "2024-01-01", category: "Work" }];
  await page.goto("/privacy");
  await page.evaluate((t) => localStorage.setItem("mytoolsbox-todo-list-v2", JSON.stringify(t)), todos);
  await page.goto("/work/todo-list");
  await expect(page.getByText("Saved task", { exact: true })).toBeVisible({ timeout: 15_000 });
  await page.reload();
  await expect(page.getByText("Saved task", { exact: true })).toBeVisible({ timeout: 15_000 });
});

test("calculator results survive in the share link", async ({ page }) => {
  await page.goto("/calc/fraction-calculator?a=1%2F2&op=%2B&b=1%2F3");
  await expect(page.locator("section[aria-live]").getByText("5/6", { exact: true }).first()).toBeVisible({ timeout: 15_000 });
});

test("flashcards schedule a reviewed card and keep it after reload", async ({ page }) => {
  await page.goto("/study/flashcards");
  await expect(page.getByText(/Card 1 of/)).toBeVisible();
  await page.keyboard.press("Space");
  await page.keyboard.press("3");
  await page.reload();
  await expect(page.getByText(/1 due|0 due/)).toBeVisible();
  const reps = await page.evaluate(() => JSON.parse(localStorage.getItem("flashcards:v1") ?? "{}").decks?.[0]?.cards?.[0]?.reps);
  expect(reps).toBe(1);
});
