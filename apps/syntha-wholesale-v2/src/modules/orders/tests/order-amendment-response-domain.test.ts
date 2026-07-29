import { describe, expect, it } from 'vitest';

import { organisationId } from '@/modules/organisations';
import { selectionId, selectionItemId, showroomAccessGrantId } from '@/modules/selection';
import { showroomId, showroomSnapshotId } from '@/modules/showroom';

import {
  OrderAmendmentResponseDomainError,
  acceptOrderAmendment,
  counterOrderAmendment,
  rejectOrderAmendment,
} from '../domain/order-amendment-response';
import {
  orderId,
  orderLineId,
  submittedOrderSnapshotId,
  type SubmittedOrderSnapshot,
} from '../domain/order';
import {
  createOrderReview,
  requestOrderAmendment,
  type OrderReview,
} from '../domain/order-review';

function snapshotFixture(): SubmittedOrderSnapshot {
  return Object.freeze({
    id: submittedOrderSnapshotId('submitted-order-amendment-response-1'),
    orderId: orderId('order-amendment-response-1'),
    orderVersion: 4,
    buyerOrganisationId: organisationId('shop-amendment-response-1'),
    sellerOrganisationId: organisationId('brand-amendment-response-1'),
    selectionId: selectionId('selection-amendment-response-1'),
    showroomAccessGrantId: showroomAccessGrantId('grant-amendment-response-1'),
    showroomId: showroomId('showroom-amendment-response-1'),
    showroomSnapshotId: showroomSnapshotId('showroom-snapshot-amendment-response-1'),
    currency: 'EUR',
    lines: Object.freeze([
      Object.freeze({
        id: orderLineId('order-line-amendment-response-1'),
        selectionItemId: selectionItemId('selection-item-amendment-response-1'),
        productReference: 'SKU-AMENDMENT-RESPONSE-1',
        variantReference: 'BLACK',
        sizeQuantities: Object.freeze([
          Object.freeze({ size: 'S', quantity: 2 }),
          Object.freeze({ size: 'M', quantity: 4 }),
        ]),
        totalQuantity: 6,
        unitPriceMinor: 25_000,
        discountBasisPoints: 1_000,
        taxBasisPoints: 2_000,
        totals: Object.freeze({
          grossMinor: 150_000,
          discountMinor: 15_000,
          netMinor: 135_000,
          taxMinor: 27_000,
          totalMinor: 162_000,
        }),
        note: 'Core line',
        createdAt: '2026-07-29T20:00:00.000Z',
        updatedAt: '2026-07-29T21:00:00.000Z',
      }),
      Object.freeze({
        id: orderLineId('order-line-amendment-response-2'),
        selectionItemId: selectionItemId('selection-item-amendment-response-2'),
        productReference: 'SKU-AMENDMENT-RESPONSE-2',
        variantReference: 'WHITE',
        sizeQuantities: Object.freeze([
          Object.freeze({ size: 'M', quantity: 1 }),
          Object.freeze({ size: 'L', quantity: 2 }),
        ]),
        totalQuantity: 3,
        unitPriceMinor: 10_000,
        discountBasisPoints: 0,
        taxBasisPoints: 0,
        totals: Object.freeze({
          grossMinor: 30_000,
          discountMinor: 0,
          netMinor: 30_000,
          taxMinor: 0,
          totalMinor: 30_000,
        }),
        note: 'Unchanged line',
        createdAt: '2026-07-29T20:00:00.000Z',
        updatedAt: '2026-07-29T21:00:00.000Z',
      }),
    ]),
    totals: Object.freeze({
      quantity: 9,
      grossMinor: 180_000,
      discountMinor: 15_000,
      netMinor: 165_000,
      taxMinor: 27_000,
      totalMinor: 192_000,
    }),
    submittedByCredentialId: 'buyer-admin',
    submittedAt: '2026-07-29T21:00:00.000Z',
  });
}

function amendmentReview(snapshot = snapshotFixture()): OrderReview {
  const pending = createOrderReview({
    id: 'order-review-amendment-response-1',
    snapshot,
    ownerCredentialId: 'seller-reviewer',
    now: new Date('2026-07-29T22:00:00.000Z'),
  });
  return requestOrderAmendment(pending, snapshot, {
    reason: 'Reduce M and improve launch discount',
    lineChanges: [
      {
        lineId: snapshot.lines[0]!.id,
        sizeQuantities: [{ size: 'M', quantity: 3 }],
        discountBasisPoints: 500,
      },
    ],
    actorCredentialId: 'seller-reviewer',
    now: new Date('2026-07-29T22:05:00.000Z'),
  });
}

describe('Order amendment response domain', () => {
  it('accepts seller changes into a new immutable revision', () => {
    const snapshot = snapshotFixture();
    const review = amendmentReview(snapshot);
    const snapshotBefore = JSON.stringify(snapshot);
    const reviewBefore = JSON.stringify(review);

    const result = acceptOrderAmendment({
      responseId: 'amendment-response-accepted-1',
      revisedVersionId: 'revised-order-version-accepted-1',
      review,
      snapshot,
      actorCredentialId: 'buyer-admin',
      now: new Date('2026-07-29T22:10:00.000Z'),
    });

    expect(result.response).toMatchObject({
      decision: 'ACCEPTED',
      orderReviewId: review.id,
      submittedOrderSnapshotId: snapshot.id,
      revisedOrderVersionId: result.revised.id,
      version: 1,
    });
    expect(result.revised.lines[0]).toMatchObject({
      productReference: 'SKU-AMENDMENT-RESPONSE-1',
      variantReference: 'BLACK',
      sizeQuantities: [
        { size: 'S', quantity: 2 },
        { size: 'M', quantity: 3 },
      ],
      totalQuantity: 5,
      unitPriceMinor: 25_000,
      discountBasisPoints: 500,
      taxBasisPoints: 2_000,
      totals: {
        grossMinor: 125_000,
        discountMinor: 6_250,
        netMinor: 118_750,
        taxMinor: 23_750,
        totalMinor: 142_500,
      },
    });
    expect(result.revised.lines[1]).toEqual(snapshot.lines[1]);
    expect(result.revised.lines[1]).not.toBe(snapshot.lines[1]);
    expect(result.revised.totals).toEqual({
      quantity: 8,
      grossMinor: 155_000,
      discountMinor: 6_250,
      netMinor: 148_750,
      taxMinor: 23_750,
      totalMinor: 172_500,
    });
    expect(JSON.stringify(snapshot)).toBe(snapshotBefore);
    expect(JSON.stringify(review)).toBe(reviewBefore);
  });

  it('creates a buyer counterproposal with deterministic recalculation', () => {
    const snapshot = snapshotFixture();
    const review = amendmentReview(snapshot);
    const result = counterOrderAmendment({
      responseId: 'amendment-response-countered-1',
      revisedVersionId: 'revised-order-version-countered-1',
      review,
      snapshot,
      reason: 'Keep M quantity and reduce unit price instead',
      lineChanges: [
        {
          lineId: snapshot.lines[0]!.id,
          unitPriceMinor: 24_000,
          discountBasisPoints: 800,
          note: 'Buyer counterproposal',
        },
      ],
      actorCredentialId: 'buyer-admin',
      now: new Date('2026-07-29T22:15:00.000Z'),
    });

    expect(result.response).toMatchObject({
      decision: 'COUNTERED',
      reason: 'Keep M quantity and reduce unit price instead',
      revisedOrderVersionId: result.revised.id,
    });
    expect(result.revised).toMatchObject({
      revisionKind: 'COUNTERED',
      sourceOrderVersion: 4,
      totals: {
        quantity: 9,
        grossMinor: 174_000,
        discountMinor: 11_520,
        netMinor: 162_480,
        taxMinor: 25_920,
        totalMinor: 188_400,
      },
    });
    expect(result.revised.lines[0]).toMatchObject({
      totalQuantity: 6,
      unitPriceMinor: 24_000,
      discountBasisPoints: 800,
      taxBasisPoints: 2_000,
      note: 'Buyer counterproposal',
      totals: {
        grossMinor: 144_000,
        discountMinor: 11_520,
        netMinor: 132_480,
        taxMinor: 26_496,
        totalMinor: 158_976,
      },
    });
  });

  it('rejects the amendment without creating a revised version', () => {
    const snapshot = snapshotFixture();
    const review = amendmentReview(snapshot);
    const response = rejectOrderAmendment({
      responseId: 'amendment-response-rejected-1',
      review,
      snapshot,
      reason: 'Original commercial terms remain required',
      actorCredentialId: 'buyer-admin',
      now: new Date('2026-07-29T22:20:00.000Z'),
    });

    expect(response).toMatchObject({
      decision: 'REJECTED',
      reason: 'Original commercial terms remain required',
      proposedLineChanges: [],
      version: 1,
    });
    expect(response.revisedOrderVersionId).toBeUndefined();
  });

  it('rejects unknown identities, duplicate changes and invalid source state', () => {
    const snapshot = snapshotFixture();
    const review = amendmentReview(snapshot);
    expect(() =>
      counterOrderAmendment({
        responseId: 'amendment-response-invalid-line',
        revisedVersionId: 'revised-order-version-invalid-line',
        review,
        snapshot,
        reason: 'Invalid line',
        lineChanges: [
          { lineId: orderLineId('missing-line'), unitPriceMinor: 1 },
        ],
        actorCredentialId: 'buyer-admin',
        now: new Date('2026-07-29T22:30:00.000Z'),
      }),
    ).toThrow(OrderAmendmentResponseDomainError);
    expect(() =>
      counterOrderAmendment({
        responseId: 'amendment-response-invalid-size',
        revisedVersionId: 'revised-order-version-invalid-size',
        review,
        snapshot,
        reason: 'Invalid size',
        lineChanges: [
          {
            lineId: snapshot.lines[0]!.id,
            sizeQuantities: [{ size: 'XL', quantity: 1 }],
          },
        ],
        actorCredentialId: 'buyer-admin',
        now: new Date('2026-07-29T22:30:00.000Z'),
      }),
    ).toThrow(OrderAmendmentResponseDomainError);
    expect(() =>
      counterOrderAmendment({
        responseId: 'amendment-response-duplicate-line',
        revisedVersionId: 'revised-order-version-duplicate-line',
        review,
        snapshot,
        reason: 'Duplicate line',
        lineChanges: [
          { lineId: snapshot.lines[0]!.id, unitPriceMinor: 20_000 },
          { lineId: snapshot.lines[0]!.id, unitPriceMinor: 21_000 },
        ],
        actorCredentialId: 'buyer-admin',
        now: new Date('2026-07-29T22:30:00.000Z'),
      }),
    ).toThrow(OrderAmendmentResponseDomainError);

    const pending = createOrderReview({
      id: 'pending-review-no-amendment',
      snapshot,
      ownerCredentialId: 'seller-reviewer',
      now: new Date('2026-07-29T22:00:00.000Z'),
    });
    expect(() =>
      rejectOrderAmendment({
        responseId: 'amendment-response-invalid-state',
        review: pending,
        snapshot,
        reason: 'No request exists',
        actorCredentialId: 'buyer-admin',
        now: new Date('2026-07-29T22:30:00.000Z'),
      }),
    ).toThrow(OrderAmendmentResponseDomainError);
  });
});
