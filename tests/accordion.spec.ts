import { test, expect } from "@playwright/test";

test.describe("Accordion", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("renders FAQ accordion items", async ({ page }) => {
    const accordionTriggers = page.locator("#faq button[aria-expanded]");
    await expect(accordionTriggers.first()).toBeVisible();
    const count = await accordionTriggers.count();
    expect(count).toBeGreaterThan(0);
  });

  test("expand/collapse with animation", async ({ page }) => {
    const firstTrigger = page.locator("#faq button[aria-expanded]").first();
    await expect(firstTrigger).toBeVisible();

    // Should start collapsed
    await expect(firstTrigger).toHaveAttribute("aria-expanded", "false");

    // Click to expand
    await firstTrigger.click();
    await page.waitForTimeout(500);

    // Should now be expanded
    await expect(firstTrigger).toHaveAttribute("aria-expanded", "true");

    // Content area should have non-zero height
    const contentId = await firstTrigger.getAttribute("aria-controls");
    expect(contentId).toBeTruthy();
    if (!contentId) throw new Error("content id missing");
    const content = page.locator(`#${contentId}`);
    await expect(content).toBeVisible();
    const height = await content.evaluate((el) => (el as HTMLElement).offsetHeight);
    expect(height).toBeGreaterThan(0);

    // Click to collapse
    await firstTrigger.click();
    await page.waitForTimeout(500);
    await expect(firstTrigger).toHaveAttribute("aria-expanded", "false");
  });

  test("keyboard navigation", async ({ page }) => {
    const firstTrigger = page.locator("#faq button[aria-expanded]").first();
    await firstTrigger.focus();

    // Press Enter to expand
    await page.keyboard.press("Enter");
    await page.waitForTimeout(500);
    await expect(firstTrigger).toHaveAttribute("aria-expanded", "true");

    // Press Enter again to collapse
    await page.keyboard.press("Enter");
    await page.waitForTimeout(500);
    await expect(firstTrigger).toHaveAttribute("aria-expanded", "false");
  });

  test("only one item open at a time (single mode)", async ({ page }) => {
    const triggers = page.locator("#faq button[aria-expanded]");
    const count = await triggers.count();

    if (count >= 2) {
      // Open first
      await triggers.nth(0).click();
      await page.waitForTimeout(500);
      await expect(triggers.nth(0)).toHaveAttribute("aria-expanded", "true");

      // Open second
      await triggers.nth(1).click();
      await page.waitForTimeout(500);

      // First should now be collapsed, second expanded
      await expect(triggers.nth(0)).toHaveAttribute("aria-expanded", "false");
      await expect(triggers.nth(1)).toHaveAttribute("aria-expanded", "true");
    }
  });
});
