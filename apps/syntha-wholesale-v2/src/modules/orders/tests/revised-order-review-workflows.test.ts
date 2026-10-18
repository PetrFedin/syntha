import { describe, expect, it } from 'vitest';

import { LifecycleIdempotencyConflict } from '@/modules/lifecycle-idempotency';
import { organisationId } from '@/modules/organisations';
import { selectionItemId } from '@/modules/selection';

import type { OrderAmendmentResponseRepository } from '../application/order-amendment-response-repository';
import {
  RevisedOrderReviewAlreadyExists,
  RevisedOrderReviewSourceNotFound,
  approveRevisedOrderUseCase,
  confirmApprovedRevisedOrderUseCase,
  getRevisedConfirmedOrderForBuyer,
  requestRevisedOrderAmendmentUseCase,
} from '../application/revised-order-review-workflows';
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
import { InMemoryRevisedOrderReviewRepository } from '../infrastructure/in-memory-revised-order-review-repository';

function revisedFixture(): RevisedOrderVersion {
  return Object.freeze({
    id: revisedOrderVersionId('revised-order-workflow-source-1'),
    orderAmendmentResponseId: orderAmendmentResponseId('response-workflow-source-1'),
    orderReviewId: 'order-review-workflow-source-1' as RevisedOrderVersion['orderReviewId'],
    submittedOrderSnapshotId: submittedOrderSnapshotId('submitted-workflow-source-1'),
    orderId: orderId('order-workflow-source-1'),
    sourceOrderVersion: 4,
    buyerOrganisationId: organisationId('shop-revised-workflow-1'),
    sellerOrganisationId: organisationId('brand-revised-workflow-1'),
    revisionKind: 'ACCEPTED',
    currency: 'EUR',
    lines: Object.freeze([
      Object.freeze({
        id: orderLineId('revised-workflow-line-1'),
        selectionItemId: selectionItemId('revised-workflow-item-1'),
        productReference: 'SKU-REVISED-WORKFLOW-1',
        variantReference: 'BLACK',
        sizeQuantities: Object.freeze([
          Object.freeze({ size: 'S', quantity: 2 }),
          Object.freeze({ size: 'M', quantity: 2 }),
        ]),
        totalQuantity: 4,
        unitPriceMinor: 25_000,
        discountBasisPoints: 500,
        taxBasisPoints: 2_000,
        totals: Object.freeze({
          grossMinor: 100_000,
          discountMinor: 5_000,
          netMinor: 95_000,
          taxMinor: 19_000,
          totalMinor: 114_000,
        }),
        note: 'Accepted amendment',
        createdAt: '2026-07-30T10:00:00.000Z',
        updatedAt: '2026-07-30T10:00:00.000Z',
      }),
    ]),
    totals: Object.freeze({
      quantity: 4,
      grossMinor: 100_000,
      discountMinor: 5_000,
      netMinor: 95_000,
      taxMinor: 19_000,
      totalMinor: 114_000,
    }),
    createdByCredentialId: 'buyer-admin',
    createdAt: '2026-07-30T10:00:00.000Z',
  });
}

function sourceRepository(revised: RevisedOrderVersion): OrderAmendmentResponseRepository {
  return {
    findRevisedForSeller: async (sellerOrganisationId, versionId) =>
      sellerOrganisationId === revised.sellerOrganisationId && versionId === revised.id
        ? revised
        : null,
  } as OrderAmendmentResponseRepository;
}

function runtime() {
  let sequence = 0;
  return {
    clock: { now: () => new Date('2026-07-30T14:00:00.000Z') },
    ids: { next: (prefix: string) => `${prefix}-${++sequence}` },
  };
}

describe('Revised Order review workflows', () => {
  it('approves, replays and confirms an immutable Revised Order', async () => {
    const revised = revisedFixture();
    const responseRepository = sourceRepository(revised);
    const reviewRepository = new InMemoryRevisedOrderReviewRepository();
    const execution = runtime();
    const approveInput = {
      responseRepository,
      reviewRepository,
      ...execution,
      sellerOrganisationId: revised.sellerOrganisationId,
      versionId: revised.id,
      expectedVersion: 0,
      actorCredentialId: 'seller-reviewer',
      idempotencyKey: 'approve-revised-workflow-1',
    } as const;

    const approved = await approveRevisedOrderUseCase(approveInput);
    const replayed = await approveRevisedOrderUseCase(approveInput);
    expect(approved.replayed).toBe(false);
    expect(replayed).toEqual({ entity: approved.entity, replayed: true });
    expect(reviewRepository.audits).toHaveLength(1);
    expect(reviewRepository.outbox).toHaveLength(1);

    const confirmed = await confirmApprovedRevisedOrderUseCase({
      responseRepository,
      reviewRepository,
      ...execution,
      sellerOrganisationId: revised.sellerOrganisationId,
      reviewId: approved.entity.id,
      expectedVersion: approved.entity.version,
      actorCredentialId: 'seller-approver',
      idempotencyKey: 'confirm-revised-workflow-1',
    });
    const confirmReplay = await confirmApprovedRevisedOrderUseCase({
      responseRepository,
      reviewRepository,
      ...execution,
      sellerOrganisationId: revised.sellerOrganisationId,
      reviewId: approved.entity.id,
      expectedVersion: approved.entity.version,
      actorCredentialId: 'seller-approver',
      idempotencyKey: 'confirm-revised-workflow-1',
    });
    expect(confirmReplay).toEqual({ entity: confirmed.entity, replayed: true });
    expect(confirmed.entity.totals).toEqual(revised.totals);
    expect(
      await getRevisedConfirmedOrderForBuyer({
        repository: reviewRepository,
        buyerOrganisationId: revised.buyerOrganisationId,
        versionId: confirmed.entity.id,
      }),
    ).toEqual(confirmed.entity);
  });

  it('creates a second amendment request and prevents another decision', async () => {
    const revised = revisedFixture();
    const responseRepository = sourceRepository(revised);
    const reviewRepository = new InMemoryRevisedOrderReviewRepository();
    const execution = runtime();
    const requested = await requestRevisedOrderAmendmentUseCase({
      responseRepository,
      reviewRepository,
      ...execution,
      sellerOrganisationId: revised.sellerOrganisationId,
      versionId: revised.id,
      expectedVersion: 0,
      reason: 'Reduce M before final confirmation',
      lineChanges: [
        {
          lineId: revised.lines[0]!.id,
          sizeQuantities: [{ size: 'M', quantity: 1 }],
        },
      ],
      actorCredentialId: 'seller-reviewer',
      idempotencyKey: 'request-revised-workflow-1',
    });
    expect(requested.entity.status).toBe('AMENDMENT_REQUESTED');

    await expect(
      approveRevisedOrderUseCase({
        responseRepository,
        reviewRepository,
        ...execution,
        sellerOrganisationId: revised.sellerOrganisationId,
        versionId: revised.id,
        expectedVersion: 0,
        actorCredentialId: 'seller-reviewer',
        idempotencyKey: 'approve-after-request-workflow-1',
      }),
    ).rejects.toBeInstanceOf(RevisedOrderReviewAlreadyExists);
  });

  it('rejects changed idempotency payload and cross-seller source access', async () => {
    const revised = revisedFixture();
    const responseRepository = sourceRepository(revised);
    const reviewRepository = new InMemoryRevisedOrderReviewRepository();
    const execution = runtime();
    const input = {
      responseRepository,
      reviewRepository,
      ...execution,
      sellerOrganisationId: revised.sellerOrganisationId,
      versionId: revised.id,
      expectedVersion: 0,
      actorCredentialId: 'seller-reviewer',
      idempotencyKey: 'approve-revised-conflict-1',
    } as const;
    await approveRevisedOrderUseCase(input);
    await expect(
      approveRevisedOrderUseCase({ ...input, expectedVersion: 1 }),
    ).rejects.toBeInstanceOf(LifecycleIdempotencyConflict);

    await expect(
      approveRevisedOrderUseCase({
        responseRepository,
        reviewRepository: new InMemoryRevisedOrderReviewRepository(),
        ...runtime(),
        sellerOrganisationId: organisationId('another-brand'),
        versionId: revised.id,
        expectedVersion: 0,
        actorCredentialId: 'other-seller',
        idempotencyKey: 'cross-seller-revised-workflow-1',
      }),
    ).rejects.toBeInstanceOf(RevisedOrderReviewSourceNotFound);
  });
});
