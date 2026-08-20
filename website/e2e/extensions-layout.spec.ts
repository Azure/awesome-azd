import { test, expect } from "@playwright/test";
import extensions from "../static/extensions.json";
import templates from "../static/templates.json";

const SPARSE_TAG = "swa";

// Derived from the gallery data so retiring a template doesn't break this test.
function sparseTemplateQuery() {
  const match = (templates as any[]).find((template) =>
    [
      ...(template.tags ?? []),
      ...(template.languages ?? []),
      ...(template.frameworks ?? []),
      ...(template.azureServices ?? []),
      ...(template.IaC ?? []),
    ].includes(SPARSE_TAG),
  );

  if (!match) {
    throw new Error(`No template in templates.json is tagged "${SPARSE_TAG}"`);
  }

  const params = new URLSearchParams({ tags: SPARSE_TAG, name: match.title });
  return `templates?${params.toString()}`;
}

function sparseExtensionQuery() {
  const displayNames = (extensions as any[]).map((extension) => extension.displayName);
  const unique = displayNames.find(
    (displayName) =>
      displayNames.filter((other) => other.toLowerCase().includes(displayName.toLowerCase()))
        .length === 1,
  );

  if (!unique) {
    throw new Error("No extension in extensions.json has a uniquely matching display name");
  }

  const params = new URLSearchParams({ name: unique });
  return `extensions?${params.toString()}`;
}

test.describe("Gallery card layout", () => {
  test("sparse gallery results stay left aligned", async ({ page }) => {
    await page.goto(sparseTemplateQuery());
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

    await page.goto(sparseExtensionQuery());
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
