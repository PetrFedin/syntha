import { test, expect } from '@playwright/test';
import { gotoPlatformCoreWorkspace, gotoRoleCoreCabinet } from './helpers/core-chain-overview';

const GOTO = { waitUntil: 'domcontentloaded' as const, timeout: 90_000 };

/**
 * Wave WK · Supplier material catalog pillar nav + PG read stub + P2/price-delta polish.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-174-wave-wk-material-catalog.spec.ts
 */
test.describe('core-174: wave WK supplier material catalog', () => {
  test('supplier dev cabinet: pillar nav catalog + peers (development)', async ({ page, request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { demoSeeded?: boolean };
    test.skip(!health.demoSeeded, 'нужен db:core:bootstrap');

    const res = await gotoRoleCoreCabinet(
      page,
      '/factory/supplier/core?pillar=development&collection=SS27'
    );
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('role-core-pillar-nav')).toBeVisible({ timeout: 60_000 });

    await expect(page.getByTestId('supplier-dev-pillar-material-catalog-nav')).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByTestId('supplier-core-material-catalog-nav')).toBeVisible();
    await expect(page.getByTestId('supplier-core-material-catalog-materials-peer')).toBeVisible();
    await expect(page.getByTestId('supplier-core-material-catalog-rfq-peer')).toBeVisible();
  });

  test('material catalog workspace: PG read strip + listing core', async ({ page, request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { pgReachable?: boolean; demoSeeded?: boolean };
    test.skip(!health.pgReachable, 'нужен PG');

    const params = new URLSearchParams({ collection: 'SS27' });
    const res = await gotoPlatformCoreWorkspace(
      page,
      `/factory/production/catalog?${params.toString()}`
    );
    expect(res?.status() ?? 599).toBeLessThan(500);

    await expect(page.getByTestId('supplier-material-catalog-pg-read-strip')).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByTestId('supplier-material-catalog-pg-read-badge')).toContainText(/PG read/i);
    await expect(page.getByTestId('supplier-material-catalog-core')).toBeVisible();
  });

  test('material catalog API PG read-path', async ({ request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { pgReachable?: boolean };
    test.skip(!health.pgReachable, 'нужен PG');

    const res = await request.get('/api/workshop2/supplier/material-catalog?supplierId=sup-demo-001');
    expect(res.ok()).toBe(true);
    const json = (await res.json()) as { ok?: boolean; listings?: unknown[] };
    expect(json.ok).toBe(true);
    expect(Array.isArray(json.listings)).toBe(true);
  });

  test('supplier dev cabinet: compare P2 + price delta strips', async ({ page, request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { demoSeeded?: boolean };
    test.skip(!health.demoSeeded, 'нужен db:core:bootstrap');

    const res = await page.goto(
      '/factory/supplier/core?pillar=development&collection=SS27&article=demo-ss27-01',
      GOTO
    );
    expect(res?.status() ?? 599).toBeLessThan(500);

    const p2Strip = page.getByTestId('sup-dev-compare-suppliers-p2-strip');
    await expect(p2Strip).toBeVisible({ timeout: 60_000 });
    await expect(p2Strip).toContainText(/P2|Centric/i);
    await expect(page.getByTestId('sup-dev-compare-suppliers-p2-catalog-link')).toBeVisible();

    const priceDelta = page
      .getByTestId('sup-dev-price-delta-alert-strip')
      .or(page.getByTestId('sup-dev-price-delta-alert-empty'))
      .or(page.getByTestId('sup-dev-price-delta-alert-loading'));
    await expect(priceDelta.first()).toBeVisible({ timeout: 30_000 });
  });

  test('sidebar catalog nav still distinct from pillar nav', async ({ page }) => {
    const res = await page.goto('/factory/supplier/core?pillar=development&collection=SS27', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);

    const sidebarNav = page.getByTestId('supplier-sidebar-materials-catalog-nav');
    await expect(sidebarNav).toBeVisible({ timeout: 45_000 });
    await expect(sidebarNav).toHaveAttribute('href', /\/factory\/production\/catalog/);
  });
});
