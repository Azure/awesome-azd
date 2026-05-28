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

  test("templates page loads", async ({ page }) => {
    const response = await page.goto("templates");
    expect(response?.status()).toBe(200);
  });

  test("contribute page loads", async ({ page }) => {
    const response = await page.goto("docs/intro");
    expect(response?.status()).toBe(200);
  });

  test("navbar navigates to templates", async ({ page }) => {
    await page.goto("./");
    await page
      .getByRole("navigation")
      .getByRole("link", { name: /^templates$/i })
      .first()
      .click();
    await expect(page).toHaveURL(/templates/);
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

  test("templates page search input has accessible role", async ({ page }) => {
    await page.goto("templates");
    const searchInput = page.getByRole("searchbox");
    await expect(searchInput).toBeVisible();
  });

  test("images have alt text", async ({ page }) => {
    await page.goto("./");
    await page.waitForLoadState("networkidle");
    // Read all alts in a single page.evaluate to avoid auto-wait flakes
    // when parallel workers stress the test server.
    const alts = await page.locator("img").evaluateAll((imgs) =>
      imgs.slice(0, 10).map((img) => img.getAttribute("alt"))
    );
    for (const alt of alts) {
      expect(alt).not.toBeNull();
    }
  });
});
