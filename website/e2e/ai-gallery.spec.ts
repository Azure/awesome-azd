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

async function openAiGallery(page: Page) {
  const response = await page.goto("templates/ai", {
    waitUntil: "domcontentloaded",
  });
  expect(response?.ok()).toBeTruthy();
  await expect(
    page.getByRole("heading", { level: 1, name: "Build with AI" }),
  ).toBeVisible();
  await expect(
    page.locator('#ai-gallery-root[data-hydrated="true"]'),
  ).toBeVisible({ timeout: 15_000 });
  await expect.poll(() => resultLinks(page).count()).toBe(56);
}

test.describe("Unified AI app templates gallery", () => {
  test.beforeEach(async ({ context }) => {
    await stubExternalServices(context);
  });

  test("switches between the existing and AI template collections", async ({
    page,
  }) => {
    await page.goto("templates");
    const allTab = page.getByRole("tab", { name: "All templates" });
    const aiTab = page.getByRole("tab", { name: "AI app templates" });

    await expect(allTab).toHaveAttribute("aria-selected", "true");
    await expect(aiTab).toHaveAttribute("aria-selected", "false");
    await aiTab.click();

    await expect(page).toHaveURL(/\/templates\/ai\/?$/);
    await expect(
      page.getByRole("tab", { name: "AI app templates" }),
    ).toHaveAttribute("aria-selected", "true");
    await expect(
      page.getByRole("heading", { level: 1, name: "Build with AI" }),
    ).toBeVisible();
  });

  test("loads all 56 active AI templates and the original filters", async ({
    page,
  }) => {
    await openAiGallery(page);

    await expect(page.getByTestId("template-results-count")).toContainText(
      /Showing\s*56\s*templates/,
    );
    await expect(
      page.getByRole("checkbox", { name: "Python", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Collection", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Model", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Database", exact: true }),
    ).toBeVisible();
  });

  test("server-renders AI gallery content and Fluent styles", async ({
    browser,
  }) => {
    const context = await browser.newContext({
      baseURL: "http://localhost:3000/awesome-azd/",
      javaScriptEnabled: false,
    });
    const page = await context.newPage();

    const response = await page.goto("templates/ai", {
      waitUntil: "domcontentloaded",
    });

    expect(response?.ok()).toBeTruthy();
    if (!response) {
      throw new Error("AI gallery response was not available");
    }
    expect(await response.text()).toContain('data-precedence="griffel-0"');
    await expect(
      page.getByRole("heading", { level: 1, name: "Build with AI" }),
    ).toBeVisible();
    await expect(
      page.getByRole("combobox", { name: "Sort Options" }),
    ).toHaveCSS("display", "grid");
    await expect(
      page.getByRole("checkbox", { name: "Python", exact: true }),
    ).toHaveCSS("opacity", "0");

    await context.close();
  });

  test("filters the AI collection and synchronizes the URL", async ({
    page,
  }) => {
    await openAiGallery(page);
    const pythonFilter = page.getByRole("checkbox", {
      name: "Python",
      exact: true,
    });

    await pythonFilter.check();

    await expect(pythonFilter).toBeChecked();
    await expect(page).toHaveURL(/(?:\?|&)tags=python(?:&|$)/);
    await expect.poll(() => resultLinks(page).count()).toBeLessThan(56);
    expect(await resultLinks(page).count()).toBeGreaterThan(0);
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

    const searchBox = page.getByPlaceholder("Search templates");
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
    const searchBox = page.getByPlaceholder("Search templates");

    await searchBox.fill("azure");
    await searchBox.press("Enter");

    await expect(page).toHaveURL(/(?:\?|&)name=azure(?:&|$)/);
    await expect.poll(() => resultLinks(page).count()).toBeGreaterThan(0);
    expect(await resultLinks(page).count()).toBeLessThan(56);
  });

  test("opens the nested AI detail route and returns to the AI tab", async ({
    page,
  }) => {
    await openAiGallery(page);
    const templateLink = resultLinks(page).filter({
      hasText: featuredTemplateTitle,
    });

    await expect(templateLink).toHaveAttribute(
      "href",
      "/awesome-azd/templates/ai/repo/azure-samples/azure-search-openai-demo",
    );
    await page.goto("templates/ai/repo/azure-samples/azure-search-openai-demo");

    await expect(
      page.getByText(featuredTemplateTitle, { exact: true }),
    ).toBeVisible();
    await expect(page.getByText("Resources included")).toBeVisible();
    await page.getByRole("button", { name: "Back to templates" }).click();
    await expect(page).toHaveURL(/\/templates\/ai\/?$/);
  });

  test("server-renders Fluent styles on AI detail actions", async ({
    browser,
  }) => {
    const context = await browser.newContext({
      baseURL: "http://localhost:3000/awesome-azd/",
      javaScriptEnabled: false,
    });
    const page = await context.newPage();

    const response = await page.goto(
      "templates/ai/repo/azure-samples/azure-search-openai-demo",
      { waitUntil: "domcontentloaded" },
    );

    expect(response?.ok()).toBeTruthy();
    if (!response) {
      throw new Error("AI template detail response was not available");
    }
    const html = await response.text();
    expect(html).toContain('data-precedence="griffel-0"');
    await expect(
      page.getByRole("button", {
        name: "Open in VS Code for the Web",
      }),
    ).toHaveCSS("background-color", "rgb(15, 108, 189)");

    await context.close();
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
    const searchBox = page.getByPlaceholder("Search templates");
    await searchBox.fill("privacy-check");
    await searchBox.press("Enter");

    await expect.poll(() => resultLinks(page).count()).toBe(1);
    const privateAddress = `private${"@"}example.com`;
    await expect(page.getByText(privateAddress)).toHaveCount(0);
  });
});
