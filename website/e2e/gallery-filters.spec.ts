import { test, expect, type Page } from "@playwright/test";

function resultsStatus(page: Page) {
  return page.getByTestId("template-results-count");
}

async function revealPythonFilter(page: Page) {
  const pythonCheckbox = page.locator("#catalog-languages-python");

  if (!(await pythonCheckbox.isVisible())) {
    await page.locator("summary", { hasText: "Language" }).click();
  }

  await expect(pythonCheckbox).toBeVisible();
  return pythonCheckbox;
}

test.describe("Gallery Filtering", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("templates");
    await expect(resultsStatus(page)).toContainText("templates");
  });

  test("filter panel is visible with category headings", async ({ page }) => {
    await expect(page.locator("summary", { hasText: "Language" })).toBeVisible();
    await expect(page.locator("summary", { hasText: "Framework" })).toBeVisible();
  });

  test("filter checkboxes show template counts", async ({ page }) => {
    const pythonCheckbox = await revealPythonFilter(page);
    await expect(pythonCheckbox.locator("xpath=..")).toContainText(/\d+/);
  });
});
