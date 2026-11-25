/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page, baseURL }) => {
  const origin = new URL(baseURL!).origin;
  // Block hydration but leave Docusaurus's inline theme script enabled.
  await page.route("**/*", (route) => {
    const request = route.request();
    if (
      request.resourceType() === "script" ||
      new URL(request.url()).origin !== origin
    ) {
      return route.abort();
    }
    return route.continue();
  });
});

test("the homepage canvas is dark before the site stylesheet loads", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.route("**/*.css", (route) => route.abort());
  await page.goto("./", { waitUntil: "domcontentloaded" });

  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  // Resolve the browser's system canvas color without the site's CSS.
  const canvasColor = await page.locator("html").evaluate((html) => {
    html.style.backgroundColor = "Canvas";
    return getComputedStyle(html).backgroundColor;
  });
  expect(canvasColor).not.toBe("rgb(255, 255, 255)");
});

for (const { name, query, theme, background } of [
  {
    name: "system dark mode",
    query: "",
    theme: "dark",
    background: "rgb(31, 31, 31)",
  },
  {
    name: "an explicit light theme in system dark mode",
    query: "?docusaurus-theme=light",
    theme: "light",
    background: "rgb(250, 250, 250)",
  },
] as const) {
  test(`the catalog matches ${name} before hydration`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto(`templates${query}`, { waitUntil: "domcontentloaded" });

    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    await expect(page.getByRole("main")).toHaveCSS("background-color", background);
  });
}
