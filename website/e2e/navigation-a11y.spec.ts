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

  test("external navbar links show the Fluent external-link icon", async ({
    page,
  }) => {
    await page.goto("./");

    for (const name of ["Docs", "Resources"]) {
      const link = page
        .getByRole("navigation")
        .getByRole("link", { name, exact: true });
      await expect(link).toHaveClass(/navbar-external-link/);

      const icon = await link.evaluate((element) => {
        const style = window.getComputedStyle(element, "::after");
        return {
          content: style.content,
          width: style.width,
          maskImage:
            style.getPropertyValue("mask-image") ||
            style.getPropertyValue("-webkit-mask-image"),
        };
      });

      expect(icon.content).toBe('""');
      expect(icon.width).toBe("14px");
      expect(icon.maskImage).toContain("data:image/svg+xml");
    }
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

  test("homepage images define alt text", async ({ page }) => {
    await page.goto("./");
    await expect(page.locator("h1")).toBeVisible();
    const alts = await page.locator("img").evaluateAll((imgs) =>
      imgs.map((img) => img.getAttribute("alt"))
    );
    expect(alts.length).toBeGreaterThan(0);
    for (const alt of alts) {
      expect(alt).not.toBeNull();
    }
  });
});
