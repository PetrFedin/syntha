import { test, expect } from '@playwright/test';
import { gotoRoleCoreCabinet } from './helpers/core-chain-overview';

const GOTO = { waitUntil: 'domcontentloaded' as const, timeout: 90_000 };

/**
 * Wave YR: brand SC 1.2 — one-click shop matrix prefill + mini-matrix CTA dedup (UE/VC).
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-233-wave-yr-matrix-cta.spec.ts
 */
test.describe('core-233: wave YR brand SC matrix CTA', () => {
  test('cabinet: mini-matrix one-click prefill, golden path matrix deduped', async ({
    page,
    request,
  }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { demoSeeded?: boolean };
    test.skip(!health.demoSeeded, 'нужен db:core:bootstrap');

    const res = await gotoRoleCoreCabinet(
      page,
      '/brand/core?pillar=sample_collection&collection=SS27'
    );
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('brand-sc-cabinet-panel')).toBeVisible({ timeout: 60_000 });
    await expect(page.getByTestId('brand-sample-collection-mini-matrix')).toBeVisible({
      timeout: 45_000,
    });
    await expect(page.getByTestId('brand-sc-audit-path-shop-matrix')).toHaveCount(0);
    await expect(page.getByTestId('brand-sc-mini-matrix-qty-hint')).toContainText(/SKU|матриц/i);

    const href = await page.getByTestId('brand-sc-mini-matrix-link').getAttribute('href');
    expect(href).toMatch(/linesheetArticleIds=/);
    expect(href).toMatch(/linesheetPrefill=1/);

    await page.getByTestId('brand-sc-mini-matrix-link').click();
    await page.waitForURL(/\/shop\/b2b\/matrix/, { timeout: 60_000 });
    expect(page.url()).toMatch(/linesheetArticleIds=/);
    await expect(page.getByTestId('shop-sc-matrix-linesheet-prefill-hint')).toBeVisible({
      timeout: 45_000,
    });
  });

  test('linesheets: open-shop prefill CTA primary, peer matrix deduped', async ({ page, request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    test.skip(!healthRes.ok(), 'health API недоступен');

    const res = await page.goto('/brand/linesheets?collection=SS27', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('brand-sc-linesheets-panel')).toBeVisible({ timeout: 60_000 });
    await expect(page.getByTestId('brand-sc-cross-matrix-open-shop-btn')).toBeVisible({
      timeout: 45_000,
    });
    await expect(page.getByTestId('brand-sc-linesheets-shop-matrix-link')).toHaveCount(0);

    const href = await page.getByTestId('brand-sc-cross-matrix-open-shop-btn').getAttribute('href');
    expect(href).toMatch(/linesheetArticleIds=/);
    expect(href).toMatch(/linesheetPrefill=1/);
  });

  test('showroom: open-shop btn-only prefill, peer matrix deduped', async ({ page, request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    test.skip(!healthRes.ok(), 'health API недоступен');

    const res = await page.goto('/brand/showroom?collection=SS27', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('brand-sc-cross-matrix-open-shop-btn')).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByTestId('brand-sc-showroom-shop-matrix-link')).toHaveCount(0);
    await expect(page.getByTestId('brand-sc-showroom-retail-peer-strip')).toBeVisible();
    await expect(page.getByTestId('brand-sc-showroom-shop-checkout-link')).toBeVisible();

    const href = await page.getByTestId('brand-sc-cross-matrix-open-shop-btn').getAttribute('href');
    expect(href).toMatch(/linesheetArticleIds=|collection=SS27/);
  });
});
