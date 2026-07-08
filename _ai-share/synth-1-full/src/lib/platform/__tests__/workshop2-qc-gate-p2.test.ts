import {
  workshop2QcGateBlocksOrderShipment,
  workshop2QcInspectionBlocksShipment,
} from '@/lib/production/workshop2-qc-gate-shipment';
import {
  assertWorkshop2QcGateAllowsOrderShipment,
  clearWorkshop2QcInspectionMemoryForTests,
  upsertWorkshop2QcInspection,
} from '@/lib/server/workshop2-qc-gate-repository';
import { bumpPlatformCoreHandoffQueue } from '@/lib/server/platform-core-handoff-queue-hub';
import { fingerprintWorkshop2HandoffQueue } from '@/lib/platform-core-handoff-queue-sse';

describe('workshop2-qc-gate-shipment', () => {
  it('blocks when fail/rework with blocksShipment', () => {
    expect(workshop2QcInspectionBlocksShipment({ blocksShipment: true, result: 'fail' })).toBe(
      true
    );
    expect(workshop2QcInspectionBlocksShipment({ blocksShipment: true, result: 'pass' })).toBe(
      false
    );
    expect(
      workshop2QcGateBlocksOrderShipment([
        { blocksShipment: true, result: 'rework' },
        { blocksShipment: false, result: 'pass' },
      ])
    ).toBe(true);
  });
});

describe('workshop2-qc-gate-repository P2', () => {
  beforeEach(() => {
    clearWorkshop2QcInspectionMemoryForTests();
  });

  it('blocks shipped transition when QC fail persisted', async () => {
    const orderId = `QC-BLOCK-${Date.now()}`;
    await upsertWorkshop2QcInspection({
      orderId,
      collectionId: 'SS27',
      result: 'fail',
      blocksShipment: true,
    });

    const gate = await assertWorkshop2QcGateAllowsOrderShipment(orderId);
    expect(gate.ok).toBe(false);
    if (!gate.ok) expect(gate.code).toBe('qc_gate_blocked');
  });

  it('allows shipment when only pass inspection', async () => {
    const orderId = `QC-PASS-${Date.now()}`;
    await upsertWorkshop2QcInspection({
      orderId,
      result: 'pass',
      blocksShipment: false,
    });
    const gate = await assertWorkshop2QcGateAllowsOrderShipment(orderId);
    expect(gate.ok).toBe(true);
  });
});

describe('platform-core-handoff-queue-sse', () => {
  it('fingerprints queue items', () => {
    expect(
      fingerprintWorkshop2HandoffQueue([
        { productionOrderId: 'po-1', status: 'pending_erp' },
        { productionOrderId: 'po-2', status: 'synced' },
      ])
    ).toBe('po-1:pending_erp|po-2:synced');
  });

  it('bumps handoff queue hub without throw', () => {
    expect(() => bumpPlatformCoreHandoffQueue('fact-1')).not.toThrow();
  });
});
