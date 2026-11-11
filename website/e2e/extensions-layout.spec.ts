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
  test("extension discovery layout matches the templates catalog", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto("extensions");

    await expect(
      page.getByRole("heading", { level: 1, name: "Extension Gallery" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Explore extension docs" }),
    ).toBeVisible();

    const search = page.getByPlaceholder(
      "Search for an azd extension, capability, or author...",
    );
    const sort = page.getByRole("combobox", { name: "Sort by" });
    await expect(search).toBeVisible();
    await expect(sort).toBeVisible();

    const [searchBox, sortBox] = await Promise.all([
      search.boundingBox(),
      sort.boundingBox(),
    ]);
    expect(searchBox).not.toBeNull();
    expect(sortBox).not.toBeNull();
    expect(
      Math.abs(
        searchBox!.y +
          searchBox!.height / 2 -
          (sortBox!.y + sortBox!.height / 2),
      ),
    ).toBeLessThan(2);
    expect(searchBox!.x).toBeLessThan(sortBox!.x);

    await expect(
      page.getByText("Filter extensions", { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /^Capabilities\s*\d+$/ }),
    ).toBeVisible();
    await expect(
      page.getByText("Extension Capabilities", { exact: true }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("checkbox", { name: /Microsoft Authored/ }),
    ).toHaveCount(0);

    const grid = page.getByTestId("showcase-list");
    const status = page.getByRole("status");
    await expect(grid).toBeVisible();
    const visibleExtensions = Math.min(20, extensions.length);
    await expect(status).toContainText(
      `Viewing 1-${visibleExtensions} of ${extensions.length} extensions`,
    );
    const [gridBox, statusBox] = await Promise.all([
      grid.boundingBox(),
      status.boundingBox(),
    ]);
    expect(gridBox).not.toBeNull();
    expect(statusBox).not.toBeNull();
    expect(statusBox!.y).toBeGreaterThan(gridBox!.y + gridBox!.height);
  });

  test("sparse gallery results stay left aligned", async ({ page }) => {
    await page.goto(sparseTemplateQuery());
    await expect(page.locator("html")).toHaveAttribute(
      "data-has-hydrated",
      "true",
    );
    await expect(page.getByTestId("template-results-count")).toContainText(
      "1-1 of 1",
    );
    const templateGrid = page.getByTestId("template-results");
    const templateCard = templateGrid.locator("[data-template-card]").first();
    await expect(templateCard).toBeVisible();

    const templateLeftOffset = await templateCard.evaluate((card) => {
      const grid = card.parentElement;
      if (!grid) {
        throw new Error("Template card is missing its grid container");
      }
      return Math.abs(
        grid.getBoundingClientRect().x - card.getBoundingClientRect().x,
      );
    });
    expect(templateLeftOffset).toBeLessThan(1);

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

    await page.goto(sparseExtensionQuery());
    const extensionCards = page.locator('[data-testid="showcase-list"] .fui-Card');
    await expect(extensionCards.first()).toBeVisible();
    await expect(extensionCards).toHaveCount(1);
    await expectLeftAlignedGrid();
  });

  test("extension commands wrap without clipping", async ({ page }) => {
    await page.goto("extensions");

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
