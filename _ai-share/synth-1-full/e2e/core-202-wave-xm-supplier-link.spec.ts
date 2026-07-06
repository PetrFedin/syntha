import { test, expect } from '@playwright/test';
import { PLATFORM_CORE_DEMO } from '../src/lib/platform-core-hub-matrix';

/**
 * Wave XM: brand OP chain PO materials → supplier PATCH (po=) + inventory ledger WMS + SSE dedup hint.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-202-wave-xm-supplier-link.spec.ts
 */
test.describe('core-202: wave XM brand OP materials supplier link', () => {
  const DEMO_ORDER = PLATFORM_CORE_DEMO.demoOrderId;
  const COLLECTION = PLATFORM_CORE_DEMO.collectionId;
  const PO_ID = PLATFORM_CORE_DEMO.productionOrderId;

  test('brand OP chain card: materials PATCH strip with po= + inventory ledger cross-link', async ({
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

    await expect(page.getByTestId('brand-op-chain-status-card')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('brand-op-chain-sse-live-badge')).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId('brand-op-chain-materials-sse-dedup-hint')).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByTestId('brand-op-chain-materials-supplier-strip')).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByTestId('brand-op-chain-materials-po-badge')).toContainText(PO_ID);

    const patchLink = page
      .getByTestId('brand-op-chain-materials-supplier-link-patch')
      .or(page.getByTestId('brand-op-chain-materials-supplier-link-done'));
    await expect(patchLink.first()).toBeVisible({ timeout: 15_000 });
    const href = await patchLink.first().getAttribute('href');
    expect(href).toContain('view=procurement');
    expect(href).toContain('role=supplier');
    expect(href).toContain(`po=${encodeURIComponent(PO_ID)}`);

    const inventoryLink = page.getByTestId('brand-op-chain-materials-inventory-ledger-link');
    await expect(inventoryLink).toBeVisible({ timeout: 15_000 });
    const inventoryHref = await inventoryLink.getAttribute('href');
    expect(inventoryHref).toContain('/brand/inventory');
    expect(inventoryHref).toContain(`order=${encodeURIComponent(DEMO_ORDER)}`);
    expect(inventoryHref).toContain(`po=${encodeURIComponent(PO_ID)}`);
  });

  test('brand inventory ledger reachable from chain cross-link context', async ({ page, request }) => {
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
    await expect(page.getByTestId('brand-op-inventory-ledger-supplier-patch-link')).toBeVisible({
      timeout: 15_000,
    });
  });

  test('registry SSE dedup strip — no duplicate full SSE badge (Wave VQ polish)', async ({
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
    await expect(page.getByTestId('brand-op-registry-sse-dedup-strip')).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByTestId('brand-op-chain-sse-dedup-badge')).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByTestId('brand-op-registry-sse-live-badge')).toHaveCount(0);
  });
});
