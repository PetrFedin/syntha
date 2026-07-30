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

async function createSubmittedOrder(request: APIRequestContext, suffix: string) {
  const season = await json<{ readonly id: string }>(
    await request.post('/api/seasons', {
      headers: {
        ...lifecycleE2eHeaders,
        'idempotency-key': `response-season-${suffix}`,
      },
      data: {
        code: `RESPONSE-SEASON-${suffix}`,
        name: `Response season ${suffix}`,
        startsAt: '2027-01-01T00:00:00.000Z',
        endsAt: '2027-12-31T00:00:00.000Z',
      },
    }),
  );
  const campaign = await json<{ readonly id: string }>(
    await request.post('/api/campaigns', {
      headers: {
        ...lifecycleE2eHeaders,
        'idempotency-key': `response-campaign-${suffix}`,
      },
      data: {
        seasonId: season.id,
        code: `RESPONSE-CAMPAIGN-${suffix}`,
        name: `Response campaign ${suffix}`,
        startsAt: '2027-02-01T00:00:00.000Z',
        endsAt: '2027-11-30T00:00:00.000Z',
      },
    }),
  );
  const collection = await json<{ readonly id: string; readonly version: number }>(
    await request.post(`/api/campaigns/${encodeURIComponent(campaign.id)}/collections`, {
      headers: {
        ...lifecycleE2eHeaders,
        'idempotency-key': `response-collection-${suffix}`,
      },
      data: {
        code: `RESPONSE-COLLECTION-${suffix}`,
        name: `Response collection ${suffix}`,
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
        'idempotency-key': `response-showroom-${suffix}`,
      },
      data: {
        code: `RESPONSE-SHOWROOM-${suffix}`,
        title: `Response Showroom ${suffix}`,
        opensAt: '2027-03-01T00:00:00.000Z',
        closesAt: '2027-10-01T00:00:00.000Z',
      },
    }),
  );
  await json(
    await request.post(`/api/showrooms/${encodeURIComponent(showroom.id)}/publish`, {
      headers: {
        ...lifecycleE2eHeaders,
        'idempotency-key': `response-showroom-publish-${suffix}`,
      },
      data: { expectedVersion: showroom.version },
    }),
  );
  const grant = await json<{ readonly id: string }>(
    await request.post(`/api/showrooms/${encodeURIComponent(showroom.id)}/access-grants`, {
      headers: {
        ...lifecycleE2eHeaders,
        'idempotency-key': `response-grant-${suffix}`,
      },
      data: { buyerOrganisationId: selectionE2eBuyerOrganisationId },
    }),
  );
  const selection = await json<{ readonly id: string; readonly version: number }>(
    await request.post('/api/selections', {
      headers: {
        ...selectionE2eBuyerHeaders,
        'idempotency-key': `response-selection-${suffix}`,
      },
      data: {
        grantId: grant.id,
        title: `Response buy ${suffix}`,
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
        productReference: `SKU-RESPONSE-${suffix}`,
        variantReference: 'BLACK',
        quantityIntent: 5,
        note: 'Amendment response coverage',
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
        'idempotency-key': `response-order-${suffix}`,
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
  return json<{
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
        'idempotency-key': `response-submit-${suffix}`,
      },
      data: { expectedVersion: priced.version },
    }),
  );
}

test('buyer accepts seller amendment into an immutable revised order', async ({
  page,
  request,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'Desktop');
  const suffix = `${Date.now()}-${testInfo.retry}`;
  const snapshot = await createSubmittedOrder(request, suffix);
  const sourceBefore = await json<unknown>(
    await request.get(
      `/api/submitted-orders/${encodeURIComponent(snapshot.id)}?perspective=buyer`,
      { headers: selectionE2eBuyerHeaders },
    ),
  );
  const line = snapshot.lines[0]!;
  const reviewResponse = await request.post(
    `/api/submitted-orders/${encodeURIComponent(snapshot.id)}/review`,
    {
      headers: {
        ...lifecycleE2eHeaders,
        'idempotency-key': `response-review-${suffix}`,
      },
      data: {
        action: 'request_amendment',
        expectedVersion: 0,
        reason: 'Reduce M quantity before acceptance',
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
  expect(reviewResponse.status()).toBe(201);
  const review = await reviewResponse.json() as {
    readonly id: string;
    readonly version: number;
  };
  const reviewBefore = await json<unknown>(
    await request.get(
      `/api/order-reviews/${encodeURIComponent(review.id)}?perspective=buyer`,
      { headers: selectionE2eBuyerHeaders },
    ),
  );

  const responseHeaders = {
    ...selectionE2eBuyerHeaders,
    'idempotency-key': `response-accept-${suffix}`,
  };
  const acceptResponse = await request.post(
    `/api/order-reviews/${encodeURIComponent(review.id)}/response`,
    {
      headers: responseHeaders,
      data: {
        action: 'accept',
        expectedReviewVersion: review.version,
      },
    },
  );
  expect(acceptResponse.status()).toBe(201);
  const response = await acceptResponse.json() as {
    readonly id: string;
    readonly decision: string;
    readonly revisedOrderVersionId: string;
  };
  expect(response.decision).toBe('ACCEPTED');

  const replay = await request.post(
    `/api/order-reviews/${encodeURIComponent(review.id)}/response`,
    {
      headers: responseHeaders,
      data: {
        action: 'accept',
        expectedReviewVersion: review.version,
      },
    },
  );
  expect(replay.status()).toBe(200);
  expect(replay.headers()['idempotency-replayed']).toBe('true');
  expect(await replay.json()).toEqual(response);

  const sellerCannotRespond = await request.post(
    `/api/order-reviews/${encodeURIComponent(review.id)}/response`,
    {
      headers: {
        ...lifecycleE2eHeaders,
        'idempotency-key': `response-wrong-org-${suffix}`,
      },
      data: {
        action: 'accept',
        expectedReviewVersion: review.version,
      },
    },
  );
  expect(sellerCannotRespond.status()).toBe(404);

  const buyerResponse = await json<{ readonly id: string }>(
    await request.get(
      `/api/order-amendment-responses/${encodeURIComponent(response.id)}?perspective=buyer`,
      { headers: selectionE2eBuyerHeaders },
    ),
  );
  expect(buyerResponse.id).toBe(response.id);
  const sellerResponse = await json<{ readonly id: string }>(
    await request.get(
      `/api/order-amendment-responses/${encodeURIComponent(response.id)}?perspective=seller`,
      { headers: lifecycleE2eHeaders },
    ),
  );
  expect(sellerResponse.id).toBe(response.id);

  const buyerRevised = await json<{
    readonly id: string;
    readonly totals: { readonly quantity: number; readonly totalMinor: number };
  }>(
    await request.get(
      `/api/revised-orders/${encodeURIComponent(response.revisedOrderVersionId)}?perspective=buyer`,
      { headers: selectionE2eBuyerHeaders },
    ),
  );
  expect(buyerRevised).toMatchObject({
    id: response.revisedOrderVersionId,
    totals: { quantity: 4, totalMinor: 114_000 },
  });
  const sellerRevised = await json<{ readonly id: string }>(
    await request.get(
      `/api/revised-orders/${encodeURIComponent(response.revisedOrderVersionId)}?perspective=seller`,
      { headers: lifecycleE2eHeaders },
    ),
  );
  expect(sellerRevised.id).toBe(response.revisedOrderVersionId);

  expect(
    await json<unknown>(
      await request.get(
        `/api/submitted-orders/${encodeURIComponent(snapshot.id)}?perspective=buyer`,
        { headers: selectionE2eBuyerHeaders },
      ),
    ),
  ).toEqual(sourceBefore);
  expect(
    await json<unknown>(
      await request.get(
        `/api/order-reviews/${encodeURIComponent(review.id)}?perspective=buyer`,
        { headers: selectionE2eBuyerHeaders },
      ),
    ),
  ).toEqual(reviewBefore);

  await page.setExtraHTTPHeaders(selectionE2eBuyerHeaders);
  await page.goto('/confirmation');
  await expect(page.getByTestId('authoritative-amendment-response')).toBeVisible();
  await expect(
    page.getByTestId('buyer-amendment-response-card').filter({ hasText: response.id }),
  ).toBeVisible();
  await expect(
    page.getByTestId('buyer-revised-order-card').filter({ hasText: response.revisedOrderVersionId }),
  ).toBeVisible();

  await page.setExtraHTTPHeaders(lifecycleE2eHeaders);
  await page.goto('/confirmation');
  await expect(
    page.getByTestId('seller-amendment-response-card').filter({ hasText: response.id }),
  ).toBeVisible();
  await expect(
    page.getByTestId('seller-revised-order-card').filter({ hasText: response.revisedOrderVersionId }),
  ).toBeVisible();
});
