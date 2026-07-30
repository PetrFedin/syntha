import { describe, expect, it } from 'vitest';

import { organisationId } from '@/modules/organisations';
import { selectionItemId } from '@/modules/selection';

import {
  orderId,
  orderLineId,
  submittedOrderSnapshotId,
} from '../domain/order';
import {
  orderAmendmentResponseId,
  revisedOrderVersionId,
  type RevisedOrderVersion,
} from '../domain/order-amendment-response';
import {
  RevisedOrderReviewDomainError,
  approveRevisedOrder,
  confirmRevisedOrder,
  createRevisedOrderReview,
  requestRevisedOrderAmendment,
} from '../domain/revised-order-review';

function revisedFixture(): RevisedOrderVersion {
  return Object.freeze({
    id: revisedOrderVersionId('revised-order-review-source-1'),
    orderAmendmentResponseId: orderAmendmentResponseId('amendment-response-review-source-1'),
    orderReviewId: 'order-review-source-1' as RevisedOrderVersion['orderReviewId'],
    submittedOrderSnapshotId: submittedOrderSnapshotId('submitted-order-review-source-1'),
    orderId: orderId('order-review-source-1'),
    sourceOrderVersion: 3,
    buyerOrganisationId: organisationId('shop-revised-review-1'),
    sellerOrganisationId: organisationId('brand-revised-review-1'),
    revisionKind: 'COUNTERED',
    currency: 'EUR',
    lines: Object.freeze([
      Object.freeze({
        id: orderLineId('revised-review-line-1'),
        selectionItemId: selectionItemId('revised-review-item-1'),
        productReference: 'SKU-REVISED-REVIEW-1',
        variantReference: 'BLACK',
        sizeQuantities: Object.freeze([
          Object.freeze({ size: 'S', quantity: 2 }),
          Object.freeze({ size: 'M', quantity: 3 }),
        ]),
        totalQuantity: 5,
        unitPriceMinor: 24_000,
        discountBasisPoints: 800,
        taxBasisPoints: 2_000,
        totals: Object.freeze({
          grossMinor: 120_000,
          discountMinor: 9_600,
          netMinor: 110_400,
          taxMinor: 22_080,
          totalMinor: 132_480,
        }),
        note: 'Buyer counterproposal',
        createdAt: '2026-07-30T10:00:00.000Z',
        updatedAt: '2026-07-30T10:00:00.000Z',
      }),
    ]),
    totals: Object.freeze({
      quantity: 5,
      grossMinor: 120_000,
      discountMinor: 9_600,
      netMinor: 110_400,
      taxMinor: 22_080,
      totalMinor: 132_480,
    }),
    createdByCredentialId: 'buyer-admin',
    createdAt: '2026-07-30T10:00:00.000Z',
  });
}

describe('Revised Order review domain', () => {
  it('approves and confirms an immutable Revised Order source', () => {
    const revised = revisedFixture();
    const sourceBefore = JSON.stringify(revised);
    const pending = createRevisedOrderReview({
      id: 'revised-order-review-1',
      revised,
      ownerCredentialId: 'seller-reviewer',
      now: new Date('2026-07-30T11:00:00.000Z'),
    });
    const approved = approveRevisedOrder(pending, revised, {
      actorCredentialId: 'seller-reviewer',
      now: new Date('2026-07-30T11:05:00.000Z'),
    });
    const result = confirmRevisedOrder(approved, revised, {
      confirmedVersionId: 'revised-confirmed-order-version-1',
      actorCredentialId: 'seller-approver',
      now: new Date('2026-07-30T11:10:00.000Z'),
    });

    expect(approved).toMatchObject({
      status: 'APPROVED',
      version: 2,
      approval: { approvedByCredentialId: 'seller-reviewer' },
    });
    expect(result.review).toMatchObject({
      status: 'CONFIRMED',
      version: 3,
      confirmedOrderVersionId: result.confirmed.id,
    });
    expect(result.confirmed).toMatchObject({
      revisedOrderVersionId: revised.id,
      orderAmendmentResponseId: revised.orderAmendmentResponseId,
      submittedOrderSnapshotId: revised.submittedOrderSnapshotId,
      totals: revised.totals,
    });
    expect(result.confirmed.lines).toEqual(revised.lines);
    expect(result.confirmed.lines[0]).not.toBe(revised.lines[0]);
    expect(JSON.stringify(revised)).toBe(sourceBefore);
  });

  it('creates a structured second amendment request without mutating the source', () => {
    const revised = revisedFixture();
    const sourceBefore = JSON.stringify(revised);
    const pending = createRevisedOrderReview({
      id: 'revised-order-review-amendment-1',
      revised,
      ownerCredentialId: 'seller-reviewer',
      now: new Date('2026-07-30T12:00:00.000Z'),
    });
    const changed = requestRevisedOrderAmendment(pending, revised, {
      reason: 'Adjust M quantity before final confirmation',
      lineChanges: [
        {
          lineId: revised.lines[0]!.id,
          sizeQuantities: [{ size: 'M', quantity: 2 }],
        },
      ],
      actorCredentialId: 'seller-reviewer',
      now: new Date('2026-07-30T12:05:00.000Z'),
    });

    expect(changed).toMatchObject({
      status: 'AMENDMENT_REQUESTED',
      version: 2,
      amendmentRequest: {
        reason: 'Adjust M quantity before final confirmation',
        lineChanges: [
          {
            lineId: revised.lines[0]!.id,
            sizeQuantities: [{ size: 'M', quantity: 2 }],
          },
        ],
      },
    });
    expect(JSON.stringify(revised)).toBe(sourceBefore);
  });

  it('rejects invalid identities, invalid transitions and source mismatch', () => {
    const revised = revisedFixture();
    const pending = createRevisedOrderReview({
      id: 'revised-order-review-invalid-1',
      revised,
      ownerCredentialId: 'seller-reviewer',
      now: new Date('2026-07-30T13:00:00.000Z'),
    });
    expect(() =>
      requestRevisedOrderAmendment(pending, revised, {
        reason: 'Invalid line',
        lineChanges: [{ lineId: orderLineId('missing-line'), unitPriceMinor: 1 }],
        actorCredentialId: 'seller-reviewer',
        now: new Date('2026-07-30T13:05:00.000Z'),
      }),
    ).toThrow(RevisedOrderReviewDomainError);
    expect(() =>
      requestRevisedOrderAmendment(pending, revised, {
        reason: 'Invalid size',
        lineChanges: [
          {
            lineId: revised.lines[0]!.id,
            sizeQuantities: [{ size: 'XL', quantity: 1 }],
          },
        ],
        actorCredentialId: 'seller-reviewer',
        now: new Date('2026-07-30T13:05:00.000Z'),
      }),
    ).toThrow(RevisedOrderReviewDomainError);
    const approved = approveRevisedOrder(pending, revised, {
      actorCredentialId: 'seller-reviewer',
      now: new Date('2026-07-30T13:10:00.000Z'),
    });
    expect(() =>
      requestRevisedOrderAmendment(approved, revised, {
        reason: 'Too late',
        lineChanges: [
          { lineId: revised.lines[0]!.id, unitPriceMinor: 23_000 },
        ],
        actorCredentialId: 'seller-reviewer',
        now: new Date('2026-07-30T13:15:00.000Z'),
      }),
    ).toThrow(RevisedOrderReviewDomainError);
    expect(() =>
      confirmRevisedOrder(pending, revised, {
        confirmedVersionId: 'not-approved-confirmation',
        actorCredentialId: 'seller-reviewer',
        now: new Date('2026-07-30T13:20:00.000Z'),
      }),
    ).toThrow(RevisedOrderReviewDomainError);
    const another = Object.freeze({
      ...revised,
      id: revisedOrderVersionId('another-revised-source'),
    });
    expect(() =>
      approveRevisedOrder(pending, another, {
        actorCredentialId: 'seller-reviewer',
        now: new Date('2026-07-30T13:25:00.000Z'),
      }),
    ).toThrow(RevisedOrderReviewDomainError);
  });
});
