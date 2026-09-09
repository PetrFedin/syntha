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

    await expect(page.getByText('4 роли × 5 столпов — один Platform Core')).toBeVisible();
    await expect(page.getByText('Golden path: от артикула до закрытия')).toBeVisible();
    await expect(page.getByText('Подтверждено в source')).toBeVisible();

    const platformCta = page.getByRole('link', { name: /Открыть Platform Core|Посмотреть Platform Core/ }).first();
    await expect(platformCta).toHaveAttribute('href', '/platform');

    await expect(page.getByText('Canonical URL')).toBeVisible();
    await expect(page.getByText('Syntha / investors')).toBeVisible();
    await expect(page.locator('svg').filter({ has: page.locator('title', { hasText: 'QR-код публичной страницы Syntha' }) })).toBeVisible();
  });

  test('fits the QR-first mobile viewport without horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 852 });
    await page.goto('/investors', GOTO_OPTS);

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 60_000 });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });
});
