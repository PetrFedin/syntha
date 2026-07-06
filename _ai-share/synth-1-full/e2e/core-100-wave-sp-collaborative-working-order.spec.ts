import { test, expect } from '@playwright/test';

/**
 * Wave SP: collaborative session SSE + working order version diff.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-100-wave-sp-collaborative-working-order.spec.ts
 */
test.describe('core-100: wave SP collaborative + working order', () => {
  test('collaborative session GET API', async ({ request }) => {
    const res = await request.get(
      '/api/shop/b2b/collaborative/session?orderId=B2B-SS27-DEMO-001&collection=SS27&buyerId=shop1'
    );
    expect(res.status()).toBeLessThan(500);
    const json = (await res.json()) as { ok?: boolean; sessionRevision?: string };
    expect(typeof json.ok).toBe('boolean');
    if (json.ok) expect(typeof json.sessionRevision).toBe('string');
  });

  test('collaborative session POST heartbeat', async ({ request }) => {
    const res = await request.post('/api/shop/b2b/collaborative/session', {
      data: { orderId: 'B2B-SS27-DEMO-001', collection: 'SS27', buyerId: 'shop1' },
    });
    expect(res.status()).toBeLessThan(500);
  });

  test('working order version-diff API', async ({ request }) => {
    const res = await request.get(
      '/api/shop/b2b/working-order/INT-SS27-DEMO-001/version-diff'
    );
    expect(res.status()).toBeLessThan(500);
    const json = (await res.json()) as { ok?: boolean; messageRu?: string };
    expect(typeof json.messageRu).toBe('string');
  });

  test('collaborative session panel visible', async ({ page }) => {
    const res = await page.goto(
      '/shop/b2b/collaborative-order?collection=SS27&pcf=session&order=B2B-SS27-DEMO-001',
      { waitUntil: 'domcontentloaded', timeout: 60_000 }
    );
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('shop-collaborative-order-session-panel')).toBeVisible({
      timeout: 45_000,
    });
  });
});
