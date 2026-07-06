import { test, expect } from '@playwright/test';

const GOTO = { waitUntil: 'domcontentloaded' as const, timeout: 90_000 };

/**
 * Wave VB: commissions payout PG ledger POST + workspace honesty strip RU + drafts sync queue.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-147-wave-vb-rep-commission.spec.ts
 */
test.describe('core-147: wave VB rep commission payout', () => {
  test('POST commissions payout writes PG ledger', async ({ request }) => {
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

  test('offline drafts API returns queueDepth + messageRu', async ({ request }) => {
    const res = await request.get('/api/shop/b2b/rep/offline-drafts?repId=rep-demo');
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
      expect(['postgres', 'file', 'memory', 'unavailable']).toContain(json.storageMode);
    }
  });

  test('sales rep workspace shows honesty strip RU on all tabs', async ({ page }) => {
    const res = await page.goto('/shop/b2b/sales-rep-portal?feature=portal&collection=SS27', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);

    const workspaceStrip = page.getByTestId('shop-agent-rep-section-ru-strip');
    await expect(workspaceStrip).toBeVisible({ timeout: 45_000 });

    const pgLedger = page.getByTestId('shop-agent-rep-workspace-ledger-storage-pg');
    const pgDrafts = page.getByTestId('shop-agent-rep-workspace-drafts-storage-pg');
    if ((await pgLedger.count()) > 0) {
      await expect(pgLedger).toContainText('PG');
    }
    if ((await pgDrafts.count()) > 0) {
      await expect(pgDrafts).toContainText('PG');
    }
  });

  test('commission tab ledger strip + sync queue badge', async ({ page }) => {
    const res = await page.goto(
      '/shop/b2b/sales-rep-portal?feature=commission&collection=SS27',
      GOTO
    );
    expect(res?.status() ?? 599).toBeLessThan(500);

    await expect(page.getByTestId('shop-agent-rep-commission-ledger-ru-strip')).toBeVisible({
      timeout: 45_000,
    });
    await expect(page.getByTestId('shop-agent-rep-section-ru-strip')).toBeVisible();
    await expect(page.getByTestId('shop-agent-rep-offline-drafts-sync-queue-badge')).toBeVisible();
  });
});
