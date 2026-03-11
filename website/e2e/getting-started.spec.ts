import { test, expect } from "@playwright/test";

test.describe("Getting Started Page", () => {
  test("renders hero section", async ({ page }) => {
    await page.goto("getting-started");
    await expect(page.locator("h1")).toContainText("Ship to Azure", { timeout: 15_000 });
  });

  test("displays three onboarding steps", async ({ page }) => {
    await page.goto("getting-started");
    await expect(page.getByRole("heading", { name: "Install the Azure Developer CLI" })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole("heading", { name: "Pick a template" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Deploy to Azure" })).toBeVisible();
  });

  test("shows step cards section", async ({ page }) => {
    await page.goto("getting-started");
    const cards = page.locator('[class*="stepCard"]');
    await expect(cards.first()).toBeVisible({ timeout: 15_000 });
    const count = await cards.count();
    expect(count).toBe(3);
  });
});
