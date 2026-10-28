import { test, expect } from "@playwright/test";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import JSZip from "jszip";

test.setTimeout(90_000);
test("runs PDF → images under 200 KB → ZIP entirely through connected browser steps", async ({ page }) => {
  const doc = await PDFDocument.create(), font = await doc.embedFont(StandardFonts.Helvetica);
  for (let index = 0; index < 2; index++) { const sheet = doc.addPage([400, 500]); sheet.drawRectangle({ x: 30, y: 30, width: 340, height: 440, color: rgb(0.8, 0.95, 0.9) }); sheet.drawText(`Workflow page ${index + 1}`, { x: 60, y: 400, font, size: 24 }); }
  const bytes = await doc.save();
  const workflowRequests: string[] = [];
  page.on("request", (request) => { if (request.url().includes("/api/") && request.method() === "POST") workflowRequests.push(request.url()); });
  await page.goto("/workflows?preset=pdf-images-200kb");
  await expect(page.getByRole("heading", { name: "Workflow builder", exact: true })).toBeVisible();
  await page.locator('input[type="file"][multiple]').setInputFiles({ name: "sample.pdf", mimeType: "application/pdf", buffer: Buffer.from(bytes) });
  await page.getByRole("button", { name: "Run workflow", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Your finished outputs", exact: true })).toBeVisible({ timeout: 60000 });
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("region", { name: "Workflow outputs" }).getByRole("button", { name: "Download", exact: true }).click();
  const download = await downloadPromise; const stream = await download.createReadStream(); const chunks: Buffer[] = []; for await (const chunk of stream!) chunks.push(chunk);
  const zip = await JSZip.loadAsync(Buffer.concat(chunks)); const images = Object.values(zip.files).filter((entry) => !entry.dir);
  expect(images).toHaveLength(2);
  for (const image of images) { const data = await image.async("uint8array"); expect(data.length).toBeLessThan(200000); expect([...data.slice(0, 3)]).toEqual([0xff, 0xd8, 0xff]); }
  expect(workflowRequests).toEqual([]);
  await page.getByRole("region", { name: "Workflow outputs" }).scrollIntoViewIfNeeded();
  await page.screenshot({ path: "test-results/workflows-desktop.png" });
});
test("supports editable workflow definitions and US English navigation on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/workflows");
  await expect(page.locator("html")).toHaveAttribute("lang", "en-US");
  await page.getByLabel("Workflow name", { exact: true }).fill("My local image pipeline");
  await page.getByRole("button", { name: "Save workflow", exact: true }).click();
  await page.getByRole("button", { name: /Saved on this device/ }).click();
  await expect(page.getByRole("heading", { name: "My local image pipeline", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: /language/i })).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: "test-results/workflows-mobile.png" });
});
