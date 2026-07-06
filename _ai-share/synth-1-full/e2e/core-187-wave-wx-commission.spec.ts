import { test, expect } from '@playwright/test';

const GOTO = { waitUntil: 'domcontentloaded' as const, timeout: 90_000 };

/**
 * Wave WX · Brand CO agent rep: commission dispute PG stub, read-only portal RU strip, shop rep payout peer.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-187-wave-wx-commission.spec.ts
 */
test.describe('core-187: wave WX brand commission dispute + portal RU', () => {
  test('commission dispute GET list + POST PG stub', async ({ request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { pgReachable?: boolean };

    const getRes = await request.get('/api/brand/b2b/commissions/dispute');
    expect(getRes.status()).toBeLessThan(500);
    const getJson = (await getRes.json()) as {
      ok?: boolean;
      disputes?: unknown[];
      storageMode?: string;
      messageRu?: string;
    };
    expect(getJson.ok).toBe(true);
    expect(Array.isArray(getJson.disputes)).toBe(true);
    expect(typeof getJson.messageRu).toBe('string');
    if (health.pgReachable) {
      expect(getJson.storageMode).toBe('postgres');
    }

    const postRes = await request.post('/api/brand/b2b/commissions/dispute', {
      data: {
        commissionId: 'comm-e2e-187',
        reasonRu: 'E2E wave WX: расхождение комиссии',
        repName: 'Rep WX',
      },
    });
    expect(postRes.status()).toBeLessThan(500);
    const postJson = (await postRes.json()) as {
      ok?: boolean;
      dispute?: { disputeId?: string; status?: string };
      storageMode?: string;
    };
    expect(postJson.ok).toBe(true);
    expect(postJson.dispute?.disputeId).toBeTruthy();
    expect(postJson.dispute?.status).toBe('received');
    if (health.pgReachable) {
      expect(postJson.storageMode).toBe('postgres');
    }
  });

  test('brand ledger: RU readonly portal strip + dispute + shop payout peer', async ({ page }) => {
    await page.goto('/brand/distributor/commissions?pcf=ledger&collection=SS27', GOTO);

    await expect(page.getByTestId('brand-agent-rep-shop-portal-readonly-ru-strip')).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByTestId('brand-co-agent-rep-shop-portal-readonly-link')).toBeVisible({
      timeout: 45_000,
    });
    await expect(page.getByTestId('brand-co-agent-rep-shop-portal-readonly-link')).toHaveAttribute(
      'href',
      /readOnly=1/
    );

    const payoutLink = page.getByTestId('brand-agent-rep-shop-rep-payout-peer-link');
    await expect(payoutLink).toBeVisible({ timeout: 45_000 });
    await expect(payoutLink).toHaveAttribute('href', /payoutPeer=brand-dispute/);
    await expect(payoutLink).toHaveAttribute('href', /pcf=commission/);

    await expect(page.getByTestId('brand-agent-rep-commission-dispute-strip')).toBeVisible({
      timeout: 45_000,
    });
    await expect(page.getByTestId('brand-agent-rep-commission-dispute-storage-badge')).toBeVisible();
  });
});
