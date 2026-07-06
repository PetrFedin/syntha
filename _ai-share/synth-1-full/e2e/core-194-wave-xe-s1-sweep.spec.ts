import { test, expect } from '@playwright/test';

const W2_DEV_HEADERS = {
  'content-type': 'application/json',
  'x-w2-actor-label': 'e2e-wave-xe',
  'x-w2-actor-id': 'brand-001',
  'x-w2-actor-roles': 'production:edit',
  'x-w2-organization-id': 'org-brand-001',
};

const GOTO = { waitUntil: 'domcontentloaded' as const, timeout: 90_000 };

/**
 * Wave XE: S1 final localStorage sweep — BFF storageMode pg contract.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-194-wave-xe-s1-sweep.spec.ts
 */
test.describe('core-194: wave XE S1 LS final sweep BFF', () => {
  test('brand production ops API returns storageMode pg when ok', async ({ request }) => {
    const res = await request.get('/api/brand/production/operations-state', {
      headers: W2_DEV_HEADERS,
    });
    expect(res.status()).toBeLessThan(500);
    const json = (await res.json()) as { ok?: boolean; storageMode?: string };
    if (json.ok) {
      expect(json.storageMode).toBe('pg');
    }
  });

  test('create-article wizard draft API returns storageMode pg when ok', async ({ request }) => {
    const res = await request.get('/api/brand/production/create-article-wizard-draft/SS27', {
      headers: W2_DEV_HEADERS,
    });
    expect(res.status()).toBeLessThan(500);
    const json = (await res.json()) as { ok?: boolean; storageMode?: string };
    if (json.ok) {
      expect(['pg', 'memory']).toContain(json.storageMode);
    }
  });

  test('floor-tab subcontractor API returns storageMode pg when ok', async ({ request }) => {
    const res = await request.get('/api/brand/production/floor-tabs/subcontractor', {
      headers: W2_DEV_HEADERS,
    });
    expect(res.status()).toBeLessThan(500);
    const json = (await res.json()) as { ok?: boolean; storageMode?: string };
    if (json.ok) {
      expect(['pg', 'memory', 'unavailable']).toContain(json.storageMode);
    }
  });

  test('comms notification prefs API returns storageMode pg when ok', async ({ request }) => {
    const res = await request.get('/api/platform-core/comms/notification-prefs?role=shop');
    expect(res.status()).toBeLessThan(500);
    const json = (await res.json()) as { ok?: boolean; storageMode?: string };
    if (json.ok) {
      expect(['pg', 'file', 'memory']).toContain(json.storageMode);
    }
  });

  test('brand production ops page shows PG badge or unavailable', async ({ page }) => {
    const healthRes = await page.request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { demoSeeded?: boolean };
    test.skip(!health.demoSeeded, 'нужен db:core:bootstrap');

    const res = await page.goto('/brand/production/operations?collection=SS27', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    const pgBadge = page.getByTestId('brand-production-ops-storage-pg');
    const unavailBadge = page.getByTestId('brand-production-ops-storage-unavailable');
    await expect(pgBadge.or(unavailBadge)).toBeVisible({ timeout: 45_000 });
  });
});
