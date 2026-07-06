import { test, expect } from '@playwright/test';

/**
 * Wave SU: shop CO cabinet tracking embed + calendar↔tracking deep-links.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-106-wave-su-co-tracking-embed.spec.ts
 */
test.describe('core-106: wave SU CO tracking embed', () => {
  test('shop CO cabinet post-confirm: tracking embed + nav', async ({ page }) => {
    const res = await page.goto('/shop/core?pillar=collection_order&collection=SS27', {
      waitUntil: 'domcontentloaded',
      timeout: 60_000,
    });
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(
      page.getByTestId('shop-co-cabinet-panel').or(page.getByTestId('collection-order-pillar-card'))
    ).toBeVisible({ timeout: 45_000 });

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

  test('shop calendar: event tracking deep-link strip', async ({ page }) => {
    const res = await page.goto(
      '/shop/b2b/calendar?collection=SS27&order=B2B-SS27-DEMO-001',
      { waitUntil: 'domcontentloaded', timeout: 60_000 }
    );
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('shop-cm-calendar-context-peer-strip')).toBeVisible({
      timeout: 45_000,
    });
    await expect(page.getByTestId('shop-cm-calendar-tracking-link')).toBeVisible();

    const strip = page.getByTestId('shop-cm-calendar-event-tracking-strip');
    const stripVisible = await strip.isVisible().catch(() => false);
    if (stripVisible) {
      const deepLink = page.locator('[data-testid^="shop-cm-calendar-tracking-deep-link-"]').first();
      await expect(deepLink).toBeVisible();
      await expect(deepLink).toHaveAttribute('href', /order=B2B/);
    }
  });

  test('shop tracking panel: calendar CTA', async ({ page }) => {
    const res = await page.goto(
      '/shop/b2b/orders/tracking?order=B2B-SS27-DEMO-001',
      { waitUntil: 'domcontentloaded', timeout: 60_000 }
    );
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(
      page.getByTestId('shop-co-tracking-calendar-link').first()
    ).toBeVisible({ timeout: 45_000 });
  });
});
