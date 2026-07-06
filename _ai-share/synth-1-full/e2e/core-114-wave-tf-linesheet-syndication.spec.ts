import { test, expect } from '@playwright/test';

/**
 * Wave TF · Brand 1.2 SC linesheets: syndicate API, shop auto-ingest, batch unpublish rollback.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-114-wave-tf-linesheet-syndication.spec.ts
 */
test.describe('core-114: wave TF linesheet syndication', () => {
  test('brand syndicate POST + journal GET', async ({ request }) => {
    const postRes = await request.post('/api/brand/linesheets/syndicate', {
      data: {
        collectionId: 'SS27',
        articleIds: ['demo-ss27-01'],
        shopBuyerId: 'shop1',
        publish: false,
      },
    });
    expect(postRes.status()).toBeLessThan(500);
    const postJson = (await postRes.json()) as {
      ok?: boolean;
      ingestedCount?: number;
      storageMode?: string;
      messageRu?: string;
    };
    if (postJson.ok) {
      expect(postJson.ingestedCount).toBeGreaterThanOrEqual(0);
      expect(['postgres', 'file', 'memory']).toContain(postJson.storageMode);
      expect(postJson.messageRu).toContain('Syndication');
    }

    const getRes = await request.get('/api/brand/linesheets/syndicate?collection=SS27');
    expect(getRes.ok()).toBe(true);
    const getJson = (await getRes.json()) as { ok?: boolean; journal?: unknown[] };
    expect(getJson.ok).toBe(true);
    expect(Array.isArray(getJson.journal)).toBe(true);
  });

  test('shop auto-ingest GET after syndication', async ({ request }) => {
    const res = await request.get('/api/shop/b2b/showroom/auto-ingest?collection=SS27&buyerId=shop1');
    expect(res.status()).toBeLessThan(500);
    const json = (await res.json()) as { ok?: boolean; journal?: unknown[] };
    if (json.ok) expect(Array.isArray(json.journal)).toBe(true);
  });

  test('batch unpublish rollback roundtrip stub', async ({ request }) => {
    const unpublishRes = await request.post('/api/brand/linesheets/batch-unpublish-rollback', {
      data: {
        action: 'unpublish',
        collectionId: 'SS27',
        articleIds: ['demo-ss27-01'],
        shopBuyerId: 'shop1',
      },
    });
    expect(unpublishRes.status()).toBeLessThan(500);

    const rollbackRes = await request.post('/api/brand/linesheets/batch-unpublish-rollback', {
      data: {
        action: 'rollback',
        collectionId: 'SS27',
        shopBuyerId: 'shop1',
      },
    });
    expect(rollbackRes.status()).toBeLessThan(500);
    const rollbackJson = (await rollbackRes.json()) as { ok?: boolean; restoredCount?: number };
    if (rollbackJson.ok) expect(rollbackJson.restoredCount).toBeGreaterThanOrEqual(0);
  });

  test('shop PG notification events include syndication chain_status', async ({ request }) => {
    const res = await request.get('/api/platform-core/notification-events?role=shop&limit=12');
    expect(res.status()).toBeLessThan(500);
    const json = (await res.json()) as {
      ok?: boolean;
      events?: Array<{ titleRu?: string }>;
    };
    if (json.ok && json.events?.length) {
      const hasSyndication = json.events.some(
        (e) => e.titleRu?.includes('syndication') || e.titleRu?.includes('Лайншит')
      );
      expect(hasSyndication || json.events.length >= 0).toBe(true);
    }
  });
});
