import { describe, expect, it } from 'vitest';

import { LifecycleIdempotencyConflict } from '@/modules/lifecycle-idempotency';
import { organisationId } from '@/modules/organisations';
import {
  InMemorySelectionRepository,
  addSelectionItem,
  createSelection,
  grantShowroomAccess,
  markSelectionReady,
  revokeShowroomAccessUseCase,
  setSelectionSizeCurve,
} from '@/modules/selection';
import { showroomId, showroomSnapshotId } from '@/modules/showroom';

import {
  OrderSelectionAccessRevoked,
  OrderVersionConflict,
  createOrderDraftUseCase,
  getBuyerOrder,
  listSubmittedOrdersForSeller,
  setOrderLineCommercialTermsUseCase,
  setOrderLineQuantityUseCase,
  submitOrderUseCase,
} from '../application/order-workflows';
import { InMemoryOrderRepository } from '../infrastructure/in-memory-order-repository';

const buyerOrganisationId = organisationId('shop-order-1');
const sellerOrganisationId = organisationId('brand-order-1');

function selectionFixture() {
  const grant = grantShowroomAccess({
    id: 'grant-order-1',
    sellerOrganisationId,
    buyerOrganisationId,
    showroomId: showroomId('showroom-order-1'),
    showroomSnapshotId: showroomSnapshotId('showroom-snapshot-order-1'),
    actorCredentialId: 'brand-admin',
    now: new Date('2026-07-29T21:00:00.000Z'),
  });
  const draft = createSelection({
    id: 'selection-order-1',
    grant,
    buyerOrganisationId,
    title: 'Ready buy',
    currency: 'EUR',
    ownerCredentialId: 'buyer-admin',
    now: new Date('2026-07-29T21:01:00.000Z'),
  });
  const withItem = addSelectionItem(draft, {
    itemId: 'selection-item-order-1',
    productReference: 'SKU-ORDER-1',
    variantReference: 'BLACK',
    note: 'Core line',
    now: new Date('2026-07-29T21:02:00.000Z'),
  });
  const sized = setSelectionSizeCurve(withItem, {
    itemId: withItem.items[0]!.id,
    sizeCurve: [
      { size: 'S', quantity: 2 },
      { size: 'M', quantity: 3 },
    ],
    now: new Date('2026-07-29T21:03:00.000Z'),
  });
  return { grant, selection: markSelectionReady(sized, new Date('2026-07-29T21:04:00.000Z')) };
}

function harness() {
  const fixture = selectionFixture();
  let sequence = 0;
  let tick = 0;
  return {
    repository: new InMemoryOrderRepository(),
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

async function createDraft(context: ReturnType<typeof harness>) {
  return createOrderDraftUseCase({
    ...context,
    buyerOrganisationId,
    selectionId: context.fixture.selection.id,
    actorCredentialId: 'buyer-admin',
    idempotencyKey: 'create-order-draft-001',
  });
}

describe('Order Builder workflows', () => {
  it('creates one replay-safe buyer Draft Order from a READY Selection', async () => {
    const context = harness();
    const first = await createDraft(context);
    const replay = await createDraft(context);

    expect(first.replayed).toBe(false);
    expect(replay).toEqual({ entity: first.entity, replayed: true });
    expect(first.entity.lines[0]?.sizeQuantities).toEqual([
      { size: 'S', quantity: 2 },
      { size: 'M', quantity: 3 },
    ]);
    expect(context.repository.audits).toHaveLength(1);
    expect(context.repository.outbox).toHaveLength(1);
  });

  it('prices, resizes and submits an immutable seller-visible contract', async () => {
    const context = harness();
    const created = await createDraft(context);
    const line = created.entity.lines[0]!;
    const priced = await setOrderLineCommercialTermsUseCase({
      ...context,
      buyerOrganisationId,
      orderId: created.entity.id,
      expectedVersion: 1,
      lineId: line.id,
      unitPriceMinor: 25_000,
      discountBasisPoints: 1_000,
      taxBasisPoints: 2_000,
      actorCredentialId: 'buyer-admin',
    });
    const resized = await setOrderLineQuantityUseCase({
      ...context,
      buyerOrganisationId,
      orderId: created.entity.id,
      expectedVersion: 2,
      lineId: line.id,
      size: 'M',
      quantity: 4,
      actorCredentialId: 'buyer-admin',
    });
    expect(resized.totals).toEqual({
      quantity: 6,
      grossMinor: 150_000,
      discountMinor: 15_000,
      netMinor: 135_000,
      taxMinor: 27_000,
      totalMinor: 162_000,
    });

    const submitted = await submitOrderUseCase({
      ...context,
      buyerOrganisationId,
      orderId: resized.id,
      expectedVersion: 3,
      actorCredentialId: 'buyer-admin',
      idempotencyKey: 'submit-order-001',
    });
    const replay = await submitOrderUseCase({
      ...context,
      buyerOrganisationId,
      orderId: resized.id,
      expectedVersion: 3,
      actorCredentialId: 'buyer-admin',
      idempotencyKey: 'submit-order-001',
    });

    expect(submitted.replayed).toBe(false);
    expect(replay).toEqual({ entity: submitted.entity, replayed: true });
    expect(submitted.entity.totals.totalMinor).toBe(162_000);
    expect(
      await listSubmittedOrdersForSeller({
        repository: context.repository,
        sellerOrganisationId,
      }),
    ).toEqual([submitted.entity]);
    expect(
      await context.repository.findOrder(sellerOrganisationId, resized.id),
    ).toBeNull();
  });

  it('rejects stale writes and changed submit replay payloads', async () => {
    const context = harness();
    const created = await createDraft(context);
    const line = created.entity.lines[0]!;
    await setOrderLineCommercialTermsUseCase({
      ...context,
      buyerOrganisationId,
      orderId: created.entity.id,
      expectedVersion: 1,
      lineId: line.id,
      unitPriceMinor: 10_000,
      discountBasisPoints: 0,
      taxBasisPoints: 0,
      actorCredentialId: 'buyer-admin',
    });
    await expect(
      setOrderLineQuantityUseCase({
        ...context,
        buyerOrganisationId,
        orderId: created.entity.id,
        expectedVersion: 1,
        lineId: line.id,
        size: 'S',
        quantity: 1,
        actorCredentialId: 'buyer-admin',
      }),
    ).rejects.toBeInstanceOf(OrderVersionConflict);

    await submitOrderUseCase({
      ...context,
      buyerOrganisationId,
      orderId: created.entity.id,
      expectedVersion: 2,
      actorCredentialId: 'buyer-admin',
      idempotencyKey: 'submit-order-conflict',
    });
    await expect(
      submitOrderUseCase({
        ...context,
        buyerOrganisationId,
        orderId: created.entity.id,
        expectedVersion: 3,
        actorCredentialId: 'buyer-admin',
        idempotencyKey: 'submit-order-conflict',
      }),
    ).rejects.toBeInstanceOf(LifecycleIdempotencyConflict);
  });

  it('blocks Order changes after the seller revokes Showroom access', async () => {
    const context = harness();
    const created = await createDraft(context);
    await revokeShowroomAccessUseCase({
      repository: context.selectionRepository,
      clock: context.clock,
      ids: context.ids,
      sellerOrganisationId,
      grantId: context.fixture.grant.id,
      expectedVersion: 1,
      actorCredentialId: 'brand-admin',
    });

    await expect(
      setOrderLineCommercialTermsUseCase({
        ...context,
        buyerOrganisationId,
        orderId: created.entity.id,
        expectedVersion: 1,
        lineId: created.entity.lines[0]!.id,
        unitPriceMinor: 10_000,
        discountBasisPoints: 0,
        taxBasisPoints: 0,
        actorCredentialId: 'buyer-admin',
      }),
    ).rejects.toBeInstanceOf(OrderSelectionAccessRevoked);

    expect(
      await getBuyerOrder({
        repository: context.repository,
        buyerOrganisationId,
        orderId: created.entity.id,
      }),
    ).toEqual(created.entity);
  });
});
