import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("homepage loads successfully", async ({ page }) => {
    const response = await page.goto("./");
    expect(response?.status()).toBe(200);
  });

  test("templates gallery page loads", async ({ page }) => {
    const response = await page.goto("./templates");
    expect(response?.status()).toBe(200);
  });

  test("contribute page loads", async ({ page }) => {
    const response = await page.goto("docs/contribute");
    expect(response?.status()).toBe(200);
  });

  test("old getting-started URL redirects to home", async ({ page }) => {
    await page.goto("getting-started");
    await expect(page).toHaveURL(/\/$/);
  });

  test("old services URLs redirect to templates", async ({ page }) => {
    await page.goto("services/container-apps");
    await expect(page).toHaveURL(/templates\/azure-container-apps/);
  });

  test("legacy gallery query params redirect to templates", async ({ page }) => {
    await page.goto("./?tags=python");
    await expect(page).toHaveURL(/templates\?tags=python/);
  });

  test("legacy extensions query param redirect to templates", async ({ page }) => {
    await page.goto("./?type=extensions");
    await expect(page).toHaveURL(/templates\?type=extensions/);
  });
});

test.describe("Accessibility", () => {
  test("landing page has proper heading hierarchy", async ({ page }) => {
    await page.goto("./");
    const h1 = page.locator("h1");
    await expect(h1).toBeVisible();
    const h1Count = await h1.count();
    expect(h1Count).toBe(1);
  });

  test("gallery has search input with accessible role", async ({ page }) => {
    await page.goto("./templates");
    const searchInput = page.getByRole("searchbox");
    await expect(searchInput).toBeVisible();
  });

  test("images have alt text", async ({ page }) => {
    await page.goto("./templates");
    const images = page.locator("img");
    const count = await images.count();
    for (let i = 0; i < Math.min(count, 10); i++) {
      const alt = await images.nth(i).getAttribute("alt");
      expect(alt).not.toBeNull();
    }
  });

  test("FAQ buttons have aria-expanded attribute", async ({ page }) => {
    await page.goto("./");
    const faqButtons = page.locator('button[aria-expanded]');
    const count = await faqButtons.count();
    expect(count).toBeGreaterThan(0);
  });
});
