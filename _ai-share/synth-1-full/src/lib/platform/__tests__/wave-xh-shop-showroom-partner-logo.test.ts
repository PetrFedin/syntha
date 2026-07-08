import {
  SHOP_SHOWROOM_PARTNER_LOGO_DOSSIER_FALLBACK_RU,
  SHOP_SHOWROOM_PARTNER_LOGO_PG_RU,
  SHOP_SHOWROOM_ELIGIBLE_FILTER_LABEL_RU,
} from '@/lib/b2b/shop-showroom-eligible-for-matrix';
import { SHOP_SHOWROOM_COVER_HERO_PRIORITY_STRIP_TESTID } from '@/lib/b2b/brand-sc-linesheet-readpath';
import {
  buildShopShowroomEligibleFilterApiUrl,
  resolveShopShowroomPartnerLogoBadgeKind,
  SHOP_SHOWROOM_ELIGIBLE_FILTER_COUNTS_TESTID,
  SHOP_SHOWROOM_PARTNER_LOGO_SOURCE_DOSSIER_FALLBACK_TESTID,
  SHOP_SHOWROOM_PARTNER_LOGO_SOURCE_PG_TESTID,
  shopShowroomEligibleFilterHintVisible,
  shopShowroomEligibleFilterToggleLabel,
  shouldShowShopShowroomCoverHeroPriorityStrip,
} from '@/lib/b2b/shop-showroom-wave-xh';

describe('wave XH — shop SC showroom partner logo PG vs dossier fallback', () => {
  it('PG logo badge when partnerships source is pg and dossier does not win', () => {
    expect(
      resolveShopShowroomPartnerLogoBadgeKind({
        partnerLogoUrl: 'https://cdn.example/logo.jpg',
        partnersSource: 'pg',
        coverHeroSource: 'partner-cover',
      })
    ).toBe('pg');
  });

  it('dossier fallback when cover hero is dossier PG', () => {
    expect(
      resolveShopShowroomPartnerLogoBadgeKind({
        partnerLogoUrl: 'https://cdn.example/logo.jpg',
        partnersSource: 'pg',
        coverHeroSource: 'dossier',
        dossierHeroUsed: true,
      })
    ).toBe('dossier-fallback');
  });

  it('dossier fallback when logo exists but not from PG read', () => {
    expect(
      resolveShopShowroomPartnerLogoBadgeKind({
        partnerLogoUrl: 'https://cdn.example/logo.jpg',
        partnersSource: 'fallback',
        coverHeroSource: 'partner-logo',
      })
    ).toBe('dossier-fallback');
  });

  it('RU copy for partner logo badges', () => {
    expect(SHOP_SHOWROOM_PARTNER_LOGO_PG_RU).toContain('PG');
    expect(SHOP_SHOWROOM_PARTNER_LOGO_DOSSIER_FALLBACK_RU).toMatch(/dossier/i);
  });

  it('partner logo source testids', () => {
    expect(SHOP_SHOWROOM_PARTNER_LOGO_SOURCE_PG_TESTID).toContain('source-pg');
    expect(SHOP_SHOWROOM_PARTNER_LOGO_SOURCE_DOSSIER_FALLBACK_TESTID).toContain('dossier-fallback');
  });

  it('exports partner logo badge component', async () => {
    const mod = await import('@/components/shop/b2b/ShopShowroomPartnerLogoSourceBadge');
    expect(typeof mod.ShopShowroomPartnerLogoSourceBadge).toBe('function');
  });
});

describe('wave XH — hero vs dossier priority strip dedupe (wave VC alignment)', () => {
  it('hides priority strip when dossier hero is active', () => {
    expect(shouldShowShopShowroomCoverHeroPriorityStrip('dossier')).toBe(false);
  });

  it('shows priority strip for partner/fallback hero sources', () => {
    expect(shouldShowShopShowroomCoverHeroPriorityStrip('partner-cover')).toBe(true);
    expect(shouldShowShopShowroomCoverHeroPriorityStrip('partner-logo')).toBe(true);
    expect(shouldShowShopShowroomCoverHeroPriorityStrip('fallback')).toBe(true);
  });

  it('priority strip testid contract', () => {
    expect(SHOP_SHOWROOM_COVER_HERO_PRIORITY_STRIP_TESTID).toContain('hero-priority');
  });
});

describe('wave XH — eligible-for-matrix filter API polish', () => {
  it('builds API URL with collection + buyerId', () => {
    const url = buildShopShowroomEligibleFilterApiUrl('SS27', 'shop1');
    expect(url).toContain('/api/shop/b2b/showroom/eligible-for-matrix');
    expect(url).toContain('collection=SS27');
    expect(url).toContain('buyerId=shop1');
  });

  it('appends eligibleOnly when filter active', () => {
    expect(
      buildShopShowroomEligibleFilterApiUrl('SS27', 'shop1', { eligibleOnly: true })
    ).toContain('eligibleOnly=1');
  });

  it('toggle label shows counts', () => {
    expect(
      shopShowroomEligibleFilterToggleLabel({ published: 5, eligible: 3, filterActive: false })
    ).toContain(SHOP_SHOWROOM_ELIGIBLE_FILTER_LABEL_RU);
    expect(
      shopShowroomEligibleFilterToggleLabel({ published: 5, eligible: 3, filterActive: false })
    ).toContain('3/5');
  });

  it('hint visible only when filter active', () => {
    expect(shopShowroomEligibleFilterHintVisible(true)).toBe(true);
    expect(shopShowroomEligibleFilterHintVisible(false)).toBe(false);
  });

  it('eligible filter counts testid', () => {
    expect(SHOP_SHOWROOM_ELIGIBLE_FILTER_COUNTS_TESTID).toContain('eligible-filter-counts');
    expect('shop-sc-showroom-eligible-filter-toggle').toContain('eligible-filter');
  });
});
