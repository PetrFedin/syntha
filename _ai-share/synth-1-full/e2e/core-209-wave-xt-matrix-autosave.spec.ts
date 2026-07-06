import { test, expect } from '@playwright/test';

const GOTO = { waitUntil: 'domcontentloaded' as const, timeout: 90_000 };

/**
 * Wave XT: matrix draft PG autosave debounce + conflict + validation hints RU + matrix↔checkout cross-links.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-209-wave-xt-matrix-autosave.spec.ts
 */
test.describe('core-209: wave XT matrix draft autosave PG edge cases', () => {
  test('draft PUT returns sizeRunOk + validationHintsRu (PG)', async ({ request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { pgReachable?: boolean };
    test.skip(!health.pgReachable, 'нужен db:core:bootstrap + PG');

    const sessionId = `core209-draft-${Date.now()}`;
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
      sizeRunOk?: boolean;
      sizeRunMessageRu?: string;
      updatedAt?: string;
    };
    expect(json.ok).toBe(true);
    expect(Array.isArray(json.validationHintsRu)).toBe(true);
    expect(typeof json.validationOk).toBe('boolean');
    expect(typeof json.sizeRunOk).toBe('boolean');
    expect(typeof json.updatedAt).toBe('string');
  });

  test('draft PUT conflict when expectedUpdatedAt is stale (PG)', async ({ request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { pgReachable?: boolean };
    test.skip(!health.pgReachable, 'нужен PG');

    const sessionId = `core209-conflict-${Date.now()}`;
    const staleAt = '2020-01-01T00:00:00.000Z';

    const seedRes = await request.put('/api/shop/b2b/matrix/draft', {
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
    expect(seedRes.ok()).toBe(true);

    const conflictRes = await request.put('/api/shop/b2b/matrix/draft', {
      data: {
        sessionId,
        buyerId: 'shop1',
        collectionId: 'SS27',
        expectedUpdatedAt: staleAt,
        draft: {
          v: 1,
          collectionId: 'SS27',
          lines: [{ articleId: 'demo-ss27-01', colorCode: 'default', size: 'M', qty: 8 }],
          updatedAt: new Date().toISOString(),
        },
      },
    });
    expect(conflictRes.status()).toBe(409);
    const conflictJson = (await conflictRes.json()) as {
      conflict?: boolean;
      messageRu?: string;
      serverDraft?: { lines?: Array<{ qty: number }> };
    };
    expect(conflictJson.conflict).toBe(true);
    expect(conflictJson.messageRu).toMatch(/конфликт/i);
    expect(conflictJson.serverDraft?.lines?.[0]?.qty).toBe(4);
  });

  test('draft GET returns updatedAt (PG)', async ({ request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { pgReachable?: boolean };
    test.skip(!health.pgReachable, 'нужен PG');

    const sessionId = `core209-get-${Date.now()}`;
    await request.put('/api/shop/b2b/matrix/draft', {
      data: {
        sessionId,
        buyerId: 'shop1',
        collectionId: 'SS27',
        draft: {
          v: 1,
          collectionId: 'SS27',
          lines: [{ articleId: 'demo-ss27-01', colorCode: 'default', size: 'M', qty: 2 }],
          updatedAt: new Date().toISOString(),
        },
      },
    });

    const getRes = await request.get(
      `/api/shop/b2b/matrix/draft?sessionId=${encodeURIComponent(sessionId)}`
    );
    expect(getRes.ok()).toBe(true);
    const getJson = (await getRes.json()) as { updatedAt?: string; draft?: { lines?: unknown[] } };
    expect(typeof getJson.updatedAt).toBe('string');
    expect(getJson.draft?.lines?.length).toBeGreaterThan(0);
  });

  test('matrix UI: qty edit shows PG badge + validation hint', async ({ page }) => {
    const healthRes = await page.request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { pgReachable?: boolean };
    test.skip(!health.pgReachable, 'нужен PG');

    const res = await page.goto('/shop/b2b/matrix?collection=SS27', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('shop-co-matrix-shell')).toBeVisible({ timeout: 60_000 });

    const qtyInput = page.locator('[data-testid^="shop-co-matrix-qty-"]').first();
    await expect(qtyInput).toBeVisible({ timeout: 45_000 });
    await qtyInput.fill('1');
    await qtyInput.blur();

    await expect(page.getByTestId('shop-co-matrix-draft-storage-pg')).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.getByTestId('shop-co-matrix-draft-validation-hint')).toBeVisible({
      timeout: 20_000,
    });
  });

  test('checkout UI: draft autosave fail query shows matrix cross-link', async ({ page }) => {
    const healthRes = await page.request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { pgReachable?: boolean };
    test.skip(!health.pgReachable, 'нужен PG');

    const res = await page.goto(
      '/shop/b2b/checkout?collection=SS27&draftAutosaveFail=1',
      GOTO
    );
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('shop-co-checkout-draft-autosave-fail-hint')).toBeVisible({
      timeout: 60_000,
    });
    const matrixLink = page.getByTestId('shop-co-checkout-draft-autosave-matrix-link');
    await expect(matrixLink).toBeVisible({ timeout: 30_000 });
    await expect(matrixLink).toHaveAttribute('href', /\/shop\/b2b\/matrix/);
  });
});
