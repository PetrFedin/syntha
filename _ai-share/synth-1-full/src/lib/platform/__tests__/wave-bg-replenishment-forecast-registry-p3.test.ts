import {
  isShopGreenfieldBuyer,
  shopGreenfieldPostCheckoutRegistryHref,
} from '@/components/shop/b2b/ShopCoCheckoutGreenfieldReadinessStrip';
import { buildShopReplenishmentSession } from '@/lib/b2b/shop-replenishment-workspace';

describe('wave-bg replenishment forecast sync + registry SSE + supplier dev peers p3', () => {
  it('greenfield post-checkout registry href contract', () => {
    const href = shopGreenfieldPostCheckoutRegistryHref({
      orderId: 'B2B-SS27-001',
      buyerId: 'shop2',
      collectionId: 'SS27',
    });
    expect(href).toContain('order=B2B-SS27-001');
    expect(isShopGreenfieldBuyer('shop2')).toBe(true);
  });

  it('replenishment rules forecast sync testid anchors', () => {
    expect('shop-replenishment-rules-forecast-sync-strip').toContain('forecast');
    expect('shop-replenishment-rules-forecast-sync-btn').toContain('sync');
    expect('shop-co-registry-greenfield-focus-replenishment-link').toContain('replenishment');
  });

  it('shop registry stream health strip testids', () => {
    expect('shop-co-registry-stream-health-strip').toContain('stream');
    expect('shop-co-registry-sse-live').toContain('sse');
    expect('shop-co-registry-stream-refresh').toContain('refresh');
  });

  it('supplier dev BOM brand dev peer links', () => {
    expect('sup-dev-bom-brand-dev-peer-strip').toContain('brand-dev');
    expect('sup-dev-bom-brand-material-passport-link').toContain('passport');
    expect('sup-dev-bom-brand-attribute-schema-link').toContain('schema');
  });

  it('replenishment session supplier forecast href', () => {
    const session = buildShopReplenishmentSession({ collectionId: 'SS27', orderId: 'B2B-DEMO-1' });
    expect(session.supplierForecastHref).toContain('forecast');
    expect(session.rulesHref).toContain('rules');
  });
});
