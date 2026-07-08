import { buildManufacturerProductionOpsSession } from '@/lib/production/manufacturer-production-ops';
import { buildSupplierOrderCommsSession } from '@/lib/b2b/supplier-order-comms';
import { buildSupplierProcurementSession } from '@/lib/fashion/supplier-procurement-workspace';
import { manufacturerHandoffFeatureHref } from '@/lib/production/manufacturer-handoff-queue';
import { factoryProductionDossierHref } from '@/lib/routes';

describe('wave-as spine peers p3', () => {
  it('manufacturer production ops session hrefs', () => {
    const session = buildManufacturerProductionOpsSession({
      factoryId: 'fact-1',
      collectionId: 'SS27',
      orderId: 'B2B-DEMO-1',
      articleId: 'demo-ss27-01',
    });
    expect(session.handoffQueueHref).toContain('handoff');
    expect(session.brandCutTicketHref).toContain('cut-ticket');
    expect(session.shopTrackingHref).toContain('tracking');
    const sampleQueue = manufacturerHandoffFeatureHref('sample-queue', {
      factoryId: 'fact-1',
      collectionId: 'SS27',
      orderId: 'B2B-DEMO-1',
    });
    expect(sampleQueue).toContain('sample-queue');
  });

  it('supplier order comms + procurement session hrefs', () => {
    const session = buildSupplierOrderCommsSession({
      collectionId: 'SS27',
      orderId: 'B2B-DEMO-1',
      articleId: 'demo-ss27-01',
    });
    const procurement = buildSupplierProcurementSession({
      collectionId: 'SS27',
      orderId: 'B2B-DEMO-1',
      articleId: 'demo-ss27-01',
    });
    expect(session.brandOrderHandoffHref).toContain('handoff');
    expect(session.shopMatrixHref).toContain('matrix');
    expect(procurement.bomHref).toContain('bom');
    expect(procurement.forecastHref).toContain('forecast');
  });

  it('wave-as testid anchors', () => {
    expect('mfr-dev-sample-queue-handoff-peer-strip').toContain('handoff-peer');
    expect('mfr-dev-dossier-production-spine-peer-strip').toContain('spine-peer');
    expect('mfr-op-production-orders-handoff-peer-strip').toContain('handoff-peer');
    expect('sup-cm-order-context-strip').toContain('context-strip');
    expect('sup-cm-cabinet-spine-peer-strip').toContain('spine-peer');
    expect('sup-dev-bom-mfr-dev-peer-strip').toContain('mfr-dev');
    expect('shop-co-detail-context-strip').toContain('context-strip');
    expect('shop-co-cabinet-co-spine-peer-strip').toContain('spine-peer');
    expect('shop-co-checkout-registry-link').toContain('registry');
    expect(factoryProductionDossierHref('demo-ss27-01', { collectionId: 'SS27' })).toContain(
      'dossier'
    );
  });
});
