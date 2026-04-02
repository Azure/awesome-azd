import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("./");
  });

  test("renders hero section with title and stats bar", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("From code to cloud");
    // Stats bar should show template/service/language counts
    const statsBar = page.locator('[class*="statsBar"]');
    await expect(statsBar).toBeVisible();
  });

  test("search input is visible and functional", async ({ page }) => {
    const searchInput = page.getByRole("searchbox");
    await expect(searchInput).toBeVisible();
    await searchInput.fill("python");
    await expect(page).toHaveURL(/name=python/);
  });

  test("template cards are displayed", async ({ page }) => {
    const cards = page.locator('[class*="card"]').filter({ has: page.locator("img") });
    await expect(cards.first()).toBeVisible({ timeout: 10_000 });
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
  });

  test("navbar links are present", async ({ page }) => {
    await expect(page.getByRole("link", { name: /getting started/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /add a template/i })).toBeVisible();
  });
});
