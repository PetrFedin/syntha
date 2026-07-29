import { expect, test, type Locator, type Page } from '@playwright/test';

import { lifecycleE2eHeaders } from './lifecycle-auth';

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

const isDeadHref = (href: string | null): boolean => {
  const normalized = href?.trim().toLowerCase();
  return !normalized || normalized === '#' || normalized.startsWith('javascript:');
};

async function submitAndWaitForNotice(
  page: Page,
  form: Locator,
  buttonName: string,
  notice: string,
): Promise<void> {
  await Promise.all([
    page.waitForURL((url) => url.searchParams.get('notice') === notice),
    form.getByRole('button', { name: buttonName }).click(),
  ]);
}

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
    await expect(page.locator('main')).toHaveCount(1);
    await expect(page.locator('main')).toBeVisible();

    const hrefs = await page.locator('a').evaluateAll((links) =>
      links.map((link) => link.getAttribute('href')),
    );
    const deadHrefs = hrefs.filter(isDeadHref);
    expect(deadHrefs, `dead or unsafe links found on ${route}`).toEqual([]);

    const internalHrefs = hrefs.filter(
      (href): href is string => Boolean(href?.startsWith('/')),
    );
    for (const href of new Set(internalHrefs)) {
      const target = await request.get(href);
      expect(target.status(), `broken internal link ${href} from ${route}`).toBeLessThan(400);
    }
  });
}

test('lifecycle pages expose controlled state without gateway credentials', async ({ page }) => {
  for (const route of ['/campaigns', '/collections']) {
    await page.goto(route);
    await expect(page.getByTestId('lifecycle-controlled-state')).toBeVisible();
    await expect(page.getByText('Demo fixture')).toHaveCount(0);
    await expect(page.locator('form.lifecycleForm')).toHaveCount(0);
    await expect(page.getByText(/требуется серверная авторизация|авторитетный lifecycle временно недоступен/i))
      .toBeVisible();
  }
});

test('authenticated operator creates and advances the authoritative lifecycle', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'Desktop');

  const suffix = `${testInfo.workerIndex}-${testInfo.retry}`;
  const seasonCode = `E2E-FW27-${suffix}`;
  const campaignCode = `E2E-CAMPAIGN-${suffix}`;
  const collectionCode = `E2E-COLLECTION-${suffix}`;

  await page.setExtraHTTPHeaders(lifecycleE2eHeaders);
  await page.goto('/campaigns');
  await expect(page.getByTestId('authoritative-campaign-workspace')).toBeVisible();
  await expect(page.getByTestId('lifecycle-controlled-state')).toHaveCount(0);

  const seasonForm = page.locator('form.lifecycleForm').filter({ hasText: 'Создать сезон' });
  await seasonForm.getByLabel('Код').fill(seasonCode);
  await seasonForm.getByLabel('Название').fill(`E2E сезон ${suffix}`);
  await seasonForm.getByLabel('Начало').fill('2027-01-01');
  await seasonForm.getByLabel('Окончание').fill('2027-12-31');
  await submitAndWaitForNotice(page, seasonForm, 'Создать сезон', 'season_created');
  await expect(page.getByText('Сезон создан и записан в авторитетный контур.')).toBeVisible();

  const seasonCard = page.locator('article.lifecycleEntityCard').filter({ hasText: seasonCode });
  await expect(seasonCard).toBeVisible();
  const seasonStatusForm = seasonCard.locator('form.lifecycleStatusForm');
  await seasonStatusForm.getByLabel('Следующий статус').selectOption('ACTIVE');
  await submitAndWaitForNotice(page, seasonStatusForm, 'Применить', 'season_updated');

  const campaignForm = page.locator('form.lifecycleForm').filter({ hasText: 'Создать кампанию' });
  await campaignForm.getByLabel('Код').fill(campaignCode);
  await campaignForm.getByLabel('Название').fill(`E2E кампания ${suffix}`);
  await campaignForm.getByLabel('Начало продаж').fill('2027-02-01');
  await campaignForm.getByLabel('Окончание продаж').fill('2027-11-30');
  await submitAndWaitForNotice(page, campaignForm, 'Создать кампанию', 'campaign_created');
  await expect(page.getByText('Кампания создана внутри выбранного сезона.')).toBeVisible();

  const campaignCard = page.locator('article.lifecycleEntityCard').filter({ hasText: campaignCode });
  await expect(campaignCard).toBeVisible();
  const campaignStatusForm = campaignCard.locator('form.lifecycleStatusForm');
  await campaignStatusForm.getByLabel('Следующий статус').selectOption('ACTIVE');
  await submitAndWaitForNotice(page, campaignStatusForm, 'Применить', 'campaign_updated');

  await page.locator('article.lifecycleEntityCard').filter({ hasText: campaignCode })
    .getByRole('link', { name: 'Открыть коллекции' })
    .click();
  await expect(page.getByTestId('authoritative-collection-workspace')).toBeVisible();

  const collectionForm = page.locator('form.lifecycleForm').filter({ hasText: 'Создать коллекцию' });
  await collectionForm.getByLabel('Код').fill(collectionCode);
  await collectionForm.getByLabel('Название').fill(`E2E коллекция ${suffix}`);
  await collectionForm.getByLabel('Валюта ISO').fill('EUR');
  await submitAndWaitForNotice(page, collectionForm, 'Создать коллекцию', 'collection_created');
  await expect(page.getByText('Коллекция создана внутри выбранной кампании.')).toBeVisible();

  const collectionCard = page.locator('article.lifecycleEntityCard').filter({ hasText: collectionCode });
  await expect(collectionCard).toBeVisible();
  const collectionStatusForm = collectionCard.locator('form.lifecycleStatusForm');
  await collectionStatusForm.getByLabel('Следующий статус').selectOption('READY');
  await submitAndWaitForNotice(page, collectionStatusForm, 'Применить', 'collection_updated');

  const seasonsResponse = await page.request.get('/api/seasons', { headers: lifecycleE2eHeaders });
  expect(seasonsResponse.ok()).toBeTruthy();
  const seasonsBody = await seasonsResponse.json() as {
    readonly seasons: readonly { readonly id: string; readonly code: string; readonly status: string; readonly version: number }[];
  };
  const season = seasonsBody.seasons.find((item) => item.code === seasonCode);
  expect(season).toMatchObject({ status: 'ACTIVE', version: 2 });

  const campaignsResponse = await page.request.get('/api/campaigns', { headers: lifecycleE2eHeaders });
  expect(campaignsResponse.ok()).toBeTruthy();
  const campaignsBody = await campaignsResponse.json() as {
    readonly campaigns: readonly { readonly id: string; readonly code: string; readonly seasonId: string; readonly status: string; readonly version: number }[];
  };
  const campaign = campaignsBody.campaigns.find((item) => item.code === campaignCode);
  expect(campaign).toMatchObject({ seasonId: season?.id, status: 'ACTIVE', version: 2 });

  const collectionsResponse = await page.request.get(
    `/api/campaigns/${encodeURIComponent(campaign?.id ?? '')}/collections`,
    { headers: lifecycleE2eHeaders },
  );
  expect(collectionsResponse.ok()).toBeTruthy();
  const collectionsBody = await collectionsResponse.json() as {
    readonly collections: readonly { readonly code: string; readonly campaignId: string; readonly status: string; readonly version: number }[];
  };
  expect(collectionsBody.collections.find((item) => item.code === collectionCode)).toMatchObject({
    campaignId: campaign?.id,
    status: 'READY',
    version: 2,
  });
});

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
