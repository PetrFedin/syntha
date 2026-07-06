import { test, expect } from '@playwright/test';

/**
 * Wave SL: S1 localStorage purge — production ops PG, no LS fallback badges.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-95-wave-sl-pg-storage.spec.ts
 */
test.describe('core-95: wave SL PG storage purge', () => {
  test('brand production ops API returns PG or unavailable (not silent LS)', async ({ request }) => {
    const res = await request.get('/api/brand/production/operations-state');
    expect(res.status()).toBeLessThan(500);
    const json = (await res.json()) as { ok?: boolean; storageMode?: string };
    if (json.ok) {
      expect(json.storageMode).toBe('postgres');
    }
  });

  test('brand production ops page shows PG badge or unavailable', async ({ page }) => {
    const res = await page.goto('/brand/production/operations?collection=SS27', {
      waitUntil: 'domcontentloaded',
      timeout: 60_000,
    });
    expect(res?.status() ?? 599).toBeLessThan(500);
    const pgBadge = page.getByTestId('brand-production-ops-storage-pg');
    const unavailBadge = page.getByTestId('brand-production-ops-storage-unavailable');
    await expect(pgBadge.or(unavailBadge)).toBeVisible({ timeout: 45_000 });
  });

  test('rep offline drafts API contract', async ({ request }) => {
    const res = await request.get('/api/shop/b2b/rep/offline-drafts?repId=rep-demo');
    expect(res.status()).toBeLessThan(500);
    const json = (await res.json()) as { ok?: boolean; storageMode?: string };
    expect(typeof json.ok).toBe('boolean');
  });
});
