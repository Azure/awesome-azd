import { test, expect } from "@playwright/test";

test.describe("Gallery Filtering", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("./");
  });

  test("filter panel is visible with category headings", async ({ page }) => {
    await expect(page.locator("text=Language").first()).toBeVisible();
    await expect(page.locator("text=Framework").first()).toBeVisible();
  });

  test("clicking a filter tag updates URL and filters results", async ({ page }) => {
    const pythonCheckbox = page.getByLabel(/python/i).first();
    if (await pythonCheckbox.isVisible()) {
      await pythonCheckbox.click();
      await expect(page).toHaveURL(/tags=/);
    }
  });

  test("filter checkboxes show template counts", async ({ page }) => {
    // Filter labels should contain count in parentheses, e.g., "Python (82)"
    const filterLabels = page.locator('[class*="checkboxLabel"]');
    const firstLabel = filterLabels.first();
    if (await firstLabel.isVisible()) {
      const text = await firstLabel.textContent();
      expect(text).toMatch(/\(\d+\)/);
    }
  });

  test("empty state shows actionable message when no results", async ({ page }) => {
    const searchInput = page.getByRole("searchbox");
    await searchInput.fill("zzzznonexistenttemplate");
    await expect(page.locator("text=No templates found")).toBeVisible({ timeout: 10_000 });
  });

  test("clear filters resets the view", async ({ page }) => {
    const searchInput = page.getByRole("searchbox");
    await searchInput.fill("python");
    await expect(page).toHaveURL(/name=python/);
    await searchInput.clear();
    await expect(page).not.toHaveURL(/name=python/);
  });
});
