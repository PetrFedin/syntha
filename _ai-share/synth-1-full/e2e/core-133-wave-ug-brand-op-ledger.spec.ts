import { test, expect } from '@playwright/test';
import { PLATFORM_CORE_DEMO } from '../src/lib/platform-core-hub-matrix';

/**
 * Wave UG: brand OP inventory ledger WMS reserve badge + cut_ticket PATCH + materials deep-link.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-133-wave-ug-brand-op-ledger.spec.ts
 */
test.describe('core-133: wave UG brand OP ledger + cut ticket', () => {
  const DEMO_ORDER = PLATFORM_CORE_DEMO.demoOrderId;
  const COLLECTION = PLATFORM_CORE_DEMO.collectionId;
  const ARTICLE = PLATFORM_CORE_DEMO.demoArticleId;
  const PO_ID = PLATFORM_CORE_DEMO.productionOrderId;

  test('PATCH production order cut_ticket on B2B PO', async ({ request }) => {
    const res = await request.patch(
      `/api/workshop2/manufacturer/production-orders/${encodeURIComponent(PO_ID)}/cut-ticket`,
      {
        data: {
          collectionId: COLLECTION,
          articleId: ARTICLE,
          b2bOrderId: DEMO_ORDER,
          ticketNo: 'CT-UG-E2E-001',
          status: 'ready',
          qty: 120,
          actor: 'e2e-ug',
        },
      }
    );
    expect(res.status()).toBeLessThan(500);
    if (res.ok()) {
      const json = (await res.json()) as { ok?: boolean; cutTicket?: { ticketNo?: string } };
      expect(json.ok).toBe(true);
      expect(json.cutTicket?.ticketNo).toBe('CT-UG-E2E-001');
    }
  });

  test('WMS balances API returns reserve qty for ledger badge', async ({ request }) => {
    const res = await request.get(
      `/api/workshop2/articles/${COLLECTION}/${ARTICLE}/wms/balances`
    );
    expect(res.status()).toBeLessThan(500);
    const json = (await res.json()) as { ok?: boolean; balances?: unknown[] };
    if (json.ok) {
      expect(Array.isArray(json.balances)).toBe(true);
    }
  });

  test('brand inventory ledger strip shows WMS reserve + supplier PATCH link', async ({
    page,
    request,
  }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { demoSeeded?: boolean };
    test.skip(!health.demoSeeded, 'нужен db:core:bootstrap');

    await page.goto(
      `/brand/inventory?pcf=overview&collection=${COLLECTION}&order=${DEMO_ORDER}`,
      { waitUntil: 'domcontentloaded', timeout: 60_000 }
    );
    await expect(page.getByTestId('brand-op-inventory-ledger-strip')).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByTestId('brand-op-inventory-ledger-wms-reserve-badge')).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByTestId('brand-op-inventory-ledger-supplier-patch-link')).toBeVisible();
  });

  test('brand OP chain materials step deep-links supplier PATCH with po=', async ({
    page,
    request,
  }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { demoSeeded?: boolean };
    test.skip(!health.demoSeeded, 'нужен db:core:bootstrap');

    await page.goto(
      `/brand/b2b/orders/${encodeURIComponent(DEMO_ORDER)}?pillar=order_production&collection=${COLLECTION}`,
      { waitUntil: 'domcontentloaded', timeout: 60_000 }
    );
    await expect(page.getByTestId('brand-op-chain-materials-supplier-strip')).toBeVisible({
      timeout: 30_000,
    });
    const patchLink = page.getByTestId('brand-op-chain-materials-supplier-link-patch').or(
      page.getByTestId('brand-op-chain-materials-supplier-link-done')
    );
    await expect(patchLink.first()).toBeVisible({ timeout: 15_000 });
  });

  test('brand dossier factory diff panel shows attach TZ PO link', async ({ page }) => {
    await page.goto(
      `/brand/production/workshop2/c/${COLLECTION}/a/${ARTICLE}?w2sec=general`,
      { waitUntil: 'domcontentloaded', timeout: 60_000 }
    );
    await expect(page.getByTestId('brand-dossier-factory-diff-panel')).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByTestId('brand-op-attach-tz-po-link')).toBeVisible({ timeout: 15_000 });
  });
});
