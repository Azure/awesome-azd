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

    const heading = page.getByRole("heading", {
      level: 1,
      name: "Extension Gallery",
    });
    const docsLink = page.getByRole("link", {
      name: "Explore extension docs",
    });
    await expect(heading).toBeVisible();
    await expect(heading).toHaveCSS("color", "rgb(36, 36, 36)");
    await expect(heading.locator("span")).toHaveCount(0);
    await expect(docsLink).toBeVisible();
    await expect(docsLink).toHaveCSS("display", "flex");
    await expect(docsLink).toHaveCSS("border-top-width", "0px");
    await expect(docsLink.locator("svg")).toBeVisible();
    expect(
      await docsLink.evaluate((element) => {
        const icon = element.querySelector("svg");
        if (!icon) {
          throw new Error("Extension docs link is missing its icon");
        }
        const linkRect = element.getBoundingClientRect();
        const iconRect = icon.getBoundingClientRect();
        return Math.abs(
          linkRect.y +
            linkRect.height / 2 -
            (iconRect.y + iconRect.height / 2),
        );
      }),
    ).toBeLessThan(1);
    await expect(page.locator(".fui-FluentProvider")).toBeVisible();

    const search = page.getByPlaceholder(
      "Search for an azd extension, capability, or author...",
    );
    const searchControl = page.locator(".fui-SearchBox").filter({
      has: search,
    });
    const sortLabel = page.getByText("Sort by", { exact: true });
    const sort = page.getByRole("combobox", { name: "Sort by" });
    await expect(search).toBeVisible();
    await expect(sort).toBeVisible();
    expect(
      await search.evaluate(
        (element) => element.closest(".fui-SearchBox") !== null,
      ),
    ).toBe(true);

    const [searchBox, sortLabelBox, sortBox] = await Promise.all([
      searchControl.boundingBox(),
      sortLabel.boundingBox(),
      sort.boundingBox(),
    ]);
    expect(searchBox).not.toBeNull();
    expect(sortLabelBox).not.toBeNull();
    expect(sortBox).not.toBeNull();
    expect(
      Math.abs(
        searchBox!.y +
          searchBox!.height / 2 -
          (sortBox!.y + sortBox!.height / 2),
      ),
    ).toBeLessThan(2);
    expect(searchBox!.x).toBeLessThan(sortBox!.x);
    expect(
      sortLabelBox!.x - (searchBox!.x + searchBox!.width),
    ).toBeLessThanOrEqual(16);

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
    const status = page.getByRole("status").filter({
      hasText: /^Viewing /,
    });
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

    const columnCount = () =>
      grid.evaluate((element) =>
        getComputedStyle(element).gridTemplateColumns
          .split(" ")
          .filter(Boolean).length,
      );
    expect(await columnCount()).toBe(3);

    await page.setViewportSize({ width: 2048, height: 1000 });
    await expect.poll(columnCount).toBe(5);

    await page.setViewportSize({ width: 1100, height: 1000 });
    await expect.poll(columnCount).toBe(2);

    await page.setViewportSize({ width: 560, height: 1000 });
    await expect.poll(columnCount).toBe(1);
  });

  test("extension hero typography matches the templates hero", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto("extensions");
    const extensionHeading = page.getByRole("heading", {
      level: 1,
      name: "Extension Gallery",
    });
    const extensionTypography = await extensionHeading.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        fontSize: style.fontSize,
        fontWeight: style.fontWeight,
        letterSpacing: style.letterSpacing,
        lineHeight: style.lineHeight,
      };
    });

    await page.goto("templates");
    const templateHeading = page.getByRole("heading", { level: 1 });
    const templateTypography = await templateHeading.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        fontSize: style.fontSize,
        fontWeight: style.fontWeight,
        letterSpacing: style.letterSpacing,
        lineHeight: style.lineHeight,
      };
    });

    expect(extensionTypography).toEqual(templateTypography);
  });

  test("extension filters use the templates panel treatment", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto("extensions");

    const panel = page.getByTestId("extension-filter-panel");
    await expect(panel).toHaveCSS("width", "240px");
    await expect(panel).toHaveCSS("padding", "16px");
    await expect(panel).toHaveCSS("border-top-width", "1px");
    await expect(panel).toHaveCSS("border-radius", "8px");
    await expect(
      panel.getByRole("heading", {
        level: 2,
        name: "Filter extensions",
      }),
    ).toBeVisible();
    await expect(panel.getByText("View All", { exact: true })).toHaveCount(0);

    const category = panel.getByRole("button", {
      name: /^Capabilities\s*\d+$/,
    });
    const categoryToggle = panel.getByTestId("filter-toggle-symbol");
    expect(
      await categoryToggle.evaluate(
        (element) => getComputedStyle(element, "::before").content,
      ),
    ).toBe('"−"');

    const option = panel.locator(".fui-Checkbox").first();
    const indicator = option.locator(".fui-Checkbox__indicator");
    await expect(option).toHaveCSS("width", "206px");
    await expect(option).toHaveCSS("min-height", "32px");
    await expect(indicator).toHaveCSS("width", "15px");
    await expect(indicator).toHaveCSS("height", "15px");

    const [labelBox, countBox] = await Promise.all([
      option.locator("label").boundingBox(),
      option.locator("small").boundingBox(),
    ]);
    expect(labelBox).not.toBeNull();
    expect(countBox).not.toBeNull();
    expect(
      Math.abs(
        labelBox!.x +
          labelBox!.width -
          (countBox!.x + countBox!.width),
      ),
    ).toBeLessThan(1);

    await category.click();
    expect(
      await categoryToggle.evaluate(
        (element) => getComputedStyle(element, "::before").content,
      ),
    ).toBe('"+"');
    await category.click();

    await option.getByRole("checkbox").check();
    const clearAll = panel.getByRole("button", { name: "Clear all" });
    await expect(clearAll).toBeVisible();
    await expect(clearAll).toHaveCSS("text-decoration-line", "underline");
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
      const card = grid.locator(".fui-Card").first();
      const [gridBox, cardBox] = await Promise.all([
        grid.boundingBox(),
        card.boundingBox(),
      ]);
      expect(gridBox).not.toBeNull();
      expect(cardBox).not.toBeNull();
      expect(Math.abs(cardBox!.x - gridBox!.x)).toBeLessThan(1);
      expect(cardBox!.width).toBeLessThanOrEqual(350);
    }

    await page.goto(sparseExtensionQuery());
    const extensionCards = page.locator('[data-testid="showcase-list"] .fui-Card');
    await expect(extensionCards.first()).toBeVisible();
    await expect(extensionCards).toHaveCount(1);
    await expectLeftAlignedGrid();
  });

  test("Fluent v9 extension search submits and clears", async ({ page }) => {
    await page.goto("extensions");

    const search = page.getByPlaceholder(
      "Search for an azd extension, capability, or author...",
    );
    await search.fill("Concurx");
    await search.press("Enter");

    await expect(page).toHaveURL(/[?&]name=Concurx(?:&|$)/);
    await expect(
      page.locator('[data-testid="showcase-list"] .fui-Card'),
    ).toHaveCount(1);

    await page.getByRole("button", { name: "Clear search" }).click();
    await expect(page).not.toHaveURL(/[?&]name=/);
    await expect(
      page.locator('[data-testid="showcase-list"] .fui-Card'),
    ).toHaveCount(Math.min(20, extensions.length));
  });

  test("extension searches use the templates empty state", async ({
    page,
  }) => {
    await page.goto("extensions");

    const search = page.getByPlaceholder(
      "Search for an azd extension, capability, or author...",
    );
    await search.fill("zzzznonexistentextension");
    await search.press("Enter");

    await expect(
      page.getByRole("heading", {
        level: 2,
        name: "No matching extensions",
      }),
    ).toBeVisible();
    await expect(
      page.getByText("Try different keywords or filters."),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Clear search and filters" })
      .click();

    await expect(page).not.toHaveURL(/[?&]name=/);
    await expect(page.getByTestId("showcase-list")).toBeVisible();
  });

  test("extension titles link directly to their external sources", async ({
    page,
  }) => {
    await page.goto("extensions");

    const grid = page.getByTestId("showcase-list");
    const card = grid.locator(".fui-Card").first();
    const titleLink = card.getByRole("link").first();
    await expect(titleLink).toHaveAttribute("href", /^https:\/\//);
    await expect(titleLink).toHaveAttribute("target", "_blank");
    await expect(
      grid.locator('a[href*="/awesome-azd/extensions/"]'),
    ).toHaveCount(0);
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

    const copyButton = page
      .getByRole("button", { name: /Copy install command/ })
      .first();
    const buttonSize = await copyButton.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    });
    expect(Math.abs(buttonSize.width - buttonSize.height)).toBeLessThan(1);

    const extensionCopyStyle = await copyButton.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        backgroundColor: style.backgroundColor,
        borderRadius: style.borderRadius,
        color: style.color,
        height: style.height,
        width: style.width,
      };
    });

    await page.goto("templates");
    const templateCopyButton = page
      .getByRole("button", { name: /Copy init command for / })
      .first();
    const templateCopyStyle = await templateCopyButton.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        backgroundColor: style.backgroundColor,
        borderRadius: style.borderRadius,
        color: style.color,
        height: style.height,
        width: style.width,
      };
    });

    expect(extensionCopyStyle).toEqual(templateCopyStyle);
  });
});
