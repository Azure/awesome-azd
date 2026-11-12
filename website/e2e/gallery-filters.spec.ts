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

  test("filter rows align checkboxes with labels in the wider panel", async ({
    page,
  }) => {
    const panel = page.locator('aside[aria-label="Template filters"]');
    const option = page
      .locator("#catalog-tasks-build-a-web-app")
      .locator("xpath=..");
    const nextOption = page
      .locator("#catalog-tasks-build-an-api")
      .locator("xpath=..");
    const indicator = option.locator(".fui-Checkbox__indicator");
    const optionLabel = option.locator(".fui-Checkbox__label");
    const label = option.getByText("Web apps", { exact: true });
    const [panelBox, optionBox, nextOptionBox, indicatorBox, labelBox] =
      await Promise.all([
        panel.boundingBox(),
        option.boundingBox(),
        nextOption.boundingBox(),
        indicator.boundingBox(),
        label.boundingBox(),
      ]);

    expect(panelBox).not.toBeNull();
    expect(optionBox).not.toBeNull();
    expect(nextOptionBox).not.toBeNull();
    expect(indicatorBox).not.toBeNull();
    expect(labelBox).not.toBeNull();
    expect(panelBox!.width).toBeGreaterThanOrEqual(238);
    await expect(option).toHaveCSS("align-items", "center");
    await expect(indicator).toHaveCSS("align-self", "center");
    await expect(optionLabel).toHaveCSS("align-items", "center");
    expect(nextOptionBox!.y).toBeGreaterThanOrEqual(
      optionBox!.y + optionBox!.height - 1,
    );
    expect(
      Math.abs(
        indicatorBox!.y +
          indicatorBox!.height / 2 -
          (labelBox!.y + labelBox!.height / 2),
      ),
    ).toBeLessThanOrEqual(0.5);
    expect(
      labelBox!.x - (indicatorBox!.x + indicatorBox!.width),
    ).toBeGreaterThanOrEqual(6);
    expect(
      labelBox!.x - (indicatorBox!.x + indicatorBox!.width),
    ).toBeLessThanOrEqual(10);
  });
});
