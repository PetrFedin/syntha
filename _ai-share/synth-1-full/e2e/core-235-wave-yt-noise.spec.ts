import { test, expect } from '@playwright/test';
import { gotoRoleCoreCabinet } from './helpers/core-chain-overview';
import {
  WAVE_YT_HUB_CHAIN_STATUS_OWNER_TESTID,
  WAVE_YT_HUB_READPATH_OWNER_TESTID,
} from '../src/lib/platform/wave-yt-hub-noise-pass2';

/**
 * Wave YT: hub noise pass 2 — hide data-audit-legacy + dedupe chain/sync badges in compact cabinet.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-235-wave-yt-noise.spec.ts
 */
test.describe('core-235: wave YT hub noise pass 2', () => {
  test('brand SC cabinet — no audit-legacy, readpath owner, sync badge deduped', async ({
    page,
    request,
  }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { demoSeeded?: boolean };
    test.skip(!health.demoSeeded, 'нужен db:core:bootstrap');

    await gotoRoleCoreCabinet(page, '/brand/core?pillar=sample_collection&collection=SS27');
    await expect(page.getByTestId('brand-sc-cabinet-panel')).toBeVisible({ timeout: 60_000 });
    await expect(page.locator('[data-audit-legacy]')).toHaveCount(0);
    await expect(page.getByTestId(WAVE_YT_HUB_READPATH_OWNER_TESTID)).toBeVisible({
      timeout: 45_000,
    });
    await expect(page.getByTestId('brand-sc-published-readpath-api')).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByTestId('brand-sc-cabinet-published-sync')).toHaveCount(0);
  });

  test('brand dev cabinet — no audit-legacy attrs in operator mode', async ({ page }) => {
    await gotoRoleCoreCabinet(page, '/brand/core?pillar=development&collection=SS27');
    await expect(page.getByTestId('brand-dev-cabinet-context-strip')).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.locator('[data-audit-legacy]')).toHaveCount(0);
    await expect(page.getByTestId('development-pillar-card')).toBeVisible();
  });

  test('brand comms cabinet — pillar chain badge suppressed, section list owns live dot', async ({
    page,
  }) => {
    await gotoRoleCoreCabinet(page, '/brand/core?pillar=comms&collection=SS27');
    await expect(page.getByTestId('comms-pillar-card')).toBeVisible({ timeout: 60_000 });
    await expect(page.getByTestId('comms-pillar-sse-live-badge')).toHaveCount(0);
    await expect(page.getByTestId(WAVE_YT_HUB_CHAIN_STATUS_OWNER_TESTID)).toBeVisible();
  });

  test('shop SC cabinet — no audit-legacy, published sync deduped', async ({ page, request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    test.skip(!healthRes.ok(), 'health API недоступен');

    await gotoRoleCoreCabinet(page, '/shop/core?pillar=sample_collection&collection=SS27');
    await expect(page.getByTestId('shop-sc-cabinet-panel')).toBeVisible({ timeout: 60_000 });
    await expect(page.locator('[data-audit-legacy]')).toHaveCount(0);
    await expect(page.getByTestId('shop-sc-cabinet-published-sync')).toHaveCount(0);
  });

  test('mfr dev cabinet — PG mirror diagnostics hidden without audit', async ({ page }) => {
    await gotoRoleCoreCabinet(
      page,
      '/factory/production/core?pillar=development&collection=SS27'
    );
    await expect(page.getByTestId('development-pillar-card')).toBeVisible({ timeout: 60_000 });
    await expect(page.getByTestId('mfr-dev-development-status-mirror-strip')).toHaveCount(0);
    await expect(page.getByTestId('mfr-dev-development-sse-live-badge')).toHaveCount(0);
  });

  test('audit ON — legacy attrs visible on brand SC cabinet', async ({ page, request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    test.skip(!healthRes.ok(), 'health API недоступен');

    await page.addInitScript(() => {
      localStorage.setItem(
        'platform-core-hub-views',
        JSON.stringify({ business: true, audit: true, planner: false })
      );
    });

    await gotoRoleCoreCabinet(page, '/brand/core?pillar=sample_collection&collection=SS27');
    await expect(page.getByTestId('brand-sc-cabinet-panel')).toBeVisible({ timeout: 60_000 });
    await expect(page.locator('[data-audit-legacy="brand-sample-collection-mini"]')).toBeVisible({
      timeout: 45_000,
    });
  });
});
