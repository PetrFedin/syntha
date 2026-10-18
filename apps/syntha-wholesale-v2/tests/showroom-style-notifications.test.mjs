import test from 'node:test';
import assert from 'node:assert/strict';
import { domainEvent } from '../src/core/events.mjs';
import { createNotificationService } from '../src/application/notification-service.mjs';
import { createMemoryWholesaleStore } from '../src/infrastructure/memory-store.mjs';
import { createMemoryNotificationProjectionStore } from '../src/infrastructure/notification-projection-store.mjs';

test('accepting showroom access surfaces Styles approved before the invitation', async () => {
  const sourceStore = createMemoryWholesaleStore();
  const projectionStore = createMemoryNotificationProjectionStore();
  await sourceStore.transaction(async (tx) => {
    await tx.insertOrganisation(Object.freeze({ id: 'brand-existing', type: 'brand', name: 'Existing Brand' }));
    await tx.insertOrganisation(Object.freeze({ id: 'shop-existing', type: 'shop', name: 'Existing Shop' }));
    await tx.insertMembership(Object.freeze({
      id: 'membership-existing', organisationId: 'shop-existing', organisationType: 'shop', userId: 'buyer-existing', role: 'buyer', status: 'active', createdAt: 'now',
    }));
    await tx.insertRelationship(Object.freeze({
      id: 'relationship-existing', brandId: 'brand-existing', shopId: 'shop-existing', status: 'accepted', version: 2,
    }));
    await tx.insertStyle(Object.freeze({
      id: 'style-existing-1', brandId: 'brand-existing', collectionId: 'collection-existing', styleCode: 'ST-1', status: 'approved', version: 2,
      sizeGrid: Object.freeze({ id: 'grid-existing', sizes: Object.freeze(['S', 'M']) }),
    }));
    await tx.insertStyle(Object.freeze({
      id: 'style-existing-2', brandId: 'brand-existing', collectionId: 'collection-existing', styleCode: 'ST-2', status: 'approved', version: 2,
      sizeGrid: Object.freeze({ id: 'grid-existing', sizes: Object.freeze(['S', 'M']) }),
    }));
    await tx.insertStyle(Object.freeze({
      id: 'style-draft', brandId: 'brand-existing', collectionId: 'collection-existing', styleCode: 'ST-DRAFT', status: 'draft', version: 1,
      sizeGrid: Object.freeze({ id: 'grid-existing', sizes: Object.freeze(['S', 'M']) }),
    }));
    await tx.insertShowroom(Object.freeze({
      id: 'showroom-existing', collectionId: 'collection-existing', brandId: 'brand-existing', name: 'Existing Showroom', status: 'open', version: 2,
    }));
    await tx.insertShowroomInvitation(Object.freeze({
      id: 'invitation-existing', showroomId: 'showroom-existing', relationshipId: 'relationship-existing',
      brandId: 'brand-existing', shopId: 'shop-existing', status: 'accepted', expiresAt: '2029-01-01T00:00:00.000Z', version: 2,
    }));
    await tx.appendOutbox(domainEvent({
      id: 'event-invitation-accepted', type: 'showroom-invitation.accepted', aggregateId: 'invitation-existing',
      occurredAt: '2026-08-06T20:00:00.000Z', payload: { showroomId: 'showroom-existing', shopId: 'shop-existing' }, metadata: {},
    }));
  });
  const service = createNotificationService({
    sourceStore,
    projectionStore,
    clock: () => '2026-08-06T20:00:01.000Z',
    nextId: () => 'notification-existing-styles',
  });
  await service.projectPending();
  const notifications = await service.listForActor('buyer-existing');
  assert.equal(notifications.length, 1);
  assert.equal(notifications[0].type, 'showroom-styles-available');
  assert.match(notifications[0].body, /2 approved Style/);
});

test('delayed projection suppresses stale showroom access notifications', async () => {
  const sourceStore = createMemoryWholesaleStore();
  const projectionStore = createMemoryNotificationProjectionStore();
  await sourceStore.transaction(async (tx) => {
    await tx.insertOrganisation(Object.freeze({ id: 'brand-stale', type: 'brand', name: 'Stale Brand' }));
    await tx.insertOrganisation(Object.freeze({ id: 'shop-stale', type: 'shop', name: 'Stale Shop' }));
    await tx.insertMembership(Object.freeze({
      id: 'membership-stale', organisationId: 'shop-stale', organisationType: 'shop', userId: 'buyer-stale', role: 'buyer', status: 'active', createdAt: 'now',
    }));
    await tx.insertRelationship(Object.freeze({
      id: 'relationship-stale', brandId: 'brand-stale', shopId: 'shop-stale', status: 'revoked', version: 3,
    }));
    await tx.insertStyle(Object.freeze({
      id: 'style-stale', brandId: 'brand-stale', collectionId: 'collection-stale', styleCode: 'ST-STALE', status: 'approved', version: 2,
      sizeGrid: Object.freeze({ id: 'grid-stale', sizes: Object.freeze(['S', 'M']) }),
    }));
    await tx.insertShowroom(Object.freeze({
      id: 'showroom-stale', collectionId: 'collection-stale', brandId: 'brand-stale', name: 'Stale Showroom', status: 'open', version: 2,
    }));
    await tx.insertShowroomInvitation(Object.freeze({
      id: 'invitation-stale', showroomId: 'showroom-stale', relationshipId: 'relationship-stale',
      brandId: 'brand-stale', shopId: 'shop-stale', status: 'accepted', expiresAt: '2029-01-01T00:00:00.000Z', version: 2,
    }));
    await tx.appendOutbox(domainEvent({
      id: 'event-invitation-stale', type: 'showroom-invitation.accepted', aggregateId: 'invitation-stale',
      occurredAt: '2026-08-06T20:00:00.000Z', payload: {}, metadata: {},
    }));
  });
  const service = createNotificationService({ sourceStore, projectionStore });
  const projected = await service.projectPending();
  assert.equal(projected.length, 1);
  assert.deepEqual(projected[0].notificationIds, []);
  assert.deepEqual(await service.listForActor('buyer-stale'), []);
});
