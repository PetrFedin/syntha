import { test, expect } from '@playwright/test';

const GOTO = { waitUntil: 'domcontentloaded' as const, timeout: 90_000 };
const COLLECTION = 'SS27';

/**
 * Wave YT: notification center compact on all role pillar cards + calendar/tracking → detail CTA.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-248-wave-yt-notifications.spec.ts
 */
test.describe('core-248: wave YT notification center final', () => {
  for (const roleCase of [
    { role: 'shop', path: `/shop/core?pillar=development&collection=${COLLECTION}`, prefix: 'shop-cm' },
    { role: 'shop-sc', path: `/shop/core?pillar=sample_collection&collection=${COLLECTION}`, prefix: 'shop-cm' },
    { role: 'shop-co', path: `/shop/core?pillar=collection_order&collection=${COLLECTION}`, prefix: 'shop-cm' },
    { role: 'shop-op', path: `/shop/core?pillar=order_production&collection=${COLLECTION}`, prefix: 'shop-cm' },
    { role: 'shop-cm', path: `/shop/core?pillar=comms&collection=${COLLECTION}`, prefix: 'shop-cm' },
    { role: 'brand-dev', path: `/brand/core?pillar=development&collection=${COLLECTION}`, prefix: 'brand-cm' },
    { role: 'brand-sc', path: `/brand/core?pillar=sample_collection&collection=${COLLECTION}`, prefix: 'brand-cm' },
    { role: 'brand-co', path: `/brand/core?pillar=collection_order&collection=${COLLECTION}`, prefix: 'brand-cm' },
    { role: 'brand-op', path: `/brand/core?pillar=order_production&collection=${COLLECTION}`, prefix: 'brand-cm' },
    { role: 'brand-cm', path: `/brand/core?pillar=comms&collection=${COLLECTION}`, prefix: 'brand-cm' },
    {
      role: 'mfr-dev',
      path: `/factory/production/core?pillar=development&collection=${COLLECTION}`,
      prefix: 'mfr-cm',
    },
    {
      role: 'mfr-op',
      path: `/factory/production/core?pillar=order_production&collection=${COLLECTION}`,
      prefix: 'mfr-cm',
    },
    {
      role: 'mfr-cm',
      path: `/factory/production/core?pillar=comms&collection=${COLLECTION}`,
      prefix: 'mfr-cm',
    },
    {
      role: 'sup-op',
      path: `/factory/supplier/core?pillar=order_production&collection=${COLLECTION}`,
      prefix: 'sup-cm',
    },
    {
      role: 'sup-co',
      path: `/factory/supplier/core?pillar=collection_order&collection=${COLLECTION}`,
      prefix: 'sup-cm',
    },
    {
      role: 'sup-cm',
      path: `/factory/supplier/core?pillar=comms&collection=${COLLECTION}`,
      prefix: 'sup-cm',
    },
  ] as const) {
    test(`${roleCase.role} hub pillar — compact notification center`, async ({ page }) => {
      await page.goto(roleCase.path, GOTO);
      const compact = page.getByTestId(`${roleCase.prefix}-notification-center-compact`);
      if ((await compact.count()) === 0) {
        test.skip(true, 'notification strip not mounted (no active order / empty pillar)');
      }
      await expect(compact).toBeVisible({ timeout: 45_000 });
      const prefs = page.getByTestId(`${roleCase.prefix}-notification-prefs-compact`);
      if ((await prefs.count()) > 0) {
        await expect(prefs).toHaveCount(1);
      }
    });
  }

  test('shop calendar — notification detail CTA, no duplicate inline strip', async ({ page }) => {
    await page.goto(`/shop/b2b/calendar?collection=${COLLECTION}`, GOTO);
    const peer = page.getByTestId('shop-cm-calendar-context-peer-strip');
    await expect(peer).toBeVisible({ timeout: 45_000 });
    const detail = page.getByTestId('shop-cm-calendar-notification-detail-link');
    if ((await detail.count()) > 0) {
      await expect(detail).toBeVisible();
      const href = await detail.getAttribute('href');
      expect(href ?? '').toMatch(/pillar=comms/);
      expect(href ?? '').toMatch(/pcNotification=detail/);
    }
    await expect(page.getByTestId('shop-cm-notification-center-compact')).toHaveCount(0);
  });

  test('brand calendar — notification detail CTA from peer strip', async ({ page }) => {
    await page.goto(`/brand/calendar?collection=${COLLECTION}`, GOTO);
    const peer = page.getByTestId('brand-cm-calendar-context-peer-strip');
    await expect(peer).toBeVisible({ timeout: 45_000 });
    const detail = page.getByTestId('brand-cm-calendar-notification-detail-link');
    if ((await detail.count()) > 0) {
      await expect(detail).toBeVisible();
      const href = await detail.getAttribute('href');
      expect(href ?? '').toContain('pillar=comms');
      expect(href ?? '').toContain('pcNotification=detail');
    }
  });
});
