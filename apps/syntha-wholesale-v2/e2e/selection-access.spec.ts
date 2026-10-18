import { expect, test } from '@playwright/test';

test('Selection shows a controlled state without server credentials', async ({ page }) => {
  await page.goto('/selections');
  await expect(page.getByTestId('selection-controlled-state')).toBeVisible();
  await expect(page.getByTestId('authoritative-selection-workspace')).toHaveCount(0);
  await expect(page.getByTestId('add-selection-item-form')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Выдать доступ' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Перевести в READY' })).toHaveCount(0);
});
