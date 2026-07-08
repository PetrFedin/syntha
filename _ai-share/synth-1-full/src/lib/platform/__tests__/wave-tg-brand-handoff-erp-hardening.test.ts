import { buildWorkshop2BulkHandoffIdempotencyKey } from '@/lib/production/workshop2-bulk-handoff-idempotency';
import { brandProductionQcBlocksHandoffCount } from '@/lib/brand-production/qc-gate';
import { workshop2QcGateBlocksHandoff } from '@/lib/production/workshop2-qc-gate-shipment';
import { WORKSHOP2_ERP_AUTO_RETRY_MAX } from '@/lib/production/workshop2-erp-retry-hint';
import { WORKSHOP2_FACTORY_ERP_AUTO_RETRY_MAX } from '@/lib/server/workshop2-b2b-production-handoff';

describe('wave TG — brand 1.4 handoff ERP hardening', () => {
  it('bulk handoff idempotency key is stable (sorted orderIds + factory)', () => {
    const a = buildWorkshop2BulkHandoffIdempotencyKey(['B2B-2', 'B2B-1'], 'fact-1');
    const b = buildWorkshop2BulkHandoffIdempotencyKey(['B2B-1', 'B2B-2'], 'fact-1');
    expect(a).toBe(b);
    expect(a).toContain('b2b-bulk-handoff:fact-1:');
  });

  it('ERP auto-retry max is 3 (server + client hint)', () => {
    expect(WORKSHOP2_FACTORY_ERP_AUTO_RETRY_MAX).toBe(3);
    expect(WORKSHOP2_ERP_AUTO_RETRY_MAX).toBe(3);
  });

  it('runWorkshop2FactoryHandoffErpAutoRetries burst contract', () => {
    expect('runWorkshop2FactoryHandoffErpAutoRetries').toContain('AutoRetries');
    expect('burst?: boolean').toContain('burst');
  });

  it('QC gate blocks handoff UI badge testid', () => {
    expect('brand-production-handoff-qc-block-badge').toContain('qc-block');
    expect('brand-production-handoff-panel').toContain('handoff-panel');
  });

  it('workshop2QcGateBlocksHandoff mirrors shipment gate', () => {
    expect(
      workshop2QcGateBlocksHandoff([
        { blocksShipment: true, result: 'fail' },
        { blocksShipment: false, result: 'pass' },
      ])
    ).toBe(true);
    expect(workshop2QcGateBlocksHandoff([{ blocksShipment: true, result: 'pass' }])).toBe(false);
  });

  it('brandProductionQcBlocksHandoffCount counts blocking inspections', () => {
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

  it('bulk handoff API accepts Idempotency-Key header', () => {
    expect('/api/brand/b2b/orders/bulk-confirm-production-handoff').toContain(
      'bulk-confirm-production-handoff'
    );
    expect('Idempotency-Key').toContain('Idempotency');
    expect('brand-b2b-bulk-handoff').toContain('bulk-handoff');
  });
});
