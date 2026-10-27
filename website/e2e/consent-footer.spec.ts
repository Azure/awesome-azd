/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { test, expect, type Page } from "@playwright/test";

function consentScript(required: boolean) {
  return `
    window.__consentTest = { initCalls: 0, manageCalls: 0 };
    window.WcpConsent = {
      init: function (locale, anchor, callback) {
        window.__consentTest.initCalls++;
        callback(null, {
          isConsentRequired: ${required},
          getConsent: function () {
            return { Required: true, Analytics: false, SocialMedia: false, Advertising: false };
          },
          manageConsent: function () { window.__consentTest.manageCalls++; }
        });
      }
    };
  `;
}

async function navigateToGallery(page: Page, name: string) {
  let link = page.locator(".navbar").getByRole("link", { name, exact: true }).first();
  if (!await link.isVisible()) {
    await page.locator(".navbar").getByRole("button", { name: "Toggle navigation bar", exact: true }).click();
    link = page.locator(".navbar-sidebar").getByRole("link", { name, exact: true });
  }
  await link.click();
  await expect(page.getByRole("status").filter({ hasText: /^Viewing/ })).toContainText(name.toLowerCase());
}

for (const required of [true, false]) {
  for (const late of [false, true]) {
    test(`mounted footer handles required=${required} with ${late ? "late" : "initial"} consent through native navigation`, async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.route("https://js.monitor.azure.com/**", (route) =>
        route.fulfill({ contentType: "application/javascript", body: "" }),
      );
      await page.route("https://wcpstatic.microsoft.com/**", (route) =>
        route.fulfill({
          contentType: "application/javascript",
          body: late ? "" : consentScript(required),
        }),
      );
      await page.addInitScript(() => {
        Reflect.set(window, "__consentTestDocument", Math.random());
      });
      await page.goto("./");
      const footer = page.locator("footer");
      const control = footer.locator("#manage_cookie");
      if (late) {
        await expect(control).toBeVisible();
        await expect(footer.locator(".footer__link-separator")).toHaveCount(
          await footer.locator(".footer__link-item").count() - 1,
        );
        await page.addScriptTag({ content: consentScript(required) });
      }
      await expect.poll(() => page.evaluate(() => Reflect.get(window, "__consentTest")?.initCalls)).toBe(1);
      const documentId = await page.evaluate(() => Reflect.get(window, "__consentTestDocument"));
      let actions = 0;
      for (const route of ["home", "Templates", "Extensions"]) {
        if (route !== "home") await navigateToGallery(page, route);
        await expect(control).toHaveCount(required ? 1 : 0);
        if (required) {
          await expect(control).toBeVisible();
          await expect(control).toHaveJSProperty("tagName", "BUTTON");
          await control.click();
          actions++;
          if (route === "home") {
            await control.press("Enter");
            await control.press("Space");
            actions += 2;
          }
        }
        await expect(footer.locator(".footer__link-separator")).toHaveCount(
          await footer.locator(".footer__link-item").count() - 1,
        );
        expect(await page.evaluate(() => Reflect.get(window, "__consentTest").manageCalls)).toBe(actions);
        expect(await page.evaluate(() => Reflect.get(window, "__consentTest").initCalls)).toBe(1);
        expect(await page.evaluate(() => Reflect.get(window, "__consentTestDocument"))).toBe(documentId);
      }
      expect(errors).toEqual([]);
    });
  }
}
