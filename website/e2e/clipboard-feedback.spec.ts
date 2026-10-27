/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { test, expect, type Page } from "@playwright/test";

declare global {
  interface Window {
    __clipboardWrite?: { resolve: () => void; reject: () => void };
  }
}

test.beforeEach(async ({ page }) => {
  await page.route(/https:\/\/(?:js\.monitor\.azure\.com|wcpstatic\.microsoft\.com)\//, (route) =>
    route.fulfill({ contentType: "application/javascript", body: "" }),
  );
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: () => new Promise<void>((resolve, reject) => {
          window.__clipboardWrite = {
            resolve,
            reject: () => reject(new DOMException("Clipboard access denied", "NotAllowedError")),
          };
        }),
      },
    });
  });
});

async function finishCopy(page: Page, success: boolean) {
  await page.evaluate((success) => {
    const write = window.__clipboardWrite;
    if (!write) throw new Error("No clipboard write is pending");
    window.__clipboardWrite = undefined;
    if (success) write.resolve();
    else write.reject();
  }, success);
}

for (const route of ["templates", "extensions"]) {
  test(`${route} copy feedback politely announces only successful writes`, async ({ page }) => {
    await page.goto(route);
    const button = page.getByRole("button", {
      name: route === "templates" ? /^Copy azd init command for / : /^Copy install command for /,
    }).first();
    await button.click();
    const feedback = page.getByRole("status").filter({ hasText: /^(Copying\.\.\.|Copied!)$/ });
    await expect(feedback).toHaveAttribute("aria-live", "polite");
    await expect(feedback).toHaveText("Copying...");
    await expect(page.getByRole("dialog").filter({ has: feedback })).toBeFocused();
    await expect(page.getByText("Copied!", { exact: true })).toBeHidden();

    await finishCopy(page, false);
    await expect(feedback).toBeHidden();
    await expect(button).toHaveAttribute("aria-expanded", "false");
    await expect(page.getByText("Copied!", { exact: true })).toBeHidden();
    await expect(page.getByText("Copy failed. Please try again.", { exact: true })).toBeHidden();

    await button.click();
    await expect(feedback).toHaveText("Copying...");
    await expect(page.getByRole("dialog").filter({ has: feedback })).toBeFocused();
    await finishCopy(page, true);
    await expect(feedback).toHaveText("Copied!");
  });
}

for (const { name, index } of [
  { name: "command", index: 0 },
  { name: "identifier", index: 1 },
]) {
  test(`Quick Use ${name} copy feedback politely announces only successful writes`, async ({ page }) => {
    await page.goto("templates");
    const firstCard = page.locator('[data-testid="showcase-list"] > .fui-Card').first();
    await firstCard.getByRole("button").first().click();
    const panel = page.locator(".ms-Panel-main");
    await expect(panel).toBeVisible();
    const button = panel.locator('button[id^="copyButton"]').nth(index);
    await button.click();
    const status = page.getByRole("status").filter({ hasText: /^(Copying\.\.\.|Copied)$/ });
    await expect(status).toHaveAttribute("aria-live", "polite");
    await expect(status).toHaveText("Copying...");
    await expect(page.getByRole("dialog", { name: "Copied", exact: true })).toBeHidden();

    await finishCopy(page, false);
    await expect(status).toBeHidden();
    await expect(page.getByRole("dialog", { name: "Copied", exact: true })).toBeHidden();
    await expect(page.getByText("Copy failed. Please try again.", { exact: true })).toBeHidden();

    await button.click();
    await expect(status).toHaveText("Copying...");
    await finishCopy(page, true);
    await expect(status).toHaveText("Copied");

    const feedback = page.getByRole("dialog", { name: "Copied", exact: true });
    await expect(feedback).toBeVisible();
    const labelId = await feedback.getAttribute("aria-labelledby");
    expect(labelId).not.toBeNull();
    await expect(page.locator(`[id="${labelId}"]`)).toHaveText("Copied");
    await expect(feedback).not.toHaveAttribute("aria-describedby");
  });
}
