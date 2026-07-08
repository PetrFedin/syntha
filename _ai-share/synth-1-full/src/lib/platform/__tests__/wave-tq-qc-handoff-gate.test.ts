import {
  bulkConfirmWorkshop2B2bProductionHandoff,
  confirmWorkshop2B2bProductionHandoff,
} from '@/lib/server/workshop2-b2b-production-handoff';
import { buildWorkshop2BulkHandoffIdempotencyKey } from '@/lib/production/workshop2-bulk-handoff-idempotency';
import { brandProductionQcBlocksHandoffCount } from '@/lib/brand-production/qc-gate';
import { workshop2QcGateBlocksHandoff } from '@/lib/production/workshop2-qc-gate-shipment';
import {
  assertWorkshop2QcGateAllowsProductionHandoff,
  clearWorkshop2QcInspectionMemoryForTests,
  upsertWorkshop2QcInspection,
} from '@/lib/server/workshop2-qc-gate-repository';

jest.mock('@/lib/server/workshop2-b2b-orders-repository', () => ({
  getWorkshop2B2bOrder: jest.fn(),
  patchWorkshop2B2bOrderStatus: jest.fn(),
}));

jest.mock('@/lib/server/workshop2-material-requisition-repository', () => ({
  listWorkshop2MaterialRequisitions: jest.fn(async () => []),
  areWorkshop2MaterialRequisitionsConfirmedForArticles: jest.fn(),
}));

jest.mock('@/lib/server/workshop2-purchase-order-repository', () => ({
  getWorkshop2PurchaseOrderById: jest.fn(async () => null),
  upsertWorkshop2PurchaseOrder: jest.fn(async () => undefined),
  updateWorkshop2PurchaseOrderErpSync: jest.fn(),
  updateWorkshop2PurchaseOrderMesReleaseStage: jest.fn(),
  listWorkshop2PurchaseOrdersByPayloadSource: jest.fn(async () => []),
}));

jest.mock('@/lib/server/workshop2-contextual-messages-repository', () => ({
  appendWorkshop2ContextualSystemMessage: jest.fn(async () => undefined),
}));

jest.mock('@/lib/server/workshop2-phase1-dossier-server-store', () => ({
  getWorkshop2ServerDossierRecord: jest.fn(async () => ({ version: 1 })),
  getWorkshop2ServerDossierAtVersion: jest.fn(),
  putWorkshop2ServerDossierRecord: jest.fn(),
  appendWorkshop2ServerDossierEvent: jest.fn(async () => undefined),
}));

jest.mock('@/lib/server/workshop2-domain-events', () => ({
  enqueueWorkshop2DomainEvent: jest.fn(async () => undefined),
}));

jest.mock('@/lib/server/workshop2-sample-order-repository', () => ({
  listWorkshop2SampleOrders: jest.fn(async () => []),
}));

import { getWorkshop2B2bOrder } from '@/lib/server/workshop2-b2b-orders-repository';

describe('wave TQ — QC gate blocks handoff + bulk idempotency UX', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearWorkshop2QcInspectionMemoryForTests();
  });

  it('QC gate blocks handoff panel + API contract testids', () => {
    expect('brand-op-qc-gate-blocks-handoff').toContain('qc-gate-blocks');
    expect('brand-production-handoff-qc-block-badge').toContain('qc-block');
    expect('brand-production-handoff-qc-tab-link').toContain('qc-tab');
    expect('brand-b2b-bulk-handoff-idempotent-badge').toContain('idempotent');
    expect('mfr-op-handoff-queue-registry-sot-strip').toContain('registry-sot');
  });

  it('workshop2QcGateBlocksHandoff mirrors shipment gate semantics', () => {
    expect(
      workshop2QcGateBlocksHandoff([
        { blocksShipment: true, result: 'fail' },
        { blocksShipment: false, result: 'pass' },
      ])
    ).toBe(true);
    expect(workshop2QcGateBlocksHandoff([{ blocksShipment: true, result: 'pass' }])).toBe(false);
    expect(workshop2QcGateBlocksHandoff([{ blocksShipment: true, result: 'rework' }])).toBe(true);
  });

  it('brandProductionQcBlocksHandoffCount counts only blocking fail/rework', () => {
    const count = brandProductionQcBlocksHandoffCount({
      qcPlans: [],
      qcInspections: [
        {
          id: 'i1',
          planId: 'p1',
          poId: 'PO-1',
          result: 'fail',
          blocksShipment: true,
          inspectorLabel: 'QC',
          inspectedAt: '2026-01-01',
        },
        {
          id: 'i2',
          planId: 'p1',
          poId: 'PO-2',
          result: 'pass',
          blocksShipment: true,
          inspectorLabel: 'QC',
          inspectedAt: '2026-01-01',
        },
      ],
      b2bOrderRefs: [],
      articles: [],
      cutTickets: [],
      alerts: [],
    } as Parameters<typeof brandProductionQcBlocksHandoffCount>[0]);
    expect(count).toBe(1);
  });

  it('assertWorkshop2QcGateAllowsProductionHandoff returns RU message for handoff', async () => {
    const orderId = `TQ-QC-BLOCK-${Date.now()}`;
    await upsertWorkshop2QcInspection({
      orderId,
      collectionId: 'SS27',
      result: 'fail',
      blocksShipment: true,
    });
    const gate = await assertWorkshop2QcGateAllowsProductionHandoff(orderId);
    expect(gate.ok).toBe(false);
    if (!gate.ok) {
      expect(gate.code).toBe('qc_gate_blocked');
      expect(gate.messageRu).toMatch(/передача в цех заблокирована/i);
    }
  });

  it('confirmWorkshop2B2bProductionHandoff returns qc_gate_blocked when QC incomplete', async () => {
    const orderId = `TQ-HANDOFF-BLOCK-${Date.now()}`;
    await upsertWorkshop2QcInspection({
      orderId,
      collectionId: 'SS27',
      result: 'rework',
      blocksShipment: true,
    });
    (getWorkshop2B2bOrder as jest.Mock).mockResolvedValue({
      id: orderId,
      status: 'confirmed',
      collectionId: 'SS27',
      buyerId: 'shop-1',
      totalRub: 1000,
      lines: [{ articleId: 'demo-ss27-01', qty: 1, collectionId: 'SS27' }],
    });

    const result = await confirmWorkshop2B2bProductionHandoff({ orderId });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('qc_gate_blocked');
      expect(result.messageRu).toMatch(/передача в цех заблокирована/i);
    }
  });

  it('bulk handoff idempotency key is stable (sorted orderIds + factory)', () => {
    const a = buildWorkshop2BulkHandoffIdempotencyKey(['B2B-2', 'B2B-1'], 'fact-1');
    const b = buildWorkshop2BulkHandoffIdempotencyKey(['B2B-1', 'B2B-2'], 'fact-1');
    expect(a).toBe(b);
    expect(a).toContain('b2b-bulk-handoff:fact-1:');
  });

  it('bulk handoff API path accepts Idempotency-Key header', () => {
    expect('/api/brand/b2b/orders/bulk-confirm-production-handoff').toContain(
      'bulk-confirm-production-handoff'
    );
    expect('Idempotency-Key').toContain('Idempotency');
    expect('brand-b2b-bulk-handoff').toContain('bulk-handoff');
  });

  it('bulkConfirmWorkshop2B2bProductionHandoff surfaces idempotent replay flag', async () => {
    const {
      rememberWorkshop2BulkHandoffIdempotency,
      resetWorkshop2BulkHandoffIdempotencyForTests,
    } = await import('@/lib/server/workshop2-b2b-production-handoff');
    resetWorkshop2BulkHandoffIdempotencyForTests();
    const key = buildWorkshop2BulkHandoffIdempotencyKey(['B2B-IDEM-REPLAY']);
    rememberWorkshop2BulkHandoffIdempotency(key, {
      ok: true,
      handedOff: ['B2B-IDEM-REPLAY'],
      skipped: [],
      errors: [],
      messageRu: 'cached replay',
    });

    const replay = await bulkConfirmWorkshop2B2bProductionHandoff({
      orderIds: ['B2B-IDEM-REPLAY'],
      idempotencyKey: key,
    });
    expect(replay.idempotent).toBe(true);
    expect(replay.handedOff).toEqual(['B2B-IDEM-REPLAY']);
    expect(getWorkshop2B2bOrder).not.toHaveBeenCalled();
  });
});
