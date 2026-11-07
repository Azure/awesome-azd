import { test, expect, type Page } from "@playwright/test";

function resultsStatus(page: Page) {
  return page.getByTestId("template-results-count");
}

async function resultCount(page: Page): Promise<number> {
  const text = (await resultsStatus(page).textContent()) ?? "";
  const numbers = text.match(/\d+/g);
  expect(numbers, `expected numbers in status: "${text}"`).not.toBeNull();
  return Number(numbers![numbers!.length - 1]);
}

test.describe("Gallery functionality (deploy gate)", () => {
  test.beforeEach(async ({ page }) => {
    await page.route(
      "https://cachelp6qsotirqelc.z20.web.core.windows.net/**",
      (route) =>
        route.fulfill({
          json: {
            forks: 12,
            stars: 345,
            updatedOn: "2025-01-15T00:00:00.000Z",
            score: 1,
          },
        }),
    );
    await page.route("**/ai-apps-search*", (route) =>
      route.fulfill({ json: [] }),
    );
    await page.goto("templates");
    await expect(resultsStatus(page)).toContainText("templates", {
      timeout: 15_000,
    });
    await expect(page.locator("html")).toHaveAttribute(
      "data-has-hydrated",
      "true",
    );
  });

  test("gallery shows the complete unified inventory", async ({ page }) => {
    expect(await resultCount(page)).toBeGreaterThanOrEqual(250);
  });

  test("page renders the first 20 template cards", async ({ page }) => {
    const cards = page.locator("[data-template-card]");
    await expect(cards.first()).toBeVisible({ timeout: 15_000 });
    await expect(cards).toHaveCount(20);
  });

  test("search fills the row up to the sort control", async ({ page }) => {
    const searchBox = page.locator(".fui-SearchBox");
    const sortDropdown = page.getByRole("combobox", { name: "Sort by" });
    const searchBounds = await searchBox.boundingBox();
    const sortBounds = await sortDropdown.boundingBox();

    expect(searchBounds).not.toBeNull();
    expect(sortBounds).not.toBeNull();
    expect(searchBounds!.width).toBeGreaterThan(800);
    const gap = sortBounds!.x - (searchBounds!.x + searchBounds!.width);
    expect(gap).toBeGreaterThan(60);
    expect(gap).toBeLessThan(90);
  });

  test("template cards open dedicated detail pages", async ({ page }) => {
    const firstLink = page.locator("a[data-template-title]").first();
    const title = await firstLink.getAttribute("data-template-title");
    await firstLink.click();

    await expect(page).toHaveURL(/\/templates\/[^/]+\/[^/?]+/);
    await expect(
      page.getByRole("heading", { level: 1, name: title ?? "" }),
    ).toBeVisible();
    const repositoryLink = page.getByRole("link", {
      name: "View repository",
    });
    await expect(repositoryLink).toHaveAttribute("target", "_blank");
    const repositoryUrl = new URL(
      (await repositoryLink.getAttribute("href")) ?? "",
    );
    await expect(
      page.getByRole("link", { name: "Open GitHub Codespaces" }),
    ).toHaveAttribute(
      "href",
      `https://github.com/codespaces/new${repositoryUrl.pathname}`,
    );
    await expect(page.locator("aside code").locator("..")).toHaveCSS(
      "border-top-width",
      "0px",
    );
    await expect(page.locator("#get-started pre")).toHaveCSS(
      "border-top-width",
      "0px",
    );
  });

  test('search "azure" narrows results but keeps some', async ({ page }) => {
    const initial = await resultCount(page);
    const searchInput = page.locator("#catalog-search");

    await searchInput.fill("azure");
    await expect(page).not.toHaveURL(/q=azure/);
    expect(await resultCount(page)).toBe(initial);
    await searchInput.press("Enter");

    await expect(page).toHaveURL(/q=azure/);
    await expect.poll(() => resultCount(page)).not.toBe(initial);
    const filtered = await resultCount(page);
    expect(filtered).toBeGreaterThan(0);
    expect(filtered).toBeLessThan(initial);
  });

  test("nonsense search shows the empty-state message", async ({ page }) => {
    const searchInput = page.locator("#catalog-search");
    await searchInput.fill("zzzznonexistenttemplate");
    await searchInput.press("Enter");

    await expect(page.getByText("No matching templates")).toBeVisible({
      timeout: 10_000,
    });
  });

  test("language filtering narrows the gallery", async ({ page }) => {
    const initial = await resultCount(page);
    const pythonCheckbox = page.locator("#catalog-languages-python");
    await page.locator("summary", { hasText: "Language" }).click();
    await pythonCheckbox.check();

    await expect(pythonCheckbox).toBeChecked();
    await expect(page).toHaveURL(/[?&]language=Python(?:&|$)/);
    await expect.poll(() => resultCount(page)).not.toBe(initial);
    expect(await resultCount(page)).toBeLessThan(initial);
  });

  test("Fluent sort dropdown restores every previous sort order", async ({
    page,
  }) => {
    const sortDropdown = page.getByRole("combobox", {
      name: "Sort by",
    });
    const sortOptions = [
      { label: "New to Old", value: "newest" },
      { label: "Old to New", value: "oldest" },
      { label: "Alphabetical (A - Z)", value: "az" },
      { label: "Alphabetical (Z - A)", value: "za" },
    ];

    for (const option of sortOptions) {
      await sortDropdown.click();
      const menuOption = page.getByRole("option", { name: option.label });
      await expect(menuOption).toBeEnabled();
      await menuOption.click();
      await expect(page).toHaveURL(
        new RegExp(`[?&]sort=${option.value}(?:&|$)`),
      );
      await expect(sortDropdown).toHaveText(option.label);
    }

    await sortDropdown.click();
    await page.getByRole("option", { name: "Most Popular" }).click();
    await expect(page).not.toHaveURL(/[?&]sort=/);
    await expect(sortDropdown).toHaveText("Most Popular");
  });

  test("clearing search restores the full gallery", async ({ page }) => {
    const initial = await resultCount(page);
    const searchInput = page.locator("#catalog-search");
    await searchInput.fill("python");
    await searchInput.press("Enter");
    await expect.poll(() => resultCount(page)).not.toBe(initial);

    await searchInput.fill("");
    await expect.poll(() => resultCount(page)).toBe(initial);
  });

  test("slash focuses search and Escape clears it", async ({ page }) => {
    await page.waitForLoadState("networkidle");
    await expect(
      page.locator(".fui-SearchBox").getByText("/", { exact: true }),
    ).toHaveCount(0);
    await page.keyboard.press("/");
    await expect(page.locator("#catalog-search")).toBeFocused();
    await page.locator("#catalog-search").fill("python");
    await page.keyboard.press("Escape");
    await expect(page.locator("#catalog-search")).toHaveValue("");
  });
});
