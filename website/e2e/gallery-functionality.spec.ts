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

  test("query URLs hydrate without React mismatch errors", async ({
    page,
  }) => {
    const hydrationErrors: string[] = [];
    page.on("console", (message) => {
      const text = message.text();
      if (
        message.type() === "error" &&
        /(Hydration failed|hydration mismatch|Minified React error #418)/i.test(
          text,
        )
      ) {
        hydrationErrors.push(text);
      }
    });

    await page.goto("templates?type=ai");
    await expect(
      page.getByRole("checkbox", { name: /AI application/ }),
    ).toBeChecked();

    await page.goto("templates?q=python");
    await expect(page.locator("#catalog-search")).toHaveValue("python");

    await page.goto("templates?page=2");
    await expect(resultsStatus(page)).toContainText("21-40 of");

    expect(hydrationErrors).toEqual([]);
  });

  test("start-with-code restores the catalog query in its back link", async ({
    page,
  }) => {
    await page.goto("templates/start-with-code?type=ai&q=python");
    await expect(page.locator("html")).toHaveAttribute(
      "data-has-hydrated",
      "true",
    );

    const backLink = page.getByRole("link", {
      name: "← Back to templates",
    });
    await expect(backLink).toHaveAttribute(
      "href",
      /\/templates\?type=ai&q=python$/,
    );
    await backLink.click();

    await expect(page).toHaveURL(/\/templates\?type=ai&q=python$/);
    await expect(
      page.getByRole("checkbox", { name: /AI application/ }),
    ).toBeChecked();
    await expect(page.locator("#catalog-search")).toHaveValue("python");
  });

  test("legacy tags and authors still narrow the unified catalog", async ({
    page,
  }) => {
    const initial = await resultCount(page);

    await page.goto("templates?tags=python");
    await expect.poll(() => resultCount(page)).toBeLessThan(initial);
    expect(await resultCount(page)).toBeGreaterThan(0);

    await page.goto("templates?type=ai");
    await expect(
      page.getByRole("checkbox", { name: /AI application/ }),
    ).toBeChecked();
    const aiCount = await resultCount(page);
    await page.goto("templates?tags=aicollection");
    await expect(
      page.getByRole("checkbox", { name: /AI application/ }),
    ).toBeChecked();
    await expect.poll(() => resultCount(page)).toBe(aiCount);

    await page.goto("templates?authors=Microsoft");
    await expect.poll(() => resultCount(page)).toBeLessThan(initial);
    expect(await resultCount(page)).toBeGreaterThan(0);

    await page.goto(
      "templates?authors=Azure%20Cosmos%20DB%20Content%20Team",
    );
    await expect(resultsStatus(page)).toContainText("1 of 1 templates");
    await expect(
      page.getByRole("link", {
        name: /Copilot sample app with Azure CosmosDB for NoSQL/,
      }),
    ).toBeVisible();
  });

  test("legacy extension URLs redirect to the extension gallery", async ({
    page,
  }) => {
    await page.goto("templates?type=extensions&name=azure");

    await expect(page).toHaveURL(/\/extensions\?name=azure$/);
    await expect(
      page.getByRole("heading", { level: 1, name: "Extension Gallery" }),
    ).toBeVisible();
    await expect(
      page.getByRole("searchbox", { name: "Search extensions" }),
    ).toHaveValue("azure");
  });

  for (const [route, service] of [
    ["services/container-apps", "aca"],
    ["services/azure-functions", "functions"],
  ] as const) {
    test(`${route} uses the same inventory as its catalog destination`, async ({
      page,
    }) => {
      await page.goto(route);
      const viewAll = page.getByRole("link", {
        name: /View all \d+ templates/,
      });
      const label = (await viewAll.textContent()) ?? "";
      const serviceCount = Number(label.match(/\d+/)?.[0]);

      expect(serviceCount).toBeGreaterThan(0);
      await viewAll.click();
      await expect(page).toHaveURL(
        new RegExp(`/templates\\?service=${service}$`),
      );
      await expect.poll(() => resultCount(page)).toBe(serviceCount);
    });
  }

  test("service cards preserve legacy preview images", async ({ page }) => {
    await page.goto("services/container-apps");

    await expect(
      page.getByRole("img", {
        name: "WordPress with Azure Container Apps",
      }),
    ).toHaveAttribute(
      "src",
      /\/templates\/images\/apptemplate-wordpress-on-ACA\.png$/,
    );
  });

  test("page renders the first 20 template cards", async ({ page }) => {
    const cards = page.locator("[data-template-card]");
    await expect(page.locator(".fui-FluentProvider")).toBeVisible();
    await expect(cards.first()).toBeVisible({ timeout: 15_000 });
    await expect(cards).toHaveCount(20);
  });

  test("featured and standard cards match the desktop card design", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1600, height: 1200 });

    for (const [title, featured, language, service] of [
      ["Get started with AI agents", true, "Python", "Azure AI Search"],
      [
        "RAG chat with Azure AI Search + C#",
        false,
        ".NET/C#",
        "Azure Container Apps",
      ],
    ] as const) {
      await page.goto(
        `templates?type=ai&q=${encodeURIComponent(title)}`,
      );
      const card = page.locator("[data-template-card]").first();
      await expect(card).toBeVisible();
      await expect(card).toHaveCSS("border-radius", "9px");
      await expect(card).toHaveCSS("padding", "21px");
      await expect(card).toHaveCSS(
        "border-top-width",
        featured ? "3px" : "1px",
      );
      await expect(card.locator("h2")).toHaveCSS("font-size", "16.8px");
      await expect(
        card.locator('[class*="cardSummary"]'),
      ).toHaveCSS("font-size", "13.12px");
      await expect(
        card.locator('[class*="cardAuthor"]'),
      ).toHaveCSS("font-size", "10px");
      await expect(
        card.getByText(language, { exact: true }).first(),
      ).toHaveCSS("font-size", "10.4px");
      await expect(card.locator("code")).toHaveCSS("font-size", "10.88px");
      await expect(card.locator("code")).toHaveCSS(
        "border-top-width",
        "0px",
      );
      await expect(card.locator("code")).toHaveCSS(
        "background-color",
        "rgba(0, 0, 0, 0)",
      );
      await expect(
        card.getByRole("button", { name: /Copy init command/ }),
      ).toHaveCSS("width", "32px");
      await expect(
        card.getByRole("button", { name: /Copy init command/ }),
      ).toHaveCSS("height", "32px");
      await expect(
        card.getByText(service, { exact: true }),
      ).toBeVisible();
    }
  });

  test("template columns adapt to the available viewport width", async ({
    page,
  }) => {
    const grid = page.getByTestId("template-results");

    for (const [width, expectedColumns] of [
      [1600, 3],
      [1200, 2],
      [600, 1],
    ] as const) {
      await page.setViewportSize({ width, height: 1200 });
      await expect
        .poll(() =>
          grid.evaluate((element) => {
            const cards = Array.from(
              element.querySelectorAll<HTMLElement>(
                "[data-template-card]",
              ),
            );
            const firstTop = cards[0]?.getBoundingClientRect().top;
            return firstTop === undefined
              ? 0
              : cards.filter(
                  (card) =>
                    Math.abs(card.getBoundingClientRect().top - firstTop) <
                    1,
                ).length;
          }),
        )
        .toBe(expectedColumns);
      const cardWidth = await grid
        .locator("[data-template-card]")
        .first()
        .evaluate((element) => element.getBoundingClientRect().width);
      expect(cardWidth).toBeGreaterThanOrEqual(285);
      expect(cardWidth).toBeLessThanOrEqual(350);
    }
  });

  test("incomplete final rows preserve the preceding column alignment", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1600, height: 1200 });
    const cards = page.getByTestId("template-results").locator(
      "[data-template-card]",
    );
    const layout = await cards.evaluateAll((elements) =>
      elements.map((element) => {
        const bounds = element.getBoundingClientRect();
        return {
          x: bounds.x,
          top: bounds.top,
          width: bounds.width,
        };
      }),
    );
    const firstTop = layout[0]?.top ?? 0;
    const lastTop = Math.max(...layout.map((card) => card.top));
    const firstRow = layout.filter(
      (card) => Math.abs(card.top - firstTop) < 1,
    );
    const lastRow = layout.filter(
      (card) => Math.abs(card.top - lastTop) < 1,
    );

    expect(firstRow).toHaveLength(3);
    expect(lastRow).toHaveLength(2);
    for (const [index, card] of lastRow.entries()) {
      expect(card.x).toBeCloseTo(firstRow[index].x, 1);
      expect(card.width).toBeCloseTo(firstRow[index].width, 1);
    }
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

  test("template cards open repository detail pages", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 1200 });
    await page.goto(
      "templates?q=RAG%20chat%20with%20Azure%20AI%20Search%20%2B%20Python",
    );
    const detailLink = page.locator("a[data-template-title]").first();
    await expect(detailLink).toHaveAttribute(
      "href",
      "/awesome-azd/templates/azure-samples/azure-search-openai-demo",
    );
    await expect(detailLink).not.toHaveAttribute("target", "_blank");

    await detailLink.click();

    await expect(page).toHaveURL(
      /\/templates\/azure-samples\/azure-search-openai-demo\/?$/,
    );
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "RAG chat with Azure AI Search + Python",
      }),
    ).toBeVisible();
    await expect(
      page.getByAltText(
        "Application screenshot for RAG chat with Azure AI Search + Python",
      ),
    ).toBeVisible();
    await expect(
      page.getByAltText(
        "Architecture diagram for RAG chat with Azure AI Search + Python",
      ),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", {
        level: 2,
        name: "Resources included",
      }),
    ).toBeVisible();
    await expect(
      page.locator("dt", { hasText: /^Models$/ }),
    ).toBeVisible();
    await expect(
      page.getByRole("table", { name: "Resources included" }).getByRole("row"),
    ).toHaveCount(7);
    await expect(
      page.locator("[data-repository-stars]"),
    ).toHaveAttribute(
      "aria-label",
      "9,876 GitHub stars (snapshot)",
    );

    const repositoryLink = page.getByRole("link", {
      name: /Azure-Samples \/ azure-search-openai-demo/i,
    });
    await expect(repositoryLink).toHaveAttribute(
      "href",
      "https://github.com/Azure-Samples/azure-search-openai-demo",
    );
    await expect(repositoryLink).toHaveAttribute("target", "_blank");
    await expect(repositoryLink).toHaveAttribute(
      "rel",
      "noopener noreferrer",
    );
    await expect(repositoryLink).toHaveCSS(
      "text-decoration-line",
      "underline",
    );

    const main = page.locator("main").first();
    await expect(main).toHaveCSS(
      "background-color",
      "rgb(252, 252, 249)",
    );
    const sidebar = page.locator("aside");
    await expect(sidebar).toHaveCSS("position", "static");
    expect(
      await sidebar.evaluate((element) => element.getBoundingClientRect().width),
    ).toBeCloseTo(440, 0);

    const screenshot = page.getByAltText(
      "Application screenshot for RAG chat with Azure AI Search + Python",
    );
    const architecture = page.getByAltText(
      "Architecture diagram for RAG chat with Azure AI Search + Python",
    );
    await expect(screenshot.locator("..")).toHaveCSS(
      "border-top-width",
      "1px",
    );
    await expect(architecture.locator("..")).toHaveCSS(
      "border-top-width",
      "1px",
    );

    const command = page.locator("code", {
      hasText:
        "azd init -t azure-search-openai-demo",
    });
    await expect(command.locator("span")).toHaveCount(3);
    await expect(command.locator("span").nth(1)).toHaveCSS(
      "color",
      "rgb(0, 95, 184)",
    );
    await expect(command.locator("span").nth(2)).toHaveCSS(
      "color",
      "rgb(23, 105, 44)",
    );

    const learnLink = page.getByRole("link", {
      name: /Learn more about azd/,
    });
    await expect(learnLink).toHaveCSS(
      "text-decoration-line",
      "underline",
    );
    const getStartedText = learnLink.locator("..");
    const sentenceBounds = await getStartedText.locator("span").first().boundingBox();
    const learnBounds = await learnLink.boundingBox();
    expect(sentenceBounds).not.toBeNull();
    expect(learnBounds).not.toBeNull();
    expect(learnBounds!.y).toBeGreaterThan(sentenceBounds!.y);

    const vscodeLink = page.getByRole("link", {
      name: "Open in VS Code for the Web",
    });
    await expect(vscodeLink).toHaveAttribute(
      "href",
      "https://vscode.dev/azure?vscode-azure-exp=azd&az-referer=awesome-azd&azdTemplateUrl=https%3A%2F%2Fgithub.com%2FAzure-Samples%2Fazure-search-openai-demo",
    );
    await expect(vscodeLink.locator("img")).toHaveAttribute(
      "src",
      /\/img\/vscode\.svg$/,
    );

    const pricingLink = page.getByRole("link", {
      name: /Pricing calculator/,
    });
    await expect(pricingLink).toHaveCSS(
      "text-decoration-line",
      "underline",
    );
    await expect(pricingLink).toHaveCSS("white-space", "nowrap");

    const firstResourceIcon = page
      .getByRole("table", { name: "Resources included" })
      .locator("tbody img")
      .first();
    expect(
      await firstResourceIcon.evaluate(
        (element) => element.getBoundingClientRect().width,
      ),
    ).toBeLessThanOrEqual(32);
  });

  test("repository stars render missing and zero states and drive popularity order", async ({
    page,
  }) => {
    const cards = page.locator("[data-template-card]");
    await expect(cards.nth(0).locator("a[data-template-title]")).toHaveAttribute(
      "data-template-title",
      "RAG chat with Azure AI Search + Python",
    );
    await expect(
      cards.nth(0).getByRole("img", { name: "9,876 GitHub stars" }),
    ).toBeVisible();
    await expect(cards.nth(1).locator("a[data-template-title]")).toHaveAttribute(
      "data-template-title",
      "Get Started with Chat",
    );
    await expect(
      cards.nth(1).getByRole("img", { name: "0 GitHub stars" }),
    ).toBeVisible();

    await page.goto(
      `templates?q=${encodeURIComponent("Get started with AI agents")}`,
    );
    const missingStarsCard = page.locator("[data-template-card]").first();
    await expect(
      missingStarsCard.locator("a[data-template-title]"),
    ).toHaveAttribute(
      "data-template-title",
      "Get started with AI agents",
    );
    await expect(
      missingStarsCard.locator("[data-repository-stars]"),
    ).toHaveCount(0);
  });

  test("template details hide Models when metadata has none", async ({
    page,
  }) => {
    await page.goto(
      "templates/azure-samples/svc-invoke-dapr-csharp",
    );

    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Microservices App - Dapr Service Invoke C# ACA",
      }),
    ).toBeVisible();
    await expect(
      page.locator("dt", { hasText: /^Models$/ }),
    ).toHaveCount(0);
  });

  test("template details omit unavailable local preview assets", async ({
    page,
  }) => {
    await page.goto(
      "templates/azure-samples/pubsub-dapr-aks-java",
    );

    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Microservices App - Dapr PubSub Java AKS",
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("img", {
        name: /Application screenshot/,
      }),
    ).toHaveCount(0);
  });

  test("template details omit unavailable remote preview assets", async ({
    page,
  }) => {
    await page.route(
      "https://github.com/passadis/azure-a2a-translation/images/a2a-translation-architecture.png",
      (route) => route.abort(),
    );
    await page.goto("templates/passadis/azure-a2a-translation");

    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Containerized A2A Translation Service with Azure AI Translator",
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("region", { name: "Application preview" }),
    ).toHaveCount(0);
  });

  test("browser Back restores the clicked card focus and scroll position", async ({
    page,
  }) => {
    await page.goto("templates?page=2");
    await expect(resultsStatus(page)).toContainText("21-40 of");
    await expect(page.locator("html")).toHaveAttribute(
      "data-has-hydrated",
      "true",
    );
    const cards = page.locator("[data-template-card]");
    await expect(cards).toHaveCount(20);
    const detailLink = cards.last().locator("a[data-template-title]");
    await expect(detailLink).toBeVisible();
    await detailLink.scrollIntoViewIfNeeded();
    await detailLink.focus();
    const focusedId = await detailLink.getAttribute("id");
    const scrollTop = await page.evaluate(() => window.scrollY);

    expect(focusedId).not.toBeNull();
    expect(scrollTop).toBeGreaterThan(0);
    await detailLink.click();
    await expect(page).toHaveURL(/\/templates\/[^/]+\/[^/]+\/?$/);

    await page.goBack();

    await expect(page).toHaveURL(/\/templates\?page=2$/);
    await expect(page.locator(`#${focusedId}`)).toBeFocused();
    await expect
      .poll(async () => {
        const restoredScrollTop = await page.evaluate(
          () => window.scrollY,
        );
        return Math.abs(restoredScrollTop - scrollTop);
      })
      .toBeLessThan(5);
  });

  test("browser Back restores the previous filter state", async ({ page }) => {
    const pythonCheckbox = page.locator("#catalog-languages-python");
    await page.locator("summary", { hasText: "Language" }).click();
    await pythonCheckbox.check();
    await expect(page).toHaveURL(/[?&]language=Python(?:&|$)/);

    await page.goBack();

    await expect(page).toHaveURL(/\/templates$/);
    await expect(pythonCheckbox).not.toBeChecked();
  });

  test("agent index documents catalogs and deployment guidance", async ({
    request,
  }) => {
    const response = await request.get("llms.txt");
    expect(response.ok()).toBe(true);
    const guidance = await response.text();

    expect(guidance).toContain("# Awesome azd");
    expect(guidance).toContain(
      "- [Agent templates](https://azure.github.io/awesome-azd/templates.json):",
    );
    expect(guidance).not.toContain("agent-templates.json");
    expect(guidance).toContain(
      'entries with `templateType: "extension.ai.agent"`',
    );
    expect(guidance).toMatch(
      /ask for user approval\r?\n\s+before running deployment commands/,
    );
  });

  test('search "postgresql" narrows results but keeps some', async ({
    page,
  }) => {
    const initial = await resultCount(page);
    const searchInput = page.locator("#catalog-search");

    await searchInput.fill("postgresql");
    await expect(page).not.toHaveURL(/q=postgresql/);
    expect(await resultCount(page)).toBe(initial);
    await searchInput.press("Enter");

    await expect(page).toHaveURL(/q=postgresql/);
    await expect.poll(() => resultCount(page)).not.toBe(initial);
    const filtered = await resultCount(page);
    expect(filtered).toBeGreaterThan(0);
    expect(filtered).toBeLessThan(initial);
  });

  test("applied search and filter values use pill styling", async ({
    page,
  }) => {
    await page.goto("templates?type=ai&q=tag");
    const pills = page.getByRole("group", {
      name: "Applied filters",
    }).getByRole("button");

    await expect(pills).toHaveCount(2);
    for (const pill of await pills.all()) {
      await expect(pill).toHaveCSS("border-radius", "999px");
      await expect(pill).toHaveCSS(
        "background-color",
        "rgb(235, 243, 252)",
      );
      await expect(pill).toHaveCSS("color", "rgb(15, 108, 189)");
    }
  });

  test("filter groups hide values with zero matching templates", async ({
    page,
  }) => {
    await page.goto(
      `templates?type=ai&q=${encodeURIComponent(
        "RAG chat with Azure AI Search + C#",
      )}`,
    );

    await expect(
      page.getByRole("checkbox", { name: /Document Q&A 2/ }),
    ).toBeVisible();
    await expect(
      page.getByRole("checkbox", { name: /Web apps 1/ }),
    ).toBeVisible();
    await expect(
      page.getByRole("checkbox", { name: /APIs 1/ }),
    ).toBeVisible();
    await expect(
      page.getByRole("checkbox", { name: /AI agents 1/ }),
    ).toBeVisible();
    await expect(
      page.getByRole("checkbox", { name: /Workflow automation 0/ }),
    ).toHaveCount(0);
  });

  test("use cases work in search and filters without appearing as card tags", async ({
    page,
  }) => {
    const searchInput = page.locator("#catalog-search");
    await searchInput.fill("Build an AI agent");
    await searchInput.press("Enter");
    await expect.poll(() => resultCount(page)).toBeGreaterThan(0);
    expect(
      (await page.locator("[data-template-tags]").allTextContents()).some(
        (text) => /Build an AI agent|AI agents/.test(text),
      ),
    ).toBe(false);

    await page.goto("templates");
    await expect(resultsStatus(page)).toContainText("templates");
    const aiAgentFilter = page.locator(
      "#catalog-tasks-build-an-ai-agent",
    );
    await aiAgentFilter.check();

    await expect(aiAgentFilter).toBeChecked();
    expect(new URL(page.url()).searchParams.get("task")).toBe(
      "Build an AI agent",
    );
    await expect.poll(() => resultCount(page)).toBeGreaterThan(0);
    expect(
      (await page.locator("[data-template-tags]").allTextContents()).some(
        (text) => /Build an AI agent|AI agents/.test(text),
      ),
    ).toBe(false);
  });

  test("nonsense search shows the empty-state message", async ({ page }) => {
    const searchInput = page.locator("#catalog-search");
    await searchInput.fill("zzzznonexistenttemplate");
    await searchInput.press("Enter");

    await expect(page.getByText("No matching templates")).toBeVisible({
      timeout: 10_000,
    });
  });

  test("populated repository metrics do not trigger metadata requests", async ({
    page,
  }) => {
    const metadataRequests: string[] = [];
    page.on("request", (request) => {
      const url = new URL(request.url());
      if (
        url.hostname === "api.github.com" ||
        url.pathname.endsWith("/repository-metrics.json") ||
        url.href.startsWith(
          "https://cachelp6qsotirqelc.z20.web.core.windows.net/",
        )
      ) {
        metadataRequests.push(url.href);
      }
    });

    await page.reload();
    await expect(page.locator("html")).toHaveAttribute(
      "data-has-hydrated",
      "true",
    );
    await page.waitForTimeout(250);

    expect(metadataRequests).toEqual([]);
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

  test("sort dropdown exposes only Most popular and Latest", async ({
    page,
  }) => {
    const sortDropdown = page.getByRole("combobox", {
      name: "Sort by",
    });
    await sortDropdown.click();
    await expect(
      page.getByRole("option", { name: "Most popular" }),
    ).toBeVisible();
    await expect(
      page.getByRole("option", { name: "Latest" }),
    ).toBeVisible();
    await expect(
      page.getByRole("option", { name: "Old to New" }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("option", { name: "Alphabetical (A - Z)" }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("option", { name: "Alphabetical (Z - A)" }),
    ).toHaveCount(0);

    await page.getByRole("option", { name: "Latest" }).click();
    await expect(page).toHaveURL(/[?&]sort=newest(?:&|$)/);
    await expect(sortDropdown).toHaveText("Latest");

    await sortDropdown.click();
    await page.getByRole("option", { name: "Most popular" }).click();
    await expect(page).not.toHaveURL(/[?&]sort=/);
    await expect(sortDropdown).toHaveText("Most popular");
  });

  test("start-with-code matches the guided setup flow", async ({ page }) => {
    await page.goto("templates/start-with-code");
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Start with your own code",
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", {
        level: 2,
        name: "Prerequisite: Install azd",
      }),
    ).toBeVisible();

    const operatingSystem = page.getByRole("combobox", {
      name: "Operating system",
    });
    await expect(page.locator(".fui-FluentProvider")).toBeVisible();
    await expect(operatingSystem).toHaveValue("windows");
    expect(
      await operatingSystem.evaluate(
        (element) => element.closest(".fui-Select") !== null,
      ),
    ).toBe(true);
    await expect(
      page.getByText("winget install microsoft.azd", { exact: true }),
    ).toBeVisible();

    await operatingSystem.selectOption("macos");
    await expect(
      page.getByText("brew tap azure/azd && brew install azd", {
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      page.getByLabel(
        "azd init prompt with three options: Scan current directory, Select a template, and Set up with GitHub Copilot (Preview)",
      ),
    ).toBeVisible();
    await expect(
      page.getByText("Scan current directory", { exact: true }).last(),
    ).toBeVisible();
    await expect(
      page.getByText("Set up with GitHub Copilot", { exact: true }).last(),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Read the setup guide" }),
    ).toHaveCount(0);
  });

  test("dark-mode copy action hover meets text contrast", async ({ page }) => {
    await page.evaluate(() => localStorage.setItem("theme", "dark"));
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute(
      "data-theme",
      "dark",
    );
    const copyButton = page.getByRole("button", {
      name: /Copy init command for/,
    }).first();
    await copyButton.hover();

    const contrast = await copyButton.evaluate((element) => {
      const parseColor = (value: string) =>
        (value.match(/[\d.]+/g) ?? [])
          .slice(0, 3)
          .map(Number)
          .map((channel) =>
            value.startsWith("color(srgb") ? channel * 255 : channel,
          );
      const luminance = (channels: number[]) => {
        const [red, green, blue] = channels.map((channel) => {
          const value = channel / 255;
          return value <= 0.03928
            ? value / 12.92
            : ((value + 0.055) / 1.055) ** 2.4;
        });
        return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
      };
      const style = window.getComputedStyle(element);
      const foreground = luminance(parseColor(style.color));
      const background = luminance(parseColor(style.backgroundColor));
      return (
        (Math.max(foreground, background) + 0.05) /
        (Math.min(foreground, background) + 0.05)
      );
    });

    expect(contrast).toBeGreaterThanOrEqual(4.5);
  });

  test("start-with-code preview label meets text contrast", async ({
    page,
  }) => {
    const contrastRatio = () =>
      page
        .getByText("(Preview)", { exact: true })
        .evaluate((element) => {
          const parseColor = (value: string) =>
            (value.match(/[\d.]+/g) ?? [])
              .slice(0, 3)
              .map(Number)
              .map((channel) =>
                value.startsWith("color(srgb")
                  ? channel * 255
                  : channel,
              );
          const luminance = (channels: number[]) => {
            const [red, green, blue] = channels.map((channel) => {
              const value = channel / 255;
              return value <= 0.03928
                ? value / 12.92
                : ((value + 0.055) / 1.055) ** 2.4;
            });
            return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
          };
          const style = window.getComputedStyle(element);
          const foreground = luminance(parseColor(style.color));
          const terminal = element.closest("figure");
          if (terminal === null) {
            throw new Error("Expected preview label inside a terminal.");
          }
          const background = luminance(
            parseColor(window.getComputedStyle(terminal).backgroundColor),
          );
          return (
            (Math.max(foreground, background) + 0.05) /
            (Math.min(foreground, background) + 0.05)
          );
        });

    await page.goto("templates/start-with-code");
    expect(await contrastRatio()).toBeGreaterThanOrEqual(4.5);

    await page.evaluate(() => localStorage.setItem("theme", "dark"));
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute(
      "data-theme",
      "dark",
    );
    expect(await contrastRatio()).toBeGreaterThanOrEqual(4.5);
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
