import { test, expect } from '@playwright/test';

const GOTO = { waitUntil: 'domcontentloaded' as const, timeout: 90_000 };

/**
 * Wave SV: shop empty development pillar — bridge, wishlist PG, dossier preview, sample request.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-107-wave-sv-shop-dev-bridge.spec.ts
 */
test.describe('core-107: wave SV shop dev bridge', () => {
  test('shop development bridge mounts peer strip + wishlist', async ({ page, request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { demoSeeded?: boolean };
    test.skip(!health.demoSeeded, 'нужен db:core:bootstrap');

    await page.goto('/shop/core?pillar=development&collection=SS27', GOTO);
    await expect(page.getByTestId('shop-development-bridge')).toBeVisible({ timeout: 60_000 });
    await expect(page.getByTestId('shop-dev-bridge-peer-strip')).toBeVisible();
    await expect(page.getByTestId('shop-dev-bridge-assortment-wishlist-strip')).toBeVisible();
    await expect(page.getByTestId('shop-development-bridge-brand-w2-preview')).toBeVisible();
  });

  test('dossier preview dialog opens read-only', async ({ page, request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { demoSeeded?: boolean };
    test.skip(!health.demoSeeded, 'нужен db:core:bootstrap');

    await page.goto('/shop/core?pillar=development&collection=SS27', GOTO);
    await expect(page.getByTestId('shop-development-bridge')).toBeVisible({ timeout: 60_000 });
    await page.getByTestId('shop-development-bridge-brand-w2-preview').click();
    const dialog = page.getByTestId('shop-development-bridge-dossier-preview-dialog');
    await expect(dialog).toBeVisible({ timeout: 15_000 });
    await expect(dialog).toContainText(/read-only|Техпак бренда/i);
  });

  test('assortment wishlist POST + request sample API', async ({ request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { pgReachable?: boolean };
    test.skip(!health.pgReachable, 'нужен PG');

    const articleId = `sv-${Date.now()}`;
    const postRes = await request.post('/api/shop/b2b/development/assortment-wishlist', {
      data: { buyerId: 'shop1', collectionId: 'SS27', articleId },
    });
    expect(postRes.ok()).toBe(true);
    const postJson = (await postRes.json()) as { ok?: boolean; storageMode?: string };
    expect(postJson.ok).toBe(true);

    const getRes = await request.get(
      '/api/shop/b2b/development/assortment-wishlist?buyerId=shop1&collectionId=SS27'
    );
    expect(getRes.ok()).toBe(true);
    const getJson = (await getRes.json()) as { items?: { articleId: string }[] };
    expect(getJson.items?.some((i) => i.articleId === articleId)).toBe(true);

    const sampleRes = await request.post('/api/shop/b2b/development/request-sample', {
      data: { buyerId: 'shop1', collectionId: 'SS27', articleId },
    });
    expect(sampleRes.ok()).toBe(true);
    const sampleJson = (await sampleRes.json()) as { ok?: boolean; messageRu?: string };
    expect(sampleJson.ok).toBe(true);
    expect(sampleJson.messageRu).toMatch(/бренд/i);
  });

  test('replenishment stock slice PG persist', async ({ request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { pgReachable?: boolean };
    test.skip(!health.pgReachable, 'нужен PG');

    const putRes = await request.put('/api/shop/b2b/replenishment/stock-slice', {
      data: {
        buyerId: 'shop1',
        orgId: 'org-shop-001',
        seasonId: 'SS27',
        collectionId: 'SS27',
        labelRu: 'SS27 · core-107',
      },
    });
    expect(putRes.ok()).toBe(true);
    const getRes = await request.get('/api/shop/b2b/replenishment/stock-slice?buyerId=shop1');
    expect(getRes.ok()).toBe(true);
    const getJson = (await getRes.json()) as { slice?: { seasonId?: string } };
    expect(getJson.slice?.seasonId).toBe('SS27');
  });
});
