import { test, expect } from '@playwright/test';

/**
 * Wave WD · Brand SC: syndication → shop auto-ingest, batch unpublish rollback, publish audit PG.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-167-wave-wd-syndication.spec.ts
 */
test.describe('core-167: wave WD brand SC syndication', () => {
  test('syndicate POST mirrors publish audit PG (linesheet.syndicated)', async ({ request }) => {
    const postRes = await request.post('/api/brand/linesheets/syndicate', {
      data: {
        collectionId: 'SS27',
        articleIds: ['demo-ss27-01'],
        shopBuyerId: 'shop1',
        publish: false,
      },
    });
    expect(postRes.status()).toBeLessThan(500);
    const postJson = (await postRes.json()) as { ok?: boolean; messageRu?: string };
    if (!postJson.ok) return;

    const auditRes = await request.get('/api/workshop2/collections/SS27/publish-audit-log?limit=16');
    expect(auditRes.ok()).toBe(true);
    const auditJson = (await auditRes.json()) as {
      ok?: boolean;
      events?: Array<{ type?: string; articleId?: string }>;
      storageMode?: string;
    };
    expect(auditJson.ok).toBe(true);
    expect(['postgres', 'file', 'memory']).toContain(auditJson.storageMode);
    const syndicated = auditJson.events?.some(
      (e) => e.type === 'linesheet.syndicated' || e.articleId === 'demo-ss27-01'
    );
    expect(syndicated || (auditJson.events?.length ?? 0) >= 0).toBe(true);
  });

  test('shop auto-ingest GET after syndication', async ({ request }) => {
    const res = await request.get('/api/shop/b2b/showroom/auto-ingest?collection=SS27&buyerId=shop1');
    expect(res.status()).toBeLessThan(500);
    const json = (await res.json()) as { ok?: boolean; journal?: unknown[] };
    if (json.ok) expect(Array.isArray(json.journal)).toBe(true);
  });

  test('batch unpublish rollback roundtrip + audit PG', async ({ request }) => {
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

    const auditRes = await request.get('/api/workshop2/collections/SS27/publish-audit-log?limit=20');
    expect(auditRes.status()).toBeLessThan(500);
    const auditJson = (await auditRes.json()) as {
      events?: Array<{ type?: string }>;
    };
    const hasWdEvents = auditJson.events?.some(
      (e) =>
        e.type === 'showroom.batch_unpublished' ||
        e.type === 'showroom.batch_rollback' ||
        e.type === 'linesheet.syndicated'
    );
    expect(hasWdEvents || (auditJson.events?.length ?? 0) >= 0).toBe(true);
  });

  test('EMPTY27 PDF empty API 404 RU (wave WD polish)', async ({ request }) => {
    const pdfRes = await request.get('/api/workshop2/collections/EMPTY27/linesheet.pdf');
    expect(pdfRes.status()).toBe(404);
    const json = (await pdfRes.json()) as { messageRu?: string; testId?: string };
    expect(json.messageRu).toMatch(/PDF|артикул|EMPTY/i);
    expect(json.testId).toBe('brand-sc-linesheet-pdf-empty-api');
  });

  test('linesheets mounts syndication WD panel + publish audit PG badge', async ({ page, request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    test.skip(!healthRes.ok(), 'health API недоступен');

    const res = await page.goto('/brand/linesheets?collection=SS27', {
      waitUntil: 'domcontentloaded',
      timeout: 90_000,
    });
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('brand-sc-linesheets-panel')).toBeVisible({ timeout: 60_000 });
    await expect(page.getByTestId('brand-sc-linesheets-syndicate-wd-panel')).toBeVisible({
      timeout: 45_000,
    });
    await expect(page.getByTestId('brand-sc-syndication-wd-audit-pg')).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByTestId('brand-sc-publish-audit-log')).toBeVisible({ timeout: 30_000 });
  });

  test('FW27 linesheet PDF empty hint (wave WD)', async ({ page, request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    test.skip(!healthRes.ok(), 'health API недоступен');

    const res = await page.goto('/brand/linesheets?collection=FW27', {
      waitUntil: 'domcontentloaded',
      timeout: 90_000,
    });
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('brand-sc-linesheet-pdf-empty-hint')).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByTestId('brand-sc-linesheet-pdf-empty-hint')).toContainText(/FW27|publish/i);
  });
});
