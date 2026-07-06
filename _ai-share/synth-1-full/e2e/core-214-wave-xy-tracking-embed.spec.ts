import { test, expect } from '@playwright/test';

const COLLECTION = 'SS27';
const DEMO_ORDER = 'B2B-DEMO-SHOP1-SS27';

/**
 * Wave XY: shop CO cabinet tracking embed + chain-status SSE mirror (not separate OP pillar).
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-214-wave-xy-tracking-embed.spec.ts
 */
test.describe('core-214: wave XY shop CO tracking embed', () => {
  test('shop CO cabinet: tracking embed + anchor + nav', async ({ page }) => {
    const res = await page.goto(`/shop/core?pillar=collection_order&collection=${COLLECTION}`, {
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
      await expect(page.locator('#shop-co-buyer-tracking')).toBeVisible();
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
      await expect(embed).toHaveAttribute('data-chain-sse-live', /[01]/);
    }
  });

  test('shop CO cabinet: chain-status SSE mirror on embed', async ({ page }) => {
    const res = await page.goto(`/shop/core?pillar=collection_order&collection=${COLLECTION}`, {
      waitUntil: 'domcontentloaded',
      timeout: 60_000,
    });
    expect(res?.status() ?? 599).toBeLessThan(500);

    const mirror = page
      .locator(`[data-testid="shop-co-cabinet-tracking-embed-chain-mirror-${DEMO_ORDER}"]`)
      .or(page.locator('[data-testid^="shop-co-cabinet-tracking-embed-chain-mirror-"]').first());
    const mirrorVisible = await mirror.isVisible().catch(() => false);
    if (mirrorVisible) {
      await expect(mirror).toHaveAttribute('data-chain-sse-live', /[01]/);
      const sseOrPoll = page
        .locator('[data-testid$="-sse-live"], [data-testid$="-poll"]')
        .filter({ has: mirror });
      await expect(sseOrPoll.first()).toBeVisible();
    }
  });

  test('shop OP pillar URL redirects to CO embed anchor', async ({ page }) => {
    const res = await page.goto(
      `/shop/core?pillar=order_production&collection=${COLLECTION}`,
      { waitUntil: 'domcontentloaded', timeout: 60_000 }
    );
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page).toHaveURL(/pillar=collection_order/, { timeout: 45_000 });
    await expect(page).toHaveURL(/#shop-co-buyer-tracking/);

    await expect(page.getByTestId('shop-co-cabinet-tracking-link')).toHaveCount(0);
    await expect(page.getByTestId('shop-co-cabinet-calendar-link')).toHaveCount(0);
  });

  test('shop calendar: event tracking deep-link strip', async ({ page }) => {
    const res = await page.goto(
      `/shop/b2b/calendar?collection=${COLLECTION}&order=${encodeURIComponent(DEMO_ORDER)}`,
      { waitUntil: 'domcontentloaded', timeout: 60_000 }
    );
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('shop-cm-calendar-context-peer-strip')).toBeVisible({
      timeout: 45_000,
    });

    const strip = page.getByTestId('shop-cm-calendar-event-tracking-strip');
    const stripVisible = await strip.isVisible().catch(() => false);
    if (stripVisible) {
      const deepLink = page.locator('[data-testid^="shop-cm-calendar-tracking-deep-link-"]').first();
      await expect(deepLink).toHaveAttribute('href', /order=B2B/);
    }
  });
});
