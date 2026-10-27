/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { test, expect } from "@playwright/test";

for (const { name, index } of [
  { name: "command", index: 0 },
  { name: "identifier", index: 1 },
]) {
  test(`Quick Use ${name} copy feedback has a real accessible label`, async ({ page }) => {
    await page.route("https://js.monitor.azure.com/**", (route) =>
      route.fulfill({ contentType: "application/javascript", body: "" }),
    );
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: { writeText: async () => {} },
      });
    });
    await page.goto("templates");
    const firstCard = page.locator('[data-testid="showcase-list"] > .fui-Card').first();
    await firstCard.getByRole("button").first().click();
    const panel = page.locator(".ms-Panel-main");
    await expect(panel).toBeVisible();
    await panel.locator('button[id^="copyButton"]').nth(index).click();

    const feedback = page.getByRole("dialog", { name: "Copied", exact: true });
    await expect(feedback).toBeVisible();
    const labelId = await feedback.getAttribute("aria-labelledby");
    expect(labelId).not.toBeNull();
    await expect(page.locator(`[id="${labelId}"]`)).toHaveText("Copied");
    await expect(feedback).not.toHaveAttribute("aria-describedby");
  });
}
