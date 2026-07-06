import { test, expect } from '@playwright/test';

/**
 * Wave SO: replenishment→matrix apply + greenfield empty registry PG onboarding.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-97-wave-so-greenfield-matrix.spec.ts
 */
test.describe('core-97: wave SO greenfield + replenishment matrix', () => {
  test('replenishment matrix-lines suggest API', async ({ request }) => {
    const res = await request.get(
      '/api/shop/b2b/replenishment/matrix-lines?collectionId=SS27&buyerId=shop1'
    );
    expect(res.status()).toBeLessThan(500);
    const json = (await res.json()) as { ok?: boolean; applyHref?: string };
    expect(typeof json.ok).toBe('boolean');
    if (json.ok) {
      expect(json.applyHref).toContain('matrix-lines/apply');
    }
  });

  test('replenishment matrix-lines apply API', async ({ request }) => {
    const res = await request.post('/api/shop/b2b/replenishment/matrix-lines/apply', {
      data: { collectionId: 'SS27', buyerId: 'shop1', orderId: 'B2B-SS27-DEMO-001' },
    });
    expect([200, 422]).toContain(res.status());
    const json = (await res.json()) as { ok?: boolean; matrixHref?: string; messageRu?: string };
    expect(typeof json.messageRu).toBe('string');
    if (json.ok) {
      expect(json.matrixHref).toContain('/shop/b2b/matrix');
    }
  });

  test('greenfield onboarding API', async ({ request }) => {
    const res = await request.get(
      '/api/shop/b2b/greenfield/onboarding?buyerId=shop2&collectionId=SS27'
    );
    expect(res.status()).toBeLessThan(500);
    const json = (await res.json()) as { ok?: boolean; state?: { crmReady?: boolean } };
    expect(typeof json.ok).toBe('boolean');
  });

  test('replenishment ATP panel shows matrix apply CTA', async ({ page }) => {
    const res = await page.goto('/shop/b2b/replenishment?collection=SS27', {
      waitUntil: 'domcontentloaded',
      timeout: 60_000,
    });
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('shop-replenishment-matrix-lines-apply')).toBeVisible({
      timeout: 45_000,
    });
  });
});
