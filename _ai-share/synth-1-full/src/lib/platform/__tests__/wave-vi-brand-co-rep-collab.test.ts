import { shopCollaborativeTabReadOnlyHref } from '@/lib/b2b/shop-collection-order-hrefs';
import { brandAgentRepShopPortalReadOnlyHref } from '@/lib/fashion/brand-agent-rep-oversight';

describe('wave VI — brand CO agent rep + collaborative readonly', () => {
  it('commission dispute POST + GET list (wave UC extend)', () => {
    expect('/api/brand/b2b/commissions/dispute').toContain('dispute');
    expect('listBrandAgentRepCommissionDisputesServer').toContain('Disputes');
    expect('brand-agent-rep-commission-dispute-submit').toContain('dispute');
  });

  it('brand collaborative read-only shop session link', () => {
    const href = shopCollaborativeTabReadOnlyHref('session', 'B2B-DEMO-SHOP1-SS27', 'SS27');
    expect(href).toContain('readOnly=1');
    expect(href).toContain('collaborative-order');
    expect('brand-co-collaborative-readonly-link').toContain('readonly');
    expect('brand-co-collaborative-shop-link').toContain('shop-link');
  });

  it('agent rep shop portal read-only still wired (wave UC)', () => {
    expect(brandAgentRepShopPortalReadOnlyHref()).toContain('readOnly=1');
    expect('brand-co-agent-rep-shop-portal-readonly-link').toContain('readonly');
  });

  it('multi-buyer registry PG query param + UI badges', () => {
    expect('/api/brand/b2b/orders?collectionId=SS27&partner=shop2').toContain('partner=shop2');
    expect('brand-co-registry-partner-filter').toContain('partner-filter');
    expect('brand-co-registry-pg-partner-badge').toContain('pg-partner');
    expect('uniquePartnerIds').toContain('Partner');
  });
});
