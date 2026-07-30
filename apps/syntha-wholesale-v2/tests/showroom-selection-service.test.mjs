import test from 'node:test';
import assert from 'node:assert/strict';
import { createOrganisation } from '../src/modules/organisations/public.mjs';
import { createMembership } from '../src/modules/access-control/public.mjs';
import { createWholesalePlatform } from '../src/application/platform.mjs';
import { createPartnerAccessService } from '../src/application/partner-access-service.mjs';
import { createShowroomSelectionService } from '../src/application/showroom-selection-service.mjs';
import { createMemoryWholesaleStore } from '../src/infrastructure/memory-store.mjs';

async function fixture() {
  let id = 0;
  const store = createMemoryWholesaleStore();
  const options = { store, clock: () => '2026-07-30T20:00:00.000Z', nextId: (prefix) => `${prefix}_${++id}` };
  const platform = createWholesalePlatform(options);
  const partners = createPartnerAccessService(options);
  const collaboration = createShowroomSelectionService(options);
  await platform.registerOrganisation('org-brand', 'system', createOrganisation({ id: 'brand-1', type: 'brand', name: 'Brand' }));
  await platform.registerOrganisation('org-shop', 'system', createOrganisation({ id: 'shop-1', type: 'shop', name: 'Shop' }));
  await platform.grantMembership('member-sales', 'system', createMembership({ id: 'm1', organisationId: 'brand-1', organisationType: 'brand', userId: 'sales-1', role: 'owner', createdAt: 'now' }));
  await platform.grantMembership('member-buyer', 'system', createMembership({ id: 'm2', organisationId: 'shop-1', organisationType: 'shop', userId: 'buyer-1', role: 'owner', createdAt: 'now' }));
  const relationship = await partners.requestRelationship('relationship-request', 'sales-1', { brandId: 'brand-1', shopId: 'shop-1' });
  await partners.acceptRelationship('relationship-accept', 'buyer-1', relationship.id);
  const campaign = await platform.createCampaign('campaign-create', 'sales-1', {
    brandId: 'brand-1', name: 'FW', season: 'FW27', startsAt: '2027-01-01T00:00:00.000Z', endsAt: '2027-02-01T00:00:00.000Z',
  });
  await platform.openCampaign('campaign-open', 'sales-1', campaign.id);
  const collection = await platform.createCollection('collection-create', 'sales-1', { campaignId: campaign.id, brandId: 'brand-1', name: 'Main', currency: 'EUR' });
  await platform.publishCollection('collection-publish', 'sales-1', collection.id);
  const showroom = await collaboration.createShowroom('showroom-create', 'sales-1', {
    collectionId: collection.id, brandId: 'brand-1', name: 'Paris', opensAt: '2027-01-05T00:00:00.000Z', closesAt: '2027-01-20T00:00:00.000Z',
  });
  await collaboration.openShowroom('showroom-open', 'sales-1', showroom.id);
  const invitation = await partners.inviteShopToShowroom('invitation-create', 'sales-1', {
    showroomId: showroom.id, shopId: 'shop-1', expiresAt: '2027-01-15T00:00:00.000Z',
  });
  await partners.acceptShowroomInvitation('invitation-accept', 'buyer-1', invitation.id);
  let cycle = await platform.startCycle('cycle-create', 'buyer-1', { brandId: 'brand-1', shopId: 'shop-1', campaignId: campaign.id, collectionId: collection.id });
  cycle = await platform.advanceCycle('cycle-collection', 'buyer-1', cycle.id, 'collection');
  cycle = await platform.advanceCycle('cycle-showroom', 'buyer-1', cycle.id, 'showroom');
  return { store, platform, collaboration, showroomId: showroom.id, cycle };
}

test('shop selection advances cycle atomically to order-builder', async () => {
  const context = await fixture();
  const created = await context.collaboration.createSelection('selection-create', 'buyer-1', { cycleId: context.cycle.id, showroomId: context.showroomId });
  assert.equal(created.cycle.stage, 'selection');
  const edited = await context.collaboration.upsertSelectionLine('selection-line', 'buyer-1', created.selection.id, { sku: 'SKU-1', quantity: 3, unitPrice: 80 });
  const submitted = await context.collaboration.submitSelection('selection-submit', 'buyer-1', edited.id);
  assert.equal(submitted.selection.status, 'submitted');
  assert.equal(submitted.cycle.stage, 'order-builder');
  assert.equal(context.store.snapshot().selections.length, 1);
});

test('brand actor cannot write a shop selection', async () => {
  const context = await fixture();
  await assert.rejects(
    context.collaboration.createSelection('selection-brand', 'sales-1', { cycleId: context.cycle.id, showroomId: context.showroomId }),
    (error) => error.code === 'ACTIVE_MEMBERSHIP_REQUIRED',
  );
  assert.equal(context.store.snapshot().selections.length, 0);
  assert.equal(context.store.snapshot().cycles.find((item) => item.id === context.cycle.id).stage, 'showroom');
});

test('empty selection submission rolls back selection and cycle changes', async () => {
  const context = await fixture();
  const created = await context.collaboration.createSelection('selection-empty-create', 'buyer-1', { cycleId: context.cycle.id, showroomId: context.showroomId });
  await assert.rejects(context.collaboration.submitSelection('selection-empty-submit', 'buyer-1', created.selection.id), (error) => error.code === 'SELECTION_LINES_REQUIRED');
  const snapshot = context.store.snapshot();
  assert.equal(snapshot.selections[0].status, 'draft');
  assert.equal(snapshot.cycles.find((item) => item.id === context.cycle.id).stage, 'selection');
  assert.equal(snapshot.commands.some((item) => item.id === 'selection-empty-submit'), false);
});
