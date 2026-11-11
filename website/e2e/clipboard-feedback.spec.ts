/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { test, expect, type Page } from "@playwright/test";

declare global {
  interface Window {
    __clipboardWrite?: { resolve: () => void; reject: () => void };
    __clipboardText?: string;
  }
}

test.beforeEach(async ({ page }) => {
  await page.route(
    /https:\/\/(?:js\.monitor\.azure\.com|wcpstatic\.microsoft\.com)\//,
    (route) =>
      route.fulfill({ contentType: "application/javascript", body: "" }),
  );
  await page.route(
    "https://cachelp6qsotirqelc.z20.web.core.windows.net/**",
    (route) =>
      route.fulfill({
        json: {
          forks: 1,
          stars: 1,
          updatedOn: "2025-01-01T00:00:00.000Z",
          score: 1,
        },
      }),
  );
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: (value: string) =>
          new Promise<void>((resolve, reject) => {
            window.__clipboardText = value;
            window.__clipboardWrite = {
              resolve,
              reject: () =>
                reject(
                  new DOMException(
                    "Clipboard access denied",
                    "NotAllowedError",
                  ),
                ),
            };
          }),
      },
    });
  });
});

async function finishCopy(page: Page, success: boolean) {
  await page.evaluate((copySucceeded) => {
    const write = window.__clipboardWrite;
    if (!write) throw new Error("No clipboard write is pending");
    window.__clipboardWrite = undefined;
    if (copySucceeded) write.resolve();
    else write.reject();
  }, success);
}

test("catalog cards announce successful and failed command copies", async ({
  page,
}) => {
  await page.goto("templates");
  const button = page
    .getByRole("button", { name: /^Copy init command for / })
    .first();

  await button.click();
  await finishCopy(page, false);
  await expect(
    page.getByRole("status").filter({ hasText: "Copy unavailable" }),
  ).toBeAttached();
  const failedButton = page
    .getByRole("button", { name: "Copy unavailable" })
    .first();
  await expect(
    failedButton.locator('[data-copy-feedback="failed"]'),
  ).toBeVisible();

  await failedButton.click();
  await finishCopy(page, true);
  await expect(
    page
      .getByRole("status")
      .filter({ hasText: /^Copied init command for / }),
  ).toBeAttached();
  const copiedButton = page
    .getByRole("button", { name: /^Copied init command for / })
    .first();
  await expect(
    copiedButton.locator('[data-copy-feedback="copied"]'),
  ).toBeVisible();
});

test("start-with-code icon buttons show visible copy feedback", async ({
  page,
}) => {
  await page.goto("templates/start-with-code");
  const button = page.getByRole("button", {
    name: "Copy azd init command",
  });

  await button.click();
  await finishCopy(page, true);

  const copiedButton = page.getByRole("button", {
    name: "azd init copied",
  });
  await expect(copiedButton).toHaveAttribute(
    "aria-label",
    "azd init copied",
  );
  await expect(
    copiedButton.locator('[data-copy-feedback="copied"]'),
  ).toBeVisible();
});

test("detail actions copy the init command and stable link", async ({
  page,
}) => {
  await page.goto("templates/azure-samples/azd-starter-bicep");
  const startPanel = page.locator("aside");
  const copyButtons = startPanel.locator("button");
  const statuses = startPanel.locator('span[role="status"]');

  const commandButton = copyButtons.nth(0);
  await expect(commandButton).toHaveText("Copy init command");
  await commandButton.click();
  await finishCopy(page, true);
  await expect(commandButton).toHaveText("Init command copied");
  await expect(statuses.nth(0)).toHaveText("Init command copied");
  await expect(statuses.nth(0)).toHaveCSS("opacity", "0");

  const linkButton = copyButtons.nth(1);
  await expect(linkButton).toHaveText("Copy stable template link");
  await linkButton.click();
  await finishCopy(page, true);
  await expect(linkButton).toHaveText("Stable template link copied");
  await expect(statuses.nth(1)).toHaveText(
    "Stable template link copied",
  );
  await expect(statuses.nth(1)).toHaveCSS("opacity", "0");
});

test("catalog agent utility omits the copy link action", async ({ page }) => {
  await page.goto("templates");
  const agentSection = page.locator("section").filter({
    has: page.getByRole("heading", {
      name: "Use with your coding agent",
    }),
  });

  await expect(agentSection.getByRole("button")).toHaveCount(0);
  await expect(
    agentSection.getByRole("link", { name: "View llms.txt" }),
  ).toBeVisible();
  await expect(
    agentSection.getByRole("link", { name: "Catalog JSON" }),
  ).toHaveAttribute("href", "https://aka.ms/awesome-azd/templates.json");
});

test("extension copy feedback matches template cards", async ({ page }) => {
  await page.goto("extensions");
  const button = page
    .getByTestId("extension-command")
    .first()
    .locator("xpath=following-sibling::button[1]");
  const status = button.locator(
    "xpath=following-sibling::span[@role='status'][1]",
  );
  await button.click();

  await finishCopy(page, true);
  await expect(button).toHaveAccessibleName(
    /^Copied install command for /,
  );
  await expect(status).toContainText("Copied install command for");
  await expect(status).toHaveCSS("opacity", "0");
});
