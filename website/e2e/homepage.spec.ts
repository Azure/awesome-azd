import { test, expect } from "@playwright/test";

test.describe("Homepage (Landing Page)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("./");
  });

  test("renders hero section with title", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("From code to cloud");
  });

  test("install command selector is visible", async ({ page }) => {
    const select = page.getByLabel("Select platform");
    await expect(select).toBeVisible();
  });

  test("navbar links are present", async ({ page }) => {
    await expect(page.getByRole("link", { name: /add a template/i })).toBeVisible();
  });
});
