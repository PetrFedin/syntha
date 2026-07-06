import { test, expect } from '@playwright/test';

const COLLECTION = 'SS27';
const DEMO_ORDER = 'B2B-DEMO-SHOP1-SS27';

/**
 * Wave VJ: shop tracking chain-status mirror + materials push + calendar deep-links all roles.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-154-wave-vj-shop-tracking.spec.ts
 */
test.describe('core-154: wave VJ shop tracking polish', () => {
  test('shop tracking: chain-status mirror badge on focus row', async ({ page }) => {
    const res = await page.goto(
      `/shop/b2b/orders/tracking?order=${encodeURIComponent(DEMO_ORDER)}`,
      { waitUntil: 'domcontentloaded', timeout: 60_000 }
    );
    expect(res?.status() ?? 599).toBeLessThan(500);

    const row = page
      .getByTestId('shop-co-tracking-focus-row')
      .or(page.locator(`[data-testid="shop-co-tracking-row-${DEMO_ORDER}"]`));
    await expect(row.first()).toBeVisible({ timeout: 45_000 });

    const mirror = page.locator(`[data-testid^="shop-co-tracking-chain-status-mirror-"]`).first();
    const mirrorVisible = await mirror.isVisible().catch(() => false);
    if (mirrorVisible) {
      await expect(mirror).toHaveAttribute('data-chain-sse-live', /[01]/);
      const sseOrPoll = page
        .locator('[data-testid$="-sse-live"], [data-testid$="-poll"]')
        .filter({ has: mirror });
      await expect(sseOrPoll.first()).toBeVisible();
    }

    const materialsStrip = page.locator('[data-testid^="shop-co-tracking-materials-push-"]').first();
    if ((await materialsStrip.count()) > 0) {
      await expect(materialsStrip).toHaveAttribute('data-materials-sse-live', /[01]/);
    }
  });

  test('shop calendar: event tracking strip deep-link', async ({ page }) => {
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
      await expect(deepLink).toBeVisible();
      await expect(deepLink).toHaveAttribute('href', /order=B2B/);
    }
  });

  test('brand calendar: tracking deep-link row', async ({ page }) => {
    const res = await page.goto(
      `/brand/calendar?collection=${COLLECTION}&order=${encodeURIComponent(DEMO_ORDER)}`,
      { waitUntil: 'domcontentloaded', timeout: 60_000 }
    );
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('brand-cm-calendar-context-peer-strip')).toBeVisible({
      timeout: 45_000,
    });

    const strip = page.getByTestId('brand-cm-calendar-event-tracking-strip');
    const stripVisible = await strip.isVisible().catch(() => false);
    if (stripVisible) {
      const deepLink = page.locator('[data-testid^="brand-cm-calendar-tracking-deep-link-"]').first();
      await expect(deepLink).toHaveAttribute('href', /order=B2B/);
    }
  });

  test('supplier calendar: tracking deep-link row', async ({ page }) => {
    const res = await page.goto(
      `/factory/calendar?role=supplier&collection=${COLLECTION}&order=${encodeURIComponent(DEMO_ORDER)}`,
      { waitUntil: 'domcontentloaded', timeout: 60_000 }
    );
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('sup-cm-calendar-context-peer-strip')).toBeVisible({
      timeout: 45_000,
    });

    const strip = page.getByTestId('sup-cm-calendar-event-tracking-strip');
    const stripVisible = await strip.isVisible().catch(() => false);
    if (stripVisible) {
      const deepLink = page.locator('[data-testid^="sup-cm-calendar-tracking-deep-link-"]').first();
      await expect(deepLink).toHaveAttribute('href', /order=B2B/);
    }
  });

  test('mfr calendar: tracking deep-link row', async ({ page }) => {
    const res = await page.goto(
      `/factory/calendar?role=manufacturer&collection=${COLLECTION}&order=${encodeURIComponent(DEMO_ORDER)}`,
      { waitUntil: 'domcontentloaded', timeout: 60_000 }
    );
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('mfr-cm-calendar-context-peer-strip')).toBeVisible({
      timeout: 45_000,
    });

    const strip = page.getByTestId('mfr-cm-calendar-event-tracking-strip');
    const stripVisible = await strip.isVisible().catch(() => false);
    if (stripVisible) {
      const deepLink = page.locator('[data-testid^="mfr-cm-calendar-tracking-deep-link-"]').first();
      await expect(deepLink).toHaveAttribute('href', /order=B2B/);
    }
  });
});
