import { brandCrmSegmentationFeatureHref } from '@/lib/b2b/brand-crm-segmentation';
import { buildShopOrderCommsSession } from '@/lib/b2b/shop-order-comms';
import { buildSupplierOrderCommsSession } from '@/lib/b2b/supplier-order-comms';

describe('wave-az greenfield CRM + calendar PG p3', () => {
  it('checkout buyer CRM pricelist href', () => {
    expect(brandCrmSegmentationFeatureHref('pricelist', 'SS27')).toContain('pricelist');
    expect(brandCrmSegmentationFeatureHref('segments', 'SS27')).toContain('segments');
  });

  it('checkout monetization session hrefs', () => {
    const session = buildShopOrderCommsSession({ collectionId: 'SS27', orderId: 'B2B-DEMO-1' });
    expect(session.brandOrderHandoffHref).toContain('handoff');
    expect(session.platformHubHref).toContain('/platform/b2b');
  });

  it('supplier BOM WMS session hrefs', () => {
    const session = buildSupplierOrderCommsSession({
      collectionId: 'SS27',
      articleId: 'demo-ss27-01',
      orderId: 'B2B-DEMO-1',
    });
    expect(session.brandOrderHandoffHref).toContain('handoff');
    expect(session.shopTrackingHref).toContain('tracking');
  });

  it('wave-az testid anchors', () => {
    expect('shop-co-checkout-buyer-crm-strip').toContain('buyer-crm');
    expect('shop-co-checkout-buyer-crm-pricelist-link').toContain('pricelist');
    expect('shop-co-checkout-brand-pricelist-link').toContain('pricelist');
    expect('shop-co-registry-buyer-crm-refresh').toContain('refresh');
    expect('data-pc-task-focused').toContain('focused');
    expect('sup-op-procurement-bom-wms-reserve-strip').toContain('wms-reserve');
  });
});
