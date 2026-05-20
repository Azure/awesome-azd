import { test, expect } from "@playwright/test";

// End-to-end coverage modeled on Azure/ai-app-templates' website.spec.ts.
// Validates that the gallery actually renders templates, that search and
// section filters narrow results, and that the live "Viewing N templates"
// counter is consistent with the rendered card count.
test.describe("Gallery functionality (deploy gate)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("./");
    await page.waitForLoadState("networkidle");
    await page.waitForSelector(".fui-Card", { timeout: 15_000 });
  });

  test("homepage renders without 404 / error fallback", async ({ page }) => {
    const body = (await page.textContent("body")) ?? "";
    expect(body).not.toContain("Page Not Found");
    expect(body).not.toContain("404 Not Found");
    await expect(page.locator("body")).toBeVisible();
  });

  test("gallery shows a healthy number of templates", async ({ page }) => {
    const cards = page.locator(".fui-Card");
    const count = await cards.count();
    console.log(`Initial template card count: ${count}`);

    // Deploy-gate guardrail: if the data pipeline regresses or the gallery
    // fails to hydrate, count drops to ~0. A real release has dozens.
    expect(count).toBeGreaterThanOrEqual(20);
  });

  test('live counter ("Viewing N templates") matches rendered cards', async ({
    page,
  }) => {
    const cards = page.locator(".fui-Card");
    const rendered = await cards.count();

    const status = page.locator('[role="status"][aria-live="polite"]').first();
    await expect(status).toBeVisible();
    const statusText = (await status.textContent()) ?? "";
    const match = statusText.match(/(\d+)/);
    expect(match, `expected a number in status: "${statusText}"`).not.toBeNull();
    const reported = Number(match![1]);

    // The status counter reports the gallery template count. Featured/static
    // cards may inflate the DOM card count slightly, so allow equality or
    // a small overcount but never an undercount.
    expect(rendered).toBeGreaterThanOrEqual(reported);
    expect(reported).toBeGreaterThan(0);
  });

  test('search "azure" narrows results but keeps some', async ({ page }) => {
    const cards = page.locator(".fui-Card");
    const initial = await cards.count();
    expect(initial).toBeGreaterThan(0);

    const searchInput = page.locator("#filterBar");
    await searchInput.click();
    await searchInput.fill("azure");

    // URL reflects the query, then card count settles.
    await expect(page).toHaveURL(/name=azure/);

    // Wait until the rendered set actually changes from the unfiltered baseline.
    await expect
      .poll(async () => cards.count(), { timeout: 10_000 })
      .not.toBe(initial);

    const filtered = await cards.count();
    console.log(`Cards after searching "azure": ${filtered}`);
    expect(filtered).toBeGreaterThan(0);
    expect(filtered).toBeLessThanOrEqual(initial);
  });

  test("nonsense search shows the empty-state message", async ({ page }) => {
    const searchInput = page.locator("#filterBar");
    await searchInput.click();
    await searchInput.fill("zzzznonexistenttemplate");

    await expect(page.locator("text=No templates found")).toBeVisible({
      timeout: 10_000,
    });
  });

  test("section filter (Language) changes the number of templates", async ({
    page,
  }) => {
    const cards = page.locator(".fui-Card");
    const initial = await cards.count();
    expect(initial).toBeGreaterThan(0);

    // The left-side filter panel uses checkboxes; clicking one applies a
    // tag filter and updates the URL with ?tags=...
    const pythonCheckbox = page.getByLabel(/^python/i).first();
    await expect(pythonCheckbox).toBeVisible({ timeout: 10_000 });
    await pythonCheckbox.click();

    await expect(page).toHaveURL(/tags=/);
    await expect
      .poll(async () => cards.count(), { timeout: 10_000 })
      .not.toBe(initial);

    const filtered = await cards.count();
    console.log(`Cards after filtering by Python: ${filtered}`);
    expect(filtered).toBeGreaterThan(0);
    expect(filtered).toBeLessThan(initial);
  });

  test("clearing search restores the full gallery", async ({ page }) => {
    const cards = page.locator(".fui-Card");
    const initial = await cards.count();

    const searchInput = page.locator("#filterBar");
    await searchInput.fill("python");
    await expect(page).toHaveURL(/name=python/);
    await expect
      .poll(async () => cards.count(), { timeout: 10_000 })
      .not.toBe(initial);

    await searchInput.clear();
    await expect(page).not.toHaveURL(/name=python/);
    await expect
      .poll(async () => cards.count(), { timeout: 10_000 })
      .toBe(initial);
  });
});
