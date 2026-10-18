import { expect, test } from '@playwright/test';

import {
  lifecycleE2eHeaders,
  selectionE2eBuyerHeaders,
  selectionE2eBuyerOrganisationId,
} from './lifecycle-auth';

test('seller grants a snapshot and buyer plans a private Selection', async ({
  page,
  request,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'Desktop');

  const suffix = `${Date.now()}-${testInfo.retry}`;
  const seasonResponse = await request.post('/api/seasons', {
    headers: {
      ...lifecycleE2eHeaders,
      'idempotency-key': `selection-season-${suffix}`,
    },
    data: {
      code: `SELECTION-SEASON-${suffix}`,
      name: `Selection season ${suffix}`,
      startsAt: '2027-01-01T00:00:00.000Z',
      endsAt: '2027-12-31T00:00:00.000Z',
    },
  });
  expect(seasonResponse.ok()).toBeTruthy();
  const season = await seasonResponse.json() as { readonly id: string };

  const campaignResponse = await request.post('/api/campaigns', {
    headers: {
      ...lifecycleE2eHeaders,
      'idempotency-key': `selection-campaign-${suffix}`,
    },
    data: {
      seasonId: season.id,
      code: `SELECTION-CAMPAIGN-${suffix}`,
      name: `Selection campaign ${suffix}`,
      startsAt: '2027-02-01T00:00:00.000Z',
      endsAt: '2027-11-30T00:00:00.000Z',
    },
  });
  expect(campaignResponse.ok()).toBeTruthy();
  const campaign = await campaignResponse.json() as { readonly id: string };

  const collectionResponse = await request.post(
    `/api/campaigns/${encodeURIComponent(campaign.id)}/collections`,
    {
      headers: {
        ...lifecycleE2eHeaders,
        'idempotency-key': `selection-collection-${suffix}`,
      },
      data: {
        code: `SELECTION-COLLECTION-${suffix}`,
        name: `Selection collection ${suffix}`,
        currency: 'EUR',
      },
    },
  );
  expect(collectionResponse.ok()).toBeTruthy();
  const collection = await collectionResponse.json() as {
    readonly id: string;
    readonly version: number;
  };

  const readyResponse = await request.patch(
    `/api/collections/${encodeURIComponent(collection.id)}`,
    {
      headers: lifecycleE2eHeaders,
      data: { expectedVersion: collection.version, status: 'READY' },
    },
  );
  expect(readyResponse.ok()).toBeTruthy();
  const ready = await readyResponse.json() as { readonly version: number };
  const publishedCollectionResponse = await request.patch(
    `/api/collections/${encodeURIComponent(collection.id)}`,
    {
      headers: lifecycleE2eHeaders,
      data: { expectedVersion: ready.version, status: 'PUBLISHED' },
    },
  );
  expect(publishedCollectionResponse.ok()).toBeTruthy();

  const showroomResponse = await request.post(
    `/api/collections/${encodeURIComponent(collection.id)}/showrooms`,
    {
      headers: {
        ...lifecycleE2eHeaders,
        'idempotency-key': `selection-showroom-${suffix}`,
      },
      data: {
        code: `SELECTION-SHOWROOM-${suffix}`,
        title: `Selection Showroom ${suffix}`,
        description: 'Snapshot for buyer planning',
        opensAt: '2027-03-01T00:00:00.000Z',
        closesAt: '2027-10-01T00:00:00.000Z',
      },
    },
  );
  expect(showroomResponse.ok()).toBeTruthy();
  const showroom = await showroomResponse.json() as {
    readonly id: string;
    readonly version: number;
  };
  const publishResponse = await request.post(
    `/api/showrooms/${encodeURIComponent(showroom.id)}/publish`,
    {
      headers: {
        ...lifecycleE2eHeaders,
        'idempotency-key': `selection-showroom-publish-${suffix}`,
      },
      data: { expectedVersion: showroom.version },
    },
  );
  expect(publishResponse.ok()).toBeTruthy();

  const grantResponse = await request.post(
    `/api/showrooms/${encodeURIComponent(showroom.id)}/access-grants`,
    {
      headers: {
        ...lifecycleE2eHeaders,
        'idempotency-key': `selection-grant-${suffix}`,
      },
      data: { buyerOrganisationId: selectionE2eBuyerOrganisationId },
    },
  );
  expect(grantResponse.ok()).toBeTruthy();
  const grant = await grantResponse.json() as { readonly id: string };

  const createSelectionResponse = await request.post('/api/selections', {
    headers: {
      ...selectionE2eBuyerHeaders,
      'idempotency-key': `selection-create-${suffix}`,
    },
    data: {
      grantId: grant.id,
      title: `Main Buy ${suffix}`,
      currency: 'EUR',
      budgetMinor: 500_000,
    },
  });
  expect(createSelectionResponse.ok()).toBeTruthy();
  const selection = await createSelectionResponse.json() as {
    readonly id: string;
    readonly version: number;
  };

  const sellerCannotReadBuyerSelection = await request.get(
    `/api/selections/${encodeURIComponent(selection.id)}`,
    { headers: lifecycleE2eHeaders },
  );
  expect(sellerCannotReadBuyerSelection.status()).toBe(404);

  await page.setExtraHTTPHeaders(selectionE2eBuyerHeaders);
  await page.goto(`/selections?selectionId=${encodeURIComponent(selection.id)}`);
  await expect(page.getByTestId('authoritative-selection-workspace')).toBeVisible();
  await expect(page.getByTestId('selection-controlled-state')).toHaveCount(0);
  await expect(page.getByText('Brand видит grant, Shop видит свой Selection')).toBeVisible();
  await expect(page.getByRole('heading', { name: `Main Buy ${suffix}` })).toBeVisible();

  const selectionCard = page
    .locator('article.lifecycleEntityCard')
    .filter({ has: page.getByRole('heading', { name: `Main Buy ${suffix}` }) });
  await expect(selectionCard).toContainText(/5[\s\u00a0\u202f]?000,00/);

  const addItemForm = selectionCard.getByTestId('add-selection-item-form');
  await addItemForm.getByLabel('Product reference').fill(`SKU-${suffix}`);
  await addItemForm.getByLabel('Variant').fill('BLACK');
  await addItemForm.getByLabel('Quantity intent').fill('6');
  await addItemForm.getByLabel('Заметка').fill('Window story');
  await Promise.all([
    page.waitForURL((url) => url.searchParams.get('notice') === 'selection_item_added'),
    addItemForm.getByRole('button', { name: 'Добавить в shortlist' }).click(),
  ]);
  await expect(page.getByText('Товар добавлен в shortlist.')).toBeVisible();
  await expect(selectionCard.getByText(`SKU-${suffix}`)).toBeVisible();

  const itemPanel = selectionCard.locator('article.modulePanel').filter({ hasText: `SKU-${suffix}` });
  await itemPanel.getByLabel('Размерная кривая').fill('XS:1,S:2,M:3');
  await Promise.all([
    page.waitForURL((url) => url.searchParams.get('notice') === 'selection_size_curve_updated'),
    itemPanel.getByRole('button', { name: 'Сохранить кривую' }).click(),
  ]);
  await expect(page.getByText('Размерная кривая сохранена.')).toBeVisible();
  await expect(selectionCard.getByText('XS:1 · S:2 · M:3')).toBeVisible();

  await Promise.all([
    page.waitForURL((url) => url.searchParams.get('notice') === 'selection_ready'),
    selectionCard.getByRole('button', { name: 'Перевести в READY' }).click(),
  ]);
  await expect(page.getByText('Selection переведён в READY.')).toBeVisible();
  await expect(selectionCard.getByText('READY')).toBeVisible();

  const detailResponse = await request.get(
    `/api/selections/${encodeURIComponent(selection.id)}`,
    { headers: selectionE2eBuyerHeaders },
  );
  expect(detailResponse.ok()).toBeTruthy();
  const detail = await detailResponse.json() as {
    readonly status: string;
    readonly budgetMinor: number;
    readonly items: readonly {
      readonly productReference: string;
      readonly quantityIntent: number;
      readonly sizeCurve: readonly { readonly size: string; readonly quantity: number }[];
    }[];
  };
  expect(detail).toMatchObject({ status: 'READY', budgetMinor: 500_000 });
  expect(detail.items).toEqual([
    expect.objectContaining({
      productReference: `SKU-${suffix}`,
      quantityIntent: 6,
      sizeCurve: [
        { size: 'XS', quantity: 1 },
        { size: 'S', quantity: 2 },
        { size: 'M', quantity: 3 },
      ],
    }),
  ]);
});
