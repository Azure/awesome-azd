import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("homepage loads successfully", async ({ page }) => {
    const response = await page.goto("./");
    expect(response?.status()).toBe(200);
  });

  test("getting started page loads", async ({ page }) => {
    const response = await page.goto("getting-started");
    expect(response?.status()).toBe(200);
  });

  test("contribute page loads", async ({ page }) => {
    const response = await page.goto("docs/intro");
    expect(response?.status()).toBe(200);
  });

  test("navbar navigates to getting started", async ({ page }) => {
    await page.goto("./");
    await page.getByRole("link", { name: /getting started/i }).click();
    await expect(page).toHaveURL(/getting-started/);
  });
});

test.describe("Accessibility", () => {
  test("homepage has proper heading hierarchy", async ({ page }) => {
    await page.goto("./");
    const h1 = page.locator("h1");
    await expect(h1).toBeVisible();
    const h1Count = await h1.count();
    expect(h1Count).toBe(1);
  });

  test("search input has accessible role", async ({ page }) => {
    await page.goto("./");
    const searchInput = page.getByRole("searchbox");
    await expect(searchInput).toBeVisible();
  });

  test("images have alt text", async ({ page }) => {
    await page.goto("./");
    const images = page.locator("img");
    const count = await images.count();
    for (let i = 0; i < Math.min(count, 10); i++) {
      const alt = await images.nth(i).getAttribute("alt");
      expect(alt).not.toBeNull();
    }
  });
});
