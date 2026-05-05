import { test, expect } from "@playwright/test";

test.describe("Landing Page", () => {
  test("renders hero section", async ({ page }) => {
    await page.goto("./");
    await expect(page.locator("h1")).toContainText("From code to cloud", { timeout: 15_000 });
  });

  test("displays two onboarding steps", async ({ page }) => {
    await page.goto("./");
    await expect(page.getByRole("heading", { name: "Pick a template" })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole("heading", { name: "Deploy to Azure" })).toBeVisible();
  });

  test("shows step cards section", async ({ page }) => {
    await page.goto("./");
    const cards = page.locator('[class*="stepCard"]');
    await expect(cards.first()).toBeVisible({ timeout: 15_000 });
    const count = await cards.count();
    expect(count).toBe(2);
  });
});
