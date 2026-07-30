import test from 'node:test';
import assert from 'node:assert/strict';
import { createOrganisation } from '../src/modules/organisations/public.mjs';
import { createMembership } from '../src/modules/access-control/public.mjs';
import { createWholesalePlatform } from '../src/application/platform.mjs';

function fixture() {
  let tick = 0;
  let id = 0;
  const platform = createWholesalePlatform({
    clock: () => `2026-07-30T20:00:${String(tick++).padStart(2, '0')}.000Z`,
    nextId: (prefix) => `${prefix}_${++id}`,
  });
  platform.registerOrganisation('cmd-org-brand', 'system', createOrganisation({ id: 'brand-1', type: 'brand', name: 'Syntha Brand' }));
  platform.registerOrganisation('cmd-org-shop', 'system', createOrganisation({ id: 'shop-1', type: 'shop', name: 'Syntha Shop' }));
  platform.grantMembership('cmd-brand-owner', 'system', createMembership({
    id: 'membership-brand-owner', organisationId: 'brand-1', organisationType: 'brand', userId: 'brand-owner', role: 'owner', createdAt: 'now',
  }));
  platform.grantMembership('cmd-shop-owner', 'system', createMembership({
    id: 'membership-shop-owner', organisationId: 'shop-1', organisationType: 'shop', userId: 'shop-owner', role: 'owner', createdAt: 'now',
  }));
  platform.grantMembership('cmd-shop-buyer', 'shop-owner', createMembership({
    id: 'membership-shop-buyer', organisationId: 'shop-1', organisationType: 'shop', userId: 'buyer-1', role: 'buyer', createdAt: 'now',
  }));
  platform.grantMembership('cmd-shop-viewer', 'shop-owner', createMembership({
    id: 'membership-shop-viewer', organisationId: 'shop-1', organisationType: 'shop', userId: 'viewer-1', role: 'viewer', createdAt: 'now',
  }));
  return platform;
}

function moveToOrder(platform, actorId = 'buyer-1') {
  let cycle = platform.startCycle('cmd-cycle', actorId, { brandId: 'brand-1', shopId: 'shop-1', campaignName: 'FW27' });
  for (const stage of ['collection', 'showroom', 'selection', 'order-builder', 'order']) {
    cycle = platform.advanceCycle(`cmd-${stage}`, actorId, cycle.id, stage);
  }
  return cycle;
}

test('confirmation atomically opens DealSpace and shared milestones', () => {
  const platform = fixture();
  const cycle = moveToOrder(platform);
  platform.attachOrder('cmd-attach-order', 'buyer-1', cycle.id, {
    id: 'order-1',
    currency: 'EUR',
    totalAmount: 600,
    lines: [
      { sku: 'JACKET-01', quantity: 2, unitPrice: 200 },
      { sku: 'SHIRT-01', quantity: 2, unitPrice: 100 },
    ],
  });
  const result = platform.confirmAndOpenDeal('cmd-confirm', 'buyer-1', cycle.id);
  assert.equal(result.cycle.stage, 'deal-space');
  assert.equal(result.deal.orderId, 'order-1');
  assert.equal(result.milestones.length, 2);
  assert.deepEqual(new Set(result.milestones.map((item) => item.ownerOrganisationId)), new Set(['brand-1', 'shop-1']));
  assert.equal(platform.snapshot().events.at(-1).metadata.actorId, 'buyer-1');
});

test('commands are idempotent and do not duplicate cycles or events', () => {
  const platform = fixture();
  const input = { brandId: 'brand-1', shopId: 'shop-1', campaignName: 'SS28' };
  const first = platform.startCycle('same-command', 'buyer-1', input);
  const second = platform.startCycle('same-command', 'buyer-1', input);
  assert.strictEqual(first, second);
  assert.equal(platform.snapshot().cycles.length, 1);
  assert.equal(platform.snapshot().events.filter((event) => event.type === 'commercial-cycle.started').length, 1);
});

test('reusing commandId for another actor or mutation is rejected', () => {
  const platform = fixture();
  platform.startCycle('shared-command', 'buyer-1', { brandId: 'brand-1', shopId: 'shop-1', campaignName: 'SS28' });
  assert.throws(
    () => platform.startCycle('shared-command', 'shop-owner', { brandId: 'brand-1', shopId: 'shop-1', campaignName: 'SS28' }),
    (error) => error.code === 'COMMAND_ID_CONFLICT',
  );
});

test('viewer cannot create or mutate a commercial cycle', () => {
  const platform = fixture();
  assert.throws(
    () => platform.startCycle('cmd-viewer-cycle', 'viewer-1', { brandId: 'brand-1', shopId: 'shop-1', campaignName: 'SS28' }),
    (error) => error.code === 'CAPABILITY_DENIED',
  );
});

test('actor from unrelated organisation cannot operate on the trade', () => {
  const platform = fixture();
  platform.registerOrganisation('cmd-other-shop', 'system', createOrganisation({ id: 'shop-2', type: 'shop', name: 'Other Shop' }));
  platform.grantMembership('cmd-other-owner', 'system', createMembership({
    id: 'membership-other-owner', organisationId: 'shop-2', organisationType: 'shop', userId: 'other-owner', role: 'owner', createdAt: 'now',
  }));
  assert.throws(
    () => platform.startCycle('cmd-other-cycle', 'other-owner', { brandId: 'brand-1', shopId: 'shop-1', campaignName: 'SS28' }),
    (error) => error.code === 'TRADE_MEMBERSHIP_REQUIRED',
  );
});

test('only system can bootstrap the first owner; owner can grant later memberships', () => {
  const platform = createWholesalePlatform();
  platform.registerOrganisation('cmd-org', 'system', createOrganisation({ id: 'brand-2', type: 'brand', name: 'Brand Two' }));
  const owner = createMembership({
    id: 'm-owner', organisationId: 'brand-2', organisationType: 'brand', userId: 'owner-2', role: 'owner', createdAt: 'now',
  });
  assert.throws(() => platform.grantMembership('cmd-bad-bootstrap', 'owner-2', owner), (error) => error.code === 'SYSTEM_ACTOR_REQUIRED');
  platform.grantMembership('cmd-bootstrap', 'system', owner);
  platform.grantMembership('cmd-sales', 'owner-2', createMembership({
    id: 'm-sales', organisationId: 'brand-2', organisationType: 'brand', userId: 'sales-2', role: 'sales', createdAt: 'now',
  }));
  assert.equal(platform.snapshot().memberships.length, 2);
});
