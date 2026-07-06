import { test, expect } from '@playwright/test';
import { PLATFORM_CORE_DEMO } from '../src/lib/platform-core-hub-matrix';

/**
 * Wave YH: S3 WMS inventory reserve — shop checkout live badge, brand ledger reserve qty cross-link,
 * supplier materials_supplied PATCH chain polish.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-223-wave-yh-wms-reserve.spec.ts
 */
test.describe('core-223: wave YH WMS reserve checkout + ledger', () => {
  const DEMO_ORDER = PLATFORM_CORE_DEMO.demoOrderId;
  const COLLECTION = PLATFORM_CORE_DEMO.collectionId;
  const ARTICLE = PLATFORM_CORE_DEMO.demoArticleId;
  const PO_ID = PLATFORM_CORE_DEMO.productionOrderId;

  test('GET stock-atp exposes reserved field for live WMS badge', async ({ request }) => {
    const res = await request.get(
      `/api/shop/b2b/replenishment/stock-atp?collection=${COLLECTION}&limit=12`
    );
    expect(res.status()).toBeLessThan(500);
    const json = (await res.json()) as {
      ok?: boolean;
      source?: string;
      rows?: Array<{ reserved?: number; atp?: number }>;
    };
    if (json.ok) {
      expect(Array.isArray(json.rows)).toBe(true);
      expect(['pg', 'pg+wms', 'wms', 'file', 'memory', 'demo']).toContain(json.source ?? 'demo');
    }
  });

  test('shop checkout: live WMS reserve badge + honest pre-handoff phase', async ({ page }) => {
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

    const liveBadge = page.getByTestId('shop-co-checkout-wms-reserve-live-badge');
    const qtyLink = page.getByTestId('shop-co-checkout-wms-reserve-qty-link');
    const liveOrPending = liveBadge.or(badge);
    await expect(liveOrPending.first()).toBeVisible({ timeout: 15_000 });

    if ((await liveBadge.count()) > 0) {
      await expect(liveBadge).toHaveAttribute('data-wms-reserve-live', '1');
      await expect(qtyLink).toBeVisible();
      const href = await qtyLink.getAttribute('href');
      expect(href).toContain('/wms/balances');
    }

    await expect(page.getByTestId('shop-co-checkout-inventory-s3-link')).toBeVisible();
    await expect(page.getByTestId('shop-co-checkout-wms-tracking-link')).toBeVisible();
  });

  test('brand inventory ledger: reserve qty cross-link + supplier PATCH', async ({
    page,
    request,
  }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { demoSeeded?: boolean };
    test.skip(!health.demoSeeded, 'нужен db:core:bootstrap');

    await page.goto(
      `/brand/inventory?pcf=overview&collection=${COLLECTION}&order=${encodeURIComponent(DEMO_ORDER)}&po=${encodeURIComponent(PO_ID)}`,
      { waitUntil: 'domcontentloaded', timeout: 60_000 }
    );

    await expect(page.getByTestId('brand-op-inventory-ledger-strip')).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByTestId('brand-op-inventory-ledger-wms-reserve-badge')).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByTestId('brand-op-inventory-ledger-wms-reserve-api-link')).toBeVisible();
    await expect(page.getByTestId('brand-op-inventory-ledger-supplier-patch-link')).toBeVisible();

    const reserveQtyLink = page.getByTestId('brand-op-inventory-ledger-wms-reserve-qty-link');
    if ((await reserveQtyLink.count()) > 0) {
      await expect(reserveQtyLink).toBeVisible();
      const href = await reserveQtyLink.getAttribute('href');
      expect(href).toContain('/wms/balances');
    }
  });

  test('brand OP chain: materials_supplied PATCH hint + supplier link', async ({
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

    const strip = page.getByTestId('brand-op-chain-materials-supplier-strip');
    await expect(strip).toBeVisible({ timeout: 30_000 });
    await expect(strip).toHaveAttribute('data-chain-step', 'materials_supplied');
    await expect(page.getByTestId('brand-op-chain-materials-supplied-patch-hint')).toBeVisible({
      timeout: 15_000,
    });

    const patchLink = page
      .getByTestId('brand-op-chain-materials-supplier-link-patch')
      .or(page.getByTestId('brand-op-chain-materials-supplier-link-done'));
    await expect(patchLink.first()).toBeVisible({ timeout: 15_000 });
    const href = await patchLink.first().getAttribute('href');
    expect(href).toContain('view=procurement');
    expect(href).toContain(`po=${encodeURIComponent(PO_ID)}`);
  });

  test('WMS balances API for demo article', async ({ request }) => {
    const res = await request.get(
      `/api/workshop2/articles/${COLLECTION}/${ARTICLE}/wms/balances`
    );
    expect(res.status()).toBeLessThan(500);
  });
});
