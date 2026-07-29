import { expect, test } from '@playwright/test';

test('Showroom workspace hides authoritative records and mutations without credentials', async ({ page }) => {
  await page.goto('/showroom');

  await expect(page.getByTestId('showroom-controlled-state')).toBeVisible();
  await expect(page.getByTestId('authoritative-showroom-workspace')).toHaveCount(0);
  await expect(page.getByTestId('create-showroom-form')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Опубликовать snapshot' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Архивировать' })).toHaveCount(0);
  await expect(page.getByText(/demo showroom/i)).toHaveCount(0);
});
