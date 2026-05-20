import { test, expect } from "@playwright/test";

// End-to-end coverage modeled on Azure/ai-app-templates' website.spec.ts,
// adapted for awesome-azd's paginated gallery (20 cards/page). Assertions
// against the filtered template *total* read the live "Viewing N templates"
// status text, since the rendered `.fui-Card` count is capped by pagination.
test.describe("Gallery functionality (deploy gate)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("./");
    await page.waitForLoadState("networkidle");
    await page.waitForSelector(".fui-Card", { timeout: 15_000 });
  });

  // Reads the integer from the "Viewing N templates" live region.
  async function viewingCount(page: import("@playwright/test").Page): Promise<number> {
    const status = page.locator('[role="status"][aria-live="polite"]').first();
    await expect(status).toBeVisible();
    const text = (await status.textContent()) ?? "";
    const m = text.match(/(\d+)/);
    expect(m, `expected a number in status: "${text}"`).not.toBeNull();
    return Number(m![1]);
  }

  test("homepage renders without 404 / error fallback", async ({ page }) => {
    const body = (await page.textContent("body")) ?? "";
    expect(body).not.toContain("Page Not Found");
    expect(body).not.toContain("404 Not Found");
    await expect(page.locator("body")).toBeVisible();
  });

  test("gallery shows a healthy number of templates", async ({ page }) => {
    // Deploy-gate guardrail: if the data pipeline regresses or the gallery
    // fails to hydrate, the live counter drops to ~0. A real release has 100+.
    const total = await viewingCount(page);
    console.log(`Initial gallery total: ${total}`);
    expect(total).toBeGreaterThanOrEqual(50);
  });

  test("page renders at least one template card", async ({ page }) => {
    const cards = page.locator(".fui-Card");
    const rendered = await cards.count();
    expect(rendered).toBeGreaterThan(0);
  });

  test('search "azure" narrows results but keeps some', async ({ page }) => {
    const initial = await viewingCount(page);
    expect(initial).toBeGreaterThan(0);

    const searchInput = page.locator("#filterBar");
    await searchInput.click();
    await searchInput.fill("azure");
    // The SearchBox's onSearch (URL update + filtering) only fires on Enter.
    await searchInput.press("Enter");

    await expect(page).toHaveURL(/name=azure/);
    await expect
      .poll(async () => viewingCount(page), { timeout: 10_000 })
      .not.toBe(initial);

    const filtered = await viewingCount(page);
    console.log(`Gallery total after searching "azure": ${filtered}`);
    expect(filtered).toBeGreaterThan(0);
    expect(filtered).toBeLessThanOrEqual(initial);
  });

  test("nonsense search shows the empty-state message", async ({ page }) => {
    const searchInput = page.locator("#filterBar");
    await searchInput.click();
    await searchInput.fill("zzzznonexistenttemplate");
    await searchInput.press("Enter");

    await expect(page.locator("text=No templates found")).toBeVisible({
      timeout: 10_000,
    });
  });

  test("section filter (Language → Python) narrows the gallery", async ({
    page,
  }) => {
    const initial = await viewingCount(page);
    expect(initial).toBeGreaterThan(0);

    // The left-side filter panel uses checkboxes; clicking one applies a
    // tag filter and updates the URL with ?tags=...
    const pythonCheckbox = page.getByLabel(/^python/i).first();
    await expect(pythonCheckbox).toBeVisible({ timeout: 10_000 });
    await pythonCheckbox.click();

    await expect(page).toHaveURL(/tags=/);
    await expect
      .poll(async () => viewingCount(page), { timeout: 10_000 })
      .not.toBe(initial);

    const filtered = await viewingCount(page);
    console.log(`Gallery total after filtering by Python: ${filtered}`);
    expect(filtered).toBeGreaterThan(0);
    expect(filtered).toBeLessThan(initial);
  });

  test("clearing search restores the full gallery", async ({ page }) => {
    const initial = await viewingCount(page);

    const searchInput = page.locator("#filterBar");
    await searchInput.fill("python");
    await searchInput.press("Enter");
    await expect(page).toHaveURL(/name=python/);
    await expect
      .poll(async () => viewingCount(page), { timeout: 10_000 })
      .not.toBe(initial);

    await searchInput.clear();
    await expect(page).not.toHaveURL(/name=python/);
    await expect
      .poll(async () => viewingCount(page), { timeout: 10_000 })
      .toBe(initial);
  });
});
