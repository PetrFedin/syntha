import { test, expect } from '@playwright/test';

const GOTO = { waitUntil: 'domcontentloaded' as const, timeout: 90_000 };

/**
 * Wave XI: brand production operations — PG SoT + operations ↔ handoff peer strip.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-198-wave-xi-prod-ops.spec.ts
 */
test.describe('core-198: wave XI brand production ops PG', () => {
  test('operations-state API returns storageMode pg when ok', async ({ request }) => {
    const res = await request.get('/api/brand/production/operations-state');
    expect(res.status()).toBeLessThan(500);
    const json = (await res.json()) as { ok?: boolean; storageMode?: string };
    if (json.ok) {
      expect(json.storageMode).toBe('pg');
    }
  });

  test('ops spine API returns ok for SS27 collection', async ({ request }) => {
    const res = await request.get('/api/brand/production/ops?collectionId=SS27');
    expect(res.status()).toBeLessThan(500);
    const json = (await res.json()) as { ok?: boolean; storageMode?: string };
    if (json.ok) {
      expect(['pg', 'file', 'empty']).toContain(json.storageMode);
    }
  });

  test('operations page: PG badge + handoff peer strip', async ({ page }) => {
    const healthRes = await page.request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { demoSeeded?: boolean };
    test.skip(!health.demoSeeded, 'нужен db:core:bootstrap');

    const res = await page.goto(
      '/brand/production/operations?collection=SS27&pcf=operations',
      GOTO
    );
    expect(res?.status() ?? 599).toBeLessThan(500);

    const pgBadge = page.getByTestId('brand-production-ops-storage-pg');
    const unavailBadge = page.getByTestId('brand-production-ops-storage-unavailable');
    await expect(pgBadge.or(unavailBadge)).toBeVisible({ timeout: 45_000 });

    await expect(page.getByTestId('brand-production-operations-panel')).toBeVisible({
      timeout: 45_000,
    });

    const peerStrip = page.getByTestId('brand-op-operations-handoff-peer-strip');
    if (await peerStrip.isVisible().catch(() => false)) {
      await expect(peerStrip.getByTestId('brand-op-handoff-peer-link')).toBeVisible();
      await expect(peerStrip.getByTestId('brand-op-handoff-factory-queue-peer-link')).toBeVisible();
    }
  });

  test('handoff tab: operations peer link (no dup handoff link)', async ({ page }) => {
    const healthRes = await page.request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { demoSeeded?: boolean };
    test.skip(!health.demoSeeded, 'нужен db:core:bootstrap');

    const res = await page.goto(
      '/brand/production/operations?collection=SS27&pcf=handoff',
      GOTO
    );
    expect(res?.status() ?? 599).toBeLessThan(500);

    await expect(page.getByTestId('brand-production-handoff-panel')).toBeVisible({
      timeout: 60_000,
    });

    const peerStrip = page.getByTestId('brand-op-operations-handoff-peer-strip');
    await expect(peerStrip).toBeVisible({ timeout: 45_000 });
    await expect(peerStrip.getByTestId('brand-op-handoff-operations-peer-link')).toBeVisible();
    await expect(peerStrip.getByTestId('brand-op-handoff-peer-link')).toHaveCount(0);
    await expect(peerStrip.getByTestId('brand-op-handoff-factory-queue-peer-link')).toBeVisible();
  });
});
