import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("./");
  });

  test("renders hero section with title and badge", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("From code to cloud");
    // Hero badge: "Open-source CLI · 300+ templates"
    const heroBadge = page.locator('[class*="heroBadge"]');
    await expect(heroBadge.first()).toBeVisible();
  });

  test("featured template cards are displayed", async ({ page }) => {
    const cards = page.locator('[class*="templateCard"]');
    await expect(cards.first()).toBeVisible({ timeout: 10_000 });
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
  });

  test("navbar links are present", async ({ page }) => {
    const nav = page.getByRole("navigation");
    await expect(nav.getByRole("link", { name: /^templates$/i }).first()).toBeVisible();
    await expect(nav.getByRole("link", { name: /add a template/i })).toBeVisible();
  });
});
