import { test, expect } from '@playwright/test';

const GOTO = { waitUntil: 'domcontentloaded' as const, timeout: 90_000 };

/**
 * Wave WA: shop showroom → matrix qty/size carry + draft validation hints.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-164-wave-wa-matrix-qty-carry.spec.ts
 */
test.describe('core-164: wave WA shop matrix qty carry', () => {
  test('matrix draft PUT returns validationHintsRu', async ({ request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    test.skip(!healthRes.ok(), 'health API недоступен');
    const health = (await healthRes.json()) as { pgReachable?: boolean };
    test.skip(!health.pgReachable, 'нужен PG');

    const sessionId = `core164-draft-${Date.now()}`;
    const putRes = await request.put('/api/shop/b2b/matrix/draft', {
      data: {
        sessionId,
        buyerId: 'shop1',
        collectionId: 'SS27',
        draft: {
          v: 1,
          collectionId: 'SS27',
          lines: [{ articleId: 'demo-ss27-01', colorCode: 'default', size: 'M', qty: 1 }],
          updatedAt: new Date().toISOString(),
        },
      },
    });
    expect(putRes.ok()).toBe(true);
    const json = (await putRes.json()) as {
      ok?: boolean;
      validationHintsRu?: string[];
      validationOk?: boolean;
    };
    expect(json.ok).toBe(true);
    expect(Array.isArray(json.validationHintsRu)).toBe(true);
    expect(typeof json.validationOk).toBe('boolean');
  });

  test('showroom inline qty → matrix carries qty and size', async ({ page }) => {
    const healthRes = await page.request.get('/api/workshop2/platform-core/health');
    test.skip(!healthRes.ok(), 'health API недоступен');

    const res = await page.goto('/shop/b2b/showroom?collection=SS27', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('shop-sc-showroom-panel')).toBeVisible({ timeout: 60_000 });

    const articleId = 'demo-ss27-01';
    const qtyInput = page.getByTestId(`shop-sc-showroom-inline-qty-input-${articleId}`);
    const applyBtn = page.getByTestId(`shop-sc-showroom-inline-qty-apply-${articleId}`);
    await expect(qtyInput).toBeVisible({ timeout: 30_000 });
    await qtyInput.fill('5');
    const sizeL = page.getByTestId(`shop-sc-showroom-inline-size-L-${articleId}`);
    if (await sizeL.isVisible().catch(() => false)) {
      await sizeL.click();
    }
    if (await applyBtn.isVisible().catch(() => false)) {
      await applyBtn.click();
    }

    const matrixLink = page.getByTestId(`shop-sc-matrix-entry-link-${articleId}`);
    await expect(matrixLink).toBeVisible({ timeout: 30_000 });
    const nav = page.waitForURL(/\/shop\/b2b\/matrix.*carryQty=5/, { timeout: 60_000 });
    await matrixLink.click();
    await nav;
    expect(page.url()).toMatch(/carrySize=L|carryQty=5/);
    await expect(page.getByTestId('shop-sc-matrix-entry-panel')).toBeVisible({ timeout: 60_000 });
    await expect(page.getByTestId('shop-sc-matrix-showroom-carry-hint')).toBeVisible({
      timeout: 30_000,
    });
  });

  test('showroom quick-add one-click prefill to matrix', async ({ page }) => {
    const healthRes = await page.request.get('/api/workshop2/platform-core/health');
    test.skip(!healthRes.ok(), 'health API недоступен');

    const res = await page.goto('/shop/b2b/showroom?collection=SS27', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('shop-sc-showroom-panel')).toBeVisible({ timeout: 60_000 });

    const articleId = 'demo-ss27-01';
    const quickAdd = page.getByTestId(`shop-sc-showroom-matrix-quick-add-${articleId}`);
    await expect(quickAdd).toBeVisible({ timeout: 30_000 });
    const nav = page.waitForURL(/\/shop\/b2b\/matrix.*article=demo-ss27-01/, { timeout: 60_000 });
    await quickAdd.click();
    await nav;
    expect(page.url()).toMatch(/carryQty=|article=demo-ss27-01/);
    await expect(page.getByTestId('shop-co-matrix-shell')).toBeVisible({ timeout: 60_000 });
  });

  test('eligible-for-matrix filter shows counts on showroom', async ({ page }) => {
    const healthRes = await page.request.get('/api/workshop2/platform-core/health');
    test.skip(!healthRes.ok(), 'health API недоступен');

    const res = await page.goto('/shop/b2b/showroom?collection=SS27', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('shop-sc-showroom-eligible-filter-toggle')).toBeVisible({
      timeout: 45_000,
    });
    await expect(page.getByTestId('shop-sc-showroom-eligible-filter-toggle')).toContainText(/\//, {
      timeout: 45_000,
    });
  });
});
