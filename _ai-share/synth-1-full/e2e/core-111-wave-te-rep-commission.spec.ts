import { test, expect } from '@playwright/test';

const GOTO = { waitUntil: 'domcontentloaded' as const, timeout: 90_000 };

/**
 * Wave TE: rep commission ledger PG write + offline drafts sync (fail-closed LS).
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-111-wave-te-rep-commission.spec.ts
 */
test.describe('core-111: wave TE rep commission ledger', () => {
  test('commission ledger API GET contract', async ({ request }) => {
    const res = await request.get('/api/shop/b2b/rep/commission-ledger?repId=rep-anna');
    expect(res.status()).toBeLessThan(500);
    const json = (await res.json()) as {
      ok?: boolean;
      storageMode?: string;
      messageRu?: string;
    };
    expect(typeof json.ok).toBe('boolean');
    if (json.ok && json.storageMode) {
      expect(['postgres', 'file', 'memory', 'empty', 'unavailable']).toContain(json.storageMode);
    }
  });

  test('commission ledger POST payout write', async ({ request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { pgReachable?: boolean };

    const res = await request.post('/api/shop/b2b/rep/commission-ledger', {
      data: { repId: 'rep-anna', action: 'payout_request', orderIds: ['B2B-0010'] },
    });
    expect(res.status()).toBeLessThan(500);
    const json = (await res.json()) as {
      ok?: boolean;
      storageMode?: string;
      messageRu?: string;
    };
    if (health.pgReachable) {
      expect(json.ok).toBe(true);
      expect(json.storageMode).toBe('postgres');
      expect(json.messageRu).toBeTruthy();
    } else {
      expect([503, 200]).toContain(res.status());
    }
  });

  test('rep offline drafts API returns storageMode', async ({ request }) => {
    const res = await request.get('/api/shop/b2b/rep/offline-drafts?repId=rep-demo');
    expect(res.status()).toBeLessThan(500);
    const json = (await res.json()) as { ok?: boolean; storageMode?: string };
    expect(json.ok).toBe(true);
    if (json.storageMode) {
      expect(['postgres', 'file', 'memory', 'unavailable']).toContain(json.storageMode);
    }
  });

  test('sales rep commission tab shows ledger RU strip', async ({ page }) => {
    const res = await page.goto(
      '/shop/b2b/sales-rep-portal?feature=commission&collection=SS27',
      GOTO
    );
    expect(res?.status() ?? 599).toBeLessThan(500);
    const strip = page.getByTestId('shop-agent-rep-commission-ledger-ru-strip');
    await expect(strip).toBeVisible({ timeout: 45_000 });
    const draftsStrip = page.getByTestId('shop-agent-rep-offline-drafts-honesty-strip');
    await expect(draftsStrip).toBeVisible();
    const pgLedger = page.getByTestId('shop-agent-rep-commission-ledger-storage-pg');
    const pgDrafts = page.getByTestId('shop-agent-rep-offline-drafts-storage-pg');
    if ((await pgLedger.count()) > 0) {
      await expect(pgLedger).toContainText('PG');
    }
    if ((await pgDrafts.count()) > 0) {
      await expect(pgDrafts).toContainText('PG');
    }
  });
});
