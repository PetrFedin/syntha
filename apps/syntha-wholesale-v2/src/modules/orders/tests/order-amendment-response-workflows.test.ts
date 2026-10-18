import { describe, expect, it } from 'vitest';

import { LifecycleIdempotencyConflict } from '@/modules/lifecycle-idempotency';
import { organisationId } from '@/modules/organisations';
import { selectionId, selectionItemId, showroomAccessGrantId } from '@/modules/selection';
import { showroomId, showroomSnapshotId } from '@/modules/showroom';

import type { OrderRepository } from '../application/order-repository';
import type { OrderReviewRepository } from '../application/order-review-repository';
import {
  OrderAmendmentResponseAlreadyExists,
  OrderAmendmentResponseSourceNotFound,
  acceptOrderAmendmentUseCase,
  getRevisedOrderForBuyer,
  rejectOrderAmendmentUseCase,
} from '../application/order-amendment-response-workflows';
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
import { InMemoryOrderAmendmentResponseRepository } from '../infrastructure/in-memory-order-amendment-response-repository';

function snapshotFixture(): SubmittedOrderSnapshot {
  return Object.freeze({
    id: submittedOrderSnapshotId('submitted-order-response-workflow-1'),
    orderId: orderId('order-response-workflow-1'),
    orderVersion: 3,
    buyerOrganisationId: organisationId('shop-response-workflow-1'),
    sellerOrganisationId: organisationId('brand-response-workflow-1'),
    selectionId: selectionId('selection-response-workflow-1'),
    showroomAccessGrantId: showroomAccessGrantId('grant-response-workflow-1'),
    showroomId: showroomId('showroom-response-workflow-1'),
    showroomSnapshotId: showroomSnapshotId('showroom-snapshot-response-workflow-1'),
    currency: 'EUR',
    lines: Object.freeze([
      Object.freeze({
        id: orderLineId('order-line-response-workflow-1'),
        selectionItemId: selectionItemId('selection-item-response-workflow-1'),
        productReference: 'SKU-RESPONSE-WORKFLOW-1',
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
        createdAt: '2026-07-30T08:00:00.000Z',
        updatedAt: '2026-07-30T08:30:00.000Z',
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
    submittedAt: '2026-07-30T08:30:00.000Z',
  });
}

function reviewFixture(snapshot: SubmittedOrderSnapshot): OrderReview {
  return requestOrderAmendment(
    createOrderReview({
      id: 'order-review-response-workflow-1',
      snapshot,
      ownerCredentialId: 'seller-reviewer',
      now: new Date('2026-07-30T09:00:00.000Z'),
    }),
    snapshot,
    {
      reason: 'Reduce M and improve discount',
      lineChanges: [
        {
          lineId: snapshot.lines[0]!.id,
          sizeQuantities: [{ size: 'M', quantity: 3 }],
          discountBasisPoints: 500,
        },
      ],
      actorCredentialId: 'seller-reviewer',
      now: new Date('2026-07-30T09:05:00.000Z'),
    },
  );
}

function sourceRepositories(snapshot: SubmittedOrderSnapshot, review: OrderReview): {
  readonly orderRepository: OrderRepository;
  readonly reviewRepository: OrderReviewRepository;
} {
  return {
    orderRepository: {
      findSubmittedSnapshotForBuyer: async (buyerOrganisationId, snapshotId) =>
        buyerOrganisationId === snapshot.buyerOrganisationId && snapshotId === snapshot.id
          ? snapshot
          : null,
    } as OrderRepository,
    reviewRepository: {
      findReviewForBuyer: async (buyerOrganisationId, reviewId) =>
        buyerOrganisationId === review.buyerOrganisationId && reviewId === review.id
          ? review
          : null,
    } as OrderReviewRepository,
  };
}

function runtime() {
  let sequence = 0;
  return {
    clock: { now: () => new Date('2026-07-30T10:00:00.000Z') },
    ids: { next: (prefix: string) => `${prefix}-${++sequence}` },
  };
}

describe('Order amendment response workflows', () => {
  it('accepts once, replays exactly and exposes the immutable revision to the buyer', async () => {
    const snapshot = snapshotFixture();
    const review = reviewFixture(snapshot);
    const responseRepository = new InMemoryOrderAmendmentResponseRepository();
    const source = sourceRepositories(snapshot, review);
    const execution = runtime();
    const input = {
      ...source,
      responseRepository,
      ...execution,
      buyerOrganisationId: snapshot.buyerOrganisationId,
      reviewId: review.id,
      expectedReviewVersion: review.version,
      actorCredentialId: 'buyer-admin',
      idempotencyKey: 'accept-response-workflow-1',
    };

    const created = await acceptOrderAmendmentUseCase(input);
    const replayed = await acceptOrderAmendmentUseCase(input);

    expect(created.replayed).toBe(false);
    expect(replayed).toEqual({ entity: created.entity, replayed: true });
    expect(created.entity.decision).toBe('ACCEPTED');
    expect(created.entity.revisedOrderVersionId).toBeDefined();
    expect(responseRepository.audits).toHaveLength(1);
    expect(responseRepository.outbox).toHaveLength(1);

    const revised = await getRevisedOrderForBuyer({
      repository: responseRepository,
      buyerOrganisationId: snapshot.buyerOrganisationId,
      versionId: created.entity.revisedOrderVersionId!,
    });
    expect(revised.totals).toEqual({
      quantity: 5,
      grossMinor: 125_000,
      discountMinor: 6_250,
      netMinor: 118_750,
      taxMinor: 23_750,
      totalMinor: 142_500,
    });

    await expect(
      acceptOrderAmendmentUseCase({
        ...input,
        expectedReviewVersion: review.version + 1,
      }),
    ).rejects.toBeInstanceOf(LifecycleIdempotencyConflict);
  });

  it('rejects without a revised version and prevents a second response', async () => {
    const snapshot = snapshotFixture();
    const review = reviewFixture(snapshot);
    const responseRepository = new InMemoryOrderAmendmentResponseRepository();
    const source = sourceRepositories(snapshot, review);
    const execution = runtime();

    const rejected = await rejectOrderAmendmentUseCase({
      ...source,
      responseRepository,
      ...execution,
      buyerOrganisationId: snapshot.buyerOrganisationId,
      reviewId: review.id,
      expectedReviewVersion: review.version,
      reason: 'Original terms remain required',
      actorCredentialId: 'buyer-admin',
      idempotencyKey: 'reject-response-workflow-1',
    });

    expect(rejected.entity.decision).toBe('REJECTED');
    expect(rejected.entity.revisedOrderVersionId).toBeUndefined();
    expect(await responseRepository.listRevisedForBuyer(snapshot.buyerOrganisationId)).toEqual([]);

    await expect(
      acceptOrderAmendmentUseCase({
        ...source,
        responseRepository,
        ...execution,
        buyerOrganisationId: snapshot.buyerOrganisationId,
        reviewId: review.id,
        expectedReviewVersion: review.version,
        actorCredentialId: 'buyer-admin',
        idempotencyKey: 'accept-after-reject-workflow-1',
      }),
    ).rejects.toBeInstanceOf(OrderAmendmentResponseAlreadyExists);
  });

  it('does not expose a seller review through another buyer organisation', async () => {
    const snapshot = snapshotFixture();
    const review = reviewFixture(snapshot);
    const responseRepository = new InMemoryOrderAmendmentResponseRepository();
    const source = sourceRepositories(snapshot, review);

    await expect(
      acceptOrderAmendmentUseCase({
        ...source,
        responseRepository,
        ...runtime(),
        buyerOrganisationId: organisationId('another-shop'),
        reviewId: review.id,
        expectedReviewVersion: review.version,
        actorCredentialId: 'other-buyer',
        idempotencyKey: 'cross-tenant-response-workflow-1',
      }),
    ).rejects.toBeInstanceOf(OrderAmendmentResponseSourceNotFound);
  });
});
