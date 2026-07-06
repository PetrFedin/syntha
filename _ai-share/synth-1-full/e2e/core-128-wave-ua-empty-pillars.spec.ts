import { test, expect } from '@playwright/test';

const GOTO = { waitUntil: 'domcontentloaded' as const, timeout: 90_000 };

/**
 * Wave UA: P3 empty pillars — shop dev bridge, supplier SC/CO, shop CO tracking embed.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-128-wave-ua-empty-pillars.spec.ts
 */
test.describe('core-128: wave UA empty pillars', () => {
  test('shop development empty pillar: dossier preview + sample request', async ({ page }) => {
    const res = await page.goto('/shop/core?pillar=development&collection=SS27', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('shop-development-bridge')).toBeVisible({ timeout: 60_000 });
    await page.getByTestId('shop-development-bridge-brand-w2-preview').click();
    await expect(page.getByTestId('shop-development-bridge-dossier-preview-dialog')).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByTestId('shop-dev-bridge-request-sample-preview-btn')).toBeVisible();
    await page.getByTestId('shop-dev-bridge-request-sample-preview-btn').click();
    await expect(page.getByTestId('shop-dev-bridge-request-sample-msg')).toBeVisible({
      timeout: 30_000,
    });
  });

  test('supplier empty SC: linesheet notify strip + BOM mini', async ({ page }) => {
    const res = await page.goto(
      '/factory/supplier/core?pillar=sample_collection&collection=SS27',
      GOTO
    );
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('supplier-bom-preview-mini')).toBeVisible({ timeout: 60_000 });
    await expect(page.getByTestId('sup-empty-sc-linesheet-notify-strip')).toBeVisible({
      timeout: 45_000,
    });
    await expect(page.getByTestId('sup-empty-sc-linesheet-bom-peer-link')).toBeVisible();
  });

  test('supplier empty CO: forecast + expected PO date strip', async ({ page }) => {
    const res = await page.goto(
      '/factory/supplier/core?pillar=collection_order&collection=SS27',
      GOTO
    );
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('supplier-collection-order-forecast')).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByTestId('sup-empty-co-expected-po-date-strip')).toBeVisible({
      timeout: 45_000,
    });
    await expect(page.getByTestId('sup-empty-co-peer-strip')).toBeVisible();
  });

  test('shop CO cabinet: tracking embed RU nav when post-confirm', async ({ page }) => {
    const res = await page.goto('/shop/core?pillar=collection_order&collection=SS27', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(
      page.getByTestId('shop-co-cabinet-panel').or(page.getByTestId('collection-order-pillar-card'))
    ).toBeVisible({ timeout: 60_000 });

    const embed = page.getByTestId('shop-co-cabinet-tracking-embed');
    const embedVisible = await embed.isVisible().catch(() => false);
    if (embedVisible) {
      await expect(page.getByTestId('shop-co-cabinet-tracking-embed-facts')).toBeVisible();
      await expect(page.getByTestId('shop-co-cabinet-tracking-embed-nav')).toBeVisible();
      await expect(page.getByTestId('shop-co-cabinet-tracking-embed-tracking-link')).toHaveAttribute(
        'href',
        /tracking|order=B2B/
      );
      await expect(page.getByTestId('shop-co-cabinet-tracking-embed-calendar-link')).toHaveAttribute(
        'href',
        /calendar.*order=/
      );
    }
  });

  test('POST request-sample from dev bridge API', async ({ request }) => {
    const res = await request.post('/api/shop/b2b/development/request-sample', {
      data: {
        buyerId: 'shop1',
        collectionId: 'SS27',
        articleId: 'demo-ss27-01',
      },
    });
    expect(res.status()).toBeLessThan(500);
    const json = (await res.json()) as { ok?: boolean; messageRu?: string };
    expect(typeof json.messageRu).toBe('string');
  });
});
