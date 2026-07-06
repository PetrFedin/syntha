import { test, expect } from '@playwright/test';

const GOTO = { waitUntil: 'domcontentloaded' as const, timeout: 90_000 };

/**
 * Wave WV: shop empty dev pillar — sample request → brand notification, dossier preview RU, wishlist PG.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-185-wave-wv-dev-bridge.spec.ts
 */
test.describe('core-185: wave WV shop dev bridge', () => {
  test('dossier preview dialog RU + request sample from preview', async ({ page }) => {
    const res = await page.goto('/shop/core?pillar=development&collection=SS27', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('shop-development-bridge')).toBeVisible({ timeout: 60_000 });
    await page.getByTestId('shop-development-bridge-brand-w2-preview').click();
    const dialog = page.getByTestId('shop-development-bridge-dossier-preview-dialog');
    await expect(dialog).toBeVisible({ timeout: 30_000 });
    await expect(dialog).toContainText(/Только просмотр|редактирование ТЗ/i);
    await expect(page.getByTestId('shop-dev-bridge-request-sample-preview-btn')).toBeVisible();
    await page.getByTestId('shop-dev-bridge-request-sample-preview-btn').click();
    await expect(page.getByTestId('shop-dev-bridge-request-sample-msg')).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByTestId('shop-dev-bridge-request-sample-msg')).toContainText(/бренд/i);
  });

  test('peer strip golden path without duplicate card CTAs', async ({ page }) => {
    await page.goto('/shop/core?pillar=development&collection=SS27', GOTO);
    await expect(page.getByTestId('shop-development-bridge')).toBeVisible({ timeout: 60_000 });
    await expect(page.getByTestId('shop-dev-bridge-peer-strip')).toBeVisible();
    await expect(page.getByTestId('shop-development-bridge-brand-w2')).toHaveCount(0);
    await expect(page.getByTestId('shop-development-bridge-showroom')).toHaveCount(0);
  });

  test('POST request-sample + PUT wishlist PG API', async ({ request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { pgReachable?: boolean };
    test.skip(!health.pgReachable, 'нужен PG');

    const articleId = `wv-${Date.now()}`;
    const putRes = await request.put('/api/shop/b2b/development/assortment-wishlist', {
      data: {
        buyerId: 'shop1',
        collectionId: 'SS27',
        items: [{ articleId, noteRu: 'core-185' }],
      },
    });
    expect(putRes.ok()).toBe(true);
    const putJson = (await putRes.json()) as { ok?: boolean; storageMode?: string };
    expect(putJson.ok).toBe(true);
    expect(putJson.storageMode).toBe('postgres');

    const sampleRes = await request.post('/api/shop/b2b/development/request-sample', {
      data: { buyerId: 'shop1', collectionId: 'SS27', articleId },
    });
    expect(sampleRes.ok()).toBe(true);
    const sampleJson = (await sampleRes.json()) as { ok?: boolean; messageRu?: string; eventId?: string };
    expect(sampleJson.ok).toBe(true);
    expect(sampleJson.messageRu).toMatch(/бренд/i);
    expect(sampleJson.eventId).toBeTruthy();
  });

  test('wishlist strip remove control visible when items present', async ({ page, request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { pgReachable?: boolean };
    test.skip(!health.pgReachable, 'нужен PG');

    const articleId = `wv-ui-${Date.now()}`;
    await request.post('/api/shop/b2b/development/assortment-wishlist', {
      data: { buyerId: 'shop1', collectionId: 'SS27', articleId },
    });

    await page.goto('/shop/core?pillar=development&collection=SS27', GOTO);
    await expect(page.getByTestId('shop-dev-bridge-assortment-wishlist-strip')).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByTestId(`shop-dev-bridge-wishlist-remove-${articleId}`)).toBeVisible({
      timeout: 30_000,
    });
  });
});
