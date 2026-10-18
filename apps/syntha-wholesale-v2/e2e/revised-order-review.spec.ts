import { expect, test } from '@playwright/test';

import {
  lifecycleE2eHeaders,
  selectionE2eBuyerHeaders,
} from './lifecycle-auth';
import {
  createNegotiationSubmittedOrder,
  responseJson,
} from './order-negotiation-fixture';

test('seller approves and confirms an immutable Revised Order', async ({
  page,
  request,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'Desktop');
  const suffix = `${Date.now()}-${testInfo.retry}`;
  const snapshot = await createNegotiationSubmittedOrder(request, suffix);
  const sourceLine = snapshot.lines[0]!;

  const sellerReview = await responseJson<{
    readonly id: string;
    readonly version: number;
  }>(
    await request.post(
      `/api/submitted-orders/${encodeURIComponent(snapshot.id)}/review`,
      {
        headers: {
          ...lifecycleE2eHeaders,
          'idempotency-key': `revised-loop-review-${suffix}`,
        },
        data: {
          action: 'request_amendment',
          expectedVersion: 0,
          reason: 'Reduce M quantity before final confirmation',
          lineChanges: [
            {
              lineId: sourceLine.id,
              sizeQuantities: [{ size: 'M', quantity: 2 }],
              discountBasisPoints: 500,
            },
          ],
        },
      },
    ),
  );

  const buyerResponse = await responseJson<{
    readonly id: string;
    readonly revisedOrderVersionId: string;
  }>(
    await request.post(
      `/api/order-reviews/${encodeURIComponent(sellerReview.id)}/response`,
      {
        headers: {
          ...selectionE2eBuyerHeaders,
          'idempotency-key': `revised-loop-accept-${suffix}`,
        },
        data: {
          action: 'accept',
          expectedReviewVersion: sellerReview.version,
        },
      },
    ),
  );

  const revisedBefore = await responseJson<unknown>(
    await request.get(
      `/api/revised-orders/${encodeURIComponent(buyerResponse.revisedOrderVersionId)}?perspective=seller`,
      { headers: lifecycleE2eHeaders },
    ),
  );
  const responseBefore = await responseJson<unknown>(
    await request.get(
      `/api/order-amendment-responses/${encodeURIComponent(buyerResponse.id)}?perspective=seller`,
      { headers: lifecycleE2eHeaders },
    ),
  );

  const approveHeaders = {
    ...lifecycleE2eHeaders,
    'idempotency-key': `revised-loop-approve-${suffix}`,
  };
  const approve = await request.post(
    `/api/revised-orders/${encodeURIComponent(buyerResponse.revisedOrderVersionId)}/review`,
    {
      headers: approveHeaders,
      data: { action: 'approve', expectedVersion: 0 },
    },
  );
  expect(approve.status()).toBe(201);
  const revisedReview = await approve.json() as {
    readonly id: string;
    readonly status: string;
    readonly version: number;
  };
  expect(revisedReview).toMatchObject({ status: 'APPROVED', version: 2 });

  const approveReplay = await request.post(
    `/api/revised-orders/${encodeURIComponent(buyerResponse.revisedOrderVersionId)}/review`,
    {
      headers: approveHeaders,
      data: { action: 'approve', expectedVersion: 0 },
    },
  );
  expect(approveReplay.status()).toBe(200);
  expect(approveReplay.headers()['idempotency-replayed']).toBe('true');
  expect(await approveReplay.json()).toEqual(revisedReview);

  const buyerCannotApprove = await request.post(
    `/api/revised-orders/${encodeURIComponent(buyerResponse.revisedOrderVersionId)}/review`,
    {
      headers: {
        ...selectionE2eBuyerHeaders,
        'idempotency-key': `revised-loop-wrong-org-${suffix}`,
      },
      data: { action: 'approve', expectedVersion: 0 },
    },
  );
  expect(buyerCannotApprove.status()).toBe(404);

  const confirmHeaders = {
    ...lifecycleE2eHeaders,
    'idempotency-key': `revised-loop-confirm-${suffix}`,
  };
  const confirmation = await request.post(
    `/api/revised-order-reviews/${encodeURIComponent(revisedReview.id)}/confirm`,
    {
      headers: confirmHeaders,
      data: { expectedVersion: revisedReview.version },
    },
  );
  expect(confirmation.status()).toBe(201);
  const confirmed = await confirmation.json() as {
    readonly id: string;
    readonly revisedOrderVersionId: string;
    readonly totals: { readonly quantity: number; readonly totalMinor: number };
  };
  expect(confirmed).toMatchObject({
    revisedOrderVersionId: buyerResponse.revisedOrderVersionId,
    totals: { quantity: 4, totalMinor: 114_000 },
  });

  const confirmReplay = await request.post(
    `/api/revised-order-reviews/${encodeURIComponent(revisedReview.id)}/confirm`,
    {
      headers: confirmHeaders,
      data: { expectedVersion: revisedReview.version },
    },
  );
  expect(confirmReplay.status()).toBe(200);
  expect(confirmReplay.headers()['idempotency-replayed']).toBe('true');
  expect(await confirmReplay.json()).toEqual(confirmed);

  const buyerConfirmed = await responseJson<{ readonly id: string }>(
    await request.get(
      `/api/revised-confirmed-orders/${encodeURIComponent(confirmed.id)}?perspective=buyer`,
      { headers: selectionE2eBuyerHeaders },
    ),
  );
  expect(buyerConfirmed.id).toBe(confirmed.id);
  const sellerConfirmed = await responseJson<{ readonly id: string }>(
    await request.get(
      `/api/revised-confirmed-orders/${encodeURIComponent(confirmed.id)}?perspective=seller`,
      { headers: lifecycleE2eHeaders },
    ),
  );
  expect(sellerConfirmed.id).toBe(confirmed.id);

  expect(
    await responseJson<unknown>(
      await request.get(
        `/api/revised-orders/${encodeURIComponent(buyerResponse.revisedOrderVersionId)}?perspective=seller`,
        { headers: lifecycleE2eHeaders },
      ),
    ),
  ).toEqual(revisedBefore);
  expect(
    await responseJson<unknown>(
      await request.get(
        `/api/order-amendment-responses/${encodeURIComponent(buyerResponse.id)}?perspective=seller`,
        { headers: lifecycleE2eHeaders },
      ),
    ),
  ).toEqual(responseBefore);

  await page.setExtraHTTPHeaders(lifecycleE2eHeaders);
  await page.goto('/confirmation');
  await expect(page.getByTestId('authoritative-revised-order-review')).toBeVisible();
  await expect(
    page.getByTestId('seller-revised-order-review-card').filter({ hasText: revisedReview.id }),
  ).toContainText('CONFIRMED');
  await expect(
    page.getByTestId('seller-revised-confirmed-order-card').filter({ hasText: confirmed.id }),
  ).toBeVisible();

  await page.setExtraHTTPHeaders(selectionE2eBuyerHeaders);
  await page.goto('/confirmation');
  await expect(
    page.getByTestId('buyer-revised-order-review-card').filter({ hasText: revisedReview.id }),
  ).toContainText('CONFIRMED');
  await expect(
    page.getByTestId('buyer-revised-confirmed-order-card').filter({ hasText: confirmed.id }),
  ).toBeVisible();
});
