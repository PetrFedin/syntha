import { ROUTES as EXTENDED_ROUTES } from '@/lib/platform-core-extended-routes';
import { buildBrandProductionHandoffSession } from '@/lib/brand-production/brand-production-handoff';
import { buildManufacturerProductionOpsSession } from '@/lib/production/manufacturer-production-ops';
import { buildSupplierProcurementSession } from '@/lib/fashion/supplier-procurement-workspace';
import { ROUTES } from '@/lib/routes';

describe('wave BT — OP spine peers wired (brand/mfr/supplier)', () => {
  it('brand OP chain CO spine peer session links', () => {
    const session = buildBrandProductionHandoffSession({
      orderId: 'B2B-DEMO-1',
      collectionId: 'SS27',
    });
    expect(session.handoffTabHref).toContain('handoff');
    expect('brand-op-chain-co-spine-peer-strip').toContain('co-spine');
    expect('brand-op-chain-shop-matrix-link').toContain('matrix');
  });

  it('brand OP cabinet spine peer QC + registry', () => {
    const session = buildBrandProductionHandoffSession({
      orderId: 'B2B-DEMO-1',
      collectionId: 'SS27',
    });
    expect(session.qcGateTabHref).toContain('qc');
    expect('brand-op-cabinet-spine-peer-strip').toContain('spine-peer');
    expect('brand-op-cabinet-registry-link').toContain('registry');
  });

  it('mfr OP cabinet spine peer + coreSlim chat gate', () => {
    const session = buildManufacturerProductionOpsSession({
      collectionId: 'SS27',
      orderId: 'B2B-DEMO-1',
      factoryId: 'FACTORY-1',
    });
    expect(session.handoffQueueHref).toContain(EXTENDED_ROUTES.factory.production);
    expect('mfr-op-cabinet-spine-peer-strip').toContain('spine-peer');
    expect('mfr-op-cabinet-handoff-link').toContain('handoff');
    expect('mfr-op-cabinet-chat-link').toContain('chat');
  });

  it('supplier chain workspace peer forecast/supply', () => {
    const session = buildSupplierProcurementSession({
      collectionId: 'SS27',
      articleId: 'ART-1',
      orderId: 'B2B-DEMO-1',
    });
    expect(session.forecastHref).toContain('forecast');
    expect('sup-op-chain-workspace-peer-strip').toContain('workspace-peer');
    expect('sup-op-chain-peer-brand-chat-link').toContain('chat');
  });
});
