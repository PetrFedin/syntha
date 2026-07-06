import { test, expect } from '@playwright/test';

/**
 * Wave SK: universal inbox on messages + supplier RFQ inbox route + mfr empty badges.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-94-wave-sk-universal-inbox.spec.ts
 */
test.describe('core-94: wave SK universal inbox + RFQ route', () => {
  test('shop messages: universal inbox strip', async ({ page }) => {
    const res = await page.goto('/shop/messages?collection=SS27', {
      waitUntil: 'domcontentloaded',
      timeout: 60_000,
    });
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('comms-universal-inbox-strip')).toBeVisible({ timeout: 45_000 });
    await expect(page.getByTestId('shop-cm-universal-inbox-po-list')).toBeVisible();
  });

  test('supplier RFQ inbox route (not messages alias)', async ({ page }) => {
    const res = await page.goto('/factory/supplier/rfq-inbox?collection=SS27', {
      waitUntil: 'domcontentloaded',
      timeout: 60_000,
    });
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('supplier-rfq-inbox-core')).toBeVisible({ timeout: 45_000 });
    await expect(page.getByTestId('supplier-procurement-rfq-inbox-link')).toBeVisible();
  });

  test('mfr empty SC publish badge on hub', async ({ page }) => {
    const res = await page.goto(
      '/factory/production/core?pillar=sample_collection&collection=SS27',
      { waitUntil: 'domcontentloaded', timeout: 60_000 }
    );
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('manufacturer-sample-collection-mini')).toBeVisible({
      timeout: 45_000,
    });
  });
});
