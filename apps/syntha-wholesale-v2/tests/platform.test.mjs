import test from 'node:test';
import assert from 'node:assert/strict';
import { createOrganisation } from '../src/modules/organisations/public.mjs';
import { createWholesalePlatform } from '../src/application/platform.mjs';

function fixture() {
  let tick = 0;
  let id = 0;
  const platform = createWholesalePlatform({
    clock: () => `2026-07-30T20:00:${String(tick++).padStart(2, '0')}.000Z`,
    nextId: (prefix) => `${prefix}_${++id}`,
  });
  platform.registerOrganisation('cmd-org-brand', createOrganisation({ id: 'brand-1', type: 'brand', name: 'Syntha Brand' }));
  platform.registerOrganisation('cmd-org-shop', createOrganisation({ id: 'shop-1', type: 'shop', name: 'Syntha Shop' }));
  return platform;
}

test('confirmation atomically opens DealSpace and shared milestones', () => {
  const platform = fixture();
  let cycle = platform.startCycle('cmd-cycle', { brandId: 'brand-1', shopId: 'shop-1', campaignName: 'FW27' });
  for (const stage of ['collection', 'showroom', 'selection', 'order-builder', 'order']) {
    cycle = platform.advanceCycle(`cmd-${stage}`, cycle.id, stage);
  }
  platform.attachOrder('cmd-attach-order', cycle.id, {
    id: 'order-1',
    currency: 'EUR',
    totalAmount: 600,
    lines: [
      { sku: 'JACKET-01', quantity: 2, unitPrice: 200 },
      { sku: 'SHIRT-01', quantity: 2, unitPrice: 100 },
    ],
  });
  const result = platform.confirmAndOpenDeal('cmd-confirm', cycle.id);
  assert.equal(result.cycle.stage, 'deal-space');
  assert.equal(result.deal.orderId, 'order-1');
  assert.equal(result.milestones.length, 2);
  assert.deepEqual(new Set(result.milestones.map((item) => item.ownerOrganisationId)), new Set(['brand-1', 'shop-1']));
});

test('commands are idempotent and do not duplicate deals or events', () => {
  const platform = fixture();
  const first = platform.startCycle('same-command', { brandId: 'brand-1', shopId: 'shop-1', campaignName: 'SS28' });
  const second = platform.startCycle('same-command', { brandId: 'brand-1', shopId: 'shop-1', campaignName: 'SS28' });
  assert.strictEqual(first, second);
  assert.equal(platform.snapshot().cycles.length, 1);
  assert.equal(platform.snapshot().events.filter((event) => event.type === 'commercial-cycle.started').length, 1);
});

test('reusing commandId for a different mutation is rejected', () => {
  const platform = fixture();
  platform.startCycle('shared-command', { brandId: 'brand-1', shopId: 'shop-1', campaignName: 'SS28' });
  assert.throws(
    () => platform.startCycle('shared-command', { brandId: 'brand-1', shopId: 'shop-1', campaignName: 'FW28' }),
    (error) => error.code === 'COMMAND_ID_CONFLICT',
  );
});
