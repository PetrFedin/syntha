import { test, expect } from '@playwright/test';

/**
 * Wave TN: brand SC publish audit PG journal + cabinet panel.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-117-wave-tn-publish-audit-pg.spec.ts
 */
test.describe('core-117: wave TN publish audit PG', () => {
  test('publish-audit-log API reads PG journal', async ({ request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { demoSeeded?: boolean; pgReachable?: boolean };
    test.skip(!health.demoSeeded || !health.pgReachable, 'нужен db:core:bootstrap + PG');

    const res = await request.get('/api/workshop2/collections/SS27/publish-audit-log?limit=8');
    expect(res.ok()).toBeTruthy();
    const json = (await res.json()) as {
      ok?: boolean;
      collectionId?: string;
      events?: unknown[];
      storageMode?: string;
      messageRu?: string;
    };
    expect(json.ok).toBe(true);
    expect(json.collectionId).toBe('SS27');
    expect(Array.isArray(json.events)).toBe(true);
    expect(json.storageMode).toBe('postgres');
    expect(json.messageRu).toBeTruthy();
  });

  test('brand SC cabinet mounts PG publish audit panel', async ({ page, request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { demoSeeded?: boolean };
    test.skip(!health.demoSeeded, 'нужен db:core:bootstrap');

    await page.goto('/brand/core?pillar=sample_collection&collection=SS27', {
      waitUntil: 'domcontentloaded',
      timeout: 60_000,
    });
    await expect(page.getByTestId('brand-sc-cabinet-panel')).toBeVisible({ timeout: 60_000 });
    await expect(page.getByTestId('brand-release-publish-audit-panel')).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByTestId('brand-sc-publish-audit-log')).toBeVisible({ timeout: 30_000 });
    await expect(
      page
        .getByTestId('brand-sc-publish-audit-list')
        .or(page.getByTestId('brand-sc-publish-audit-empty'))
    ).toBeVisible();
  });
});
