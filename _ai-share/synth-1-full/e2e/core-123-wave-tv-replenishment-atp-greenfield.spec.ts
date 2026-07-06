import { test, expect } from '@playwright/test';

const GOTO = { waitUntil: 'domcontentloaded' as const, timeout: 90_000 };

/**
 * Wave TV: WMS ATP → replenishment allocate + shop2 greenfield cabinet strip.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-123-wave-tv-replenishment-atp-greenfield.spec.ts
 */
test.describe('core-123: wave TV replenishment ATP + greenfield', () => {
  test('replenishment allocate POST returns ATP + matrix prefill', async ({ request }) => {
    const res = await request.post('/api/shop/b2b/replenishment/allocate', {
      data: { collectionId: 'SS27', buyerId: 'shop1', orderId: 'B2B-SS27-DEMO-001' },
    });
    expect([200, 422]).toContain(res.status());
    const json = (await res.json()) as {
      ok?: boolean;
      atpSource?: string;
      atpQtyTotal?: number;
      atpLines?: Array<{ sku?: string; atpQty?: number }>;
      matrixHref?: string;
      messageRu?: string;
    };
    expect(typeof json.messageRu).toBe('string');
    expect(typeof json.atpQtyTotal).toBe('number');
    if (json.ok && json.matrixHref) {
      expect(json.matrixHref).toContain('/shop/b2b/matrix');
      expect(json.matrixHref).toContain('replenishmentApply=1');
    }
  });

  test('greenfield onboarding API for shop2', async ({ request }) => {
    const res = await request.get(
      '/api/shop/b2b/greenfield/onboarding?buyerId=shop2&collectionId=SS27'
    );
    expect(res.status()).toBeLessThan(500);
    const json = (await res.json()) as {
      ok?: boolean;
      state?: { crmReady?: boolean; pricelistReady?: boolean };
      storageMode?: string;
    };
    expect(typeof json.ok).toBe('boolean');
  });

  test('replenishment panel matrix CTA visible', async ({ page }) => {
    const res = await page.goto('/shop/b2b/replenishment?collection=SS27&pcf=stock-atp', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('shop-replenishment-matrix-lines-apply')).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByTestId('shop-replenishment-filter-slices-sidebar')).toBeVisible({
      timeout: 45_000,
    });
  });

  test('shop2 cabinet CO shows greenfield registry strip', async ({ page }) => {
    await page.goto('/shop/core?pillar=collection_order&collection=SS27&buyer=shop2', GOTO);
    await expect(page.getByTestId('shop-co-cabinet-empty-onboarding')).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByTestId('shop-co-greenfield-registry-strip')).toBeVisible({
      timeout: 45_000,
    });
    await expect(
      page
        .getByTestId('shop-co-greenfield-registry-pg')
        .or(page.getByTestId('shop-co-greenfield-registry-memory'))
    ).toBeVisible({ timeout: 45_000 });
  });
});
