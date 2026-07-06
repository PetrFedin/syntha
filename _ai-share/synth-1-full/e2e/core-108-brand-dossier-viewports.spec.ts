import { test, expect } from '@playwright/test';

const DOSSIER_URL = '/brand/production/workshop2/c/SS27/a/demo-ss27-01?tab=tz';
const GOTO = { waitUntil: 'domcontentloaded' as const, timeout: 120_000 };

async function expectNoPageOverflow(page: import('@playwright/test').Page): Promise<void> {
  await expect
    .poll(
      () =>
        page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
      { timeout: 30_000 }
    )
    .toBe(true);
}

test.describe('core-108: brand dossier viewports', () => {
  test('iPhone 393 — panel, strips, section nav, actions, no overflow', async ({ page, request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { demoSeeded?: boolean };
    test.skip(!health.demoSeeded, 'нужен db:core:bootstrap');

    test.setTimeout(240_000);
    await page.setViewportSize({ width: 393, height: 812 });

    const res = await page.goto(DOSSIER_URL, GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);

    await expect(page.getByTestId('brand-dev-dossier-panel')).toBeVisible({ timeout: 120_000 });
    await expect(page.getByTestId('brand-dev-dossier-context-strip')).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByTestId('brand-dev-dossier-cross-strip')).toBeVisible();
    await expect(page.getByTestId('brand-dev-dossier-w2-hub-link')).toBeVisible();
    await expect(page.getByTestId('brand-dev-dossier-factory-peer-link')).toBeVisible();
    await expect(page.getByTestId('brand-dev-dossier-section-nav')).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByTestId('brand-dev-dossier-actions-strip')).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByTestId('workshop2-dossier-save-draft')).toBeVisible();

    const saveH = await page
      .getByTestId('workshop2-dossier-save-draft')
      .evaluate((el) => el.getBoundingClientRect().height);
    expect(saveH).toBeGreaterThanOrEqual(44);

    await expectNoPageOverflow(page);
  });

  test('iPad 834 — section nav + context strip, no overflow', async ({ page, request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { demoSeeded?: boolean };
    test.skip(!health.demoSeeded, 'нужен db:core:bootstrap');

    test.setTimeout(240_000);
    await page.setViewportSize({ width: 834, height: 1194 });

    const res = await page.goto(DOSSIER_URL, GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);

    await expect(page.getByTestId('brand-dev-dossier-panel')).toBeVisible({ timeout: 120_000 });
    await expect(page.getByTestId('brand-dev-dossier-context-strip')).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByTestId('brand-dev-dossier-section-nav')).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByTestId('brand-dev-dossier-actions-strip')).toBeVisible({
      timeout: 60_000,
    });

    const strip = page.getByTestId('brand-dev-dossier-context-strip');
    const box = await strip.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      expect(box.width).toBeLessThanOrEqual(834 + 2);
    }

    await expectNoPageOverflow(page);
  });
});
