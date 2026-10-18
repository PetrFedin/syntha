import { describe, expect, it } from 'vitest';

import { organisationId } from '@/modules/organisations';
import { selectionId, selectionItemId, showroomAccessGrantId } from '@/modules/selection';
import { showroomId, showroomSnapshotId } from '@/modules/showroom';

import {
  OrderReviewDomainError,
  approveOrder,
  confirmOrder,
  createOrderReview,
  requestOrderAmendment,
} from '../domain/order-review';
import {
  orderId,
  orderLineId,
  submittedOrderSnapshotId,
  type SubmittedOrderSnapshot,
} from '../domain/order';

function snapshotFixture(): SubmittedOrderSnapshot {
  return Object.freeze({
    id: submittedOrderSnapshotId('submitted-order-review-1'),
    orderId: orderId('order-review-1'),
    orderVersion: 4,
    buyerOrganisationId: organisationId('shop-review-1'),
    sellerOrganisationId: organisationId('brand-review-1'),
    selectionId: selectionId('selection-review-1'),
    showroomAccessGrantId: showroomAccessGrantId('grant-review-1'),
    showroomId: showroomId('showroom-review-1'),
    showroomSnapshotId: showroomSnapshotId('showroom-snapshot-review-1'),
    currency: 'EUR',
    lines: Object.freeze([
      Object.freeze({
        id: orderLineId('order-line-review-1'),
        selectionItemId: selectionItemId('selection-item-review-1'),
        productReference: 'SKU-REVIEW-1',
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
    ]),
    totals: Object.freeze({
      quantity: 6,
      grossMinor: 150_000,
      discountMinor: 15_000,
      netMinor: 135_000,
      taxMinor: 27_000,
      totalMinor: 162_000,
    }),
    submittedByCredentialId: 'buyer-admin',
    submittedAt: '2026-07-29T21:00:00.000Z',
  });
}

function pendingReview() {
  return createOrderReview({
    id: 'order-review-aggregate-1',
    snapshot: snapshotFixture(),
    ownerCredentialId: 'seller-reviewer',
    now: new Date('2026-07-29T22:00:00.000Z'),
  });
}

describe('Order review domain', () => {
  it('approves and confirms without mutating the submitted snapshot', () => {
    const snapshot = snapshotFixture();
    const before = JSON.stringify(snapshot);
    const approved = approveOrder(pendingReview(), {
      actorCredentialId: 'seller-approver',
      now: new Date('2026-07-29T22:05:00.000Z'),
    });
    const result = confirmOrder(approved, snapshot, {
      confirmedVersionId: 'confirmed-order-version-1',
      actorCredentialId: 'seller-confirmer',
      now: new Date('2026-07-29T22:10:00.000Z'),
    });

    expect(result.review).toMatchObject({ status: 'CONFIRMED', version: 3 });
    expect(result.confirmed).toMatchObject({
      submittedOrderSnapshotId: snapshot.id,
      sourceOrderVersion: 4,
      totals: { quantity: 6, totalMinor: 162_000 },
      approvedByCredentialId: 'seller-approver',
      confirmedByCredentialId: 'seller-confirmer',
    });
    expect(JSON.stringify(snapshot)).toBe(before);
    expect(result.confirmed.lines).not.toBe(snapshot.lines);
    expect(result.confirmed.lines[0]).not.toBe(snapshot.lines[0]);
  });

  it('records a structured amendment request only against submitted identities', () => {
    const snapshot = snapshotFixture();
    const changed = requestOrderAmendment(pendingReview(), snapshot, {
      reason: 'Reduce launch quantity and adjust terms',
      lineChanges: [
        {
          lineId: snapshot.lines[0]!.id,
          sizeQuantities: [{ size: 'M', quantity: 3 }],
          unitPriceMinor: 24_000,
          discountBasisPoints: 800,
          note: 'Approved launch cap',
        },
      ],
      actorCredentialId: 'seller-reviewer',
      now: new Date('2026-07-29T22:06:00.000Z'),
    });

    expect(changed).toMatchObject({
      status: 'AMENDMENT_REQUESTED',
      version: 2,
      amendmentRequest: {
        reason: 'Reduce launch quantity and adjust terms',
        requestedByCredentialId: 'seller-reviewer',
      },
    });
    expect(changed.amendmentRequest?.lineChanges[0]).toEqual({
      lineId: snapshot.lines[0]!.id,
      sizeQuantities: [{ size: 'M', quantity: 3 }],
      unitPriceMinor: 24_000,
      discountBasisPoints: 800,
      note: 'Approved launch cap',
    });
  });

  it('rejects unknown line and size proposals', () => {
    const snapshot = snapshotFixture();
    expect(() =>
      requestOrderAmendment(pendingReview(), snapshot, {
        reason: 'Unknown line',
        lineChanges: [{ lineId: orderLineId('missing-line'), unitPriceMinor: 1 }],
        actorCredentialId: 'seller-reviewer',
        now: new Date('2026-07-29T22:06:00.000Z'),
      }),
    ).toThrow(OrderReviewDomainError);
    expect(() =>
      requestOrderAmendment(pendingReview(), snapshot, {
        reason: 'Unknown size',
        lineChanges: [
          {
            lineId: snapshot.lines[0]!.id,
            sizeQuantities: [{ size: 'XL', quantity: 1 }],
          },
        ],
        actorCredentialId: 'seller-reviewer',
        now: new Date('2026-07-29T22:06:00.000Z'),
      }),
    ).toThrow(OrderReviewDomainError);
  });

  it('prevents approval, amendment and confirmation from invalid states', () => {
    const snapshot = snapshotFixture();
    const approved = approveOrder(pendingReview(), {
      actorCredentialId: 'seller-approver',
      now: new Date('2026-07-29T22:05:00.000Z'),
    });
    expect(() =>
      requestOrderAmendment(approved, snapshot, {
        reason: 'Late change',
        lineChanges: [],
        actorCredentialId: 'seller-reviewer',
        now: new Date('2026-07-29T22:06:00.000Z'),
      }),
    ).toThrow(OrderReviewDomainError);
    expect(() =>
      approveOrder(approved, {
        actorCredentialId: 'seller-approver',
        now: new Date('2026-07-29T22:07:00.000Z'),
      }),
    ).toThrow(OrderReviewDomainError);
    expect(() =>
      confirmOrder(pendingReview(), snapshot, {
        confirmedVersionId: 'confirmed-order-version-invalid',
        actorCredentialId: 'seller-confirmer',
        now: new Date('2026-07-29T22:08:00.000Z'),
      }),
    ).toThrow(OrderReviewDomainError);
  });
});
