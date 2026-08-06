import test from 'node:test';
import assert from 'node:assert/strict';
import { domainEvent } from '../src/core/events.mjs';
import { createNotificationService } from '../src/application/notification-service.mjs';
import { createMemoryWholesaleStore } from '../src/infrastructure/memory-store.mjs';
import { createMemoryNotificationProjectionStore } from '../src/infrastructure/memory-notification-projection-store.mjs';

test('approved Style notifies each shop with active showroom access exactly once', async () => {
  const sourceStore = createMemoryWholesaleStore();
  const projectionStore = createMemoryNotificationProjectionStore();
  await sourceStore.transaction(async (tx) => {
    await tx.insertOrganisation(Object.freeze({ id: 'brand-style', type: 'brand', name: 'Style Brand' }));
    await tx.insertOrganisation(Object.freeze({ id: 'shop-style', type: 'shop', name: 'Style Shop' }));
    await tx.insertOrganisation(Object.freeze({ id: 'shop-expired', type: 'shop', name: 'Expired Shop' }));
    await tx.insertMembership(Object.freeze({
      id: 'membership-shop-style', organisationId: 'shop-style', organisationType: 'shop', userId: 'buyer-style', role: 'buyer', status: 'active', createdAt: 'now',
    }));
    await tx.insertRelationship(Object.freeze({
      id: 'relationship-style', brandId: 'brand-style', shopId: 'shop-style', status: 'accepted', version: 2,
    }));
    await tx.insertRelationship(Object.freeze({
      id: 'relationship-expired', brandId: 'brand-style', shopId: 'shop-expired', status: 'accepted', version: 2,
    }));
    await tx.insertStyle(Object.freeze({
      id: 'style-approved', brandId: 'brand-style', collectionId: 'collection-style', styleCode: 'JK-500',
      status: 'approved', version: 2, sizeGrid: Object.freeze({ id: 'grid-style', sizes: Object.freeze(['S', 'M']) }),
    }));
    await tx.insertShowroom(Object.freeze({
      id: 'showroom-style-1', collectionId: 'collection-style', brandId: 'brand-style', status: 'open', version: 2,
    }));
    await tx.insertShowroom(Object.freeze({
      id: 'showroom-style-2', collectionId: 'collection-style', brandId: 'brand-style', status: 'open', version: 2,
    }));
    await tx.insertShowroomInvitation(Object.freeze({
      id: 'invitation-style-1', showroomId: 'showroom-style-1', relationshipId: 'relationship-style',
      brandId: 'brand-style', shopId: 'shop-style', status: 'accepted', expiresAt: '2029-01-01T00:00:00.000Z', version: 2,
    }));
    await tx.insertShowroomInvitation(Object.freeze({
      id: 'invitation-style-2', showroomId: 'showroom-style-2', relationshipId: 'relationship-style',
      brandId: 'brand-style', shopId: 'shop-style', status: 'accepted', expiresAt: '2029-01-01T00:00:00.000Z', version: 2,
    }));
    await tx.insertShowroomInvitation(Object.freeze({
      id: 'invitation-expired', showroomId: 'showroom-style-1', relationshipId: 'relationship-expired',
      brandId: 'brand-style', shopId: 'shop-expired', status: 'accepted', expiresAt: '2026-01-01T00:00:00.000Z', version: 2,
    }));
    await tx.appendOutbox(domainEvent({
      id: 'event-style-approved', type: 'style.approved', aggregateId: 'style-approved',
      occurredAt: '2026-08-06T19:00:00.000Z', payload: { brandId: 'brand-style', collectionId: 'collection-style', styleCode: 'JK-500' }, metadata: {},
    }));
  });

  const service = createNotificationService({
    sourceStore,
    projectionStore,
    clock: () => '2026-08-06T19:00:01.000Z',
    nextId: () => 'notification-style',
  });
  const projected = await service.projectPending();
  assert.equal(projected.length, 1);
  assert.deepEqual(projected[0].notificationIds, ['notification-style']);
  const snapshot = projectionStore.snapshot();
  assert.equal(snapshot.notifications.length, 1);
  assert.equal(snapshot.notifications[0].recipientOrganisationId, 'shop-style');
  assert.equal(snapshot.notifications[0].type, 'style-approved');
  assert.equal(snapshot.notifications.some((item) => item.recipientOrganisationId === 'shop-expired'), false);
  assert.deepEqual((await service.listForActor('buyer-style')).map((item) => item.id), ['notification-style']);

  const replay = await service.projectPending();
  assert.equal(replay[0].status, 'already-projected');
  assert.equal(projectionStore.snapshot().notifications.length, 1);
});
