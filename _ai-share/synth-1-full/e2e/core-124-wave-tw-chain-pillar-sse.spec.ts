import { test, expect } from '@playwright/test';

const COLLECTION = 'SS27';
const DEMO_ORDER = 'B2B-DEMO-SHOP1-SS27';

/**
 * Wave TW: chain-status SSE on CO/OP pillar cards + calendar↔tracking all roles.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-124-wave-tw-chain-pillar-sse.spec.ts
 */
test.describe('core-124: wave TW chain pillar SSE', () => {
  test('brand CO cabinet: SSE dot badge on pillar insight', async ({ page }) => {
    const res = await page.goto(`/brand/core?pillar=collection_order&collection=${COLLECTION}`, {
      waitUntil: 'domcontentloaded',
      timeout: 60_000,
    });
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('role-pillar-insight-brand-collection_order')).toBeVisible({
      timeout: 45_000,
    });
    const panel = page.getByTestId('brand-co-cabinet-panel');
    await expect(panel).toBeVisible();
    const sseOrPoll = page
      .getByTestId('brand-co-cabinet-sse-live-badge')
      .or(page.getByTestId('brand-co-cabinet-poll-badge'));
    await expect(sseOrPoll.first()).toBeVisible();
  });

  test('shop OP cabinet: chain SSE badge + data-chain-sse-live', async ({ page }) => {
    const res = await page.goto(`/shop/core?pillar=order_production&collection=${COLLECTION}`, {
      waitUntil: 'domcontentloaded',
      timeout: 60_000,
    });
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('shop-op-cabinet-panel')).toBeVisible({ timeout: 45_000 });
    const sseOrPoll = page
      .getByTestId('shop-op-cabinet-sse-live-badge')
      .or(page.getByTestId('shop-op-cabinet-poll-badge'));
    await expect(sseOrPoll.first()).toBeVisible();
    await expect(page.getByTestId('shop-op-cabinet-panel')).toHaveAttribute(
      'data-chain-sse-live',
      /[01]/
    );
  });

  test('manufacturer OP cabinet: SSE/poll badge', async ({ page }) => {
    const res = await page.goto(
      `/factory/production/core?pillar=order_production&collection=${COLLECTION}`,
      { waitUntil: 'domcontentloaded', timeout: 60_000 }
    );
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('mfr-op-cabinet-panel')).toBeVisible({ timeout: 45_000 });
    const sseOrPoll = page
      .getByTestId('mfr-op-cabinet-sse-live-badge')
      .or(page.getByTestId('mfr-op-cabinet-poll-badge'));
    await expect(sseOrPoll.first()).toBeVisible();
  });

  test('supplier OP cabinet: SSE/poll badge', async ({ page }) => {
    const res = await page.goto(
      `/factory/supplier/core?pillar=order_production&collection=${COLLECTION}`,
      { waitUntil: 'domcontentloaded', timeout: 60_000 }
    );
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('sup-op-cabinet-panel')).toBeVisible({ timeout: 45_000 });
    const sseOrPoll = page
      .getByTestId('sup-op-cabinet-sse-live-badge')
      .or(page.getByTestId('sup-op-cabinet-poll-badge'));
    await expect(sseOrPoll.first()).toBeVisible();
  });

  test('brand calendar: tracking deep-link testid + href', async ({ page }) => {
    const res = await page.goto(
      `/brand/calendar?collection=${COLLECTION}&order=${encodeURIComponent(DEMO_ORDER)}`,
      { waitUntil: 'domcontentloaded', timeout: 60_000 }
    );
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('brand-cm-calendar-context-peer-strip')).toBeVisible({
      timeout: 45_000,
    });
    await expect(page.getByTestId('brand-cm-calendar-shop-tracking-link')).toHaveAttribute(
      'href',
      /tracking|order=B2B/
    );
    const deepLink = page.locator('[data-testid^="brand-cm-calendar-tracking-deep-link-"]').first();
    const deepVisible = await deepLink.isVisible().catch(() => false);
    if (deepVisible) {
      await expect(deepLink).toHaveAttribute('href', /order=B2B/);
    }
  });

  test('mfr calendar: peer tracking link', async ({ page }) => {
    const res = await page.goto(
      `/factory/calendar?role=manufacturer&collection=${COLLECTION}&order=${encodeURIComponent(DEMO_ORDER)}`,
      { waitUntil: 'domcontentloaded', timeout: 60_000 }
    );
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('mfr-cm-calendar-context-peer-strip')).toBeVisible({
      timeout: 45_000,
    });
    await expect(page.getByTestId('mfr-cm-calendar-shop-tracking-link')).toHaveAttribute(
      'href',
      /order=B2B/
    );
  });
});
