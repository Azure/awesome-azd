import { expect, test, type BrowserContext, type Page } from "@playwright/test";

const featuredTemplateTitle = "RAG chat with Azure AI Search + Python";
const featuredTemplateSource =
  "https://github.com/Azure-Samples/azure-search-openai-demo";
const renamedAiTemplateTitle = "VoiceRAG with Realtime API";
const renamedAiTemplateSource =
  "https://github.com/Azure-Samples/aisearch-openai-rag-audio";

async function stubExternalServices(context: BrowserContext) {
  await context.route(
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
  await context.route("**/ai-apps-search*", (route) => {
    const searchTerm = new URL(route.request().url()).searchParams.get(
      "search",
    );
    return searchTerm === "initialRequest"
      ? route.fulfill({ json: [] })
      : route.abort();
  });
}

function resultLinks(page: Page) {
  return page.getByTestId("template-results").locator("a[data-template-title]");
}

async function resultCount(page: Page): Promise<number> {
  const text =
    (await page.getByTestId("template-results-count").textContent()) ?? "";
  const numbers = text.match(/\d+/g);
  expect(numbers, `expected numbers in status: "${text}"`).not.toBeNull();
  return Number(numbers![numbers!.length - 1]);
}

async function openAiGallery(page: Page) {
  const response = await page.goto("templates?type=ai", {
    waitUntil: "domcontentloaded",
  });
  expect(response?.ok()).toBeTruthy();
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Your next app. Ready to build.",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("checkbox", { name: /AI application/ }),
  ).toBeChecked();
  await expect(page.getByTestId("template-results-count")).toContainText(
    "56 templates",
  );
}

test.describe("Unified AI app templates catalog", () => {
  test.beforeEach(async ({ context }) => {
    await stubExternalServices(context);
  });

  test("redirects the legacy AI collection URL to the AI facet", async ({
    page,
  }) => {
    await page.goto("templates/ai");

    await expect(page).toHaveURL(/\/templates\?type=ai$/);
    await expect(
      page.getByRole("checkbox", { name: /AI application/ }),
    ).toBeChecked();
  });

  test("preserves legacy tag filters when redirecting the AI collection", async ({
    page,
  }) => {
    await page.goto("templates/ai?tags=python");

    await expect(page).toHaveURL(/\/templates\?(?=.*tags=python)(?=.*type=ai)/);
    await expect(
      page.getByRole("checkbox", { name: /AI application/ }),
    ).toBeChecked();
    await expect.poll(() => resultCount(page)).toBeLessThan(56);
    expect(await resultCount(page)).toBeGreaterThan(0);
  });

  test("loads all 56 AI templates in the unified catalog", async ({
    page,
  }) => {
    await openAiGallery(page);

    await expect(page.getByTestId("template-results-count")).toContainText(
      "56 templates",
    );
    expect(await resultLinks(page).count()).toBe(20);
    await page.locator("summary", { hasText: "Language" }).click();
    await expect(
      page.getByRole("checkbox", { name: /Python/ }),
    ).toBeVisible();
  });

  test("server-renders catalog content with Fluent UI components", async ({
    browser,
  }) => {
    const context = await browser.newContext({
      baseURL: "http://localhost:3000/awesome-azd/",
      javaScriptEnabled: false,
    });
    const page = await context.newPage();

    const response = await page.goto("templates?type=ai", {
      waitUntil: "domcontentloaded",
    });

    expect(response?.ok()).toBeTruthy();
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Your next app. Ready to build.",
      }),
    ).toBeVisible();
    await expect(page.locator("[data-template-card]")).toHaveCount(20);
    await expect(page.locator(".fui-Card")).toHaveCount(20);
    await expect(page.locator(".fui-SearchBox")).toHaveCount(1);
    await expect(page.locator(".fui-Dropdown")).toHaveCount(1);
    await expect(page.locator(".fui-Checkbox").first()).toBeVisible();

    await context.close();
  });

  test("rehydrates Fluent styles across direct loads and client navigation", async ({
    page,
  }) => {
    const styleErrors: string[] = [];
    page.on("console", (message) => {
      if (
        message.type() === "error" &&
        /(griffel|hydration|style.*rehydrat)/i.test(message.text())
      ) {
        styleErrors.push(message.text());
      }
    });

    await page.goto("templates");
    await expect(page.locator("html")).toHaveAttribute(
      "data-has-hydrated",
      "true",
    );
    const serverStyles = page.locator('style[data-href^="griffel:"]');
    const serverStyleCount = await serverStyles.count();
    expect(serverStyleCount).toBeGreaterThan(0);
    expect(
      await serverStyles.evaluateAll(
        (styles) =>
          styles.filter(
            (style) =>
              !style.hasAttribute("data-make-styles-bucket") ||
              !style.hasAttribute("data-priority") ||
              style.getAttribute("data-make-styles-rehydration") !== "true" ||
              !style.textContent,
          ).length,
      ),
    ).toBe(0);

    await page
      .getByRole("navigation")
      .getByRole("link", { name: /Azure Developer CLI/ })
      .first()
      .click();
    await expect(page).toHaveURL(/\/awesome-azd\/$/);
    await expect(serverStyles).toHaveCount(serverStyleCount);

    await page
      .getByRole("navigation")
      .getByRole("link", { name: /^Templates$/ })
      .first()
      .click();
    await expect(page.locator(".fui-Card").first()).toBeVisible();
    await expect(serverStyles).toHaveCount(serverStyleCount);

    await page.goto("./");
    await expect(page.locator("html")).toHaveAttribute(
      "data-has-hydrated",
      "true",
    );
    await expect(serverStyles).toHaveCount(0);
    await expect(page.locator("style[data-make-styles-bucket]")).toHaveCount(0);

    await page
      .getByRole("navigation")
      .getByRole("link", { name: /^Templates$/ })
      .first()
      .click();
    await expect(page.locator(".fui-Card").first()).toBeVisible();
    await expect
      .poll(() => page.locator("style[data-make-styles-bucket]").count())
      .toBeGreaterThan(0);
    await expect(serverStyles).toHaveCount(0);
    expect(styleErrors).toEqual([]);
  });

  test("filters AI templates and synchronizes the URL", async ({ page }) => {
    await openAiGallery(page);
    const pythonFilter = page.locator("#catalog-languages-python");

    await page.locator("summary", { hasText: "Language" }).click();
    await pythonFilter.check();

    await expect(pythonFilter).toBeChecked();
    await expect(page).toHaveURL(/(?:\?|&)language=Python(?:&|$)/);
    await expect(page.getByTestId("template-results-count")).not.toContainText(
      "56 templates",
    );
  });

  test("matches backend search results by allowlisted source, not title", async ({
    page,
  }) => {
    await page.route("**/ai-apps-search*", (route) => {
      const searchTerm = new URL(route.request().url()).searchParams.get(
        "search",
      );
      if (searchTerm === "source-ranked") {
        return route.fulfill({
          json: [
            {
              document: {
                source: renamedAiTemplateSource,
                email: [`private${"@"}example.com`],
              },
            },
            { document: { source: renamedAiTemplateSource } },
            {
              document: {
                source: "https://github.com/example/stale-template",
              },
            },
          ],
        });
      }
      return route.fulfill({ json: [] });
    });
    await openAiGallery(page);

    const searchBox = page.getByPlaceholder(
      "Describe the app you want to build or search with keywords",
    );
    await searchBox.fill("source-ranked");
    await searchBox.press("Enter");

    await expect.poll(() => resultLinks(page).count()).toBe(1);
    await expect(resultLinks(page)).toHaveAttribute(
      "data-template-title",
      renamedAiTemplateTitle,
    );
  });

  test("falls back to local search when the backend is unavailable", async ({
    page,
  }) => {
    await openAiGallery(page);
    const searchBox = page.getByPlaceholder(
      "Describe the app you want to build or search with keywords",
    );

    await searchBox.fill("azure");
    await searchBox.press("Enter");

    await expect(page).toHaveURL(/(?:\?|&)q=azure(?:&|$)/);
    await expect.poll(() => resultLinks(page).count()).toBeGreaterThan(0);
  });

  test("opens canonical and legacy AI detail routes", async ({ page }) => {
    await openAiGallery(page);
    const templateLink = resultLinks(page).filter({
      hasText: featuredTemplateTitle,
    });

    await expect(templateLink).toHaveAttribute(
      "href",
      /\/awesome-azd\/templates\/azure-samples\/azure-search-openai-demo\?/,
    );
    await page.goto(
      "templates/azure-samples/azure-search-openai-demo?type=ai",
    );

    await expect(
      page.getByRole("heading", {
        level: 1,
        name: featuredTemplateTitle,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", {
        name: "Azure Content Team",
        exact: true,
      }),
    ).toHaveAttribute("href", "https://github.com/Azure-Samples");
    await expect(page.getByText("Services and integrations.")).toBeVisible();
    await page.getByRole("link", { name: "Back to templates" }).click();
    await expect(page).toHaveURL(/\/templates\?type=ai$/);

    const legacyResponse = await page.goto(
      "templates/ai/repo/azure-samples/azure-search-openai-demo",
    );
    expect(legacyResponse?.ok()).toBeTruthy();
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: featuredTemplateTitle,
      }),
    ).toBeVisible();
  });

  test("keeps the public search payload source-only in the UI", async ({
    page,
  }) => {
    await page.route("**/ai-apps-search*", (route) =>
      route.fulfill({
        json: [
          {
            document: {
              source: featuredTemplateSource,
              email: [`private${"@"}example.com`],
            },
          },
        ],
      }),
    );
    await openAiGallery(page);
    const searchBox = page.getByPlaceholder(
      "Describe the app you want to build or search with keywords",
    );
    await searchBox.fill("privacy-check");
    await searchBox.press("Enter");

    await expect.poll(() => resultLinks(page).count()).toBe(1);
    await expect(
      page.getByText(`private${"@"}example.com`),
    ).toHaveCount(0);
  });
});
