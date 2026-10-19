import { randomBytes } from "node:crypto";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { expect, test, type Page } from "@playwright/test";
import QRCode from "qrcode";

const loadModule = createRequire(resolve(__dirname, "../package.json"));
const { buildInventory } = loadModule("./compare_slugs.js") as {
  buildInventory: () => { canonicalPages: { route: string }[] };
};
const routes = buildInventory().canonicalPages.map((entry) => entry.route);
const protectedRoutes = new Set(["/account", "/admin", "/dashboard", "/favorites", "/history", "/settings"]);
const routeAliases: Record<string, string> = { "/resources": "/blog" };

test.beforeEach(async ({ page }) => {
  const identity = randomBytes(12);
  const suffix = Array.from({ length: 6 }, (_, index) => identity.readUInt16BE(index * 2).toString(16)).join(":");
  await page.setExtraHTTPHeaders({ "x-forwarded-for": `2001:db8:${suffix}` });
  await page.route(/https:\/\/(identitytoolkit|securetoken|firestore|generativelanguage)\.googleapis\.com\//, (route) => route.abort());
  await page.route(/https:\/\/(api\.openai\.com|api\.anthropic\.com|api\.groq\.com|image\.pollinations\.ai)\//, (route) => route.abort());
});

async function expectNoOverflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
}

for (const route of routes) {
  test(`route ${route}`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error" && /hydration|Minified React error/i.test(message.text())) errors.push(message.text());
    });
    const response = await page.goto(route);
    expect(response?.status()).toBe(200);
    await expect(page.locator("main")).toBeVisible();
    if (protectedRoutes.has(route)) {
      await expect(page).toHaveURL(/\/\?signin=true$/);
      await expect(page.getByRole("dialog", { name: "Sign In", exact: true })).toBeVisible();
    } else {
      await expect(page.getByRole("button", { name: /Switch to (light|dark) theme/ }).first()).toBeVisible({ timeout: 10_000 });
      await expect(page.locator('main [role="status"]').filter({ hasText: /^Loading workspace/ })).toHaveCount(0);
      await expect(page.locator("main").getByRole("heading", { name: /^Unable to open .+|.+ is unavailable$/ })).toHaveCount(0);
      await expect.poll(() => new URL(page.url()).pathname).toBe(routeAliases[route] ?? route);
      if (route === "/ai") {
        await expect(page.getByRole("textbox", { name: "Your Message", exact: true })).toBeVisible();
      } else {
        await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
      }
    }
    await expectNoOverflow(page);
    expect(errors).toEqual([]);
  });
}

const pilots = ["/", "/tools/json-formatter", "/tools/pdf-merger", "/tools/percentage-calculator", "/apps/image-editor", "/ai"];
for (const width of [390, 1440]) {
  for (const theme of ["light", "dark"]) {
    for (const route of pilots) {
      test(`pilot ${width} ${theme} ${route}`, async ({ page }, testInfo) => {
        await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
        await page.addInitScript((value) => localStorage.setItem("theme", value), theme);
        const errors: string[] = [];
        page.on("pageerror", (error) => errors.push(error.message));
        await page.goto(route);
        await expect.poll(() => new URL(page.url()).pathname).toBe(route);
        await expect(page.locator("html")).toHaveClass(theme === "dark" ? /dark/ : /light/);
        await expectNoOverflow(page);
        const workspace = page.locator("main").getByRole("region").first();
        if (route.startsWith("/tools/") || route.startsWith("/apps/")) {
          await expect(workspace).toBeVisible();
          const bounds = await workspace.boundingBox();
          expect(bounds?.y).toBeLessThan(280);
        }
        if (route === "/tools/json-formatter") {
          await page.getByRole("textbox", { name: "JSON input", exact: true }).fill('{"b":2,"a":1}');
          await page.getByRole("button", { name: "Process JSON", exact: true }).click();
          await expect(page.getByRole("textbox", { name: "JSON output", exact: true })).toHaveValue('{\n  "b": 2,\n  "a": 1\n}');
        }
        if (route === "/apps/image-editor") {
          const fixture = await QRCode.toBuffer("MyToolsBox browser fixture", { width: 320, margin: 2 });
          await page.locator('main input[type="file"]').setInputFiles({ name: "fixture.png", mimeType: "image/png", buffer: fixture });
          const canvas = page.locator("main canvas").first();
          await expect(canvas).toBeVisible();
          const pixels = await canvas.evaluate((element: HTMLCanvasElement) => {
            const context = element.getContext("2d");
            const data = context?.getImageData(0, 0, element.width, element.height).data;
            return !!data?.some((value, index) => index % 4 === 3 && value > 0);
          });
          expect(pixels).toBe(true);
        }
        if (route === "/ai") {
          const composer = page.getByRole("textbox", { name: "Your Message", exact: true });
          await expect(composer).toBeVisible();
          if (width === 390) {
            const history = page.getByRole("dialog", { name: /history/i });
            await expect(history).toHaveCount(0);
            await page.getByRole("button", { name: "Open chat history", exact: true }).click();
            await expect(history).toBeVisible();
            await page.keyboard.press("Escape");
            await expect(history).toHaveCount(0);
            await expect(composer).toBeVisible();
          }
        }
        expect(errors).toEqual([]);
        await page.screenshot({ path: testInfo.outputPath("workspace.png"), fullPage: false, animations: "disabled", timeout: 10_000 });
      });
    }
  }
}

test("unknown tool uses the not-found page", async ({ page }) => {
  const response = await page.goto("/tools/not-a-tool");
  expect(response?.status()).toBe(404);
  await expect(page.locator("main")).toBeVisible();
});

test("habit tracker preserves existing habits and check-ins after hydration and reload", async ({ page }) => {
  test.setTimeout(60_000);
  const habits = [{ id: "legacy-habit", name: "Saved habit", emoji: "H", color: "#3b82f6", createdAt: 1700000000000 }];
  const entries = [{ habitId: "legacy-habit", date: "2024-01-01", done: true }];
  await page.goto("/privacy");
  await page.evaluate(({ habits, entries }) => {
    localStorage.setItem("mytoolsbox-habits-v2", JSON.stringify(habits));
    localStorage.setItem("mytoolsbox-habit-entries-v2", JSON.stringify(entries));
  }, { habits, entries });
  await page.goto("/tools/habit-tracker");
  await expect(page.getByText("Saved habit", { exact: true })).toBeVisible({ timeout: 15_000 });
  await page.reload();
  await expect(page.getByText("Saved habit", { exact: true })).toBeVisible({ timeout: 15_000 });
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("mytoolsbox-habits-v2") ?? "null"))).toEqual(habits);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("mytoolsbox-habit-entries-v2") ?? "null"))).toEqual(entries);
  const checkIn = page.getByRole("button", { name: /^Saved habit on / }).first();
  const date = (await checkIn.getAttribute("aria-label"))?.slice("Saved habit on ".length);
  await checkIn.focus();
  await page.keyboard.press("Space");
  await expect(checkIn).toHaveAttribute("aria-pressed", "true");
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("mytoolsbox-habit-entries-v2") ?? "null"))).toEqual([...entries, { habitId: "legacy-habit", date, done: true }]);
  await page.reload();
  await expect(page.getByRole("button", { name: `Saved habit on ${date}`, exact: true })).toHaveAttribute("aria-pressed", "true", { timeout: 15_000 });
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("mytoolsbox-habit-entries-v2") ?? "null"))).toEqual([...entries, { habitId: "legacy-habit", date, done: true }]);
});

test("todo list preserves existing saved tasks after hydration and reload", async ({ page }) => {
  test.setTimeout(60_000);
  const todos = [{ id: "legacy-task", text: "Saved task", completed: true, priority: "high", createdAt: 1700000000000, dueDate: "2024-01-01", category: "Work" }];
  await page.goto("/privacy");
  await page.evaluate((todos) => localStorage.setItem("mytoolsbox-todo-list-v2", JSON.stringify(todos)), todos);
  await page.goto("/tools/todo-list");
  await expect(page.getByText("Saved task", { exact: true })).toBeVisible({ timeout: 15_000 });
  await page.reload();
  await expect(page.getByText("Saved task", { exact: true })).toBeVisible({ timeout: 15_000 });
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("mytoolsbox-todo-list-v2") ?? "null"))).toEqual(todos);
});

test("sign-in redirect dialog can be dismissed without reopening", async ({ page }) => {
  await page.goto("/account");
  await expect(page).toHaveURL(/\/\?signin=true$/);
  const dialog = page.getByRole("dialog", { name: "Sign In", exact: true });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Close", exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await expect(page.getByRole("button", { name: /Switch to (light|dark) theme/ }).first()).toBeVisible();
});