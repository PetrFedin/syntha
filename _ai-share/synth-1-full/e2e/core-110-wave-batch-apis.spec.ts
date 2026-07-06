import { test, expect } from '@playwright/test';

/**
 * Wave batch SS–SV: PG API smoke (wizard, matrix draft, prefs, wishlist).
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-110-wave-batch-apis.spec.ts
 */
test.describe('core-110: wave batch PG APIs', () => {
  test('wizard draft GET', async ({ request }) => {
    const res = await request.get('/api/brand/production/create-article-wizard-draft/SS27');
    expect(res.status()).toBeLessThan(500);
    const json = (await res.json()) as { ok?: boolean; storageMode?: string };
    if (json.storageMode) expect(['postgres', 'memory', 'file']).toContain(json.storageMode);
  });

  test('matrix draft GET requires session', async ({ request }) => {
    const res = await request.get('/api/shop/b2b/matrix/draft');
    expect([400, 401, 403]).toContain(res.status());
  });

  test('size run validate POST', async ({ request }) => {
    const res = await request.post('/api/shop/b2b/matrix/size-run-validate', {
      data: { sizes: { S: 2, M: 4, L: 2 }, moqPerSize: 1 },
    });
    expect(res.status()).toBeLessThan(500);
  });

  test('comms notification prefs GET shop', async ({ request }) => {
    const res = await request.get('/api/platform-core/comms/notification-prefs?role=shop');
    expect(res.status()).toBeLessThan(500);
    const json = (await res.json()) as { ok?: boolean; storageMode?: string };
    if (json.ok) expect(json.storageMode).toBeTruthy();
  });

  test('assortment wishlist GET', async ({ request }) => {
    const res = await request.get(
      '/api/shop/b2b/development/assortment-wishlist?collectionId=SS27&buyerId=shop1'
    );
    expect(res.status()).toBeLessThan(500);
  });
});
