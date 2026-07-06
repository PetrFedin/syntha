import { test, expect } from '@playwright/test';

const GOTO = { waitUntil: 'domcontentloaded' as const, timeout: 90_000 };

/**
 * Wave ST: matrix draft PG autosave + size-run validate GET/POST.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-105-wave-st-matrix-autosave.spec.ts
 */
test.describe('core-105: wave ST matrix draft PG autosave', () => {
  test('matrix draft PUT/GET roundtrip (PG)', async ({ request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { pgReachable?: boolean };
    test.skip(!health.pgReachable, 'нужен db:core:bootstrap + PG');

    const sessionId = `core105-draft-${Date.now()}`;
    const putRes = await request.put('/api/shop/b2b/matrix/draft', {
      data: {
        sessionId,
        buyerId: 'shop1',
        collectionId: 'SS27',
        draft: {
          v: 1,
          collectionId: 'SS27',
          lines: [{ articleId: 'demo-ss27-01', colorCode: 'default', size: 'M', qty: 4 }],
          updatedAt: new Date().toISOString(),
        },
      },
    });
    expect(putRes.ok()).toBe(true);
    const putJson = (await putRes.json()) as { ok?: boolean; storageMode?: string };
    expect(putJson.ok).toBe(true);
    expect(putJson.storageMode).toBe('postgres');

    const getRes = await request.get(
      `/api/shop/b2b/matrix/draft?sessionId=${encodeURIComponent(sessionId)}`
    );
    expect(getRes.ok()).toBe(true);
    const getJson = (await getRes.json()) as {
      draft?: { lines?: Array<{ qty: number }> };
      storageMode?: string;
    };
    expect(getJson.storageMode).toBe('postgres');
    expect(getJson.draft?.lines?.[0]?.qty).toBe(4);
  });

  test('size-run validate POST + GET (curve + MOQ)', async ({ request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { pgReachable?: boolean };
    test.skip(!health.pgReachable, 'нужен PG');

    const postRes = await request.post('/api/shop/b2b/matrix/size-run-validate', {
      data: {
        collectionId: 'SS27',
        articleId: 'demo-ss27-01',
        qtyBySize: { XS: 1, S: 2, M: 3, L: 2, XL: 1 },
      },
    });
    expect(postRes.ok()).toBe(true);
    const postJson = (await postRes.json()) as { ok?: boolean; moqPerCell?: number };
    expect(typeof postJson.moqPerCell).toBe('number');

    const getRes = await request.get(
      '/api/shop/b2b/matrix/size-run-validate?collectionId=SS27&articleId=demo-ss27-01&qtyBySize=' +
        encodeURIComponent(JSON.stringify({ M: 1 }))
    );
    expect(getRes.ok()).toBe(true);
    const getJson = (await getRes.json()) as { ok?: boolean; violations?: string[] };
    expect(typeof getJson.ok).toBe('boolean');
  });

  test('matrix UI shows PG draft badge after qty edit', async ({ page }) => {
    const healthRes = await page.request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { pgReachable?: boolean };
    test.skip(!health.pgReachable, 'нужен PG');

    const res = await page.goto('/shop/b2b/matrix?collection=SS27', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('shop-co-matrix-shell')).toBeVisible({ timeout: 60_000 });

    const qtyInput = page.locator('[data-testid^="shop-co-matrix-qty-"]').first();
    await expect(qtyInput).toBeVisible({ timeout: 45_000 });
    await qtyInput.fill('6');
    await qtyInput.blur();

    await expect(page.getByTestId('shop-co-matrix-draft-storage-pg')).toBeVisible({
      timeout: 15_000,
    });
  });
});
