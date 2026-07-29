import { expect, test } from '@playwright/test';

import {
  lifecycleE2eHeaders,
  selectionE2eBuyerHeaders,
  selectionE2eBuyerOrganisationId,
} from './lifecycle-auth';

test('buyer submits an immutable Order and seller receives the contract', async ({
  page,
  request,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'Desktop');

  const suffix = `${Date.now()}-${testInfo.retry}`;
  const seasonResponse = await request.post('/api/seasons', {
    headers: {
      ...lifecycleE2eHeaders,
      'idempotency-key': `order-season-${suffix}`,
    },
    data: {
      code: `ORDER-SEASON-${suffix}`,
      name: `Order season ${suffix}`,
      startsAt: '2027-01-01T00:00:00.000Z',
      endsAt: '2027-12-31T00:00:00.000Z',
    },
  });
  expect(seasonResponse.ok()).toBeTruthy();
  const season = await seasonResponse.json() as { readonly id: string };

  const campaignResponse = await request.post('/api/campaigns', {
    headers: {
      ...lifecycleE2eHeaders,
      'idempotency-key': `order-campaign-${suffix}`,
    },
    data: {
      seasonId: season.id,
      code: `ORDER-CAMPAIGN-${suffix}`,
      name: `Order campaign ${suffix}`,
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
        'idempotency-key': `order-collection-${suffix}`,
      },
      data: {
        code: `ORDER-COLLECTION-${suffix}`,
        name: `Order collection ${suffix}`,
        currency: 'EUR',
      },
    },
  );
  expect(collectionResponse.ok()).toBeTruthy();
  const collection = await collectionResponse.json() as {
    readonly id: string;
    readonly version: number;
  };

  const readyCollectionResponse = await request.patch(
    `/api/collections/${encodeURIComponent(collection.id)}`,
    {
      headers: lifecycleE2eHeaders,
      data: { expectedVersion: collection.version, status: 'READY' },
    },
  );
  expect(readyCollectionResponse.ok()).toBeTruthy();
  const readyCollection = await readyCollectionResponse.json() as { readonly version: number };
  const publishedCollectionResponse = await request.patch(
    `/api/collections/${encodeURIComponent(collection.id)}`,
    {
      headers: lifecycleE2eHeaders,
      data: { expectedVersion: readyCollection.version, status: 'PUBLISHED' },
    },
  );
  expect(publishedCollectionResponse.ok()).toBeTruthy();

  const showroomResponse = await request.post(
    `/api/collections/${encodeURIComponent(collection.id)}/showrooms`,
    {
      headers: {
        ...lifecycleE2eHeaders,
        'idempotency-key': `order-showroom-${suffix}`,
      },
      data: {
        code: `ORDER-SHOWROOM-${suffix}`,
        title: `Order Showroom ${suffix}`,
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
        'idempotency-key': `order-showroom-publish-${suffix}`,
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
        'idempotency-key': `order-grant-${suffix}`,
      },
      data: { buyerOrganisationId: selectionE2eBuyerOrganisationId },
    },
  );
  expect(grantResponse.ok()).toBeTruthy();
  const grant = await grantResponse.json() as { readonly id: string };

  const createSelectionResponse = await request.post('/api/selections', {
    headers: {
      ...selectionE2eBuyerHeaders,
      'idempotency-key': `order-selection-${suffix}`,
    },
    data: {
      grantId: grant.id,
      title: `Order buy ${suffix}`,
      currency: 'EUR',
      budgetMinor: 500_000,
    },
  });
  expect(createSelectionResponse.ok()).toBeTruthy();
  const selection = await createSelectionResponse.json() as {
    readonly id: string;
    readonly version: number;
  };

  const itemResponse = await request.patch(
    `/api/selections/${encodeURIComponent(selection.id)}`,
    {
      headers: selectionE2eBuyerHeaders,
      data: {
        action: 'add_item',
        expectedVersion: selection.version,
        productReference: `SKU-ORDER-${suffix}`,
        variantReference: 'BLACK',
        quantityIntent: 5,
        note: 'Commercial order coverage',
      },
    },
  );
  expect(itemResponse.ok()).toBeTruthy();
  const withItem = await itemResponse.json() as {
    readonly version: number;
    readonly items: readonly { readonly id: string }[];
  };

  const sizeResponse = await request.patch(
    `/api/selections/${encodeURIComponent(selection.id)}`,
    {
      headers: selectionE2eBuyerHeaders,
      data: {
        action: 'set_size_curve',
        expectedVersion: withItem.version,
        itemId: withItem.items[0]!.id,
        sizeCurve: [
          { size: 'S', quantity: 2 },
          { size: 'M', quantity: 3 },
        ],
      },
    },
  );
  expect(sizeResponse.ok()).toBeTruthy();
  const sized = await sizeResponse.json() as { readonly version: number };

  const readySelectionResponse = await request.patch(
    `/api/selections/${encodeURIComponent(selection.id)}`,
    {
      headers: selectionE2eBuyerHeaders,
      data: { action: 'mark_ready', expectedVersion: sized.version },
    },
  );
  expect(readySelectionResponse.ok()).toBeTruthy();

  const createOrderHeaders = {
    ...selectionE2eBuyerHeaders,
    'idempotency-key': `order-draft-${suffix}`,
  };
  const orderResponse = await request.post('/api/orders', {
    headers: createOrderHeaders,
    data: { selectionId: selection.id },
  });
  expect(orderResponse.status()).toBe(201);
  const order = await orderResponse.json() as {
    readonly id: string;
    readonly version: number;
    readonly lines: readonly { readonly id: string }[];
  };
  const orderReplayResponse = await request.post('/api/orders', {
    headers: createOrderHeaders,
    data: { selectionId: selection.id },
  });
  expect(orderReplayResponse.status()).toBe(200);
  expect(orderReplayResponse.headers()['idempotency-replayed']).toBe('true');
  expect(await orderReplayResponse.json()).toEqual(order);

  const sellerDraftRead = await request.get(
    `/api/orders/${encodeURIComponent(order.id)}`,
    { headers: lifecycleE2eHeaders },
  );
  expect(sellerDraftRead.status()).toBe(404);

  const termsResponse = await request.patch(
    `/api/orders/${encodeURIComponent(order.id)}`,
    {
      headers: selectionE2eBuyerHeaders,
      data: {
        action: 'set_terms',
        expectedVersion: order.version,
        lineId: order.lines[0]!.id,
        unitPriceMinor: 25_000,
        discountBasisPoints: 1_000,
        taxBasisPoints: 2_000,
      },
    },
  );
  expect(termsResponse.ok()).toBeTruthy();
  const priced = await termsResponse.json() as { readonly version: number };

  const quantityResponse = await request.patch(
    `/api/orders/${encodeURIComponent(order.id)}`,
    {
      headers: selectionE2eBuyerHeaders,
      data: {
        action: 'set_quantity',
        expectedVersion: priced.version,
        lineId: order.lines[0]!.id,
        size: 'M',
        quantity: 4,
      },
    },
  );
  expect(quantityResponse.ok()).toBeTruthy();
  const resized = await quantityResponse.json() as {
    readonly version: number;
    readonly totals: { readonly quantity: number; readonly totalMinor: number };
  };
  expect(resized.totals).toEqual({
    quantity: 6,
    grossMinor: 150_000,
    discountMinor: 15_000,
    netMinor: 135_000,
    taxMinor: 27_000,
    totalMinor: 162_000,
  });

  const submitHeaders = {
    ...selectionE2eBuyerHeaders,
    'idempotency-key': `order-submit-${suffix}`,
  };
  const submitResponse = await request.post(
    `/api/orders/${encodeURIComponent(order.id)}/submit`,
    {
      headers: submitHeaders,
      data: { expectedVersion: resized.version },
    },
  );
  expect(submitResponse.status()).toBe(201);
  const snapshot = await submitResponse.json() as {
    readonly id: string;
    readonly orderId: string;
    readonly totals: { readonly quantity: number; readonly totalMinor: number };
  };
  expect(snapshot).toMatchObject({
    orderId: order.id,
    totals: { quantity: 6, totalMinor: 162_000 },
  });

  const submitReplayResponse = await request.post(
    `/api/orders/${encodeURIComponent(order.id)}/submit`,
    {
      headers: submitHeaders,
      data: { expectedVersion: resized.version },
    },
  );
  expect(submitReplayResponse.status()).toBe(200);
  expect(submitReplayResponse.headers()['idempotency-replayed']).toBe('true');
  expect(await submitReplayResponse.json()).toEqual(snapshot);

  const sellerSnapshotResponse = await request.get(
    `/api/submitted-orders/${encodeURIComponent(snapshot.id)}?perspective=seller`,
    { headers: lifecycleE2eHeaders },
  );
  expect(sellerSnapshotResponse.ok()).toBeTruthy();
  expect(await sellerSnapshotResponse.json()).toMatchObject({
    id: snapshot.id,
    orderId: order.id,
    totals: { quantity: 6, totalMinor: 162_000 },
  });

  await page.setExtraHTTPHeaders(selectionE2eBuyerHeaders);
  await page.goto(`/order-builder?orderId=${encodeURIComponent(order.id)}`);
  await expect(page.getByTestId('authoritative-order-builder')).toBeVisible();
  const submittedOrderCard = page.getByTestId('draft-order-card').filter({ hasText: order.id });
  await expect(submittedOrderCard).toContainText('SUBMITTED');
  await expect(submittedOrderCard.getByTestId('submit-order-form')).toHaveCount(0);

  await page.goto('/orders');
  await expect(page.getByTestId('authoritative-orders-workspace')).toBeVisible();
  await expect(page.getByTestId('buyer-submitted-order-card').filter({ hasText: snapshot.id })).toBeVisible();

  await page.setExtraHTTPHeaders(lifecycleE2eHeaders);
  await page.goto('/orders');
  await expect(page.getByTestId('seller-submitted-order-card').filter({ hasText: snapshot.id })).toBeVisible();
  await expect(page.getByText(/1[\s\u00a0\u202f]?620,00/)).toBeVisible();
});
