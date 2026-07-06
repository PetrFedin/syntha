import { test, expect } from '@playwright/test';

/**
 * Wave TK–TO batch API smoke.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-115-wave-tk-tl-tm-batch.spec.ts
 */
test.describe('core-115: wave TK TL TM batch', () => {
  test('tier-sync POST', async ({ request }) => {
    const res = await request.post('/api/brand/b2b/pricelist/tier-sync', {
      data: { collectionId: 'SS27', tierId: 'standard' },
    });
    expect(res.status()).toBeLessThan(500);
  });

  test('showroom eligible-for-matrix GET', async ({ request }) => {
    const res = await request.get(
      '/api/shop/b2b/showroom/eligible-for-matrix?collectionId=SS27&buyerId=shop1'
    );
    expect(res.status()).toBeLessThan(500);
    const json = (await res.json()) as { ok?: boolean; storageMode?: string };
    if (json.ok) expect(['pg', 'file', 'memory', 'postgres']).toContain(json.storageMode);
  });

  test('publish audit PG journal', async ({ request }) => {
    const res = await request.get('/api/workshop2/collections/SS27/publish-audit-log?limit=5');
    expect(res.status()).toBeLessThan(500);
    const json = (await res.json()) as { storageMode?: string };
    if (json.storageMode) expect(['postgres', 'memory', 'file']).toContain(json.storageMode);
  });
});
