import { describe, expect, it } from 'vitest';

import { LifecycleIdempotencyConflict } from '@/modules/lifecycle-idempotency';
import { organisationId } from '@/modules/organisations';
import {
  InMemorySelectionRepository,
  addSelectionItem,
  createSelection,
  grantShowroomAccess,
  markSelectionReady,
  setSelectionSizeCurve,
} from '@/modules/selection';
import { showroomId, showroomSnapshotId } from '@/modules/showroom';

import {
  OrderReviewAlreadyExists,
  OrderReviewSourceNotFound,
  OrderReviewVersionConflict,
  approveSubmittedOrderUseCase,
  confirmApprovedOrderUseCase,
  getConfirmedOrderForBuyer,
  getOrderReviewForBuyer,
  requestOrderAmendmentUseCase,
} from '../application/order-review-workflows';
import {
  createOrderDraftUseCase,
  setOrderLineCommercialTermsUseCase,
  submitOrderUseCase,
} from '../application/order-workflows';
import { InMemoryOrderRepository } from '../infrastructure/in-memory-order-repository';
import { InMemoryOrderReviewRepository } from '../infrastructure/in-memory-order-review-repository';

const buyerOrganisationId = organisationId('shop-review-workflow');
const sellerOrganisationId = organisationId('brand-review-workflow');

function selectionFixture() {
  const grant = grantShowroomAccess({
    id: 'grant-review-workflow',
    sellerOrganisationId,
    buyerOrganisationId,
    showroomId: showroomId('showroom-review-workflow'),
    showroomSnapshotId: showroomSnapshotId('showroom-snapshot-review-workflow'),
    actorCredentialId: 'brand-admin',
    now: new Date('2026-07-29T20:00:00.000Z'),
  });
  const draft = createSelection({
    id: 'selection-review-workflow',
    grant,
    buyerOrganisationId,
    title: 'Approval buy',
    currency: 'EUR',
    ownerCredentialId: 'buyer-admin',
    now: new Date('2026-07-29T20:01:00.000Z'),
  });
  const withItem = addSelectionItem(draft, {
    itemId: 'selection-item-review-workflow',
    productReference: 'SKU-REVIEW-WORKFLOW',
    variantReference: 'BLACK',
    note: 'Approval line',
    now: new Date('2026-07-29T20:02:00.000Z'),
  });
  const sized = setSelectionSizeCurve(withItem, {
    itemId: withItem.items[0]!.id,
    sizeCurve: [
      { size: 'S', quantity: 2 },
      { size: 'M', quantity: 3 },
    ],
    now: new Date('2026-07-29T20:03:00.000Z'),
  });
  return {
    grant,
    selection: markSelectionReady(sized, new Date('2026-07-29T20:04:00.000Z')),
  };
}

function harness() {
  const fixture = selectionFixture();
  let sequence = 0;
  let tick = 0;
  return {
    orderRepository: new InMemoryOrderRepository(),
    reviewRepository: new InMemoryOrderReviewRepository(),
    selectionRepository: new InMemorySelectionRepository({
      grants: [fixture.grant],
      selections: [fixture.selection],
    }),
    fixture,
    ids: { next: (prefix: string) => `${prefix}-${++sequence}` },
    clock: {
      now: () => new Date(Date.parse('2026-07-29T22:00:00.000Z') + tick++ * 60_000),
    },
  };
}

async function submittedOrder(context: ReturnType<typeof harness>) {
  const created = await createOrderDraftUseCase({
    repository: context.orderRepository,
    selectionRepository: context.selectionRepository,
    clock: context.clock,
    ids: context.ids,
    buyerOrganisationId,
    selectionId: context.fixture.selection.id,
    actorCredentialId: 'buyer-admin',
    idempotencyKey: 'review-create-order',
  });
  const priced = await setOrderLineCommercialTermsUseCase({
    repository: context.orderRepository,
    selectionRepository: context.selectionRepository,
    clock: context.clock,
    ids: context.ids,
    buyerOrganisationId,
    orderId: created.entity.id,
    expectedVersion: 1,
    lineId: created.entity.lines[0]!.id,
    unitPriceMinor: 25_000,
    discountBasisPoints: 1_000,
    taxBasisPoints: 2_000,
    actorCredentialId: 'buyer-admin',
  });
  return submitOrderUseCase({
    repository: context.orderRepository,
    selectionRepository: context.selectionRepository,
    clock: context.clock,
    ids: context.ids,
    buyerOrganisationId,
    orderId: priced.id,
    expectedVersion: 2,
    actorCredentialId: 'buyer-admin',
    idempotencyKey: 'review-submit-order',
  });
}

describe('Order review workflows', () => {
  it('approves and confirms with exact replay and buyer visibility', async () => {
    const context = harness();
    const submitted = await submittedOrder(context);
    const approveInput = {
      orderRepository: context.orderRepository,
      reviewRepository: context.reviewRepository,
      clock: context.clock,
      ids: context.ids,
      sellerOrganisationId,
      snapshotId: submitted.entity.id,
      expectedVersion: 0,
      actorCredentialId: 'seller-approver',
      idempotencyKey: 'approve-submitted-order',
    } as const;
    const approved = await approveSubmittedOrderUseCase(approveInput);
    const approveReplay = await approveSubmittedOrderUseCase(approveInput);
    expect(approved.replayed).toBe(false);
    expect(approveReplay).toEqual({ entity: approved.entity, replayed: true });
    expect(approved.entity).toMatchObject({ status: 'APPROVED', version: 2 });

    const confirmInput = {
      orderRepository: context.orderRepository,
      reviewRepository: context.reviewRepository,
      clock: context.clock,
      ids: context.ids,
      sellerOrganisationId,
      reviewId: approved.entity.id,
      expectedVersion: 2,
      actorCredentialId: 'seller-confirmer',
      idempotencyKey: 'confirm-approved-order',
    } as const;
    const confirmed = await confirmApprovedOrderUseCase(confirmInput);
    const confirmReplay = await confirmApprovedOrderUseCase(confirmInput);
    expect(confirmed.replayed).toBe(false);
    expect(confirmReplay).toEqual({ entity: confirmed.entity, replayed: true });
    expect(confirmed.entity).toMatchObject({
      submittedOrderSnapshotId: submitted.entity.id,
      totals: submitted.entity.totals,
    });
    expect(
      await getConfirmedOrderForBuyer({
        repository: context.reviewRepository,
        buyerOrganisationId,
        versionId: confirmed.entity.id,
      }),
    ).toEqual(confirmed.entity);
    expect(context.reviewRepository.audits).toHaveLength(2);
    expect(context.reviewRepository.outbox).toHaveLength(2);
  });

  it('creates one buyer-visible immutable amendment request', async () => {
    const context = harness();
    const submitted = await submittedOrder(context);
    const sourceBefore = JSON.stringify(submitted.entity);
    const line = submitted.entity.lines[0]!;
    const requested = await requestOrderAmendmentUseCase({
      orderRepository: context.orderRepository,
      reviewRepository: context.reviewRepository,
      clock: context.clock,
      ids: context.ids,
      sellerOrganisationId,
      snapshotId: submitted.entity.id,
      expectedVersion: 0,
      reason: 'Reduce M and adjust discount',
      lineChanges: [
        {
          lineId: line.id,
          sizeQuantities: [{ size: 'M', quantity: 2 }],
          discountBasisPoints: 500,
        },
      ],
      actorCredentialId: 'seller-reviewer',
      idempotencyKey: 'request-order-amendment',
    });
    expect(requested.entity).toMatchObject({
      status: 'AMENDMENT_REQUESTED',
      version: 2,
      amendmentRequest: { reason: 'Reduce M and adjust discount' },
    });
    expect(
      await getOrderReviewForBuyer({
        repository: context.reviewRepository,
        buyerOrganisationId,
        reviewId: requested.entity.id,
      }),
    ).toEqual(requested.entity);
    const sourceAfter = await context.orderRepository.findSubmittedSnapshotForBuyer(
      buyerOrganisationId,
      submitted.entity.id,
    );
    expect(JSON.stringify(sourceAfter)).toBe(sourceBefore);
    await expect(
      approveSubmittedOrderUseCase({
        orderRepository: context.orderRepository,
        reviewRepository: context.reviewRepository,
        clock: context.clock,
        ids: context.ids,
        sellerOrganisationId,
        snapshotId: submitted.entity.id,
        expectedVersion: 0,
        actorCredentialId: 'seller-approver',
        idempotencyKey: 'approve-after-amendment',
      }),
    ).rejects.toBeInstanceOf(OrderReviewAlreadyExists);
  });

  it('rejects wrong seller scope, stale confirmation and changed replay payload', async () => {
    const context = harness();
    const submitted = await submittedOrder(context);
    await expect(
      approveSubmittedOrderUseCase({
        orderRepository: context.orderRepository,
        reviewRepository: context.reviewRepository,
        clock: context.clock,
        ids: context.ids,
        sellerOrganisationId: organisationId('brand-review-other'),
        snapshotId: submitted.entity.id,
        expectedVersion: 0,
        actorCredentialId: 'seller-other',
        idempotencyKey: 'approve-wrong-seller',
      }),
    ).rejects.toBeInstanceOf(OrderReviewSourceNotFound);

    const approved = await approveSubmittedOrderUseCase({
      orderRepository: context.orderRepository,
      reviewRepository: context.reviewRepository,
      clock: context.clock,
      ids: context.ids,
      sellerOrganisationId,
      snapshotId: submitted.entity.id,
      expectedVersion: 0,
      actorCredentialId: 'seller-approver',
      idempotencyKey: 'approve-stale-test',
    });
    await expect(
      confirmApprovedOrderUseCase({
        orderRepository: context.orderRepository,
        reviewRepository: context.reviewRepository,
        clock: context.clock,
        ids: context.ids,
        sellerOrganisationId,
        reviewId: approved.entity.id,
        expectedVersion: 1,
        actorCredentialId: 'seller-confirmer',
        idempotencyKey: 'confirm-stale-review',
      }),
    ).rejects.toBeInstanceOf(OrderReviewVersionConflict);

    await expect(
      approveSubmittedOrderUseCase({
        orderRepository: context.orderRepository,
        reviewRepository: context.reviewRepository,
        clock: context.clock,
        ids: context.ids,
        sellerOrganisationId,
        snapshotId: submitted.entity.id,
        expectedVersion: 1,
        actorCredentialId: 'seller-approver',
        idempotencyKey: 'approve-stale-test',
      }),
    ).rejects.toBeInstanceOf(LifecycleIdempotencyConflict);
  });
});
