import { expect, type APIRequestContext, type APIResponse } from '@playwright/test';

import {
  lifecycleE2eHeaders,
  selectionE2eBuyerHeaders,
  selectionE2eBuyerOrganisationId,
} from './lifecycle-auth';

export async function responseJson<T>(response: APIResponse): Promise<T> {
  expect(response.ok()).toBeTruthy();
  return response.json() as Promise<T>;
}

export async function createNegotiationSubmittedOrder(
  request: APIRequestContext,
  suffix: string,
) {
  const season = await responseJson<{ readonly id: string }>(
    await request.post('/api/seasons', {
      headers: {
        ...lifecycleE2eHeaders,
        'idempotency-key': `negotiation-season-${suffix}`,
      },
      data: {
        code: `NEGOTIATION-SEASON-${suffix}`,
        name: `Negotiation season ${suffix}`,
        startsAt: '2027-01-01T00:00:00.000Z',
        endsAt: '2027-12-31T00:00:00.000Z',
      },
    }),
  );
  const campaign = await responseJson<{ readonly id: string }>(
    await request.post('/api/campaigns', {
      headers: {
        ...lifecycleE2eHeaders,
        'idempotency-key': `negotiation-campaign-${suffix}`,
      },
      data: {
        seasonId: season.id,
        code: `NEGOTIATION-CAMPAIGN-${suffix}`,
        name: `Negotiation campaign ${suffix}`,
        startsAt: '2027-02-01T00:00:00.000Z',
        endsAt: '2027-11-30T00:00:00.000Z',
      },
    }),
  );
  const collection = await responseJson<{
    readonly id: string;
    readonly version: number;
  }>(
    await request.post(`/api/campaigns/${encodeURIComponent(campaign.id)}/collections`, {
      headers: {
        ...lifecycleE2eHeaders,
        'idempotency-key': `negotiation-collection-${suffix}`,
      },
      data: {
        code: `NEGOTIATION-COLLECTION-${suffix}`,
        name: `Negotiation collection ${suffix}`,
        currency: 'EUR',
      },
    }),
  );
  const ready = await responseJson<{ readonly version: number }>(
    await request.patch(`/api/collections/${encodeURIComponent(collection.id)}`, {
      headers: lifecycleE2eHeaders,
      data: { expectedVersion: collection.version, status: 'READY' },
    }),
  );
  await responseJson(
    await request.patch(`/api/collections/${encodeURIComponent(collection.id)}`, {
      headers: lifecycleE2eHeaders,
      data: { expectedVersion: ready.version, status: 'PUBLISHED' },
    }),
  );
  const showroom = await responseJson<{
    readonly id: string;
    readonly version: number;
  }>(
    await request.post(`/api/collections/${encodeURIComponent(collection.id)}/showrooms`, {
      headers: {
        ...lifecycleE2eHeaders,
        'idempotency-key': `negotiation-showroom-${suffix}`,
      },
      data: {
        code: `NEGOTIATION-SHOWROOM-${suffix}`,
        title: `Negotiation Showroom ${suffix}`,
        opensAt: '2027-03-01T00:00:00.000Z',
        closesAt: '2027-10-01T00:00:00.000Z',
      },
    }),
  );
  await responseJson(
    await request.post(`/api/showrooms/${encodeURIComponent(showroom.id)}/publish`, {
      headers: {
        ...lifecycleE2eHeaders,
        'idempotency-key': `negotiation-showroom-publish-${suffix}`,
      },
      data: { expectedVersion: showroom.version },
    }),
  );
  const grant = await responseJson<{ readonly id: string }>(
    await request.post(`/api/showrooms/${encodeURIComponent(showroom.id)}/access-grants`, {
      headers: {
        ...lifecycleE2eHeaders,
        'idempotency-key': `negotiation-grant-${suffix}`,
      },
      data: { buyerOrganisationId: selectionE2eBuyerOrganisationId },
    }),
  );
  const selection = await responseJson<{
    readonly id: string;
    readonly version: number;
  }>(
    await request.post('/api/selections', {
      headers: {
        ...selectionE2eBuyerHeaders,
        'idempotency-key': `negotiation-selection-${suffix}`,
      },
      data: {
        grantId: grant.id,
        title: `Negotiation buy ${suffix}`,
        currency: 'EUR',
        budgetMinor: 500_000,
      },
    }),
  );
  const withItem = await responseJson<{
    readonly version: number;
    readonly items: readonly { readonly id: string }[];
  }>(
    await request.patch(`/api/selections/${encodeURIComponent(selection.id)}`, {
      headers: selectionE2eBuyerHeaders,
      data: {
        action: 'add_item',
        expectedVersion: selection.version,
        productReference: `SKU-NEGOTIATION-${suffix}`,
        variantReference: 'BLACK',
        quantityIntent: 5,
        note: 'Negotiation coverage',
      },
    }),
  );
  const sized = await responseJson<{ readonly version: number }>(
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
  await responseJson(
    await request.patch(`/api/selections/${encodeURIComponent(selection.id)}`, {
      headers: selectionE2eBuyerHeaders,
      data: { action: 'mark_ready', expectedVersion: sized.version },
    }),
  );
  const order = await responseJson<{
    readonly id: string;
    readonly version: number;
    readonly lines: readonly { readonly id: string }[];
  }>(
    await request.post('/api/orders', {
      headers: {
        ...selectionE2eBuyerHeaders,
        'idempotency-key': `negotiation-order-${suffix}`,
      },
      data: { selectionId: selection.id },
    }),
  );
  const priced = await responseJson<{ readonly version: number }>(
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
  return responseJson<{
    readonly id: string;
    readonly orderId: string;
    readonly lines: readonly {
      readonly id: string;
      readonly sizeQuantities: readonly {
        readonly size: string;
        readonly quantity: number;
      }[];
    }[];
    readonly totals: {
      readonly quantity: number;
      readonly totalMinor: number;
    };
  }>(
    await request.post(`/api/orders/${encodeURIComponent(order.id)}/submit`, {
      headers: {
        ...selectionE2eBuyerHeaders,
        'idempotency-key': `negotiation-submit-${suffix}`,
      },
      data: { expectedVersion: priced.version },
    }),
  );
}
