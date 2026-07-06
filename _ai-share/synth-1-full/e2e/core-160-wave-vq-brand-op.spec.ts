import { test, expect } from '@playwright/test';
import { PLATFORM_CORE_DEMO } from '../src/lib/platform-core-hub-matrix';

/**
 * Wave VQ: brand OP chain SSE dedup + dossier locked/diff + cut_ticket PG verify.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-160-wave-vq-brand-op.spec.ts
 */
test.describe('core-160: wave VQ brand OP chain dossier', () => {
  const DEMO_ORDER = PLATFORM_CORE_DEMO.demoOrderId;
  const COLLECTION = PLATFORM_CORE_DEMO.collectionId;
  const ARTICLE = PLATFORM_CORE_DEMO.demoArticleId;
  const PO_ID = PLATFORM_CORE_DEMO.productionOrderId;

  test('GET cut_ticket verify on production order', async ({ request }) => {
    const res = await request.get(
      `/api/workshop2/manufacturer/production-orders/${encodeURIComponent(PO_ID)}/cut-ticket`
    );
    expect(res.status()).toBeLessThan(500);
    if (res.ok()) {
      const json = (await res.json()) as {
        ok?: boolean;
        pgVerified?: boolean;
        cutTicket?: { ticketNo?: string };
      };
      expect(json.ok).toBe(true);
      expect(typeof json.pgVerified).toBe('boolean');
    }
  });

  test('brand OP order detail: chain SSE + dossier locked + diff panel', async ({
    page,
    request,
  }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { demoSeeded?: boolean };
    test.skip(!health.demoSeeded, 'нужен db:core:bootstrap');

    await page.goto(
      `/brand/b2b/orders/${encodeURIComponent(DEMO_ORDER)}?pillar=order_production&collection=${COLLECTION}#production-dossier`,
      { waitUntil: 'domcontentloaded', timeout: 60_000 }
    );

    await expect(page.getByTestId('brand-op-chain-status-card')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('brand-op-chain-sse-live-badge')).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByTestId('brand-op-dossier-card')).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId('brand-op-dossier-locked-badge')).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByTestId('brand-op-dossier-factory-diff-wrap')).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByTestId('brand-dossier-factory-diff-panel')).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByTestId('brand-op-cut-ticket-pg-verify-badge')).toBeVisible({
      timeout: 15_000,
    });
  });

  test('brand OP registry + cabinet: SSE dedup strip (not duplicate full badge)', async ({
    page,
    request,
  }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { demoSeeded?: boolean };
    test.skip(!health.demoSeeded, 'нужен db:core:bootstrap');

    await page.goto(
      `/brand/b2b-orders?filter=in_production&order=${encodeURIComponent(DEMO_ORDER)}&pillar=order_production`,
      { waitUntil: 'domcontentloaded', timeout: 60_000 }
    );
    await expect(page.getByTestId('brand-op-registry-panel')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('brand-op-registry-sse-dedup-strip')).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByTestId('brand-op-chain-sse-dedup-badge')).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByTestId('brand-op-registry-sse-live-badge')).toHaveCount(0);

    await page.goto(`/brand/core?pillar=order_production&collection=${COLLECTION}`, {
      waitUntil: 'domcontentloaded',
      timeout: 60_000,
    });
    await expect(page.getByTestId('brand-op-cabinet-panel')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('brand-op-cabinet-sse-dedup-strip')).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByTestId('brand-op-cabinet-sse-live-badge')).toHaveCount(0);
  });
});
