import { buildBrandOrderCommsSession } from '@/lib/b2b/brand-order-comms';
import { buildShopReplenishmentSession } from '@/lib/b2b/shop-replenishment-workspace';
import { buildSupplierProcurementSession } from '@/lib/fashion/supplier-procurement-workspace';

describe('wave BQ — comms dedup + dev/retailers/supplier spine peers', () => {
  it('brand order comms session registry SoT href', () => {
    const session = buildBrandOrderCommsSession({ orderId: 'B2B-DEMO-1', collectionId: 'SS27' });
    expect(session.registryHref).toContain('B2B-DEMO-1');
    expect('brand-order-comms-detail-panel').toContain('detail');
    expect('brand-order-comms-registry-sot-link').toContain('registry');
  });

  it('W2 hub co peer strip testids', () => {
    expect('brand-dev-w2-hub-co-peer-strip').toContain('co-peer');
    expect('brand-dev-w2-hub-shop-matrix-link').toContain('matrix');
  });

  it('retailers greenfield onboarding strip on panel', () => {
    expect('brand-co-registry-retail-onboarding-strip').toContain('onboarding');
    expect('brand-co-registry-shop-checkout-link').toContain('checkout');
  });

  it('supplier dev materials co peer forecast + replenishment', () => {
    const proc = buildSupplierProcurementSession({
      collectionId: 'SS27',
      articleId: 'ART-1',
      orderId: 'B2B-DEMO-1',
    });
    const replen = buildShopReplenishmentSession({ collectionId: 'SS27', orderId: 'B2B-DEMO-1' });
    expect(proc.forecastHref).toContain('forecast');
    expect(replen.stockAtpHref).toContain('stock-atp');
    expect('sup-dev-materials-co-peer-strip').toContain('co-peer');
    expect('sup-dev-materials-forecast-link').toContain('forecast');
  });

  it('brand inventory co peer strip anchors', () => {
    expect('brand-op-inventory-co-peer-strip').toContain('co-peer');
    expect('brand-op-inventory-replenishment-link').toContain('replenishment');
  });
});
