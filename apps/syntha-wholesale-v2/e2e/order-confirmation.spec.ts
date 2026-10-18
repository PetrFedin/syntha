import {
  expect,
  test,
  type APIRequestContext,
  type APIResponse,
} from '@playwright/test';

import {
  lifecycleE2eHeaders,
  selectionE2eBuyerHeaders,
  selectionE2eBuyerOrganisationId,
} from './lifecycle-auth';

async function json<T>(response: APIResponse): Promise<T> {
  expect(response.ok()).toBeTruthy();
  return response.json() as Promise<T>;
}

async function createGrant(request: APIRequestContext, suffix: string): Promise<string> {
  const season = await json<{ readonly id: string }>(
    await request.post('/api/seasons', {
      headers: {
        ...lifecycleE2eHeaders,
        'idempotency-key': `confirm-season-${suffix}`,
      },
      data: {
        code: `CONFIRM-SEASON-${suffix}`,
        name: `Confirmation season ${suffix}`,
        startsAt: '2027-01-01T00:00:00.000Z',
        endsAt: '2027-12-31T00:00:00.000Z',
      },
    }),
  );
  const campaign = await json<{ readonly id: string }>(
    await request.post('/api/campaigns', {
      headers: {
        ...lifecycleE2eHeaders,
        'idempotency-key': `confirm-campaign-${suffix}`,
      },
      data: {
        seasonId: season.id,
        code: `CONFIRM-CAMPAIGN-${suffix}`,
        name: `Confirmation campaign ${suffix}`,
        startsAt: '2027-02-01T00:00:00.000Z',
        endsAt: '2027-11-30T00:00:00.000Z',
      },
    }),
  );
  const collection = await json<{ readonly id: string; readonly version: number }>(
    await request.post(`/api/campaigns/${encodeURIComponent(campaign.id)}/collections`, {
      headers: {
        ...lifecycleE2eHeaders,
        'idempotency-key': `confirm-collection-${suffix}`,
      },
      data: {
        code: `CONFIRM-COLLECTION-${suffix}`,
        name: `Confirmation collection ${suffix}`,
        currency: 'EUR',
      },
    }),
  );
  const ready = await json<{ readonly version: number }>(
    await request.patch(`/api/collections/${encodeURIComponent(collection.id)}`, {
      headers: lifecycleE2eHeaders,
      data: { expectedVersion: collection.version, status: 'READY' },
    }),
  );
  await json(
    await request.patch(`/api/collections/${encodeURIComponent(collection.id)}`, {
      headers: lifecycleE2eHeaders,
      data: { expectedVersion: ready.version, status: 'PUBLISHED' },
    }),
  );
  const showroom = await json<{ readonly id: string; readonly version: number }>(
    await request.post(`/api/collections/${encodeURIComponent(collection.id)}/showrooms`, {
      headers: {
        ...lifecycleE2eHeaders,
        'idempotency-key': `confirm-showroom-${suffix}`,
      },
      data: {
        code: `CONFIRM-SHOWROOM-${suffix}`,
        title: `Confirmation Showroom ${suffix}`,
        opensAt: '2027-03-01T00:00:00.000Z',
        closesAt: '2027-10-01T00:00:00.000Z',
      },
    }),
  );
  await json(
    await request.post(`/api/showrooms/${encodeURIComponent(showroom.id)}/publish`, {
      headers: {
        ...lifecycleE2eHeaders,
        'idempotency-key': `confirm-showroom-publish-${suffix}`,
      },
      data: { expectedVersion: showroom.version },
    }),
  );
  const grant = await json<{ readonly id: string }>(
    await request.post(`/api/showrooms/${encodeURIComponent(showroom.id)}/access-grants`, {
      headers: {
        ...lifecycleE2eHeaders,
        'idempotency-key': `confirm-grant-${suffix}`,
      },
      data: { buyerOrganisationId: selectionE2eBuyerOrganisationId },
    }),
  );
  return grant.id;
}

async function createSubmittedOrder(
  request: APIRequestContext,
  grantId: string,
  suffix: string,
) {
  const selection = await json<{ readonly id: string; readonly version: number }>(
    await request.post('/api/selections', {
      headers: {
        ...selectionE2eBuyerHeaders,
        'idempotency-key': `confirm-selection-${suffix}`,
      },
      data: {
        grantId,
        title: `Confirmation buy ${suffix}`,
        currency: 'EUR',
        budgetMinor: 500_000,
      },
    }),
  );
  const withItem = await json<{
    readonly version: number;
    readonly items: readonly { readonly id: string }[];
  }>(
    await request.patch(`/api/selections/${encodeURIComponent(selection.id)}`, {
      headers: selectionE2eBuyerHeaders,
      data: {
        action: 'add_item',
        expectedVersion: selection.version,
        productReference: `SKU-CONFIRM-${suffix}`,
        variantReference: 'BLACK',
        quantityIntent: 5,
        note: 'Confirmation coverage',
      },
    }),
  );
  const sized = await json<{ readonly version: number }>(
    await request.patch(`/api/selections/${encodeURIComponent(selection.id)}`, {
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
    }),
  );
  await json(
    await request.patch(`/api/selections/${encodeURIComponent(selection.id)}`, {
      headers: selectionE2eBuyerHeaders,
      data: { action: 'mark_ready', expectedVersion: sized.version },
    }),
  );
  const order = await json<{
    readonly id: string;
    readonly version: number;
    readonly lines: readonly { readonly id: string }[];
  }>(
    await request.post('/api/orders', {
      headers: {
        ...selectionE2eBuyerHeaders,
        'idempotency-key': `confirm-order-${suffix}`,
      },
      data: { selectionId: selection.id },
    }),
  );
  const priced = await json<{ readonly version: number }>(
    await request.patch(`/api/orders/${encodeURIComponent(order.id)}`, {
      headers: selectionE2eBuyerHeaders,
      data: {
        action: 'set_terms',
        expectedVersion: order.version,
        lineId: order.lines[0]!.id,
        unitPriceMinor: 25_000,
        discountBasisPoints: 1_000,
        taxBasisPoints: 2_000,
      },
    }),
  );
  const snapshot = await json<{
    readonly id: string;
    readonly orderId: string;
    readonly lines: readonly {
      readonly id: string;
      readonly sizeQuantities: readonly { readonly size: string; readonly quantity: number }[];
    }[];
    readonly totals: { readonly quantity: number; readonly totalMinor: number };
  }>(
    await request.post(`/api/orders/${encodeURIComponent(order.id)}/submit`, {
      headers: {
        ...selectionE2eBuyerHeaders,
        'idempotency-key': `confirm-submit-${suffix}`,
      },
      data: { expectedVersion: priced.version },
    }),
  );
  return snapshot;
}

test('seller approval and confirmation preserve the submitted contract', async ({
  page,
  request,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'Desktop');
  const suffix = `${Date.now()}-${testInfo.retry}`;
  const grantId = await createGrant(request, suffix);
  const snapshot = await createSubmittedOrder(request, grantId, `${suffix}-approved`);
  const sourceBefore = await json<unknown>(
    await request.get(
      `/api/submitted-orders/${encodeURIComponent(snapshot.id)}?perspective=buyer`,
      { headers: selectionE2eBuyerHeaders },
    ),
  );

  const approveHeaders = {
    ...lifecycleE2eHeaders,
    'idempotency-key': `confirm-approve-${suffix}`,
  };
  const approveResponse = await request.post(
    `/api/submitted-orders/${encodeURIComponent(snapshot.id)}/review`,
    {
      headers: approveHeaders,
      data: { action: 'approve', expectedVersion: 0 },
    },
  );
  expect(approveResponse.status()).toBe(201);
  const review = await approveResponse.json() as {
    readonly id: string;
    readonly status: string;
    readonly version: number;
  };
  expect(review).toMatchObject({ status: 'APPROVED', version: 2 });
  const approveReplay = await request.post(
    `/api/submitted-orders/${encodeURIComponent(snapshot.id)}/review`,
    {
      headers: approveHeaders,
      data: { action: 'approve', expectedVersion: 0 },
    },
  );
  expect(approveReplay.status()).toBe(200);
  expect(approveReplay.headers()['idempotency-replayed']).toBe('true');
  expect(await approveReplay.json()).toEqual(review);

  const wrongSellerRead = await request.get(
    `/api/order-reviews/${encodeURIComponent(review.id)}?perspective=seller`,
    {
      headers: {
        ...lifecycleE2eHeaders,
        'x-syntha-organization-id': 'BRAND-CONFIRM-OTHER',
      },
    },
  );
  expect(wrongSellerRead.status()).toBe(404);

  const confirmHeaders = {
    ...lifecycleE2eHeaders,
    'idempotency-key': `confirm-version-${suffix}`,
  };
  const confirmResponse = await request.post(
    `/api/order-reviews/${encodeURIComponent(review.id)}/confirm`,
    {
      headers: confirmHeaders,
      data: { expectedVersion: review.version },
    },
  );
  expect(confirmResponse.status()).toBe(201);
  const confirmed = await confirmResponse.json() as {
    readonly id: string;
    readonly submittedOrderSnapshotId: string;
    readonly totals: { readonly quantity: number; readonly totalMinor: number };
  };
  expect(confirmed).toMatchObject({
    submittedOrderSnapshotId: snapshot.id,
    totals: snapshot.totals,
  });
  const confirmReplay = await request.post(
    `/api/order-reviews/${encodeURIComponent(review.id)}/confirm`,
    {
      headers: confirmHeaders,
      data: { expectedVersion: review.version },
    },
  );
  expect(confirmReplay.status()).toBe(200);
  expect(confirmReplay.headers()['idempotency-replayed']).toBe('true');
  expect(await confirmReplay.json()).toEqual(confirmed);
  expect(
    await json<unknown>(
      await request.get(
        `/api/submitted-orders/${encodeURIComponent(snapshot.id)}?perspective=buyer`,
        { headers: selectionE2eBuyerHeaders },
      ),
    ),
  ).toEqual(sourceBefore);

  const buyerConfirmed = await json<{ readonly id: string }>(
    await request.get(
      `/api/confirmed-orders/${encodeURIComponent(confirmed.id)}?perspective=buyer`,
      { headers: selectionE2eBuyerHeaders },
    ),
  );
  expect(buyerConfirmed.id).toBe(confirmed.id);

  await page.setExtraHTTPHeaders(lifecycleE2eHeaders);
  await page.goto(`/confirmation?reviewId=${encodeURIComponent(review.id)}`);
  await expect(page.getByTestId('authoritative-order-confirmation')).toBeVisible();
  await expect(
    page.getByTestId('seller-confirmed-order-card').filter({ hasText: confirmed.id }),
  ).toBeVisible();

  await page.setExtraHTTPHeaders(selectionE2eBuyerHeaders);
  await page.goto('/confirmation');
  await expect(
    page.getByTestId('buyer-confirmed-order-card').filter({ hasText: confirmed.id }),
  ).toBeVisible();
});

test('seller amendment request becomes visible to the buyer', async ({ page, request }, testInfo) => {
  test.skip(testInfo.project.name !== 'Desktop');
  const suffix = `${Date.now()}-${testInfo.retry}-amendment`;
  const grantId = await createGrant(request, suffix);
  const snapshot = await createSubmittedOrder(request, grantId, suffix);
  const line = snapshot.lines[0]!;
  const response = await request.post(
    `/api/submitted-orders/${encodeURIComponent(snapshot.id)}/review`,
    {
      headers: {
        ...lifecycleE2eHeaders,
        'idempotency-key': `confirm-amendment-${suffix}`,
      },
      data: {
        action: 'request_amendment',
        expectedVersion: 0,
        reason: 'Reduce M quantity before confirmation',
        lineChanges: [
          {
            lineId: line.id,
            sizeQuantities: [{ size: 'M', quantity: 2 }],
            discountBasisPoints: 500,
          },
        ],
      },
    },
  );
  expect(response.status()).toBe(201);
  const review = await response.json() as { readonly id: string; readonly status: string };
  expect(review.status).toBe('AMENDMENT_REQUESTED');

  const buyerReview = await json<{
    readonly status: string;
    readonly amendmentRequest: { readonly reason: string };
  }>(
    await request.get(
      `/api/order-reviews/${encodeURIComponent(review.id)}?perspective=buyer`,
      { headers: selectionE2eBuyerHeaders },
    ),
  );
  expect(buyerReview).toMatchObject({
    status: 'AMENDMENT_REQUESTED',
    amendmentRequest: { reason: 'Reduce M quantity before confirmation' },
  });

  await page.setExtraHTTPHeaders(selectionE2eBuyerHeaders);
  await page.goto(`/confirmation?reviewId=${encodeURIComponent(review.id)}`);
  const buyerCard = page
    .getByTestId('buyer-order-review-card')
    .filter({ hasText: review.id });
  await expect(buyerCard).toBeVisible();
  await expect(buyerCard.getByTestId('amendment-request-detail')).toContainText(
    'Reduce M quantity before confirmation',
  );
});
