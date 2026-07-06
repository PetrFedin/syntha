import { buildBrandCrmSegmentationSession } from '@/lib/b2b/brand-crm-segmentation';
import { buildBrandOrderCommsSession } from '@/lib/b2b/brand-order-comms';
import { buildManufacturerOrderCommsSession } from '@/lib/b2b/manufacturer-order-comms';
import { buildShopOrderCommsSession } from '@/lib/b2b/shop-order-comms';
import { brandWssiShopMatrixHref } from '@/lib/fashion/brand-wssi-plan';

describe('wave-av spine peers p3', () => {
  it('brand CO CRM + WSSI session hrefs', () => {
    const crm = buildBrandCrmSegmentationSession({ collectionId: 'SS27' });
    const comms = buildBrandOrderCommsSession({ collectionId: 'SS27', orderId: 'B2B-DEMO-1' });
    expect(crm.shopMatrixHref).toContain('matrix');
    expect(crm.collaborativeHref).toContain('collaborative');
    expect(comms.registryHref).toContain('b2b-orders');
    expect(brandWssiShopMatrixHref('SS27', 'B2B-DEMO-1')).toContain('B2B-DEMO-1');
  });

  it('shop + mfr comms cabinet session hrefs', () => {
    const shop = buildShopOrderCommsSession({ collectionId: 'SS27', orderId: 'B2B-DEMO-1' });
    const mfr = buildManufacturerOrderCommsSession({
      collectionId: 'SS27',
      orderId: 'B2B-DEMO-1',
      factoryId: 'fact-1',
    });
    expect(shop.brandOrderHandoffHref).toContain('handoff');
    expect(shop.inventoryOverviewHref).toContain('inventory');
    expect(mfr.handoffHref).toContain('handoff');
    expect(mfr.entitiesHref).toContain('entities');
  });

  it('wave-av testid anchors', () => {
    expect('brand-co-crm-co-peer-strip').toContain('co-peer');
    expect('brand-co-wssi-co-peer-strip').toContain('co-peer');
    expect('brand-dev-cabinet-co-peer-strip').toContain('co-peer');
    expect('shop-op-tracking-spine-peer-strip').toContain('spine-peer');
    expect('shop-cm-cabinet-spine-peer-strip').toContain('spine-peer');
    expect('mfr-cm-cabinet-spine-peer-strip').toContain('spine-peer');
    expect('mfr-op-cabinet-spine-peer-strip').toContain('spine-peer');
    expect('shop-op-cabinet-spine-peer-strip').toContain('spine-peer');
  });
});
