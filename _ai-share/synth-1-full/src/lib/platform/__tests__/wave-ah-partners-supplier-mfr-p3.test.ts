import { buildBrandSupplierBomSession } from '@/lib/fashion/brand-supplier-bom-workspace';
import { buildSupplierProcurementSession } from '@/lib/fashion/supplier-procurement-workspace';
import { listShopB2bPartnerships } from '@/lib/server/shop-b2b-partnerships';
import { clearShopB2bPartnershipPgMemoryForTests } from '@/lib/server/shop-b2b-partnerships-repository';

describe('wave-ah partners + supplier + mfr', () => {
  beforeEach(() => {
    clearShopB2bPartnershipPgMemoryForTests();
  });

  it('greenfield shop2 returns profile partners with live collections when published', async () => {
    const rows = await listShopB2bPartnerships('shop2');
    expect(rows.length).toBeGreaterThan(0);
    const syntha = rows.find((r) => r.status === 'profile' || r.status === 'connected');
    expect(syntha).toBeTruthy();
  });

  it('supplier dev BOM peer links brand supplier-bom workspace', () => {
    const session = buildBrandSupplierBomSession({
      collectionId: 'SS27',
      articleId: 'demo-ss27-01',
    });
    expect(session.bomHref).toContain('pcf=bom');
    expect(session.bomHref).toContain('collection=SS27');
  });

  it('supplier procurement session exposes brand push chat section href', () => {
    const session = buildSupplierProcurementSession({
      collectionId: 'SS27',
      articleId: 'demo-ss27-01',
      orderId: 'B2B-DEMO-1',
    });
    expect(session.orderTabHref).toContain('pcf=order');
    expect(session.entitiesHref).toContain('pcf=entities');
  });
});
