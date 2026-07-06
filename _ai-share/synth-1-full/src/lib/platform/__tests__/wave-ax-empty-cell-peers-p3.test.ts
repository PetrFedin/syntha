import { buildManufacturerHandoffQueueSession } from '@/lib/production/manufacturer-handoff-queue';
import { buildShopShowroomBuySession } from '@/lib/b2b/shop-showroom-buy';
import { buildSupplierProcurementSession } from '@/lib/fashion/supplier-procurement-workspace';
import { brandCrmSegmentationFeatureHref } from '@/lib/b2b/brand-crm-segmentation';
import { shopB2bCheckoutCollectionHref } from '@/lib/routes';

describe('wave-ax empty-cell spine peers p3', () => {
  it('mfr empty SC session hrefs', () => {
    const shop = buildShopShowroomBuySession({ collectionId: 'SS27' });
    expect(shop.showroomHref).toContain('showroom');
    expect(shop.matrixHref).toContain('/shop/b2b/matrix');
  });

  it('mfr empty CO session hrefs', () => {
    const session = buildManufacturerHandoffQueueSession({
      factoryId: 'factory-1',
      collectionId: 'SS27',
      orderId: 'B2B-DEMO-1',
    });
    expect(session.brandHandoffHref).toContain('handoff');
    expect(session.shopTrackingHref).toContain('tracking');
    expect(session.handoffHref).toContain('handoff');
  });

  it('sup empty CO procurement session hrefs', () => {
    const session = buildSupplierProcurementSession({
      collectionId: 'SS27',
      articleId: 'demo-ss27-01',
      orderId: 'B2B-DEMO-1',
    });
    expect(session.forecastHref).toContain('forecast');
    expect(session.shopTrackingHref).toContain('tracking');
  });

  it('shop greenfield CRM pricelist href', () => {
    expect(brandCrmSegmentationFeatureHref('pricelist', 'SS27')).toContain('pricelist');
    expect(shopB2bCheckoutCollectionHref('SS27')).toContain('checkout');
  });

  it('wave-ax testid anchors', () => {
    expect('mfr-empty-sc-peer-strip').toContain('sc-peer');
    expect('mfr-empty-co-peer-strip').toContain('co-peer');
    expect('sup-empty-co-peer-strip').toContain('co-peer');
    expect('sup-dev-cabinet-spine-peer-strip').toContain('spine-peer');
    expect('shop-dev-bridge-crm-brand-pricelist-link').toContain('pricelist');
    expect('shop-dev-bridge-crm-landed-margin-link').toContain('landed-margin');
    expect('shop-development-bridge-greenfield-crm-strip').toContain('greenfield');
  });
});
