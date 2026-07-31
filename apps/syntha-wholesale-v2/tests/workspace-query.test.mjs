import test from 'node:test';
import assert from 'node:assert/strict';
import { createWorkspaceQueryService } from '../src/application/workspace-query-service.mjs';
import { createMemoryWorkspaceReader } from '../src/infrastructure/memory-workspace-reader.mjs';

function store(snapshot) { return { async snapshot() { return snapshot; } }; }
const source = {
  memberships: [
    { userId: 'brand-user', organisationId: 'brand-1', organisationType: 'brand', status: 'active' },
    { userId: 'shop-user', organisationId: 'shop-1', organisationType: 'shop', status: 'active' },
    { userId: 'other-user', organisationId: 'shop-2', organisationType: 'shop', status: 'active' },
  ],
  organisations: [{ id: 'brand-1' }, { id: 'shop-1' }, { id: 'shop-2' }],
  relationships: [{ id: 'rel-1', brandId: 'brand-1', shopId: 'shop-1' }],
  showroomInvitations: [{ id: 'invite-1', brandId: 'brand-1', shopId: 'shop-1', showroomId: 'showroom-1' }],
  campaigns: [{ id: 'campaign-1', brandId: 'brand-1' }],
  collections: [{ id: 'collection-1', brandId: 'brand-1' }],
  showrooms: [{ id: 'showroom-1', brandId: 'brand-1' }],
  cycles: [{ id: 'cycle-1', brandId: 'brand-1', shopId: 'shop-1', campaignId: 'campaign-1', collectionId: 'collection-1' }],
  selections: [{ id: 'selection-1', brandId: 'brand-1', shopId: 'shop-1', showroomId: 'showroom-1' }],
  orders: [{ id: 'order-1', brandId: 'brand-1', shopId: 'shop-1' }],
  deals: [{ id: 'deal-1', brandId: 'brand-1', shopId: 'shop-1' }],
  calendar: [{ id: 'cal-brand', ownerOrganisationId: 'brand-1' }, { id: 'cal-shop', ownerOrganisationId: 'shop-1' }],
};

test('workspace exposes own organisations, accepted counterparties and trade data only', async () => {
  const service = createWorkspaceQueryService({ reader: createMemoryWorkspaceReader({ store: store(source) }) });
  const workspace = await service.loadForActor('shop-user');
  assert.deepEqual(workspace.organisations.map((item) => item.id).sort(), ['brand-1', 'shop-1']);
  assert.equal(workspace.cycles.length, 1);
  assert.equal(workspace.calendar.length, 1);
  assert.equal(workspace.calendar[0].ownerOrganisationId, 'shop-1');
  assert.equal(workspace.organisations.some((item) => item.id === 'shop-2'), false);
});

test('actor without active membership receives an empty workspace', async () => {
  const service = createWorkspaceQueryService({ reader: createMemoryWorkspaceReader({ store: store(source) }) });
  const workspace = await service.loadForActor('unknown');
  assert.ok(Object.values(workspace).every((items) => items.length === 0));
});
