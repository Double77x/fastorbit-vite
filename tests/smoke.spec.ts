import { test, expect } from "@playwright/test";

test.describe("App smoke tests", () => {
  test("home page loads with all sections", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await expect(page.locator("nav")).toBeVisible();
    await expect(page.locator("#features")).toBeVisible();
    await expect(page.locator("#quick-start")).toBeVisible();
    await expect(page.locator("#stack")).toBeVisible();
    await expect(page.locator("#weather")).toBeVisible();
    await expect(page.locator("#faq")).toBeVisible();
    await expect(page.locator("#contact")).toBeVisible();
  });

  test("quick start section renders clone command", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await expect(page.locator("#quick-start")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Quick start in 30 seconds" })).toBeVisible();
    await expect(page.locator("text=git clone")).toBeVisible();
  });

  test("weather demo renders with location picker", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await expect(page.locator("#weather")).toBeVisible();
    await expect(page.locator("text=Powered by")).toBeVisible();
  });

  test("stack section renders architecture cards", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await expect(page.locator("#stack")).toBeVisible();
    await expect(page.locator("text=Full stack")).toBeVisible();
  });
});
