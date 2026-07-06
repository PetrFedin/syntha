import { test, expect } from '@playwright/test';
import { gotoPlatformCoreWorkspace, gotoRoleCoreCabinet } from './helpers/core-chain-overview';

const GOTO = { waitUntil: 'domcontentloaded' as const, timeout: 90_000 };

/**
 * Wave VG · Supplier development polish: compare P2 strip, quote card RU, catalog nav peers.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-152-wave-vg-supplier-dev.spec.ts
 */
test.describe('core-152: wave VG supplier development polish', () => {
  test('materials development: compare P2 strip + peer links', async ({ page, request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { demoSeeded?: boolean };
    test.skip(!health.demoSeeded, 'нужен db:core:bootstrap');

    const params = new URLSearchParams({
      collection: 'SS27',
      article: 'demo-ss27-01',
      view: 'development',
    });
    const res = await gotoPlatformCoreWorkspace(
      page,
      `/factory/production/materials?${params.toString()}`
    );
    expect(res?.status() ?? 599).toBeLessThan(500);

    const strip = page.getByTestId('sup-dev-compare-suppliers-p2-strip');
    await expect(strip).toBeVisible({ timeout: 60_000 });
    await expect(strip).toContainText(/P2|Centric|поставщик/i);
    await expect(page.getByTestId('sup-dev-compare-suppliers-p2-materials-link')).toBeVisible();
    await expect(page.getByTestId('sup-dev-compare-suppliers-p2-catalog-link')).toBeVisible();
    await expect(page.getByTestId('sup-dev-compare-suppliers-p2-rfq-link')).toBeVisible();
  });

  test('supplier RFQ inbox: quote card RU + compare cross-link', async ({ page, request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { demoSeeded?: boolean };
    test.skip(!health.demoSeeded, 'нужен db:core:bootstrap');

    const res = await page.goto('/factory/supplier/rfq-inbox?collection=SS27&article=demo-ss27-01', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('supplier-rfq-inbox-panel')).toBeVisible({ timeout: 60_000 });

    const quotePanel = page.getByTestId('sup-dev-rfq-quote-card-panel');
    const quoteMissing = page.getByTestId('sup-dev-rfq-quote-card-missing');
    const quoteEmpty = page.getByTestId('sup-dev-rfq-quote-card-empty');
    await expect(quotePanel.or(quoteMissing).or(quoteEmpty).first()).toBeVisible({ timeout: 30_000 });

    const compareLink = page.getByTestId('sup-dev-rfq-quote-card-compare-link');
    if (await compareLink.isVisible().catch(() => false)) {
      const href = await compareLink.getAttribute('href');
      expect(href).toMatch(/view=development/);
    }
  });

  test('supplier dev cabinet: compare strip wired + catalog nav peers', async ({ page, request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { demoSeeded?: boolean };
    test.skip(!health.demoSeeded, 'нужен db:core:bootstrap');

    const res = await gotoRoleCoreCabinet(
      page,
      '/factory/core?pillar=development&collection=SS27'
    );
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('role-core-pillar-nav')).toBeVisible({ timeout: 60_000 });

    await expect(page.getByTestId('supplier-core-material-catalog-nav')).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByTestId('supplier-core-material-catalog-materials-peer')).toBeVisible();
    await expect(page.getByTestId('supplier-core-material-catalog-rfq-peer')).toBeVisible();

    await expect(page.getByTestId('sup-dev-compare-suppliers-p2-strip')).toBeVisible({
      timeout: 30_000,
    });
  });
});
