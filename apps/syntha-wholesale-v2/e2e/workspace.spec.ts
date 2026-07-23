import { expect, test } from '@playwright/test';

const routes = [
  '/',
  '/campaigns',
  '/collections',
  '/showroom',
  '/selections',
  '/order-builder',
  '/orders',
  '/confirmation',
  '/dealspace',
  '/messages',
  '/calendar',
  '/analytics',
  '/settings',
  '/help',
  '/notifications',
  '/search?q=test',
] as const;

const lifecycle = [
  '/campaigns',
  '/collections',
  '/showroom',
  '/selections',
  '/order-builder',
  '/orders',
  '/confirmation',
  '/dealspace',
] as const;

test('health endpoint reports an independent runtime', async ({ request }) => {
  const response = await request.get('/api/health');
  expect(response.ok()).toBeTruthy();
  await expect(response.json()).resolves.toMatchObject({
    status: 'ok',
    legacyDependency: false,
  });
});

for (const route of routes) {
  test(`${route} is a real, linked workspace route`, async ({ page, request }) => {
    const response = await page.goto(route);
    expect(response?.ok()).toBeTruthy();
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('main')).toBeVisible();

    const internalHrefs = await page.locator('a[href]').evaluateAll((links) =>
      links.map((link) => link.getAttribute('href')).filter(
        (href): href is string => Boolean(href?.startsWith('/')),
      ),
    );
    expect(internalHrefs.some((href) => href.startsWith('#'))).toBe(false);
    for (const href of new Set(internalHrefs)) {
      const target = await request.get(href);
      expect(target.status(), `broken internal link ${href} from ${route}`).toBeLessThan(400);
    }
  });
}

test('unknown workspace section returns 404', async ({ request }) => {
  const response = await request.get('/not-a-workspace-section');
  expect(response.status()).toBe(404);
});

test('desktop shell exposes the active sidebar and hides mobile navigation', async ({
  page,
}, testInfo) => {
  test.skip(!testInfo.project.name.includes('Desktop'));
  await page.goto('/collections');

  await expect(page.getByTestId('desktop-navigation')).toBeVisible();
  await expect(page.getByTestId('mobile-navigation')).toBeHidden();
  await expect(page.locator('.workspaceTopbar')).toBeVisible();
  await expect(page.getByTestId('desktop-navigation').getByRole('link', { name: 'Коллекции' }))
    .toHaveAttribute('aria-current', 'page');
});

test('mobile shell exposes active navigation without horizontal overflow', async ({
  page,
}, testInfo) => {
  test.skip(!['Tablet', 'iPhone'].includes(testInfo.project.name));
  await page.goto('/orders');

  await expect(page.getByTestId('desktop-navigation')).toBeHidden();
  await expect(page.getByTestId('mobile-navigation')).toBeVisible();
  await expect(page.getByTestId('mobile-navigation').getByRole('link', { name: 'Заказы' }))
    .toHaveAttribute('aria-current', 'page');
  await expect(page.getByRole('link', { name: /перейти к подтверждению/i }).first()).toBeVisible();
  const dimensions = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    content: document.documentElement.scrollWidth,
  }));
  expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport);
});

test('commercial lifecycle is traversable and preserves context', async ({ page }) => {
  await page.goto('/?campaignId=campaign-1');
  await page.getByRole('link', { name: /начать коммерческий поток/i }).click();

  for (let index = 0; index < lifecycle.length; index += 1) {
    await expect(page).toHaveURL(new RegExp(`${lifecycle[index]}.*campaignId=campaign-1`));
    await expect(page.locator('h1')).toHaveCount(1);
    if (index < lifecycle.length - 1) {
      await page.locator('nav[aria-label="Переходы коммерческого процесса"] a').last().click();
    }
  }
});
