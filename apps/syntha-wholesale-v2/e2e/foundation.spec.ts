import { expect, test } from '@playwright/test';

test('foundation page and health endpoint are available', async ({ page, request }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Wholesale work');
  await expect(page.getByText('New Syntha is isolated from Legacy')).toBeVisible();

  const response = await request.get('/api/health');
  expect(response.ok()).toBeTruthy();
  await expect(response.json()).resolves.toMatchObject({
    status: 'ok',
    legacyDependency: false,
  });
});
