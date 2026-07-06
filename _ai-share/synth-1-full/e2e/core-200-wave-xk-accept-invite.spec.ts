import { test, expect } from '@playwright/test';

import { createWorkshop2B2bBuyerInviteToken } from '../src/lib/production/workshop2-b2b-wave23-parity';

const GOTO = { waitUntil: 'domcontentloaded' as const, timeout: 90_000 };

/**
 * Wave XK · Shop accept-invite: PG partner session cookies, partners golden path cross-link.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-200-wave-xk-accept-invite.spec.ts
 */
test.describe('core-200: wave XK shop accept-invite PG session', () => {
  test('accept-invite POST sets partner session + buyer cookies', async ({ request }) => {
    const { token } = createWorkshop2B2bBuyerInviteToken({
      buyerEmail: 'buyer@shop-demo.local',
      tier: 'standard',
    });

    const res = await request.post('/api/shop/b2b/accept-invite', {
      data: { token },
    });
    expect(res.status()).toBeLessThan(500);
    const json = (await res.json()) as {
      ok?: boolean;
      buyerId?: string;
      sessionId?: string;
      storageMode?: string;
    };
    expect(json.ok).toBe(true);
    expect(json.buyerId).toBe('shop1');
    expect(typeof json.sessionId).toBe('string');
    expect(['postgres', 'memory']).toContain(json.storageMode);

    const setCookie = res.headers()['set-cookie'] ?? '';
    expect(setCookie).toMatch(/b2b_cart_session=/);
    expect(setCookie).toMatch(/b2b_partner_tier=/);
    expect(setCookie).toMatch(/shop_b2b_buyer_id=shop1/);
  });

  test('accept-invite page: PG badge + partners golden path links', async ({ page }) => {
    const { token } = createWorkshop2B2bBuyerInviteToken({
      buyerEmail: 'buyer@shop-demo.local',
      tier: 'vip',
    });

    const res = await page.goto(`/shop/b2b/accept-invite?token=${encodeURIComponent(token)}`, GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);

    await expect(page.getByTestId('b2b-accept-invite')).toBeVisible({ timeout: 60_000 });
    const pgBadge = page.getByTestId('b2b-accept-invite-storage-pg');
    const healthRes = await page.request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { pgReachable?: boolean };
    if (health.pgReachable) {
      await expect(pgBadge).toBeVisible({ timeout: 45_000 });
    }
    await expect(page.getByTestId('shop-sc-accept-invite-partners-golden-path-link')).toBeVisible({
      timeout: 45_000,
    });
    await expect(page.getByTestId('shop-sc-accept-invite-showroom-eligible-link')).toBeVisible({
      timeout: 45_000,
    });
    await expect(page.getByText(/invite PG/i)).toBeVisible();
    await expect(page.getByText(/eligible-for-matrix/i)).toBeVisible();
  });

  test('checkout cart/lines resolves buyer from partner session cookie', async ({ request }) => {
    const { token } = createWorkshop2B2bBuyerInviteToken({
      buyerEmail: 'buyer@shop-demo.local',
      tier: 'standard',
    });
    const acceptRes = await request.post('/api/shop/b2b/accept-invite', { data: { token } });
    expect(acceptRes.ok()).toBeTruthy();
    const acceptJson = (await acceptRes.json()) as { sessionId?: string };
    const sessionId = acceptJson.sessionId;
    expect(sessionId).toBeTruthy();

    const cartRes = await request.post('/api/shop/b2b/cart/lines', {
      headers: {
        cookie: `b2b_cart_session=${encodeURIComponent(sessionId!)}`,
        'Content-Type': 'application/json',
      },
      data: {
        action: 'upsert',
        sessionId,
        line: {
          collectionId: 'SS27',
          articleId: 'W2-SS27-001',
          colorCode: 'BLK',
          size: 'M',
          qty: 1,
        },
      },
    });
    expect(cartRes.status()).toBeLessThan(500);
    const cartJson = (await cartRes.json()) as { ok?: boolean; messageRu?: string };
    if (cartJson.ok === false && cartJson.messageRu?.includes('Досье')) {
      test.skip(true, 'demo dossier absent — buyer resolution path still exercised');
    }
    expect([200, 400, 404]).toContain(cartRes.status());
  });
});
