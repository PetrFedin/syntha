import { describe, expect, it } from 'vitest';

import { LifecycleIdempotencyConflict } from '@/modules/lifecycle-idempotency';
import { organisationId } from '@/modules/organisations';
import {
  createShowroom,
  publishShowroom,
  type ShowroomRepository,
} from '@/modules/showroom';
import { collectionId } from '@/modules/collections';

import {
  SelectionAccessRevoked,
  SelectionVersionConflict,
  addSelectionItemUseCase,
  createSelectionUseCase,
  grantShowroomAccessUseCase,
  revokeShowroomAccessUseCase,
  setSelectionBudgetUseCase,
} from '../application/selection-workflows';
import { InMemorySelectionRepository } from '../infrastructure/in-memory-selection-repository';

const sellerOrganisationId = organisationId('brand-1');
const buyerOrganisationId = organisationId('shop-1');
const otherBuyerOrganisationId = organisationId('shop-2');

function publishedShowroomRepository(): ShowroomRepository {
  const draft = createShowroom({
    id: 'showroom-1',
    organisationId: sellerOrganisationId,
    collectionId: collectionId('collection-1'),
    code: 'AW27',
    title: 'AW27 Buyer Preview',
    description: 'Published source',
    opensAt: new Date('2026-08-01T00:00:00.000Z'),
    closesAt: new Date('2026-09-01T00:00:00.000Z'),
    ownerCredentialId: 'brand-admin',
    now: new Date('2026-07-29T18:00:00.000Z'),
  });
  const publication = publishShowroom(draft, {
    snapshotId: 'snapshot-1',
    actorCredentialId: 'brand-admin',
    now: new Date('2026-07-29T18:05:00.000Z'),
  });

  return {
    findById: async (organisationId, id) =>
      organisationId === sellerOrganisationId && id === publication.showroom.id
        ? publication.showroom
        : null,
    findByCode: async () => null,
    listByCollection: async () => [publication.showroom],
    findPublicationSnapshot: async (organisationId, showroomId) =>
      organisationId === sellerOrganisationId && showroomId === publication.showroom.id
        ? publication.snapshot
        : null,
    findCreateReplay: async () => null,
    create: async () => {
      throw new Error('not used');
    },
    update: async () => false,
    findPublishReplay: async () => null,
    publish: async () => {
      throw new Error('not used');
    },
  };
}

function harness() {
  let sequence = 0;
  let tick = 0;
  const repository = new InMemorySelectionRepository();
  return {
    repository,
    showroomRepository: publishedShowroomRepository(),
    ids: { next: (prefix: string) => `${prefix}-${++sequence}` },
    clock: {
      now: () => new Date(Date.parse('2026-07-29T19:00:00.000Z') + tick++ * 60_000),
    },
  };
}

async function grantAccess(context: ReturnType<typeof harness>) {
  return grantShowroomAccessUseCase({
    ...context,
    sellerOrganisationId,
    buyerOrganisationId,
    showroomId: 'showroom-1',
    actorCredentialId: 'brand-admin',
    idempotencyKey: 'grant-showroom-001',
  });
}

describe('buyer access and Selection workflows', () => {
  it('grants snapshot-bound access idempotently and rejects changed replay payload', async () => {
    const context = harness();
    const first = await grantAccess(context);
    const replay = await grantAccess(context);

    expect(first.replayed).toBe(false);
    expect(replay.replayed).toBe(true);
    expect(replay.entity.id).toBe(first.entity.id);
    expect(context.repository.audits).toHaveLength(1);
    expect(context.repository.outbox).toHaveLength(1);

    await expect(
      grantShowroomAccessUseCase({
        ...context,
        sellerOrganisationId,
        buyerOrganisationId: otherBuyerOrganisationId,
        showroomId: 'showroom-1',
        actorCredentialId: 'brand-admin',
        idempotencyKey: 'grant-showroom-001',
      }),
    ).rejects.toBeInstanceOf(LifecycleIdempotencyConflict);
  });

  it('creates one buyer-private Selection and mutates it with optimistic versioning', async () => {
    const context = harness();
    const granted = await grantAccess(context);
    const created = await createSelectionUseCase({
      ...context,
      buyerOrganisationId,
      grantId: granted.entity.id,
      title: 'AW27 Main Buy',
      currency: 'EUR',
      budgetMinor: 250_000,
      actorCredentialId: 'buyer-1',
      idempotencyKey: 'create-selection-001',
    });
    expect(created.replayed).toBe(false);

    const withItem = await addSelectionItemUseCase({
      ...context,
      buyerOrganisationId,
      selectionId: created.entity.id,
      expectedVersion: 1,
      productReference: 'SKU-001',
      quantityIntent: 4,
      actorCredentialId: 'buyer-1',
    });
    expect(withItem.version).toBe(2);
    expect(withItem.items[0]?.productReference).toBe('SKU-001');

    await expect(
      setSelectionBudgetUseCase({
        ...context,
        buyerOrganisationId,
        selectionId: created.entity.id,
        expectedVersion: 1,
        budgetMinor: 300_000,
        actorCredentialId: 'buyer-1',
      }),
    ).rejects.toBeInstanceOf(SelectionVersionConflict);

    const crossTenant = await context.repository.findSelection(
      otherBuyerOrganisationId,
      created.entity.id,
    );
    expect(crossTenant).toBeNull();
  });

  it('blocks further Selection changes after Brand revokes access', async () => {
    const context = harness();
    const granted = await grantAccess(context);
    const created = await createSelectionUseCase({
      ...context,
      buyerOrganisationId,
      grantId: granted.entity.id,
      title: 'Revoked buy',
      currency: 'USD',
      actorCredentialId: 'buyer-1',
      idempotencyKey: 'create-selection-002',
    });

    await revokeShowroomAccessUseCase({
      ...context,
      sellerOrganisationId,
      grantId: granted.entity.id,
      expectedVersion: 1,
      actorCredentialId: 'brand-admin',
    });

    await expect(
      addSelectionItemUseCase({
        ...context,
        buyerOrganisationId,
        selectionId: created.entity.id,
        expectedVersion: 1,
        productReference: 'SKU-LOCKED',
        actorCredentialId: 'buyer-1',
      }),
    ).rejects.toBeInstanceOf(SelectionAccessRevoked);
  });
});
