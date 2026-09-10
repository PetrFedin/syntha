import { expect, test } from '@playwright/test';

const GOTO_OPTS = { waitUntil: 'domcontentloaded' as const, timeout: 60_000 };

test.describe('Syntha public investor brief', () => {
  test('opens anonymously and keeps Platform Core as the live product CTA', async ({ page }) => {
    const response = await page.goto('/investors', GOTO_OPTS);

    expect(response?.status() ?? 599).toBeLessThan(500);
    await expect(page).toHaveURL(/\/investors\/?$/);
    await expect(
      page.getByRole('heading', {
        name: 'От артикула до закрытия заказа — одна операционная среда fashion-бизнеса',
      })
    ).toBeVisible({ timeout: 60_000 });

    await expect(page.getByText('Четыре стороны одной fashion-цепочки')).toBeVisible();
    await expect(page.getByText('От артикула до закрытия — один маршрут данных и решений')).toBeVisible();
    await expect(page.getByText('Реализовано', { exact: true })).toBeVisible();

    const platformCta = page
      .getByRole('link', { name: /Открыть платформу|Посмотреть платформу/ })
      .first();
    await expect(platformCta).toHaveAttribute('href', '/platform');

    await expect(page.getByTestId('investors-canonical-url')).toBeVisible();
    await expect(page.getByText('Syntha · Fashion OS').last()).toBeVisible();
    await expect(
      page.locator('svg').filter({
        has: page.locator('title', { hasText: 'QR-код публичной страницы Syntha' }),
      })
    ).toBeVisible();

    await page.screenshot({ path: 'test-results/investors-desktop.png', fullPage: true });
  });

  test('fits the QR-first mobile viewport without horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 852 });
    await page.goto('/investors', GOTO_OPTS);

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 60_000 });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(1);

    await page.screenshot({ path: 'test-results/investors-mobile.png', fullPage: true });
  });
});
