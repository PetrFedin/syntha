import { buildBrandLandedMarginSession } from '@/lib/b2b/brand-landed-margin';
import { buildBrandPackRulesSession } from '@/lib/fashion/brand-pack-rules-workspace';
import { buildBrandPricelistSession } from '@/lib/b2b/brand-pricelist-workspace';
import { buildShopInventoryOpsSession } from '@/lib/b2b/shop-inventory-ops';
import { buildShopOrderCommsSession } from '@/lib/b2b/shop-order-comms';
import { buildManufacturerHandoffQueueSession } from '@/lib/production/manufacturer-handoff-queue';
import { buildSupplierProcurementSession } from '@/lib/fashion/supplier-procurement-workspace';

describe('wave-aw spine peers p3', () => {
  it('brand CO workspace session hrefs', () => {
    const pricelist = buildBrandPricelistSession({ collectionId: 'SS27', orderId: 'B2B-DEMO-1' });
    const packRules = buildBrandPackRulesSession({ collectionId: 'SS27', orderId: 'B2B-DEMO-1' });
    const margin = buildBrandLandedMarginSession({ collectionId: 'SS27', orderId: 'B2B-DEMO-1' });
    expect(pricelist.shopCheckoutHref).toContain('checkout');
    expect(packRules.shopMatrixHref).toContain('matrix');
    expect(margin.brandOrderCommsHandoffHref).toContain('handoff');
  });

  it('shop OP + mfr handoff session hrefs', () => {
    const shop = buildShopOrderCommsSession({ collectionId: 'SS27', orderId: 'B2B-DEMO-1' });
    const inv = buildShopInventoryOpsSession({ collectionId: 'SS27', orderId: 'B2B-DEMO-1' });
    const mfr = buildManufacturerHandoffQueueSession({
      factoryId: 'fact-1',
      collectionId: 'SS27',
      orderId: 'B2B-DEMO-1',
    });
    expect(shop.brandOrderHandoffHref).toContain('handoff');
    expect(inv.brandInventoryOverviewHref).toContain('inventory');
    expect(mfr.shopTrackingHref).toContain('tracking');
  });

  it('wave-aw testid anchors', () => {
    const sup = buildSupplierProcurementSession({
      collectionId: 'SS27',
      articleId: 'demo-ss27-01',
      orderId: 'B2B-DEMO-1',
    });
    expect('brand-co-pricelist-co-peer-strip').toContain('co-peer');
    expect('brand-dev-w2-hub-co-peer-strip').toContain('co-peer');
    expect('shop-op-registry-spine-peer-strip').toContain('spine-peer');
    expect('shop-op-order-status-spine-peer-strip').toContain('spine-peer');
    expect('mfr-op-handoff-queue-co-spine-peer-strip').toContain('co-spine');
    expect('sup-op-procurement-co-peer-strip').toContain('co-peer');
    expect(sup.forecastHref).toContain('forecast');
  });
});
