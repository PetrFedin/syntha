import { test, expect } from '@playwright/test';
import { PLATFORM_CORE_DEMO } from '../src/lib/platform-core-hub-matrix';

/**
 * Wave S3 UX: brand OP inventory ledger GET inventory/reserve + WMS API links + shop checkout honest badge.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-144-wave-ux-inventory-ledger.spec.ts
 */
test.describe('core-144: wave S3 inventory ledger + reserve UX', () => {
  const DEMO_ORDER = PLATFORM_CORE_DEMO.demoOrderId;
  const COLLECTION = PLATFORM_CORE_DEMO.collectionId;
  const ARTICLE = PLATFORM_CORE_DEMO.demoArticleId;

  test('GET B2B inventory-reserve returns reserve payload', async ({ request }) => {
    const res = await request.get(
      `/api/workshop2/b2b/orders/${encodeURIComponent(DEMO_ORDER)}/inventory-reserve`
    );
    expect(res.status()).toBeLessThan(500);
    const json = (await res.json()) as {
      ok?: boolean;
      inventoryReserve?: { reserved?: boolean; reservedQty?: number };
      wmsBalancesHref?: string;
    };
    if (json.ok) {
      expect(json.wmsBalancesHref).toContain('/wms/balances');
      expect(json.inventoryReserve).toBeTruthy();
    }
  });

  test('brand inventory ledger strip: live badge + WMS API cross-links', async ({
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
    await expect(page.getByTestId('brand-op-inventory-ledger-wms-reserve-api-link')).toBeVisible();
    await expect(page.getByTestId('brand-op-inventory-ledger-wms-balances-api-link')).toBeVisible();
    await expect(page.getByTestId('brand-op-inventory-ledger-supplier-patch-link')).toBeVisible();
  });

  test('brand OP chain materials_supplied links supplier PATCH', async ({ page, request }) => {
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
    await expect(page.getByTestId('brand-op-chain-materials-po-badge')).toBeVisible();
  });

  test('shop checkout honest reserve badge (pre-handoff, no reserve claim)', async ({ page }) => {
    await page.goto(`/shop/b2b/checkout?collection=${COLLECTION}`, {
      waitUntil: 'domcontentloaded',
      timeout: 60_000,
    });
    const hold = page.getByTestId('shop-co-checkout-inventory-hold');
    await expect(hold).toBeVisible({ timeout: 30_000 });
    await expect(hold).toHaveAttribute('data-reserve-honest', '1');
    const badge = page.getByTestId('shop-co-checkout-inventory-badge');
    await expect(badge).toBeVisible();
    await expect(badge).toHaveAttribute('data-reserve-phase', 'pre-handoff');
    await expect(page.getByTestId('shop-co-checkout-inventory-s3-link')).toBeVisible();
  });

  test('WMS balances API for article', async ({ request }) => {
    const res = await request.get(
      `/api/workshop2/articles/${COLLECTION}/${ARTICLE}/wms/balances`
    );
    expect(res.status()).toBeLessThan(500);
  });
});
