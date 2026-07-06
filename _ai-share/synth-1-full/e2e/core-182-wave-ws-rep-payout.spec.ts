import { test, expect } from '@playwright/test';

const GOTO = { waitUntil: 'domcontentloaded' as const, timeout: 90_000 };

/**
 * Wave WS: rep offline drafts PG sync queue (core fail-closed) + commission payout ledger + dispute peer.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-182-wave-ws-rep-payout.spec.ts
 */
test.describe('core-182: wave WS shop rep drafts + payout', () => {
  test('POST commissions payout writes PG ledger stub', async ({ request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { pgReachable?: boolean };

    const res = await request.post('/api/shop/b2b/commissions/payout', {
      data: {
        repId: 'rep-anna',
        action: 'payout_request',
        orderIds: ['B2B-0010'],
      },
    });
    expect(res.status()).toBeLessThan(500);
    const json = (await res.json()) as {
      ok?: boolean;
      storageMode?: string;
      messageRu?: string;
      updatedCount?: number;
    };
    if (health.pgReachable) {
      expect(json.ok).toBe(true);
      expect(json.storageMode).toBe('postgres');
      expect(json.messageRu).toBeTruthy();
      expect(typeof json.updatedCount).toBe('number');
    } else {
      expect([503, 200, 400]).toContain(res.status());
    }
  });

  test('offline drafts POST append returns queueDepth without file/mem in core', async ({ request }) => {
    const res = await request.post('/api/shop/b2b/rep/offline-drafts', {
      data: {
        repId: 'rep-demo-ws',
        draft: {
          id: `draft-ws-${Date.now()}`,
          repId: 'rep-demo-ws',
          campaignId: 'SS27::demo',
          payload: { source: 'core-182' },
          createdAt: new Date().toISOString(),
        },
      },
    });
    expect(res.status()).toBeLessThan(500);
    const json = (await res.json()) as {
      ok?: boolean;
      storageMode?: string;
      queueDepth?: number;
      messageRu?: string;
    };
    expect(json.ok).toBe(true);
    expect(typeof json.queueDepth).toBe('number');
    expect(typeof json.messageRu).toBe('string');
    if (json.storageMode) {
      expect(['postgres', 'unavailable']).toContain(json.storageMode);
    }
  });

  test('sales rep workspace section RU strip + dispute peer link', async ({ page }) => {
    const res = await page.goto('/shop/b2b/sales-rep-portal?feature=portal&collection=SS27', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);

    await expect(page.getByTestId('shop-agent-rep-section-ru-strip')).toBeVisible({ timeout: 45_000 });
    await expect(page.getByTestId('shop-agent-rep-offline-drafts-sync-queue-badge')).toBeVisible();
    await expect(page.getByTestId('shop-agent-rep-brand-commission-dispute-link')).toBeVisible();
  });

  test('commission tab ledger strip without duplicate offline honesty strip', async ({ page }) => {
    const res = await page.goto(
      '/shop/b2b/sales-rep-portal?feature=commission&collection=SS27',
      GOTO
    );
    expect(res?.status() ?? 599).toBeLessThan(500);

    await expect(page.getByTestId('shop-agent-rep-commission-ledger-ru-strip')).toBeVisible({
      timeout: 45_000,
    });
    await expect(page.getByTestId('shop-agent-rep-offline-drafts-honesty-strip')).toHaveCount(0);
    await expect(page.getByTestId('shop-agent-rep-section-ru-strip')).toBeVisible();
  });
});
