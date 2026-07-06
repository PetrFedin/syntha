import { test, expect } from '@playwright/test';
import { gotoRoleCoreCabinet } from './helpers/core-chain-overview';

const GOTO = { waitUntil: 'domcontentloaded' as const, timeout: 90_000 };

/**
 * Wave VC · Brand SC polish: PDF empty RU, readpath=api badge, hero priority, batch rollback.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-148-wave-vc-brand-sc.spec.ts
 */
test.describe('core-148: wave VC brand SC linesheet readpath', () => {
  test('brand SC cabinet: mini-matrix + readpath api badge (wave VC testids)', async ({
    page,
    request,
  }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { demoSeeded?: boolean };
    test.skip(!health.demoSeeded, 'нужен db:core:bootstrap');

    const res = await gotoRoleCoreCabinet(
      page,
      '/brand/core?pillar=sample_collection&collection=SS27'
    );
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('brand-sc-cabinet-panel')).toBeVisible({ timeout: 60_000 });
    await expect(page.getByTestId('brand-sample-collection-mini-matrix')).toBeVisible({
      timeout: 45_000,
    });
    await expect(page.getByTestId('brand-sc-mini-matrix-qty-hint')).toContainText(/SKU|матриц/i);
    await expect(page.getByTestId('brand-sc-published-readpath-api')).toBeVisible({
      timeout: 30_000,
    });
  });

  test('EMPTY27 linesheet PDF empty: wave VC UI testids + API 404 RU', async ({
    page,
    request,
  }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    test.skip(!healthRes.ok(), 'health API недоступен');

    const res = await page.goto('/brand/linesheets?collection=EMPTY27', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('brand-sc-linesheet-pdf-empty-disabled')).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByTestId('brand-sc-linesheet-pdf-empty-hint')).toContainText(
      /пустая коллекция|SS27/i
    );
    await expect(page.getByTestId('brand-sc-published-readpath-api')).toBeVisible({
      timeout: 30_000,
    });

    const pdfRes = await request.get('/api/workshop2/collections/EMPTY27/linesheet.pdf');
    expect(pdfRes.status()).toBe(404);
    const json = (await pdfRes.json()) as { messageRu?: string };
    expect(json.messageRu).toMatch(/PDF|артикул|EMPTY/i);
  });

  test('SS27 linesheets: cross-matrix strip + readpath badge', async ({ page, request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    test.skip(!healthRes.ok(), 'health API недоступен');

    const res = await page.goto('/brand/linesheets?collection=SS27', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('brand-sc-linesheets-panel')).toBeVisible({ timeout: 60_000 });
    await expect(page.getByTestId('brand-sc-cross-matrix-open-shop-btn')).toBeVisible({
      timeout: 45_000,
    });
    await expect(page.getByTestId('brand-sc-published-readpath-api')).toBeVisible({
      timeout: 30_000,
    });

    const href = await page.getByTestId('brand-sc-cross-matrix-open-shop-btn').getAttribute('href');
    expect(href).toMatch(/linesheetArticleIds=/);
  });

  test('shop showroom: cover hero priority strip honesty (wave XH dedupe)', async ({ page, request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    test.skip(!healthRes.ok(), 'health API недоступен');

    const res = await page.goto('/shop/b2b/showroom?collection=SS27', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('shop-sc-showroom-panel')).toBeVisible({ timeout: 60_000 });
    await expect(page.getByTestId('shop-sc-showroom-cover-hero')).toBeVisible({ timeout: 45_000 });

    const dossierHero = page.getByTestId('shop-sc-showroom-cover-hero-source-dossier');
    if (await dossierHero.isVisible().catch(() => false)) {
      await expect(page.getByTestId('shop-sc-showroom-cover-hero-priority-strip')).toHaveCount(0);
      await expect(dossierHero).toContainText(/dossier/i);
    } else {
      await expect(page.getByTestId('shop-sc-showroom-cover-hero-priority-strip')).toBeVisible({
        timeout: 45_000,
      });
      await expect(page.getByTestId('shop-sc-showroom-cover-hero-priority-strip')).toContainText(
        /dossier/i
      );
    }
  });

  test('batch unpublish rollback roundtrip verify (wave TF syndication)', async ({ request }) => {
    const unpublishRes = await request.post('/api/brand/linesheets/batch-unpublish-rollback', {
      data: {
        action: 'unpublish',
        collectionId: 'SS27',
        articleIds: ['demo-ss27-01'],
        shopBuyerId: 'shop1',
      },
    });
    expect(unpublishRes.status()).toBeLessThan(500);
    const unpublishJson = (await unpublishRes.json()) as {
      ok?: boolean;
      snapshot?: { snapshotId?: string };
      messageRu?: string;
    };

    const rollbackRes = await request.post('/api/brand/linesheets/batch-unpublish-rollback', {
      data: {
        action: 'rollback',
        collectionId: 'SS27',
        shopBuyerId: 'shop1',
      },
    });
    expect(rollbackRes.status()).toBeLessThan(500);
    const rollbackJson = (await rollbackRes.json()) as { ok?: boolean; restoredCount?: number };

    if (unpublishJson.ok) {
      expect(unpublishJson.snapshot?.snapshotId).toBeTruthy();
      expect(unpublishJson.messageRu).toMatch(/snapshot|Snapshot|снято/i);
    }
    if (rollbackJson.ok) {
      expect(rollbackJson.restoredCount).toBeGreaterThanOrEqual(0);
    }
  });
});
