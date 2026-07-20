import { test, expect } from "@playwright/test";

test.describe("Gallery card layout", () => {
  test("sparse gallery results stay left aligned", async ({ page }) => {
    await page.goto("templates?tags=swa&name=Static+React+Web+App");
    await page.waitForSelector('[data-testid="showcase-list"] .fui-Card');

    async function expectLeftAlignedGrid() {
      const grid = page.getByTestId("showcase-list");
      await expect(grid).toHaveCSS("justify-content", "start");

      const columns = await grid.evaluate(
        (element) => getComputedStyle(element).gridTemplateColumns,
      );
      for (const width of columns.split(" ")) {
        expect(Number.parseFloat(width)).toBeLessThanOrEqual(350);
      }
    }

    await expectLeftAlignedGrid();

    await page.goto("extensions?name=Concurx");
    await page.waitForSelector('[data-testid="showcase-list"] .fui-Card');
    await expect(page.locator('[data-testid="showcase-list"] .fui-Card')).toHaveCount(1);
    await expectLeftAlignedGrid();
  });

  test("extension commands wrap without clipping", async ({ page }) => {
    await page.goto("extensions");
    await page.waitForSelector('[data-testid="extension-command"]');

    const commands = page.getByTestId("extension-command");
    await expect(commands.first()).toBeVisible();
    await expect(commands.first()).toHaveCSS("align-items", "center");
    await expect(commands.first()).toHaveCSS("overflow-wrap", "anywhere");

    const clippedCommands = await commands.evaluateAll((elements) =>
      elements.filter(
        (element) =>
          element.scrollWidth > element.clientWidth ||
          element.scrollHeight > element.clientHeight,
      ).length,
    );
    expect(clippedCommands).toBe(0);

    const copyButton = page.getByRole("button", { name: /Copy install command/ }).first();
    const buttonSize = await copyButton.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    });
    expect(Math.abs(buttonSize.width - buttonSize.height)).toBeLessThan(1);
  });
});
