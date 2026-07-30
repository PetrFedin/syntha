import { expect, test } from '@playwright/test';

import { lifecycleE2eHeaders } from './lifecycle-auth';

test('authenticated operator publishes an immutable Showroom snapshot', async ({ page, request }, testInfo) => {
  test.skip(testInfo.project.name !== 'Desktop');

  const suffix = `${Date.now()}-${testInfo.retry}`;
  const seasonCode = `SHOWROOM-SEASON-${suffix}`;
  const campaignCode = `SHOWROOM-CAMPAIGN-${suffix}`;
  const collectionCode = `SHOWROOM-COLLECTION-${suffix}`;
  const showroomCode = `SHOWROOM-${suffix}`;

  const seasonResponse = await request.post('/api/seasons', {
    headers: {
      ...lifecycleE2eHeaders,
      'idempotency-key': `showroom-season-${suffix}`,
    },
    data: {
      code: seasonCode,
      name: `Showroom season ${suffix}`,
      startsAt: '2027-01-01T00:00:00.000Z',
      endsAt: '2027-12-31T00:00:00.000Z',
    },
  });
  expect(seasonResponse.ok()).toBeTruthy();
  const season = await seasonResponse.json() as { readonly id: string };

  const campaignResponse = await request.post('/api/campaigns', {
    headers: {
      ...lifecycleE2eHeaders,
      'idempotency-key': `showroom-campaign-${suffix}`,
    },
    data: {
      seasonId: season.id,
      code: campaignCode,
      name: `Showroom campaign ${suffix}`,
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
        'idempotency-key': `showroom-collection-${suffix}`,
      },
      data: {
        code: collectionCode,
        name: `Showroom collection ${suffix}`,
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

  await page.setExtraHTTPHeaders(lifecycleE2eHeaders);
  await page.goto(`/showroom?collectionId=${encodeURIComponent(collection.id)}`);
  await expect(page.getByTestId('authoritative-showroom-workspace')).toBeVisible();
  await expect(page.getByTestId('showroom-controlled-state')).toHaveCount(0);

  const createForm = page.getByTestId('create-showroom-form');
  await createForm.getByLabel('Код').fill(showroomCode);
  await createForm.getByLabel('Название').fill(`Buyer preview ${suffix}`);
  await createForm.getByLabel('Описание').fill('Immutable buyer-facing publication');
  await createForm.getByLabel('Открытие').fill('2027-03-01');
  await createForm.getByLabel('Закрытие').fill('2027-10-01');
  await Promise.all([
    page.waitForURL((url) => url.searchParams.get('notice') === 'showroom_created'),
    createForm.getByRole('button', { name: 'Создать Showroom' }).click(),
  ]);
  await expect(page.getByText('Showroom создан как авторитетный draft.')).toBeVisible();

  const card = page.locator('article.lifecycleEntityCard').filter({ hasText: showroomCode });
  await expect(card).toBeVisible();
  await Promise.all([
    page.waitForURL((url) => url.searchParams.get('notice') === 'showroom_published'),
    card.getByRole('button', { name: 'Опубликовать snapshot' }).click(),
  ]);
  await expect(
    page.getByText('Showroom опубликован, immutable snapshot и outbox event записаны.'),
  ).toBeVisible();
  await expect(card.getByText('PUBLISHED')).toBeVisible();
  await expect(card.getByLabel('Immutable publication snapshot')).toBeVisible();
  await expect(card.getByText('v2')).toBeVisible();

  const showroomId = new URL(page.url()).searchParams.get('showroomId');
  expect(showroomId).toBeTruthy();
  const detailResponse = await request.get(
    `/api/showrooms/${encodeURIComponent(showroomId ?? '')}`,
    { headers: lifecycleE2eHeaders },
  );
  expect(detailResponse.ok()).toBeTruthy();
  const detail = await detailResponse.json() as {
    readonly showroom: { readonly status: string; readonly version: number; readonly collectionId: string };
    readonly snapshot: {
      readonly showroomVersion: number;
      readonly collectionId: string;
      readonly publishedByCredentialId: string;
    };
  };
  expect(detail.showroom).toMatchObject({
    status: 'PUBLISHED',
    version: 2,
    collectionId: collection.id,
  });
  expect(detail.snapshot).toMatchObject({
    showroomVersion: 2,
    collectionId: collection.id,
    publishedByCredentialId: 'lifecycle-e2e-operator',
  });
});
