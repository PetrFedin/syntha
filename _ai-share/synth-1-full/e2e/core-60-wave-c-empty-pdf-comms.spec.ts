import { test, expect } from '@playwright/test';
import { gotoRoleCoreCabinet } from './helpers/core-chain-overview';
import { checkoutPgOrderViaMatrix } from './helpers/core-checkout-pg';

const GOTO = { waitUntil: 'domcontentloaded' as const, timeout: 90_000 };

/**
 * Wave C: EMPTY27 linesheets PDF edge + compact comms notification center.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-60-wave-c-empty-pdf-comms.spec.ts
 */
test.describe('core-60: Wave C empty PDF + comms compact', () => {
  test('EMPTY27 linesheets: PDF disabled + honest hint', async ({ page, request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    test.skip(!healthRes.ok(), 'health API недоступен');

    const res = await page.goto('/brand/linesheets?collection=EMPTY27', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('brand-sc-linesheets-panel')).toBeVisible({ timeout: 60_000 });
    await expect(page.getByTestId('brand-sc-linesheet-pdf-empty-disabled')).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByTestId('brand-sc-linesheet-pdf-empty-disabled')).toContainText(
      /пустая коллекция/i
    );
    await expect(page.getByTestId('brand-sc-linesheet-pdf-empty-hint')).toContainText(/EMPTY27|SS27/i);
    await expect(page.getByTestId('brand-sc-linesheets-pdf-link')).toHaveCount(0);

    const pdfRes = await request.get('/api/workshop2/collections/EMPTY27/linesheet.pdf', {
      headers: { Accept: 'application/pdf' },
    });
    expect(pdfRes.status()).toBeGreaterThanOrEqual(400);
  });

  test('shop comms hub: compact notification center', async ({ page, request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { demoSeeded?: boolean };
    test.skip(!health.demoSeeded, 'нужен db:core:bootstrap');

    await checkoutPgOrderViaMatrix(page);

    const res = await gotoRoleCoreCabinet(page, '/shop/core?pillar=comms&collection=SS27');
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('comms-pillar-card')).toBeVisible({ timeout: 60_000 });
    await expect(page.getByTestId('shop-cm-notification-center-compact')).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByTestId('shop-cm-notification-center')).toBeVisible({ timeout: 15_000 });
  });

  test('shop RFQ legacy: честный redirect про чат', async ({ page }) => {
    const res = await page.goto('/shop/b2b/rfq?collection=SS27', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('platform-core-rfq-legacy-redirect')).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByTestId('platform-core-rfq-legacy-redirect')).toContainText(/чат/i);
  });
});
