import { buildShopCollaborativeOrderSession } from '@/lib/b2b/shop-collaborative-order';
import { buildSupplierProcurementSession } from '@/lib/fashion/supplier-procurement-workspace';
import { buildManufacturerOrderCommsSession } from '@/lib/b2b/manufacturer-order-comms';
import { brandCrmSegmentationFeatureHref } from '@/lib/b2b/brand-crm-segmentation';

describe('wave BU — greenfield registry + supplier/mfr comms spine', () => {
  it('empty greenfield monetization strip anchors', () => {
    expect('shop-co-registry-empty-greenfield-monetization-strip').toContain('greenfield');
    expect('shop-co-registry-empty-greenfield-brand-assign-link').toContain('assign');
    expect(brandCrmSegmentationFeatureHref('segments', 'SS27')).toContain('customer-groups');
  });

  it('post-checkout greenfield focus strip session links', () => {
    const session = buildShopCollaborativeOrderSession({
      collectionId: 'SS27',
      orderId: 'B2B-DEMO-1',
    });
    expect(session.approvalsHref).toContain('collaborative');
    expect('shop-co-registry-greenfield-focus-strip').toContain('greenfield');
    expect('shop-co-registry-greenfield-focus-replenishment-link').toContain('replenishment');
  });

  it('supplier handoff read spine peer', () => {
    const session = buildSupplierProcurementSession({
      collectionId: 'SS27',
      articleId: 'ART-1',
      orderId: 'B2B-DEMO-1',
    });
    expect(session.forecastHref).toContain('forecast');
    expect('sup-op-handoff-read-spine-peer-strip').toContain('spine-peer');
    expect('sup-op-handoff-read-mfr-queue-link').toContain('queue');
  });

  it('mfr comms cabinet spine peer', () => {
    const comms = buildManufacturerOrderCommsSession({
      collectionId: 'SS27',
      orderId: 'B2B-DEMO-1',
      factoryId: 'FACTORY-1',
    });
    expect(comms.handoffHref).toContain('handoff');
    expect('mfr-cm-cabinet-spine-peer-strip').toContain('spine-peer');
    expect('mfr-cm-cabinet-brand-chat-link').toContain('chat');
  });
});
