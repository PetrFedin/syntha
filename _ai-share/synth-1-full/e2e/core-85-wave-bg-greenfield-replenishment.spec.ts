import { test, expect } from '@playwright/test';

/**
 * Wave BG · greenfield monetization contract (HTTP + source anchors).
 * Full browser path requires PG bootstrap + shop2 buyer — gated on platform-core health.
 */
test.describe('wave-bg greenfield monetization contract', () => {
  test('greenfield helpers and replenishment forecast sync anchors in source', async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const root = path.join(process.cwd(), 'src');
    const readiness = fs.readFileSync(
      path.join(root, 'components/shop/b2b/ShopCoCheckoutGreenfieldReadinessStrip.tsx'),
      'utf8'
    );
    const registry = fs.readFileSync(
      path.join(root, 'components/shop/b2b/ShopCoRegistryGreenfieldFocusStrip.tsx'),
      'utf8'
    );
    const rules = fs.readFileSync(
      path.join(root, 'components/shop/replenishment/ShopReplenishmentRulesForecastSyncStrip.tsx'),
      'utf8'
    );
    expect(readiness).toContain('shop-co-checkout-greenfield-readiness-strip');
    expect(readiness).toContain('shopGreenfieldPostCheckoutRegistryHref');
    expect(registry).toContain('shop-co-registry-greenfield-focus-replenishment-link');
    expect(rules).toContain('shop-replenishment-rules-forecast-sync-btn');
    expect(rules).toContain('material-request/bulk-confirm');
  });

  test('shop2 buyer orders API responds when PG healthy', async ({ request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    if (!healthRes.ok()) {
      test.skip(true, 'PG not healthy');
    }
    const ordersRes = await request.get('/api/shop/b2b/orders?buyerId=shop2&collectionId=SS27');
    expect(ordersRes.ok()).toBeTruthy();
    const json = (await ordersRes.json()) as { ok?: boolean; buyerId?: string };
    expect(json.ok).toBe(true);
    expect(json.buyerId).toBe('shop2');
  });

  test('replenishment rules PG API when healthy', async ({ request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    if (!healthRes.ok()) {
      test.skip(true, 'PG not healthy');
    }
    const res = await request.get('/api/shop/b2b/replenishment/rules?buyerId=shop1');
    expect(res.ok()).toBeTruthy();
    const json = (await res.json()) as { ok?: boolean; storageMode?: string };
    expect(json.ok).toBe(true);
    expect(['pg', 'file', 'memory']).toContain(json.storageMode);
  });
});
