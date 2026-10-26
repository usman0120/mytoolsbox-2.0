import { test, expect } from "@playwright/test";

test.setTimeout(120_000);

test("footer is a real directory without fake platform claims", async ({ page }) => {
  await page.goto("/tools");
  const footer = page.getByRole("contentinfo");
  await expect(footer.getByRole("heading", { name: "Find your next useful thing." })).toBeVisible();
  await expect(footer.getByRole("navigation", { name: "Documents & PDF", exact: true })).toBeVisible();
  await expect(footer.getByRole("navigation", { name: "Learning & everyday apps" })).toBeVisible();
  await expect(footer.getByRole("link", { name: "Saved favorites" })).toHaveAttribute("href", /settings\?tab=favorites/);
  await expect(footer).not.toContainText(/All systems operational|Zero Cloud Storage|100% Client|No telemetry|zero ads|\bPro\b/i);
  await footer.screenshot({ path: "test-results/platform-footer.png" });
});

test("mobile sign-in and signup are accessible and scrollable", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/?signin=true");
  const dialog = page.getByRole("dialog", { name: "Welcome back" });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Sign Up", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "Create your account" })).toBeVisible();
  await page.getByLabel("Confirm password", { exact: true }).fill("wrong");
  await page.getByRole("button", { name: "Create Account", exact: true }).click();
  await expect(page.getByText("Email is required.", { exact: true })).toBeVisible();
  await page.getByRole("dialog").screenshot({ path: "test-results/platform-mobile-signup.png" });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("missing routes have usable 404 recovery links", async ({ page }) => {
  await page.goto("/this-page-does-not-exist");
  await expect(page.getByRole("heading", { name: /Page Not Found/i })).toBeVisible();
  await expect(page.getByRole("main").getByRole("link", { name: /Back to Home/i })).toHaveAttribute("href", "/");
});

test("a forged session cannot render the admin dashboard or read its API", async ({ page, context }) => {
  await context.addCookies([{ name: "__session", value: "forged-token", domain: "localhost", path: "/" }]);
  const api = await page.request.get("/api/admin");
  expect([401, 503]).toContain(api.status());
  await page.goto("/admin");
  await expect(page.getByText("Active Tokens", { exact: true })).not.toBeVisible();
  await expect(page.getByText("Abuse & Security", { exact: true })).not.toBeVisible();
});
