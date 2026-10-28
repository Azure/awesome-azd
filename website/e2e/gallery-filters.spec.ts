import { test, expect, type Page } from "@playwright/test";

function viewingStatus(page: Page) {
  return page.locator('[role="status"]').filter({ hasText: /Viewing/ }).first();
}

async function revealPythonFilter(page: Page) {
  const pythonCheckbox = page.locator("#showcase_checkbox_id_python");

  if (!(await pythonCheckbox.isVisible())) {
    await page.getByRole("button", { name: /^Language/ }).first().click();
  }
  if (!(await pythonCheckbox.isVisible())) {
    const viewAllButton = page.getByRole("button", { name: /view all/i }).first();
    await expect(viewAllButton).toBeVisible();
    await viewAllButton.click();
  }

  await expect(pythonCheckbox).toBeVisible();
  return pythonCheckbox;
}

test.describe("Gallery Filtering", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("templates");
    await expect(viewingStatus(page)).toBeVisible();
  });

  test("filter panel is visible with category headings", async ({ page }) => {
    await expect(
      page.getByRole("button", { name: /^Language\s*\d+$/ }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /^Framework\s*\d+$/ }),
    ).toBeVisible();
  });

  test("filter checkboxes show template counts", async ({ page }) => {
    const pythonCheckbox = await revealPythonFilter(page);
    await expect(pythonCheckbox).toHaveAccessibleName(/^Python \(\d+\)$/);
  });
});
